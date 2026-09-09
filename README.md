# MediSphere — Smart Healthcare Management Platform

A Java full-stack implementation aligned to the supplied MediSphere Cognitive Twin specification.

## Stack
- Java 21 + Spring Boot 4.0.8 (project source specification targets Java 25; this build is configured for Java 21)
- Angular 20
- MongoDB
- Apache Kafka
- FHIR R4-ready REST exchange endpoints
- SMART on FHIR authorization handshake foundation
- JWT + role-based security
- Digital Health Twin / Patient 360
- Wearable vital ingestion + automatic alerts
- Consent management
- Explainable demo AI risk engine
- Labs, appointments, care plans, pharmacy and audit-ready structure
- Docker Compose + Kubernetes manifests

The supplied project source specifies Java 25, Spring Boot 4, Angular 20, MongoDB, Kafka, FHIR APIs/SMART on FHIR, TensorFlow Federated, Docker/Kubernetes and HIPAA Vault. The UI and backend here implement the local working foundation end-to-end; TensorFlow Federated and enterprise HIPAA Vault are represented as integration-ready boundaries rather than pretending a local demo is a production clinical AI/security deployment.

## Run locally

### 1. Prerequisites
Install:
- JDK 21
- Maven 3.6.3+
- Node.js 20.19+
- Angular CLI 20
- Docker Desktop (recommended for MongoDB + Kafka)

### 2. Start infrastructure
From this folder:
```bash
docker compose up -d
```

### 3. Start Java backend
```bash
cd backend
mvn clean spring-boot:run
```
Backend: http://localhost:8080

### 4. Start Angular
Open a second terminal:
```bash
cd frontend
npm install
npm start
```
Frontend: http://localhost:4200

## Demo logins
- Admin: admin@medisphere.local / Admin@123
- Doctor: doctor@medisphere.local / Doctor@123
- Nurse: nurse@medisphere.local / Nurse@123
- Receptionist: reception@medisphere.local / Reception@123
- Pharmacist: pharmacist@medisphere.local / Pharmacy@123
- Patient: patient@medisphere.local / Patient@123

## Working flows
1. Open the UI → Login page.
2. Login creates a JWT and opens the clinical workspace.
3. Dashboard loads real MongoDB counts.
4. Patients → Patient 360 loads vitals, labs, appointments, alerts, care plans and consent.
5. Record wearable vital → persists to MongoDB, publishes a Kafka event and evaluates abnormal thresholds.
6. Clinical Alerts → acknowledge alerts.
7. Consent → update and persist patient data-sharing permissions.
8. AI Risk → transparent rule-based demo score with contributing factors.
9. FHIR / SMART → inspect CapabilityStatement and authorization handshake.
10. Pharmacy / Appointments → read and create operational records.

## Important clinical note
The AI risk endpoint is a transparent demonstration engine, not a medically validated model and must not be used for diagnosis or treatment decisions. TensorFlow Federated/SHAP can be connected behind the AI service boundary for a real research/production model.

## Project structure
backend/     Spring Boot API
frontend/    Angular 20 UI
k8s/         Kubernetes manifests
docker-compose.yml
docs/        supporting project notes


## Frontend/backend connection
The Angular client uses `http://localhost:8080/api`. Spring Security includes an explicit CORS configuration for `http://localhost:4200` and `http://127.0.0.1:4200`. After a successful login, the JWT is stored as `medisphere_token` and the application opens `/app`.
