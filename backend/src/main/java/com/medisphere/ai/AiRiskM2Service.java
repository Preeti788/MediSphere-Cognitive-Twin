package com.medisphere.ai;

import com.medisphere.model.Models.Lab;
import com.medisphere.model.Models.Patient;
import com.medisphere.model.Models.Vital;
import com.medisphere.repo.LabRepo;
import com.medisphere.repo.PatientRepo;
import com.medisphere.repo.VitalRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@Service
public class AiRiskM2Service {

    private final PatientRepo patients;
    private final VitalRepo vitals;
    private final LabRepo labs;

    public AiRiskM2Service(
            PatientRepo patients,
            VitalRepo vitals,
            LabRepo labs) {

        this.patients = patients;
        this.vitals = vitals;
        this.labs = labs;
    }

    public Map<String, Object> predict(String patientId) {

        Patient patient = patients.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found: " + patientId));

        List<Vital> vitalList =
                vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId);

        List<Lab> labList =
                labs.findByPatientIdOrderByCollectedAtDesc(patientId);

        Vital vital = vitalList.isEmpty()
                ? new Vital()
                : vitalList.get(0);

        int age = calculateAge(patient.dateOfBirth);

        double glucose = firstNumericLab(
                labList,
                "hba1c",
                "hb a1c",
                "glucose",
                "blood sugar"
        );

        if (glucose == 0 && vital.glucose != null) {
            glucose = vital.glucose;
        }

        boolean hypertension = containsCondition(
                patient,
                "hypertension",
                "high blood pressure"
        );

        boolean diabetes = containsCondition(
                patient,
                "diabetes",
                "diabetic"
        );

        RiskModel cardiovascularModel = createCardiovascularModel();
        RiskModel diabetesModel = createDiabetesModel();

        Prediction cardiovascular = predictRisk(
                cardiovascularModel,
                age,
                vital,
                glucose,
                hypertension,
                diabetes
        );

        Prediction diabetesPrediction = predictRisk(
                diabetesModel,
                age,
                vital,
                glucose,
                hypertension,
                diabetes
        );

        Map<String, Object> inputs = new LinkedHashMap<>();

        inputs.put("age", age);
        inputs.put("heartRate", vital.heartRate);
        inputs.put("systolic", vital.systolic);
        inputs.put("diastolic", vital.diastolic);
        inputs.put("oxygen", vital.oxygen);
        inputs.put(
                "glucose",
                glucose == 0 ? null : glucose
        );

        inputs.put(
                "conditions",
                patient.conditions == null ||
                        patient.conditions.isEmpty()
                        ? "None recorded"
                        : String.join(", ", patient.conditions)
        );

        int availableFeatures =
                countAvailable(vital, glucose, patient);

        int confidence =
                Math.min(96, 58 + (availableFeatures * 6));

        String quality;

        if (availableFeatures >= 5) {
            quality = "HIGH";
        } else if (availableFeatures >= 3) {
            quality = "GOOD";
        } else {
            quality = "LIMITED";
        }

        List<String> recommendations = recommendations(
                cardiovascular.percent,
                diabetesPrediction.percent,
                vital,
                glucose
        );

        Map<String, Object> shap = new LinkedHashMap<>();

        shap.put("status", "ACTIVE");
        shap.put(
                "method",
                "Exact SHAP for linear/logistic model"
        );
        shap.put("space", "log-odds");
        shap.put(
                "additivity",
                "base value + SHAP values = model output"
        );
        shap.put(
                "cardiovascular",
                cardiovascular.shapPayload
        );
        shap.put(
                "diabetes",
                diabetesPrediction.shapPayload
        );

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("patientId", patientId);
        result.put(
                "riskType",
                "M2_FUTURE_HEALTH_RISK"
        );
        result.put(
                "predictionHorizon",
                "12 months"
        );

        result.put(
                "cardiovascular",
                cardiovascular.result
        );

        result.put(
                "diabetes",
                diabetesPrediction.result
        );

        result.put(
                "explanations",
                mergeExplanations(
                        cardiovascular.shap,
                        diabetesPrediction.shap
                )
        );

        result.put("shap", shap);

        result.put(
                "federatedLearning",
                federated(
                        cardiovascular.percent,
                        diabetesPrediction.percent
                )
        );

        result.put(
                "model",
                modelInfo()
        );

        result.put("inputs", inputs);

        result.put(
                "recommendations",
                recommendations
        );

        Map<String, Object> dataQuality =
                new LinkedHashMap<>();

        dataQuality.put("level", quality);
        dataQuality.put(
                "availableFeatures",
                availableFeatures
        );
        dataQuality.put(
                "confidence",
                confidence
        );

