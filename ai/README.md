# GramCare AI — Model Training and Export Pipeline

Offline symptom-classification and explainable pattern-detection model pipelines for GramCare AI.

## Architectural Role (Preserved Baseline)

- **Framework:** Python, scikit-learn, and m2cgen/ONNX for export to Dart (O-04 / Review 2).
- **Patient-Level Model:** Decision Tree / Small Random Forest (~10–20 trees) optimized for small footprint (<5 MB) and instant offline inference on low-cost mobile hardware (FR-AI-05, NFR-10).
- **Explainability:** Feature importance and decision-path traversal surfacing influencing symptoms for every suggested possible condition (FR-AI-03, NFR-07).
- **Medical Boundary:** Strictly decision support — produces "possible conditions" with confidence, never automated medical diagnoses (D-007, FR-AI-04).
- **Outbreak Detection:** Spatial-temporal statistical thresholds (`case_count > avg_baseline * threshold_multiplier`) and clustering across synchronized cases (D-006, FR-CA-05).

## Milestone Status

- **Phase 0 Status:** Architecture defined. Training pipeline deferred to dedicated AI milestone.
- **Dependencies:** Premature dependency installation avoided per Phase 0 operating rules.
