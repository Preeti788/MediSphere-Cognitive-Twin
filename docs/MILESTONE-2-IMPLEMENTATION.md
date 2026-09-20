# MediSphere Cognitive Twin — Milestone 2

## AI Risk Prediction

This milestone adds a presentation-ready explainable risk module on top of Milestone 1.

### Features
- Cardiovascular risk score (0–100)
- Diabetes complication risk score (0–100)
- Low / Moderate / High risk classification
- Feature-level contribution values presented as SHAP-style explanations
- Risk assessment history stored in MongoDB (`risk_assessments`)
- Federated-learning demonstration using local hospital model updates and FedAvg-style aggregation
- Privacy message showing that raw patient records are not exchanged in the simulation

### APIs
- `POST /api/ai/risk/{patientId}` — creates and stores an assessment
- `GET /api/ai/risk/{patientId}/history` — returns recent assessments
- `GET /api/ai/federated-demo` — returns the federated training simulation

### Important scope note
The current implementation is an explainable weighted clinical-feature **demo model** intended for academic presentation and integration testing. The feature contributions are **SHAP-style**, not a claim of a trained clinical SHAP/TensorFlow model. The federated endpoint is a **simulation** of the local-update/aggregation workflow. It is not a medical diagnosis or production clinical decision system.

For the academic architecture, the project specification names TensorFlow Federated and SHAP for Milestone 2. A production version can replace `AiRiskService` with a model-serving adapter while keeping the same API/UI contract.
