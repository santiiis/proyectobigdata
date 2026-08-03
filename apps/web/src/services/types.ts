export interface MLPredictRequest {
  studentId: number;
  features: Record<string, any>;
}

export interface MLPredictResponse {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  topRiskFactors: string[];
  modelVersion: string;
}