        result.put(
                "dataQuality",
                dataQuality
        );

        result.put(
                "inputsSummary",
                "Latest vitals + patient age/conditions + latest available glucose/HbA1c-related lab value"
        );

        result.put(
                "note",
                "M2 explainable future-risk prediction demo. " +
                        "SHAP values are exact for this linear/logistic model; " +
                        "the model is not clinically validated and is not a diagnosis."
        );

        return result;
    }

    private RiskModel createCardiovascularModel() {

        List<Feature> features = new ArrayList<>();

        features.add(
                new Feature("Age", 0.90, 50)
        );

        features.add(
                new Feature("Heart rate", 0.035, 80)
        );

        features.add(
                new Feature("Systolic BP", 0.030, 120)
        );

        features.add(
                new Feature("Diastolic BP", 0.025, 80)
        );

        features.add(
                new Feature("Oxygen saturation", -0.10, 97)
        );

        features.add(
                new Feature("Hypertension history", 0.65, 0)
        );

        return new RiskModel(
                "Cardiovascular 12-Month Risk",
                -2.20,
                features
        );
    }

    private RiskModel createDiabetesModel() {

        List<Feature> features = new ArrayList<>();

        features.add(
                new Feature("Age", 0.045, 45)
        );

        features.add(
                new Feature("Glucose", 0.018, 100)
        );

        features.add(
                new Feature("Systolic BP", 0.010, 120)
        );

        features.add(
                new Feature("Diabetes history", 1.35, 0)
        );

        features.add(
                new Feature("Hypertension history", 0.30, 0)
        );

        return new RiskModel(
                "Diabetes 12-Month Risk",
                -2.70,
                features
        );
    }

    private Prediction predictRisk(
            RiskModel model,
            int age,
            Vital vital,
            double glucose,
            boolean hypertension,
            boolean diabetes) {

        Map<String, Double> values =
                new LinkedHashMap<>();

        values.put("Age", (double) age);

        values.put(
                "Heart rate",
                getValue(vital.heartRate, 80)
        );

        values.put(
                "Systolic BP",
                getValue(vital.systolic, 120)
        );

        values.put(
                "Diastolic BP",
                getValue(vital.diastolic, 80)
        );

        values.put(
                "Oxygen saturation",
                getValue(vital.oxygen, 97)
        );

        values.put(
                "Glucose",
                glucose > 0 ? glucose : 100
        );

        values.put(
                "Hypertension history",
                hypertension ? 1.0 : 0.0
        );

        values.put(
                "Diabetes history",
                diabetes ? 1.0 : 0.0
        );

        double logit = model.baseValue;

        List<Map<String, Object>> shapRows =
                new ArrayList<>();

        List<Map<String, Object>> explanationRows =
                new ArrayList<>();

        for (Feature feature : model.features) {

            double actual =
                    values.getOrDefault(
                            feature.name,
                            feature.reference
                    );

            double shap =
                    feature.coefficient *
                            (actual - feature.reference);

            logit += shap;

            double probabilityDelta =
                    sigmoid(logit) -
                            sigmoid(logit - shap);

            String direction;

            if (shap > 0.01) {
                direction = "INCREASES RISK";
            } else if (shap < -0.01) {
                direction = "REDUCES RISK";
            } else {
                direction = "NEUTRAL";
            }

            double importance =
                    Math.min(100, Math.abs(shap) * 18);

            Map<String, Object> row =
                    new LinkedHashMap<>();

            row.put("feature", feature.name);
            row.put("value", round(actual));
            row.put(
                    "reference",
                    round(feature.reference)
            );
            row.put(
                    "shapValue",
                    round(shap)
            );
            row.put(
                    "impact",
                    round(shap)
            );
            row.put(
                    "probabilityImpact",
                    round(probabilityDelta * 100)
            );
            row.put("direction", direction);
            row.put(
                    "importance",
                    round(importance)
            );

            shapRows.add(row);

            Map<String, Object> simple =
                    new LinkedHashMap<>();

            simple.put("feature", feature.name);

            simple.put(
                    "impact",
                    (shap >= 0 ? "+" : "") +
                            round(shap)
            );

            simple.put(
                    "direction",
                    direction
            );

            simple.put(
                    "importance",
                    round(importance)
            );

            explanationRows.add(simple);
        }

        double probability = sigmoid(logit);

        double percent =
                round(probability * 100);

        String level;

        if (percent >= 60) {
            level = "HIGH";
        } else if (percent >= 30) {
            level = "MODERATE";
        } else {
            level = "LOW";
        }

        shapRows.sort(
                (a, b) ->
                        Double.compare(
                                Math.abs(
                                        ((Number) b.get("shapValue"))
                                                .doubleValue()
                                ),
                                Math.abs(
                                        ((Number) a.get("shapValue"))
                                                .doubleValue()
                                )
                        )
        );

        explanationRows.sort(
                (a, b) ->
                        Double.compare(
                                Math.abs(
                                        parse(
                                                (String) b.get("impact")
                                        )
                                ),
                                Math.abs(
                                        parse(
                                                (String) a.get("impact")
                                        )
                                )
                        )
        );

        Map<String, Object> prediction =
                new LinkedHashMap<>();

        prediction.put("score", percent);
        prediction.put("percentage", percent);
        prediction.put("level", level);
        prediction.put("horizon", "12 months");
        prediction.put(
                "prediction",
                model.name
        );

        prediction.put(
                "topDrivers",
                explanationRows
                        .stream()
                        .limit(5)
                        .toList()
        );

        Map<String, Object> shapPayload =
                new LinkedHashMap<>();

        shapPayload.put(
                "baseValue",
                round(model.baseValue)
        );

        shapPayload.put(
                "modelOutputLogOdds",
                round(logit)
        );

        shapPayload.put(
                "predictionProbability",
                percent
        );

        shapPayload.put(
                "features",
                shapRows
        );

        shapPayload.put(
                "additivityCheck",
                round(
                        model.baseValue +
                                shapRows
                                        .stream()
                                        .mapToDouble(
                                                row ->
                                                        ((Number)
                                                                row.get("shapValue"))
                                                                .doubleValue()
                                        )
                                        .sum()
                )
        );

        return new Prediction(
                percent,
                prediction,
                shapRows,
                shapPayload
        );
    }

    private Map<String, Object> modelInfo() {

        Map<String, Object> model =
                new LinkedHashMap<>();

        model.put(
                "name",
                "MediSphere Explainable Future-Risk Model"
        );

        model.put(
                "version",
                "M2-SHAP-3.0"
        );

        model.put(
                "algorithm",
                "Logistic risk model"
        );

        model.put(
                "predictionHorizon",
                "12 months"
        );

        model.put(
                "outputs",
                List.of(
                        "Cardiovascular risk",
                        "Diabetes risk"
                )
        );

        model.put(
                "explainability",
                "Exact SHAP values for the linear/logistic model"
        );

        model.put(
                "calculation",
                "Probability = sigmoid(base log-odds + sum(SHAP values))"
        );

        return model;
    }

    private Map<String, Object> federated(
            double cardiovascular,
            double diabetes) {

        double[] weights = {
                0.92,
                1.04,
                0.98
        };

        String[] hospitals = {
                "Hospital-A",
                "Hospital-B",
                "Hospital-C"
        };

        List<Map<String, Object>> nodes =
                new ArrayList<>();

        double weighted = 0;
        double totalWeight = 0;

        for (int i = 0; i < hospitals.length; i++) {

            double localRisk =
                    Math.min(
                            100,
                            ((cardiovascular + diabetes) / 2.0)
                                    * weights[i]
                    );

            Map<String, Object> node =
                    new LinkedHashMap<>();

            node.put("name", hospitals[i]);
            node.put(
                    "localRisk",
                    round(localRisk)
            );
            node.put(
                    "weight",
                    weights[i]
            );
            node.put(
                    "rawDataShared",
                    false
            );

            nodes.add(node);

            weighted += localRisk * weights[i];
            totalWeight += weights[i];
        }

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("status", "SIMULATED");
        result.put(
                "hospitalsParticipating",
                3
        );
        result.put(
                "aggregation",
                "Weighted federated score aggregation"
        );
        result.put(
                "privacyLevel",
                "Raw patient data stays local"
        );
        result.put(
                "globalRiskSignal",
                round(weighted / totalWeight)
        );
        result.put("nodes", nodes);

        return result;
    }

    private List<Map<String, Object>> mergeExplanations(
            List<Map<String, Object>> cardiovascular,
            List<Map<String, Object>> diabetes) {

        List<Map<String, Object>> result =
                new ArrayList<>();

        cardiovascular
                .stream()
                .limit(5)
                .forEach(item -> {

                    Map<String, Object> copy =
                            new LinkedHashMap<>(item);

                    copy.put(
                            "riskType",
                            "CARDIOVASCULAR"
                    );

                    result.add(copy);
                });

        diabetes
                .stream()
                .limit(5)
                .forEach(item -> {

                    Map<String, Object> copy =
                            new LinkedHashMap<>(item);

                    copy.put(
                            "riskType",
                            "DIABETES"
                    );

                    result.add(copy);
                });

        return result;
    }

    private List<String> recommendations(
            double cardiovascular,
            double diabetes,
            Vital vital,
            double glucose) {

        List<String> result =
                new ArrayList<>();

        if (cardiovascular >= 60) {

            result.add(
                    "Cardiovascular model predicts elevated 12-month risk; clinician review is recommended."
            );

        } else if (cardiovascular >= 30) {

            result.add(
                    "Cardiovascular model predicts moderate 12-month risk; continue monitoring BP and heart-rate trends."
            );
        }

        if (diabetes >= 60) {

            result.add(
                    "Diabetes model predicts elevated 12-month risk; review recent glucose/HbA1c trends with a clinician."
            );

        } else if (diabetes >= 30) {

            result.add(
                    "Diabetes model predicts moderate 12-month risk; continue glucose monitoring."
            );
        }

        if (vital.oxygen != null &&
                vital.oxygen < 92) {

            result.add(
                    "Low oxygen is a major positive SHAP contributor to the cardiovascular prediction."
            );
        }

        if (vital.systolic != null &&
                vital.systolic > 140) {

            result.add(
                    "Elevated systolic BP is a major positive SHAP contributor."
            );
        }

        if (glucose > 140) {

            result.add(
                    "Elevated glucose is increasing the diabetes prediction."
            );
        }

        if (result.isEmpty()) {

            result.add(
                    "No major positive risk driver was detected in the currently available data."
            );
        }

        return result;
    }

    private int countAvailable(
            Vital vital,
            double glucose,
            Patient patient) {

        int count = 0;

        if (vital.heartRate != null) {
            count++;
        }

        if (vital.systolic != null) {
            count++;
        }

        if (vital.diastolic != null) {
            count++;
        }

        if (vital.oxygen != null) {
            count++;
        }

        if (glucose > 0) {
            count++;
        }

        if (patient.conditions != null &&
                !patient.conditions.isEmpty()) {

            count++;
        }

        return count;
    }

    private double getValue(
            Double value,
            double defaultValue) {

        return value == null
                ? defaultValue
                : value;
    }

    private double sigmoid(double value) {

        return 1.0 /
                (1.0 + Math.exp(-value));
    }

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }

    private double parse(String value) {

        try {
            return Double.parseDouble(value);
        } catch (Exception e) {
            return 0;
        }
    }

    private int calculateAge(String dateOfBirth) {

        if (dateOfBirth == null ||
                dateOfBirth.isBlank()) {

            return 0;
        }

        try {

            LocalDate dob =
                    LocalDate.parse(dateOfBirth);

            return Period
                    .between(
                            dob,
                            LocalDate.now()
                    )
                    .getYears();

        } catch (Exception e) {

            return 0;
        }
    }

    private boolean containsCondition(
            Patient patient,
            String... keywords) {

        if (patient.conditions == null) {
            return false;
        }

        for (String condition :
                patient.conditions) {

            if (condition == null) {
                continue;
            }

            String value =
                    condition.toLowerCase();

            for (String keyword :
                    keywords) {

                if (value.contains(
                        keyword.toLowerCase())) {

                    return true;
                }
            }
        }

        return false;
    }

    private double firstNumericLab(
            List<Lab> labList,
            String... names) {

        for (Lab lab : labList) {

            String testName =
                    lab.testName == null
                            ? ""
                            : lab.testName.toLowerCase();

            boolean matched = false;

            for (String name : names) {

                if (testName.contains(
                        name.toLowerCase())) {

                    matched = true;
                    break;
                }
            }

            if (!matched) {
                continue;
            }

            try {

                String result =
                        lab.result == null
                                ? ""
                                : lab.result
                                        .replaceAll(
                                                "[^0-9.\\-]",
                                                ""
                                        );

                if (!result.isBlank()) {

                    return Double.parseDouble(result);
                }

            } catch (Exception ignored) {
                // Continue with next lab
            }
        }

        return 0;
    }

    private static class Feature {

        String name;
        double coefficient;
        double reference;

        Feature(
                String name,
                double coefficient,
                double reference) {

            this.name = name;
            this.coefficient = coefficient;
            this.reference = reference;
        }
    }

    private static class RiskModel {

        String name;
        double baseValue;
        List<Feature> features;

        RiskModel(
                String name,
                double baseValue,
                List<Feature> features) {

            this.name = name;
            this.baseValue = baseValue;
            this.features = features;
        }
    }

    private static class Prediction {

        double percent;
        Map<String, Object> result;
        List<Map<String, Object>> shap;
        Map<String, Object> shapPayload;

        Prediction(
                double percent,
                Map<String, Object> result,
                List<Map<String, Object>> shap,
                Map<String, Object> shapPayload) {

            this.percent = percent;
            this.result = result;
            this.shap = shap;
            this.shapPayload = shapPayload;
        }
    }
}