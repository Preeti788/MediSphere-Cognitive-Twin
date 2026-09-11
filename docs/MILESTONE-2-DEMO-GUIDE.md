# Milestone 2 Demo Flow

1. Start MongoDB.
2. Start the Spring Boot backend from `backend` with `mvn spring-boot:run`.
3. Start Angular from `frontend` with `npm install` (first time only), then `npm start`.
4. Login using the seeded doctor account: `doctor@medisphere.local` / `Doctor@123`.
5. Open **AI Risk Lab**.
6. Select **Demo Patient** and click **Run prediction**.
7. Show the two risk cards and the feature contribution panels.
8. Click **Run federated demo** and show Hospital A/B/C local updates and the aggregated model weight.

The seeded Demo Patient has a wearable vital record and a hypertension condition, so the AI screen has real data to explain.
