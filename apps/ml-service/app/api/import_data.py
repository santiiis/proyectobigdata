from fastapi import APIRouter, HTTPException, BackgroundTasks, Header
from pydantic import BaseModel
import os
import zipfile
import pandas as pd
import glob
from sqlalchemy import create_engine, text
from app.core.config import settings

router = APIRouter()

class ImportRequest(BaseModel):
    jobId: str
    filePath: str

def process_oulad_import(job_id: str, file_path: str):
    """
    Background worker that unzips/reads parquet, transforms, and bulk inserts to MySQL.
    """
    engine = create_engine(settings.DATABASE_URL)
    
    def update_job_status(status: str, processed: int = 0, error: str = None):
        with engine.begin() as conn:
            conn.execute(
                text("""
                UPDATE import_jobs 
                SET status = :status, processed = :processed, errorMessage = :error, updatedAt = NOW()
                WHERE jobId = :job_id
                """),
                {"status": status, "processed": processed, "error": error, "job_id": job_id}
            )

    try:
        if not os.path.exists(file_path):
            raise Exception("El archivo no fue encontrado en el servidor.")

        # Handle extraction if it's a zip
        target_dir = os.path.dirname(file_path)
        extract_dir = os.path.join(target_dir, f"extracted_{job_id}")
        
        if file_path.endswith('.zip'):
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
        else:
            extract_dir = file_path

        # Find the actual directory containing the parquet files or partitions
        # It could be extract_dir/content/oulad_parquet_output or similar
        parquet_root = extract_dir
        for root, dirs, files in os.walk(extract_dir):
            if any(d.startswith('code_module=') for d in dirs) or any(f.endswith('.parquet') for f in files):
                parquet_root = root
                break

        # Read Parquet files using Pandas
        update_job_status("PROCESSING", processed=0)
        df = pd.read_parquet(parquet_root, engine='pyarrow')
        
        total_rows = len(df)
        if total_rows == 0:
            raise Exception("El dataset Parquet está vacío.")

        # Map to students table
        # We assume common OULAD columns exist: id_student, gender, region, etc.
        student_id_col = 'id_student' if 'id_student' in df.columns else df.columns[0]
        
        # Drop duplicates to get unique students
        students_df = df.drop_duplicates(subset=[student_id_col]).copy()
        
        # We need to map to: studentCode, firstName, lastName, email, careerId, currentSemester, status
        students_to_insert = pd.DataFrame({
            'studentCode': students_df[student_id_col].astype(str),
            'firstName': 'OULAD',
            'lastName': students_df[student_id_col].astype(str),
            'email': students_df[student_id_col].astype(str) + "@oulad.edu",
            'careerId': 1,
            'currentSemester': 1,
            'status': 'ACTIVE'
        })
        
        # To avoid duplicate key errors, fetch existing students
        with engine.begin() as conn:
            existing_students = pd.read_sql("SELECT studentCode, id FROM students", con=conn)
            
        existing_codes = set(existing_students['studentCode'].astype(str))
        new_students = students_to_insert[~students_to_insert['studentCode'].isin(existing_codes)]
        
        if not new_students.empty:
            new_students.to_sql('students', con=engine, if_exists='append', index=False)
            
        # Re-fetch to get all valid IDs
        with engine.begin() as conn:
            all_students = pd.read_sql("SELECT studentCode, id FROM students", con=conn)
            
        id_map = dict(zip(all_students['studentCode'].astype(str), all_students['id']))
        
        # Build academic records
        # Schema: studentId, period, gpa, failedSubjects, attendanceRate, lmsScore
        df['studentId'] = df[student_id_col].astype(str).map(id_map)
        valid_records = df.dropna(subset=['studentId']).copy()
        
        records_to_insert = pd.DataFrame({
            'studentId': valid_records['studentId'].astype(int),
            'period': valid_records['code_presentation'].astype(str) if 'code_presentation' in valid_records.columns else '2024-A',
            'gpa': 7.0, # Default GPA
            'failedSubjects': 0,
            'attendanceRate': 0.85,
            'lmsScore': 0.0
        })
        
        # Map final_result if exists
        if 'final_result' in valid_records.columns:
            # If fail, GPA is lower
            failed = valid_records['final_result'].isin(['Fail', 'Withdrawn'])
            records_to_insert.loc[failed, 'gpa'] = 4.5
            records_to_insert.loc[failed, 'failedSubjects'] = 2
            records_to_insert.loc[failed, 'attendanceRate'] = 0.60
            
            # Map studied_credits as lmsScore approximation if available
            if 'studied_credits' in valid_records.columns:
                records_to_insert['lmsScore'] = valid_records['studied_credits'].fillna(0).astype(float)

        # Insert records
        update_job_status("PROCESSING", processed=int(total_rows * 0.5))
        records_to_insert.to_sql('academic_records', con=engine, if_exists='append', index=False)
        
        # Update success
        update_job_status("COMPLETED", processed=total_rows)

    except Exception as e:
        update_job_status("FAILED", error=str(e))
    finally:
        # Cleanup temp file and extracted folder
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        
        if 'extract_dir' in locals() and os.path.exists(extract_dir):
            try:
                import shutil
                shutil.rmtree(extract_dir)
            except:
                pass


@router.post("/import/oulad")
async def import_oulad_data(
    req: ImportRequest, 
    background_tasks: BackgroundTasks,
    x_worker_secret: str = Header(None)
):
    """
    Protected endpoint to start OULAD data ingestion in the background.
    """
    if x_worker_secret != settings.ML_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid worker secret")
        
    background_tasks.add_task(process_oulad_import, req.jobId, req.filePath)
    
    return {"status": "accepted", "jobId": req.jobId}
