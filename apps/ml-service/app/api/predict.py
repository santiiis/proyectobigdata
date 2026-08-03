"""
Router for ML predictions (Spec 12.4)
"""
import time
import json
from fastapi import APIRouter, Header, HTTPException, Depends
from app.schemas.prediction import MLPredictRequest, MLPredictResponse
from app.core.config import settings

router = APIRouter()

def verify_api_key(x_internal_api_key: str = Header(...)):
    if x_internal_api_key != settings.ML_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")

import os
import joblib
import pandas as pd

# Global model/scaler cache
_model_bundle = None

def get_model():
    global _model_bundle
    if _model_bundle is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'model.joblib')
        if os.path.exists(model_path):
            _model_bundle = joblib.load(model_path)
    return _model_bundle


@router.post("/predict", response_model=MLPredictResponse, dependencies=[Depends(verify_api_key)])
async def predict_risk(request: MLPredictRequest):
    """
    Run inference on student features using the trained RandomForest model.
    """
    start_time = time.time()
    bundle = get_model()
    
    features_df = pd.DataFrame([{
        'gpa': request.features.gpa or 0,
        'failedSubjects': request.features.failedSubjectsCount or 0,
        'attendanceRate': request.features.attendanceRate or 0,
        'lmsScore': request.features.lmsActivityScore or 0,
    }])
    
    if bundle is None:
        # Fallback heuristico si no hay modelo entrenado
        gpa = max(0.0, min(float(request.features.gpa or 0), 10.0))
        failed = max(0, int(request.features.failedSubjectsCount or 0))
        attendance = max(0.0, min(float(request.features.attendanceRate or 0), 1.0))
        lms = max(0.0, min(float(request.features.lmsActivityScore or 0), 1.0))
        base = 0.05
        base += (1 - gpa / 10.0) * 0.35
        base += min(failed, 5) * 0.08
        base += (1 - attendance) * 0.40
        base += (1 - lms) * 0.12
        score = round(min(base, 0.95), 4)
    else:
        model = bundle['model']
        scaler = bundle['scaler']
        
        # Scale features using the same scaler from training
        X_scaled = scaler.transform(features_df)
        X_scaled_df = pd.DataFrame(X_scaled, columns=features_df.columns)
        
        proba = model.predict_proba(X_scaled_df)[0]
        score = float(proba[1])  # Probability of being AtRisk
        
    risk_level = "LOW"
    if score >= 0.66:
        risk_level = "HIGH"
    elif score >= 0.31:
        risk_level = "MEDIUM"
        
    # Generate dynamic risk factors based on features
    factors = []
    if request.features.attendanceRate < 0.70:
        factors.append(f"Asistencia baja ({(request.features.attendanceRate * 100):.1f}%)")
    if request.features.gpa < 6.0:
        factors.append(f"GPA bajo ({request.features.gpa})")
    if request.features.failedSubjectsCount >= 2:
        factors.append(f"Materias reprobadas: {request.features.failedSubjectsCount}")
    lms_threshold = 60.0  # Matches training threshold (30th percentile)
    if request.features.lmsActivityScore < lms_threshold:
        factors.append(f"Actividad LMS baja ({request.features.lmsActivityScore:.2f})")
        
    if not factors:
        factors.append("Rendimiento estable")
    
    return MLPredictResponse(
        studentId=request.studentId,
        score=score,
        riskLevel=risk_level,
        topRiskFactors=factors,
        modelVersion=settings.MODEL_VERSION,
        executionTimeMs=round((time.time() - start_time) * 1000, 2)
    )


@router.get("/metrics")
async def get_model_metrics():
    """Return saved model training metrics (Recall, Precision, F1-Score)."""
    metrics_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'model_metrics.json')
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            return json.load(f)
    return {"recall": 0, "precision": 0, "f1": 0, "samples": 0, "version": settings.MODEL_VERSION}
