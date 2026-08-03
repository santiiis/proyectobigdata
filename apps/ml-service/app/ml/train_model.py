"""
ML Training Pipeline - Random Forest + Grid Search + AUC-ROC
Spec: Sección 7 - Clasificación con Random Forest
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import recall_score, precision_score, f1_score, roc_auc_score, classification_report
import joblib
import os
import json
from sqlalchemy import create_engine
from app.core.config import settings

def train_and_save_model():
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        df = pd.read_sql('SELECT gpa, failedSubjects, attendanceRate, lmsScore FROM academic_records', con=engine)
        if df.empty:
            raise ValueError("No records found in the database")
    except Exception as e:
        print(f"Error reading from DB: {e}")
        return

    print(f"[TRAIN] Loaded {len(df)} academic records")
    print(f"[TRAIN] GPA range: {df['gpa'].min():.2f} - {df['gpa'].max():.2f}, mean={df['gpa'].mean():.2f}")
    print(f"[TRAIN] Attendance range: {df['attendanceRate'].min():.3f} - {df['attendanceRate'].max():.3f}")
    print(f"[TRAIN] LMS range: {df['lmsScore'].min():.2f} - {df['lmsScore'].max():.2f}")
    print(f"[TRAIN] Failed subjects range: {df['failedSubjects'].min()} - {df['failedSubjects'].max()}")

    # Target: risk based on multiple factors
    lms_threshold = df['lmsScore'].quantile(0.30)
    
    df['isAtRisk'] = (
        (df['gpa'] < 6.0) |
        (df['attendanceRate'] < 0.70) |
        (df['failedSubjects'] >= 2) |
        (df['lmsScore'] < lms_threshold)
    ).astype(int)

    at_risk_count = df['isAtRisk'].sum()
    total = len(df)
    print(f"[TRAIN] Target distribution: {at_risk_count} at-risk ({at_risk_count*100/total:.1f}%), {total - at_risk_count} not-at-risk ({(total-at_risk_count)*100/total:.1f}%)")

    X = df[['gpa', 'failedSubjects', 'attendanceRate', 'lmsScore']]
    y = df['isAtRisk']

    # Add label noise (10%)
    np.random.seed(42)
    y_noisy = y.copy()
    flip_mask = np.random.random(len(y_noisy)) < 0.10
    y_noisy[flip_mask] = 1 - y_noisy[flip_mask]
    flipped_count = flip_mask.sum()
    print(f"[TRAIN] Flipped {flipped_count} labels ({flipped_count*100/len(y):.1f}%) for realistic noise")

    # Normalize features
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

    # ============================================
    # GRID SEARCH: Random Forest
    # Spec: numTrees [20,50], maxDepth [3,7]
    # ============================================
    print("\n[GRID SEARCH] Starting Random Forest Grid Search...")
    print("[GRID SEARCH] Parameters: numTrees=[20,50], maxDepth=[3,7]")
    
    param_grid = {
        'n_estimators': [20, 50],
        'max_depth': [3, 7],
        'min_samples_split': [10, 20],
        'min_samples_leaf': [5, 10],
    }
    
    rf_base = RandomForestClassifier(
        class_weight='balanced',
        random_state=42
    )
    
    # StratifiedKFold for cross-validation
    n_splits = min(5, at_risk_count) if at_risk_count >= 2 else 2
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    # GridSearchCV
    grid_search = GridSearchCV(
        estimator=rf_base,
        param_grid=param_grid,
        cv=cv,
        scoring='f1',
        n_jobs=-1,
        verbose=1
    )
    
    grid_search.fit(X_scaled, y_noisy)
    
    print(f"\n[GRID SEARCH] Best parameters: {grid_search.best_params_}")
    print(f"[GRID SEARCH] Best F1 score: {grid_search.best_score_:.4f}")
    
    # Get best model
    best_model = grid_search.best_estimator_
    
    # ============================================
    # CROSS-VALIDATION METRICS
    # ============================================
    cv_f1 = cross_val_score(best_model, X_scaled, y_noisy, cv=cv, scoring='f1')
    cv_recall = cross_val_score(best_model, X_scaled, y_noisy, cv=cv, scoring='recall')
    cv_precision = cross_val_score(best_model, X_scaled, y_noisy, cv=cv, scoring='precision')
    cv_auc = cross_val_score(best_model, X_scaled, y_noisy, cv=cv, scoring='roc_auc')
    
    # Clean label metrics
    y_pred_train = best_model.predict(X_scaled)
    y_proba_train = best_model.predict_proba(X_scaled)[:, 1]
    
    clean_f1 = f1_score(y, y_pred_train)
    clean_recall = recall_score(y, y_pred_train)
    clean_precision = precision_score(y, y_pred_train)
    clean_auc = roc_auc_score(y, y_proba_train)
    
    # Train metrics on noisy labels
    train_f1 = f1_score(y_noisy, y_pred_train)
    train_recall = recall_score(y_noisy, y_pred_train)
    train_precision = precision_score(y_noisy, y_pred_train)
    train_auc = roc_auc_score(y_noisy, y_proba_train)
    
    # ============================================
    # SAVE METRICS
    # ============================================
    metrics = {
        "recall": round(float(np.mean(cv_recall)), 4),
        "precision": round(float(np.mean(cv_precision)), 4),
        "f1": round(float(np.mean(cv_f1)), 4),
        "auc_roc": round(float(np.mean(cv_auc)), 4),
        "clean_recall": round(float(clean_recall), 4),
        "clean_precision": round(float(clean_precision), 4),
        "clean_f1": round(float(clean_f1), 4),
        "clean_auc": round(float(clean_auc), 4),
        "train_recall": round(float(train_recall), 4),
        "train_precision": round(float(train_precision), 4),
        "train_f1": round(float(train_f1), 4),
        "train_auc": round(float(train_auc), 4),
        "samples": total,
        "at_risk_count": int(at_risk_count),
        "not_at_risk_count": int(total - at_risk_count),
        "label_noise_rate": 0.10,
        "lms_threshold": round(float(lms_threshold), 2),
        "features": list(X.columns),
        "feature_importances": dict(zip(X.columns, [round(float(x), 4) for x in best_model.feature_importances_])),
        "hyperparameters": {
            "algorithm": "RandomForestClassifier",
            "n_estimators": best_model.n_estimators,
            "max_depth": best_model.max_depth,
            "min_samples_split": best_model.min_samples_split,
            "min_samples_leaf": best_model.min_samples_leaf,
            "class_weight": "balanced",
            "grid_search_params": param_grid,
            "best_params": grid_search.best_params_
        },
        "version": settings.MODEL_VERSION,
    }

    print(f"\n[TRAIN] Cross-validated metrics (noisy labels):")
    print(f"  Recall:    {np.mean(cv_recall)*100:.1f}% (+/- {np.std(cv_recall)*100:.1f}%)")
    print(f"  Precision: {np.mean(cv_precision)*100:.1f}% (+/- {np.std(cv_precision)*100:.1f}%)")
    print(f"  F1-Score:  {np.mean(cv_f1)*100:.1f}% (+/- {np.std(cv_f1)*100:.1f}%)")
    print(f"  AUC-ROC:   {np.mean(cv_auc)*100:.1f}% (+/- {np.std(cv_auc)*100:.1f}%)")
    print(f"\n[TRAIN] Metrics on CLEAN labels (true risk):")
    print(f"  Recall:    {clean_recall*100:.1f}%")
    print(f"  Precision: {clean_precision*100:.1f}%")
    print(f"  F1-Score:  {clean_f1*100:.1f}%")
    print(f"  AUC-ROC:   {clean_auc*100:.1f}%")
    print(f"\n[TRAIN] Feature importances:")
    for feat, imp in zip(X.columns, best_model.feature_importances_):
        print(f"  {feat}: {imp:.4f}")
    print(f"\n[TRAIN] Best hyperparameters:")
    for param, value in grid_search.best_params_.items():
        print(f"  {param}: {value}")

    # Save model + scaler
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    
    model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
    joblib.dump({'model': best_model, 'scaler': scaler}, model_path)
    
    metrics_path = os.path.join(os.path.dirname(__file__), 'model_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print(f"\n[TRAIN] Model saved to {model_path}")
    print(f"[TRAIN] Metrics saved to {metrics_path}")

if __name__ == '__main__':
    train_and_save_model()
