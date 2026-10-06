# MediSphere — Milestone 3: Real-Time Monitoring & Alerts

## Implemented

- Live Monitoring workspace in Angular with a modern clinical dashboard.
- Patient stream list with NORMAL / WARNING / CRITICAL state.
- Patient-specific live vitals: Heart Rate, SpO2, Blood Pressure and Glucose.
- Vital trend chart for recent MongoDB vital history.
- Five-second dashboard refresh for demo real-time visibility.
- Automatic threshold evaluation for heart rate, SpO2, blood pressure, glucose and temperature.
- Alert persistence in MongoDB and alert acknowledgement through the existing alert API.
- Duplicate active alerts are suppressed for the same patient/type/message.
- Kafka publication on `medisphere.vitals`.
- Kafka monitoring consumer for asynchronous alert evaluation.
- Synchronous monitoring fallback keeps the application functional when Kafka is not running.
- Existing M1/M2 workflows are retained; no existing endpoint was removed.

## API

- `GET /api/monitoring/overview`
- `GET /api/monitoring/patient/{patientId}`
- `POST /api/monitoring/evaluate`
- Existing `POST /api/vitals` now feeds the M3 monitoring engine and publishes the vital event.
- Existing `PUT /api/alerts/{id}/acknowledge` remains the acknowledgement action.

## Thresholds used by the demo monitoring engine

| Vital | Warning | Critical |
|---|---|---|
| Heart rate | >100 or <60 bpm | >120 or <45 bpm |
| SpO2 | <95% | <92% |
| Systolic BP | >140 or <100 mmHg | >180 or <90 mmHg |
| Diastolic BP | >90 or <65 mmHg | >120 or <60 mmHg |
| Glucose | >180 or <70 mg/dL | >250 or <55 mg/dL |
| Temperature | >37.5 C | >=39 C or <35 C |

These are software-demo thresholds for the academic project, not clinical decision rules.

## Run

1. Start MongoDB.
2. Optional but recommended for the Kafka event path: `docker compose up -d mongodb kafka` from the project root.
3. Backend: open `backend` and run `mvn spring-boot:run`.
4. Frontend: open `frontend` and run `npm start`.
5. Open the Angular application and choose **Live Monitoring** from the sidebar.

If Kafka is not running, vital ingestion and synchronous alert evaluation still work; Kafka listener connection errors may appear in backend logs until the broker is started.
