"""
Router for Clustering endpoints
"""
import time
import json
import os
from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

def verify_api_key(x_internal_api_key: str = Header(...)):
    if x_internal_api_key != "ml-api-key-cambiar-en-produccion":
        raise HTTPException(status_code=403, detail="Invalid API Key")

# Global cache
_clustering_data = None

def get_clustering_data():
    global _clustering_data
    if _clustering_data is None:
        metrics_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'clustering_metrics.json')
        if os.path.exists(metrics_path):
            with open(metrics_path, 'r') as f:
                _clustering_data = json.load(f)
    return _clustering_data


class ClusterProfile(BaseModel):
    cluster_id: int
    size: int
    percentage: float
    mean_gpa: float
    mean_failed: float
    mean_attendance: float
    mean_lms: float
    label: str


class ClusteringResponse(BaseModel):
    n_clusters: int
    silhouette_score: float
    cluster_profiles: List[ClusterProfile]
    samples: int
    features: List[str]


@router.get("/clustering", response_model=ClusteringResponse, dependencies=[Depends(verify_api_key)])
async def get_clustering():
    """Get clustering results and student profiles."""
    data = get_clustering_data()
    if data is None:
        raise HTTPException(status_code=404, detail="Clustering model not trained yet")
    return data


@router.get("/clustering/summary")
async def get_clustering_summary():
    """Get clustering summary for frontend dashboard."""
    data = get_clustering_data()
    if data is None:
        return {
            "n_clusters": 0,
            "silhouette_score": 0,
            "profiles": [],
            "message": "Model not trained"
        }
    
    return {
        "n_clusters": data["n_clusters"],
        "silhouette_score": data["silhouette_score"],
        "profiles": data["cluster_profiles"],
        "samples": data["samples"]
    }
