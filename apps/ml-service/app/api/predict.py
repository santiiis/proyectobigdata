"""
Router for ML predictions (Spec 12.4)
"""
import time
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
        # Fallback to dummy if no model is trained yet
        score = 0.842
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
    if score >= 0.70:
        risk_level = "HIGH"
    elif score >= 0.40:
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
