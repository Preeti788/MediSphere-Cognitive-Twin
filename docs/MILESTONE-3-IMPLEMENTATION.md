# Milestone 3 – Real-Time Monitoring & Alerts

## Weeks 5 & 6

MediSphere now includes a real-time monitoring demonstration that evaluates incoming patient vital readings and creates alerts when configured thresholds are crossed.

### Monitoring inputs
- Heart rate
- Systolic / diastolic blood pressure
- SpO₂
- Temperature
- Blood glucose

### Alert workflow
1. A vital reading is received from a wearable/manual/live-monitor source.
2. The backend stores the reading in MongoDB.
3. The monitoring rules evaluate the current value.
4. A HIGH or CRITICAL alert is created when a threshold is crossed.
5. The Live Monitoring screen shows the latest reading and recent alerts.
6. The existing Clinical Alerts screen allows acknowledgement.

### Demonstration thresholds
- Heart rate: HIGH > 120 bpm; CRITICAL > 140 bpm
- SpO₂: HIGH < 92%; CRITICAL < 90%
- Systolic BP: HIGH > 160 mmHg; CRITICAL >= 180 mmHg
- Glucose: HIGH > 250 mg/dL; CRITICAL >= 300 mg/dL
- Temperature: HIGH > 38.5 °C; CRITICAL >= 39 °C

### Demo stream
`POST /api/monitoring/{patientId}/simulate?critical=false|true`

The critical scenario intentionally uses a heart rate of 145 bpm so the alert workflow can be demonstrated clearly.

### Important scope
This is a software demonstration/simulation for the academic project. It is not a certified medical device and does not provide clinical diagnosis or emergency response.
