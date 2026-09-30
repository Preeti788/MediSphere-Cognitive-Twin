# MediSphere – Milestone 4: Care Plan & Treatment

## Scope
Weeks 7–8: move from risk and monitoring into a practical, patient-specific care-plan workflow.

## What is implemented
- Patient-specific care plan generation from existing patient conditions, latest vitals and latest available risk assessment.
- Treatment tasks grouped by Treatment, Monitoring, Lifestyle, Follow-up and Clinical review.
- Task completion tracking with a live progress percentage.
- Follow-up date and care-team owner.
- Latest BP, heart rate, SpO2 and glucose snapshot for progress review.
- Previous care-plan history for the selected patient.

## API
- `POST /api/care-plans/generate/{patientId}` – create a personalized demo plan.
- `GET /api/care-plans/{patientId}` – list plans for a patient.
- `POST /api/care-plans` – save a manually supplied plan.
- `PUT /api/care-plans/{id}/tasks/{taskIndex}?completed=true|false` – track task completion.

## Demo
Open **M4 Care Plans → select patient → Generate care plan → complete tasks → review progress and latest readings**.

## Important
This milestone is an academic rule-based care-plan demonstration. It does not provide medical diagnosis, prescribing, or clinically validated treatment recommendations. Production clinical guidelines, clinician approval, and validation are future enhancements.
