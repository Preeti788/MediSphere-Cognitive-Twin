# Document-to-implementation map

| Specification item | Implementation |
|---|---|
| FHIR Integration | `/api/fhir/metadata`, `/api/fhir/Patient`, `/api/fhir/Observation` |
| SMART on FHIR | `/api/smart/authorize` handshake |
| Digital Health Twin | MongoDB patient + vitals + labs + alerts + care plans |
| Patient 360 | Angular Patient 360 view |
| Wearables | Vital ingestion UI/API with `source=WEARABLE` |
| Kafka | Spring Kafka producer on vital ingestion + Docker Kafka |
| Consent | MongoDB consent document + UI controls |
| AI Risk Prediction | Explainable local demo scoring endpoint |
| Real-Time Alerts | Automatic alert creation for abnormal heart rate/SpO2 |
| Care Plan | MongoDB care-plan model/API + Patient 360 display |
| Pharmacy | MongoDB medicine model/API + UI |
| Docker/Kubernetes | Compose + K8s manifests |
| HIPAA Vault | Enterprise security integration boundary; not a local fake Vault |
| TensorFlow Federated | ML integration boundary; not falsely represented as a trained clinical model |
