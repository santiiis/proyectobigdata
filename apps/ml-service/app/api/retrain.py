"""
Router for model retraining
"""
from fastapi import APIRouter, Header, HTTPException, Depends, BackgroundTasks
from app.schemas.prediction import BatchRunRequest
from app.core.config import settings
from app.ml.train_model import train_and_save_model

router = APIRouter()

def verify_api_key(x_internal_api_key: str = Header(...)):
    if x_internal_api_key != settings.ML_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")

@router.post("/retrain", dependencies=[Depends(verify_api_key)])
async def retrain_model(request: BatchRunRequest, background_tasks: BackgroundTasks):
    """
    Trigger model retraining for a specific semester.
    """
    background_tasks.add_task(train_and_save_model)
    return {
        "status": "PROCESSING",
        "message": f"Retraining job started for semester {request.semesterCode}"
    }
