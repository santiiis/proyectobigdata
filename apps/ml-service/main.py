"""
Servicio de Machine Learning — FastAPI Entrypoint

Spec: Sección 2.1 — Servicio Desacoplado de IA/ML
Endpoints:
  GET  /health   — Health check
  POST /predict  — Run inference on student features (TODO)
  POST /retrain  — Trigger model retraining (TODO)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="ML Service — Deserción Estudiantil",
    description="Servicio de predicción de riesgo de deserción académica",
    version="0.1.0",
)

# CORS for internal communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.WEB_ORIGIN],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring."""
    return {
        "status": "ok",
        "service": "ml-service",
        "version": "0.1.0",
    }

from app.api import predict, retrain, import_data

app.include_router(predict.router, prefix="/api/v1", tags=["Predictions"])
app.include_router(retrain.router, prefix="/api/v1", tags=["Model Training"])
app.include_router(import_data.router, prefix="/api/v1", tags=["Data Import"])
