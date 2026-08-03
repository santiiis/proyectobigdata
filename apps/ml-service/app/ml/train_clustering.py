"""
ML Clustering Pipeline - K-Means para perfiles de estudiantes
Spec: Clustering de perfiles de estudiantes
"""
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import joblib
import os
import json
from sqlalchemy import create_engine
from app.core.config import settings

def train_clustering_model():
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        df = pd.read_sql('SELECT id, gpa, failedSubjects, attendanceRate, lmsScore FROM academic_records', con=engine)
        if df.empty:
            raise ValueError("No records found in the database")
    except Exception as e:
        print(f"Error reading from DB: {e}")
        return

    print(f"[CLUSTERING] Loaded {len(df)} academic records")

    X = df[['gpa', 'failedSubjects', 'attendanceRate', 'lmsScore']]
    
    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Use K=3 for clustering (Alto/Medio/Bajo riesgo)
    best_k = 3
    print(f"\n[CLUSTERING] Using K={best_k} (Alto/Medio/Bajo Riesgo)")

    # Train final model with K=3
    kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    
    # Calculate silhouette score
    best_score = silhouette_score(X_scaled, labels, sample_size=min(10000, len(X_scaled)))
    print(f"[CLUSTERING] Silhouette Score: {best_score:.4f}")
    
    # Add labels to dataframe
    df['cluster'] = labels
    
    # Analyze clusters
    print(f"\n[CLUSTERING] Cluster Analysis:")
    cluster_profiles = []
    for cluster_id in range(best_k):
        cluster_data = df[df['cluster'] == cluster_id]
        profile = {
            'cluster_id': int(cluster_id),
            'size': int(len(cluster_data)),
            'percentage': round(float(len(cluster_data) * 100 / len(df)), 2),
            'mean_gpa': round(float(cluster_data['gpa'].mean()), 2),
            'mean_failed': round(float(cluster_data['failedSubjects'].mean()), 2),
            'mean_attendance': round(float(cluster_data['attendanceRate'].mean()), 3),
            'mean_lms': round(float(cluster_data['lmsScore'].mean()), 2),
            'label': ''  # Will be assigned based on characteristics
        }
        
        # Assign label based on characteristics
        if profile['mean_gpa'] < 6.0 or profile['mean_attendance'] < 0.70:
            profile['label'] = 'Alto Riesgo'
        elif profile['mean_gpa'] < 7.0 or profile['mean_attendance'] < 0.80:
            profile['label'] = 'Riesgo Medio'
        else:
            profile['label'] = 'Bajo Riesgo'
        
        cluster_profiles.append(profile)
        
        print(f"\n  Cluster {cluster_id} ({profile['label']}):")
        print(f"    Size: {profile['size']} students ({profile['percentage']}%)")
        print(f"    GPA: {profile['mean_gpa']}")
        print(f"    Failed: {profile['mean_failed']}")
        print(f"    Attendance: {profile['mean_attendance']:.1%}")
        print(f"    LMS: {profile['mean_lms']}")

    # Save clustering model
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    
    model_path = os.path.join(os.path.dirname(__file__), 'clustering_model.joblib')
    joblib.dump({'model': kmeans, 'scaler': scaler}, model_path)
    
    metrics_path = os.path.join(os.path.dirname(__file__), 'clustering_metrics.json')
    metrics = {
        'n_clusters': best_k,
        'silhouette_score': round(float(best_score), 4),
        'cluster_profiles': cluster_profiles,
        'samples': len(df),
        'features': ['gpa', 'failedSubjects', 'attendanceRate', 'lmsScore']
    }
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"\n[CLUSTERING] Model saved to {model_path}")
    print(f"[CLUSTERING] Metrics saved to {metrics_path}")

if __name__ == '__main__':
    train_clustering_model()
