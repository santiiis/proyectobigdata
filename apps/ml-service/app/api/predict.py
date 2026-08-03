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

# Global model cache
_model = None

def get_model():
    global _model
    if _model is None:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'model.joblib')
        if os.path.exists(model_path):
            _model = joblib.load(model_path)
    return _model

@router.post("/predict", response_model=MLPredictResponse, dependencies=[Depends(verify_api_key)])
async def predict_risk(request: MLPredictRequest):
    """
    Run inference on student features using the trained RandomForest model.
    """
    start_time = time.time()
    model = get_model()
    
    if model is None:
        # Fallback heurístico si no hay modelo entrenado: el riesgo se deriva
        # de las características reales del estudiante en vez de un valor fijo.
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
        # The model was trained on ['gpa', 'failedSubjects', 'attendanceRate', 'lmsScore']
        X_df = pd.DataFrame([{
            'gpa': request.features.gpa,
            'failedSubjects': request.features.failedSubjectsCount,
            'attendanceRate': request.features.attendanceRate,
            'lmsScore': request.features.lmsActivityScore
        }])
        
        # predict_proba returns [[prob_0, prob_1]]
        proba = model.predict_proba(X_df)[0]
        score = float(proba[1]) # Probability of being AtRisk
        
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
    if request.features.failedSubjectsCount > 0:
        factors.append(f"Materias reprobadas: {request.features.failedSubjectsCount}")
        
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
