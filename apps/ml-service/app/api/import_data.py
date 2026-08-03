from fastapi import APIRouter, HTTPException, BackgroundTasks, Header, File, UploadFile, Form
import os
import shutil
import tempfile
import zipfile
import pandas as pd
import pyarrow.parquet as pq
from sqlalchemy import create_engine, text
from app.core.config import settings
from starlette.concurrency import run_in_threadpool

router = APIRouter()

def process_oulad_import(job_id: str, file_path: str):
    """
    Background worker that unzips/reads parquet, transforms, and bulk inserts to MySQL.
    """
    print(f"[IMPORT] Starting import for job {job_id}, file: {file_path}", flush=True)
    engine = create_engine(settings.DATABASE_URL)
    
    def update_job_status(status: str, processed: int = 0, error: str = None, total_records: int = None):
        try:
            with engine.begin() as conn:
                if total_records is not None:
                    conn.execute(
                        text("""
                        UPDATE import_jobs 
                        SET status = :status, processed = :processed, totalRecords = :total_records, errorMessage = :error, updatedAt = NOW()
                        WHERE jobId = :job_id
                        """),
                        {"status": status, "processed": processed, "total_records": total_records, "error": error, "job_id": job_id}
                    )
                else:
                    conn.execute(
                        text("""
                        UPDATE import_jobs 
                        SET status = :status, processed = :processed, errorMessage = :error, updatedAt = NOW()
                        WHERE jobId = :job_id
                        """),
                        {"status": status, "processed": processed, "error": error, "job_id": job_id}
                    )
            print(f"[IMPORT] Updated job {job_id} status to {status}", flush=True)
        except Exception as e:
            print(f"[IMPORT] ERROR updating job status: {e}", flush=True)

    try:
        if not os.path.exists(file_path):
            raise Exception("El archivo no fue encontrado en el servidor.")

        print(f"[IMPORT] File exists, checking size: {os.path.getsize(file_path)} bytes", flush=True)
        update_job_status("PROCESSING", processed=0)

        # Handle extraction if it's a zip
        target_dir = os.path.dirname(file_path)
        extract_dir = os.path.join(target_dir, f"extracted_{job_id}")
        
        if file_path.endswith('.zip'):
            print(f"[IMPORT] Extracting zip file...", flush=True)
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            print(f"[IMPORT] Extracted to {extract_dir}", flush=True)
        else:
            extract_dir = file_path

        # Collect all .parquet files recursively
        parquet_files = []
        if os.path.isfile(extract_dir):
            parquet_files = [extract_dir]
        else:
            for root, dirs, files in os.walk(extract_dir):
                for f in files:
                    if f.endswith('.parquet'):
                        parquet_files.append(os.path.join(root, f))

        print(f"[IMPORT] Found {len(parquet_files)} parquet files", flush=True)
        if not parquet_files:
            raise Exception("No se encontraron archivos .parquet en el paquete subido.")

        # Read Parquet files using PyArrow dataset (directory/partition aware)
        print(f"[IMPORT] Reading parquet files...", flush=True)
        df = pq.ParquetDataset(parquet_files).read().to_pandas()
        
        total_rows = len(df)
        print(f"[IMPORT] Read {total_rows} rows, columns: {list(df.columns)}", flush=True)
        if total_rows == 0:
            raise Exception("El dataset Parquet está vacío.")

        # Map to students table
        # We assume common OULAD columns exist: id_student, gender, region, etc.
        student_id_col = 'id_student' if 'id_student' in df.columns else df.columns[0]
        
        # Drop duplicates to get unique students
        students_df = df.drop_duplicates(subset=[student_id_col]).copy()
        
        from datetime import datetime
        now = datetime.now()

        students_to_insert = pd.DataFrame({
            'studentCode': students_df[student_id_col].astype(str),
            'firstName': 'OULAD',
            'lastName': students_df[student_id_col].astype(str),
            'email': students_df[student_id_col].astype(str) + "@oulad.edu",
            'careerId': 1,
            'currentSemester': 1,
            'status': 'ACTIVE',
            'updatedAt': now
        })
        
        # To avoid duplicate key errors, fetch existing students
        with engine.begin() as conn:
            existing_students = pd.read_sql("SELECT studentCode, id FROM students", con=conn)
            
        existing_codes = set(existing_students['studentCode'].astype(str))
        new_students = students_to_insert[~students_to_insert['studentCode'].isin(existing_codes)]
        
        if not new_students.empty:
            new_students.to_sql('students', con=engine, if_exists='append', index=False)
            print(f"[IMPORT] Inserted {len(new_students)} new students", flush=True)
        else:
            print(f"[IMPORT] No new students to insert (all exist)", flush=True)
            
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
            'lmsScore': 0.0,
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
        update_job_status("PROCESSING", processed=int(total_rows * 0.5), total_records=total_rows)
        records_to_insert.to_sql('academic_records', con=engine, if_exists='append', index=False)
        print(f"[IMPORT] Inserted {len(records_to_insert)} academic records", flush=True)
        
        # Update success
        update_job_status("COMPLETED", processed=total_rows, total_records=total_rows)
        print(f"[IMPORT] Job {job_id} completed successfully with {total_rows} rows", flush=True)

    except Exception as e:
        print(f"[IMPORT] ERROR: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
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
                shutil.rmtree(extract_dir)
            except:
                pass

        # Remove the temp dir created for this job
        target_dir = os.path.dirname(file_path)
        if os.path.exists(target_dir):
            try:
                shutil.rmtree(target_dir)
            except:
                pass


@router.post("/import/oulad")
async def import_oulad_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    jobId: str = Form(...),
    x_internal_api_key: str = Header(None),
    x_worker_secret: str = Header(None)
):
    """
    Protected endpoint to start OULAD data ingestion in the background.
    Recibe el archivo (.zip o .parquet) directamente vía multipart/form-data
    para que funcione tanto local como dentro de Docker.
    """
    api_key = x_internal_api_key or x_worker_secret
    if api_key != settings.ML_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

    # Persistir el archivo en un directorio temporal del ML service
    temp_dir = tempfile.mkdtemp(prefix="oulad_import_")
    file_path = os.path.join(temp_dir, file.filename or "import.zip")

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    background_tasks.add_task(_run_import_sync, jobId, file_path)

    return {"status": "accepted", "jobId": jobId}


def _run_import_sync(job_id: str, file_path: str):
    """Wrapper to run import in a thread pool so it doesn't get cancelled."""
    try:
        # BackgroundTasks runs synchronous functions in a thread pool automatically.
        process_oulad_import(job_id, file_path)
    except Exception as e:
        print(f"[IMPORT] Fatal error in _run_import_sync: {e}")
        import traceback
        traceback.print_exc()
        # Try to mark as failed
        try:
            engine = create_engine(settings.DATABASE_URL)
            with engine.begin() as conn:
                conn.execute(
                    text("UPDATE import_jobs SET status = 'FAILED', errorMessage = :error, updatedAt = NOW() WHERE jobId = :job_id"),
                    {"error": str(e), "job_id": job_id}
                )
        except:
            pass
