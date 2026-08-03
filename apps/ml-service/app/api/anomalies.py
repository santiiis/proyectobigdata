"""
Router for Anomaly Detection endpoints
"""
import time
import json
import os
from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

def verify_api_key(x_internal_api_key: str = Header(...)):
    if x_internal_api_key != "ml-api-key-cambiar-en-produccion":
        raise HTTPException(status_code=403, detail="Invalid API Key")

# Global cache
_anomaly_data = None

def get_anomaly_data():
    global _anomaly_data
    if _anomaly_data is None:
        metrics_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'anomaly_metrics.json')
        if os.path.exists(metrics_path):
            with open(metrics_path, 'r') as f:
                _anomaly_data = json.load(f)
    return _anomaly_data


class AnomalyCharacteristics(BaseModel):
    mean_gpa: float
    mean_failed: float
    mean_attendance: float
    mean_lms: float


class AnomalyResponse(BaseModel):
    n_anomalies: int
    n_normal: int
    anomaly_rate: float
    contamination: float
    anomaly_characteristics: AnomalyCharacteristics
    normal_characteristics: AnomalyCharacteristics
    samples: int
    features: List[str]


@router.get("/anomalies", response_model=AnomalyResponse, dependencies=[Depends(verify_api_key)])
async def get_anomalies():
    """Get anomaly detection results."""
    data = get_anomaly_data()
    if data is None:
        raise HTTPException(status_code=404, detail="Anomaly model not trained yet")
    return data


@router.get("/anomalies/summary")
async def get_anomalies_summary():
    """Get anomaly detection summary for frontend dashboard."""
    data = get_anomaly_data()
    if data is None:
        return {
            "n_anomalies": 0,
            "n_normal": 0,
            "anomaly_rate": 0,
            "characteristics": {},
            "message": "Model not trained"
        }
    
    return {
        "n_anomalies": data["n_anomalies"],
        "n_normal": data["n_normal"],
        "anomaly_rate": data["anomaly_rate"],
        "anomaly_characteristics": data["anomaly_characteristics"],
        "normal_characteristics": data["normal_characteristics"],
        "samples": data["samples"]
    }
