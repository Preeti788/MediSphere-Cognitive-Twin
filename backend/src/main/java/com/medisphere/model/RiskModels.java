package com.medisphere.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.*;

public final class RiskModels {
    private RiskModels() {}

    @Document("risk_assessments")
    public static class RiskAssessment {
        @Id public String id;
        public String patientId;
        public Instant assessedAt = Instant.now();
        public Double cardiovascularScore;
        public String cardiovascularLevel;
        public Double diabetesScore;
        public String diabetesLevel;
        public List<FeatureContribution> cardiovascularFactors = new ArrayList<>();
        public List<FeatureContribution> diabetesFactors = new ArrayList<>();
        public String modelVersion = "MediSphere-AI-M2.0";
        public String method = "Explainable weighted clinical-feature demo model";
        public String privacy = "Federated-learning simulation: raw patient data remains local; only model updates are represented.";
    }

    public static class FeatureContribution {
        public String feature;
        public Double value;
        public String unit;
        public Double contribution;
        public String direction;
        public String explanation;

        public FeatureContribution() {}
        public FeatureContribution(String feature, Double value, String unit, Double contribution, String direction, String explanation) {
            this.feature = feature; this.value = value; this.unit = unit; this.contribution = contribution;
            this.direction = direction; this.explanation = explanation;
        }
    }
}
