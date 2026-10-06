# MediSphere — Smart Healthcare Management Platform

MediSphere is a student-friendly Java + Angular healthcare management project covering four milestones:

- **M1:** FHIR Integration & Digital Health Twin / Patient 360
- **M2:** Explainable cardiovascular and diabetes risk review
- **M3:** Real-time vital monitoring and threshold-based clinical alerts
- **M4:** Care Plan & Treatment with task progress tracking

## Technology

- Backend: Java 21, Spring Boot 4
- Frontend: Angular 20
- Database: MongoDB
- Real-time architecture: Apache Kafka integration
- Healthcare interoperability: FHIR-ready REST endpoints + SMART handshake
- Security: JWT + role-based access

## Run in VS Code

### 1. Start MongoDB

Open Terminal 1:

```powershell
mongod --dbpath C:\data\db
```

Keep this terminal running.

### 2. Start the backend

Open Terminal 2:

```powershell
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 3. Start the Angular frontend

Open Terminal 3:

```powershell
cd frontend
npm install
npm start
```

Frontend opens at `http://localhost:4200`.

> Docker/Kafka are integration options. The basic local demo works with MongoDB + Spring Boot + Angular.

## Demo login

The backend seeds these presentation accounts on startup (and updates the demo credentials if the account already exists):

| Username | Password | Role |
|---|---|---|
| `siya` | `Siya@2026` | Receptionist |
| `aarav.mehta` | `Aarav@2026` | Doctor |
| `neha.nurse` | `Nurse@2026` | Nurse |
| `clinic.admin` | `Clinic@2026` | Admin |

The login screen accepts either the username or the email address.

## Demo data

The backend seeds a small presentation dataset when the corresponding records are missing:

- Ananya Verma — Type 2 Diabetes, high-risk demo readings
- Vikram Singh — Hypertension + Type 2 Diabetes, moderate-risk demo readings
- Rahul Kumar — routine wellness / lower-risk demo readings
- appointments, alerts, medicines, labs, consent and a sample M4 care plan

## Suggested presentation flow

`Login → Dashboard → Patient 360 → M2 Risk Review → M3 Monitoring → M4 Care Plan`

For the M3 demo, select a patient in Live Monitoring and use the live simulator to generate changing test vitals. For M4, select Ananya Verma, generate the care plan, then mark tasks completed to show the progress calculation.

## Scope note

The AI risk module and care-plan generation are educational/demo components. They are not clinically validated diagnostic or treatment systems.
