import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
from sqlalchemy import create_engine
from app.core.config import settings

def train_and_save_model():
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # Read from academic_records
        df = pd.read_sql('SELECT gpa, failedSubjects, attendanceRate, lmsScore FROM academic_records', con=engine)
        if df.empty:
            raise ValueError("No records found in the database")
    except Exception as e:
        print(f"Error reading from DB: {e}")
        return

    # Create target variable: Risk is defined as GPA < 6.0 or attendance < 0.7
    df['isAtRisk'] = (df['gpa'] < 6.0) | (df['attendanceRate'] < 0.70)

    X = df[['gpa', 'failedSubjects', 'attendanceRate', 'lmsScore']]
    y = df['isAtRisk'].astype(int)
    
    # Train actual model
    model = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
    model.fit(X, y)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    
    model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
