"""
ML Anomaly Detection Pipeline - Isolation Forest
Spec: Detección de casos de riesgo atípicos
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json
from sqlalchemy import create_engine
from app.core.config import settings

def train_anomaly_model():
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        df = pd.read_sql('SELECT id, gpa, failedSubjects, attendanceRate, lmsScore FROM academic_records', con=engine)
        if df.empty:
            raise ValueError("No records found in the database")
    except Exception as e:
        print(f"Error reading from DB: {e}")
        return

    print(f"[ANOMALY] Loaded {len(df)} academic records")

    X = df[['gpa', 'failedSubjects', 'attendanceRate', 'lmsScore']]
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest
    # contamination: expected proportion of anomalies
    # Based on domain: ~5% of students might have anomalous behavior
    print("[ANOMALY] Training Isolation Forest...")
    
    isolation_forest = IsolationForest(
        n_estimators=100,
        contamination=0.05,  # 5% expected anomalies
        max_samples='auto',
        random_state=42,
        n_jobs=-1
    )
    
    # Fit and predict
    anomaly_labels = isolation_forest.fit_predict(X_scaled)
    anomaly_scores = isolation_forest.decision_function(X_scaled)
    
    # Convert labels: -1 = anomaly, 1 = normal -> 1 = anomaly, 0 = normal
    df['is_anomaly'] = (anomaly_labels == -1).astype(int)
    df['anomaly_score'] = -anomaly_scores  # Higher score = more anomalous
    
    # Statistics
    n_anomalies = df['is_anomaly'].sum()
    n_normal = len(df) - n_anomalies
    
    print(f"\n[ANOMALY] Detection Results:")
    print(f"  Total students: {len(df)}")
    print(f"  Anomalies detected: {n_anomalies} ({n_anomalies*100/len(df):.1f}%)")
    print(f"  Normal students: {n_normal} ({n_normal*100/len(df):.1f}%)")
    
    # Analyze anomalies
    anomaly_data = df[df['is_anomaly'] == 1]
    normal_data = df[df['is_anomaly'] == 0]
    
    print(f"\n[ANOMALY] Anomaly Characteristics:")
    print(f"  GPA: {anomaly_data['gpa'].mean():.2f} (normal: {normal_data['gpa'].mean():.2f})")
    print(f"  Failed: {anomaly_data['failedSubjects'].mean():.2f} (normal: {normal_data['failedSubjects'].mean():.2f})")
    print(f"  Attendance: {anomaly_data['attendanceRate'].mean():.3f} (normal: {normal_data['attendanceRate'].mean():.3f})")
    print(f"  LMS: {anomaly_data['lmsScore'].mean():.2f} (normal: {normal_data['lmsScore'].mean():.2f})")
    
    # Top 10 most anomalous
    top_anomalies = df.nlargest(10, 'anomaly_score')[['id', 'gpa', 'failedSubjects', 'attendanceRate', 'lmsScore', 'anomaly_score']]
    print(f"\n[ANOMALY] Top 10 Most Anomalous Students:")
    print(top_anomalies.to_string(index=False))

    # Save anomaly model
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    
    model_path = os.path.join(os.path.dirname(__file__), 'anomaly_model.joblib')
    joblib.dump({'model': isolation_forest, 'scaler': scaler}, model_path)
    
    metrics_path = os.path.join(os.path.dirname(__file__), 'anomaly_metrics.json')
    metrics = {
        'n_anomalies': int(n_anomalies),
        'n_normal': int(n_normal),
        'anomaly_rate': round(float(n_anomalies * 100 / len(df)), 2),
        'contamination': 0.05,
        'anomaly_characteristics': {
            'mean_gpa': round(float(anomaly_data['gpa'].mean()), 2),
            'mean_failed': round(float(anomaly_data['failedSubjects'].mean()), 2),
            'mean_attendance': round(float(anomaly_data['attendanceRate'].mean()), 3),
            'mean_lms': round(float(anomaly_data['lmsScore'].mean()), 2)
        },
        'normal_characteristics': {
            'mean_gpa': round(float(normal_data['gpa'].mean()), 2),
            'mean_failed': round(float(normal_data['failedSubjects'].mean()), 2),
            'mean_attendance': round(float(normal_data['attendanceRate'].mean()), 3),
            'mean_lms': round(float(normal_data['lmsScore'].mean()), 2)
        },
        'samples': len(df),
        'features': ['gpa', 'failedSubjects', 'attendanceRate', 'lmsScore']
    }
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"\n[ANOMALY] Model saved to {model_path}")
    print(f"[ANOMALY] Metrics saved to {metrics_path}")

if __name__ == '__main__':
    train_anomaly_model()
