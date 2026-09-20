# Milestone 3 – Real-Time Monitoring & Alerts

## Purpose
MediSphere continuously evaluates incoming demo vital readings and creates a clinical alert when a configured threshold is crossed. The module is designed for academic demonstration and integration testing.

## Monitored signals
- Heart rate (bpm)
- Systolic/diastolic blood pressure (mmHg)
- Oxygen saturation (SpO2)
- Temperature (°C)
- Glucose (mg/dL)

## Alert workflow
1. A vital reading arrives from the demo stream.
2. The backend checks the configured thresholds.
3. An alert is stored in MongoDB with severity, observed value, unit, threshold, timestamp and recipient team.
4. The Live Monitoring screen refreshes the current reading and recent alerts.
5. A care-team notification is represented by a queued notification status.
6. Staff can acknowledge an alert.

## Demo scenario
Use **Live Monitoring → select Vikram Singh → Start live monitoring**. To show the critical path immediately, use **Simulate HR 145 bpm**. The backend records a critical heart-rate event and also evaluates the accompanying BP, SpO2 and glucose values.

## Risk levels in Milestone 2
Cardiovascular and diabetes scores are mapped automatically: **LOW < 40, MODERATE 40–69.9, HIGH ≥ 70**. The seeded demo patients intentionally contain different clinical profiles so the presentation does not show every patient as LOW.

> This is a software simulation. It does not claim live medical-device connectivity or clinical validation.
