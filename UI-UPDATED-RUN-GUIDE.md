# MediSphere — Modern Clinical Intelligence Edition

This build keeps the existing Spring Boot + MongoDB + Kafka architecture and adds a dark, premium clinical interface with real API-backed workflows.

## Start backend

```powershell
cd backend
mvn spring-boot:run
```

MongoDB is expected at `mongodb://localhost:27017/medisphere` unless `MONGODB_URI` is configured. Kafka is optional for the synchronous vital-ingestion fallback, but required if you want the Kafka event stream itself.

## Start frontend

```powershell
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Demo users

- Admin: `admin@medisphere.local` / `Admin@123`
- Doctor: `doctor@medisphere.local` / `Doctor@123`
- Nurse: `nurse@medisphere.local` / `Nurse@123`
- Pharmacist: `pharmacist@medisphere.local` / `Pharmacy@123`

## Added working clinical workflows

- Premium dark/violet/cyan clinical UI system
- Patient 360 + Digital Health Twin
- Explainable AI risk engine
- Real-time vital monitoring + alerts
- Smart prescription workspace
- FHIR `MedicationRequest` bridge
- Medication taken/missed event tracking
- Rule-based medication interaction checker
- Rule-based clinician-review medication suggestions
- Allergy-aware warning surface
- Lab result capture and history
- Real medical-document file upload to `uploads/<patientId>/...`
- Patient-linked notification center
- Patient clinical-context assistant
- Pharmacy low-stock/expiry/batch visibility
- Patient QR generation endpoint and UI
- Operations analytics panel
- Consent, appointments, care plans, FHIR/SMART and existing M1–M4 workflows retained

## Important clinical safety behavior

Medication suggestions are decision-support only. The application does not autonomously prescribe a medication. A Doctor/Admin role must create or change a prescription, and interaction warnings are shown for clinician/pharmacist review.

## Frontend dependency note

Do not copy `node_modules` between operating systems. If a platform-specific Angular/esbuild error appears, delete `frontend/node_modules` and run `npm install` again on the target machine.
