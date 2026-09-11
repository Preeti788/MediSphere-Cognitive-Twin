# MediSphere – Milestone 2 AI Risk Prediction

## What was added

The project now contains a locally runnable explainable AI module for:

1. Cardiovascular risk
2. Diabetes complication risk

### Federated Learning
Three simulated clinical clients independently train a logistic regression model.
The application uses FedAvg to average only model weights.

### SHAP explainability
For the linear model, the feature contribution is calculated additively against
a healthy baseline. The UI shows the strongest positive/negative contributors.

## Flow

Angular Patient 360
    -> POST /api/ai/risk/{patientId}
    -> Spring Boot RiskPredictionService
    -> 3 simulated local clients train
    -> FedAvg aggregation
    -> prediction
    -> SHAP-style feature contributions
    -> Angular displays both risk scores and explanations

## Run

1. Start MongoDB.
2. Start the backend:

   cd backend
   mvn spring-boot:run

3. Start Angular:

   cd frontend
   npm start

4. Open Patient 360.
5. Select a patient.
6. Add a vital if the patient has no vitals.
7. Click **Run AI Risk**.

## Important

This is an educational/project demonstration, not a clinical diagnostic model.
The synthetic federated training data is generated locally for demonstration.
