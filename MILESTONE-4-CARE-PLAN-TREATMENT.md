# MediSphere — Milestone 4: Care Plan & Treatment

## Implemented
- Dedicated **Care Plan & Treatment** workspace in Angular.
- Patient-specific care plan listing backed by MongoDB.
- Create care plan with goal, treatment actions, category, priority, status, follow-up date, progress and adherence.
- Edit existing care plans.
- Delete care plans.
- Generate a demo personalized care plan from the existing **M2 explainable risk engine**.
- Patient 360 → **Open M4** shortcut.
- Dashboard → Care orchestration summary and M4 navigation.
- Care plan count included in dashboard metrics.

## API
- `GET /api/care-plans/{patientId}`
- `POST /api/care-plans`
- `PUT /api/care-plans/{id}`
- `DELETE /api/care-plans/{id}`
- `POST /api/care-plans/generate/{patientId}`

## Data flow
`Patient → Latest Vitals/Labs/Conditions → M2 Risk Engine → M4 Care Plan → MongoDB → Angular Tracking UI`

The generated plan is a project/demo workflow and **not clinical advice or a validated treatment recommendation**.
