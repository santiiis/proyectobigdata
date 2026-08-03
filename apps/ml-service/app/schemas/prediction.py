from pydantic import BaseModel, Field
from typing import List

class MLFeatures(BaseModel):
    gpa: float
    failedSubjectsCount: int
    attendanceRate: float
    paymentDelayDays: int
    lmsActivityScore: float
    creditsRatio: float

class MLPredictRequest(BaseModel):
    studentId: int
    features: MLFeatures

class MLPredictResponse(BaseModel):
    studentId: int
    score: float
    riskLevel: str
    topRiskFactors: List[str]
    modelVersion: str
    executionTimeMs: float

class BatchRunRequest(BaseModel):
    semesterCode: str
    forceRetrain: bool = False
