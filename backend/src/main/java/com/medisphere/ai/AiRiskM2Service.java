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

/**
 * MediSphere Milestone 2 explainable risk engine.
 *
 * This version uses a fixed logistic-risk model for the project demo and
 * calculates EXACT SHAP values for that linear/logistic model relative to
 * clinically neutral reference values. The SHAP values are mathematically
 * additive in log-odds: base value + sum(SHAP values) = model output.
 *
 * It is still a project/demo model, not a clinically validated model.
 */
@Service
public class AiRiskM2Service {
    private final PatientRepo patients;
    private final VitalRepo vitals;
    private final LabRepo labs;

    public AiRiskM2Service(PatientRepo patients, VitalRepo vitals, LabRepo labs) {
        this.patients = patients;
        this.vitals = vitals;
        this.labs = labs;
    }

    public Map<String, Object> predict(String patientId) {
        Patient p = patients.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));

        List<Vital> vs = vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId);
        List<Lab> ls = labs.findByPatientIdOrderByCollectedAtDesc(patientId);
        Vital v = vs.isEmpty() ? new Vital() : vs.get(0);

        int age = age(p.dateOfBirth);
        double glucose = firstNumericLab(ls, "hba1c", "hb a1c", "glucose", "blood sugar");
        if (glucose == 0 && v.glucose != null) glucose = v.glucose;

        boolean hypertension = containsCondition(p, "hypertension", "high blood pressure");
        boolean diabetes = containsCondition(p, "diabetes", "diabetic");

        RiskModel cardioModel = cardiovascularModel();
        RiskModel diabetesModel = diabetesModel();

        Prediction cardio = predictRisk(cardioModel, age, v, glucose, hypertension, diabetes);
        Prediction diab = predictRisk(diabetesModel, age, v, glucose, hypertension, diabetes);

        Map<String, Object> federated = federated(cardio.percent, diab.percent);
        Map<String, Object> model = modelInfo(cardio, diab);

        Map<String, Object> inputs = new LinkedHashMap<>();
        inputs.put("age", age);
        inputs.put("heartRate", v.heartRate);
        inputs.put("systolic", v.systolic);
        inputs.put("diastolic", v.diastolic);
        inputs.put("oxygen", v.oxygen);
        inputs.put("glucose", glucose == 0 ? null : glucose);
        inputs.put("conditions", p.conditions == null || p.conditions.isEmpty()
                ? "None recorded" : String.join(", ", p.conditions));

        int available = countAvailable(v, glucose, p);
        int confidence = Math.min(96, 58 + available * 6);
        String quality = available >= 5 ? "HIGH" : available >= 3 ? "GOOD" : "LIMITED";

        List<String> recommendations = recommendations(cardio.percent, diab.percent, v, glucose);

        return new LinkedHashMap<>(Map.ofEntries(
                Map.entry("patientId", patientId),
                Map.entry("riskType", "M2_FUTURE_HEALTH_RISK"),
                Map.entry("predictionHorizon", "12 months"),
                Map.entry("cardiovascular", cardio.result),
                Map.entry("diabetes", diab.result),
                Map.entry("explanations", mergeExplanations(cardio.shap, diab.shap)),
                Map.entry("shap", Map.of(
                        "status", "ACTIVE",
                        "method", "Exact SHAP for linear/logistic model",
                        "space", "log-odds",
                        "additivity", "base value + SHAP values = model output",
                        "cardiovascular", cardio.shapPayload,
                        "diabetes", diab.shapPayload
                )),
                Map.entry("federatedLearning", federated),
                Map.entry("model", model),
                Map.entry("inputs", inputs),
                Map.entry("recommendations", recommendations),
                Map.entry("dataQuality", Map.of("level", quality, "availableFeatures", available, "confidence", confidence)),
                Map.entry("inputsSummary", "Latest vitals + patient age/conditions + latest available glucose/HbA1c-related lab value"),
                Map.entry("note", "M2 explainable future-risk prediction demo. SHAP values are exact for this linear/logistic model; the model is not clinically validated and is not a diagnosis.")
        ));
    }

    private RiskModel cardiovascularModel() {
        // Feature weights are in log-odds space. Reference values represent a neutral baseline.
        return new RiskModel("Cardiovascular 12-Month Risk", -2.20,
                List.of(
                        new Feature("Age", 0.90, 50),
                        new Feature("Heart rate", 0.035, 80),
                        new Feature("Systolic BP", 0.030, 120),
                        new Feature("Diastolic BP", 0.025, 80),
                        new Feature("Oxygen saturation", -0.10, 97),
                        new Feature("Hypertension history", 0.65, 0)
                ));
    }

    private RiskModel diabetesModel() {
        return new RiskModel("Diabetes 12-Month Risk", -2.70,
                List.of(
                        new Feature("Age", 0.045, 45),
                        new Feature("Glucose", 0.018, 100),
                        new Feature("Systolic BP", 0.010, 120),
                        new Feature("Diabetes history", 1.35, 0),
                        new Feature("Hypertension history", 0.30, 0)
                ));
    }

    private Prediction predictRisk(RiskModel model, int age, Vital v, double glucose,
                                   boolean hypertension, boolean diabetes) {
        Map<String, Double> x = new LinkedHashMap<>();
        x.put("Age", (double) age);
        x.put("Heart rate", value(v.heartRate, 80));
        x.put("Systolic BP", value(v.systolic, 120));
        x.put("Diastolic BP", value(v.diastolic, 80));
        x.put("Oxygen saturation", value(v.oxygen, 97));
        x.put("Glucose", glucose > 0 ? glucose : 100);
        x.put("Hypertension history", hypertension ? 1.0 : 0.0);
        x.put("Diabetes history", diabetes ? 1.0 : 0.0);

        double logit = model.baseValue;
        List<Map<String, Object>> shapRows = new ArrayList<>();
        List<Map<String, Object>> explanationRows = new ArrayList<>();

        for (Feature f : model.features) {
            double actual = x.getOrDefault(f.name, f.reference);
            // For a linear model, this is the exact SHAP value relative to the reference dataset.
            double shap = f.coefficient * (actual - f.reference);
            logit += shap;

            double probabilityDelta = sigmoid(logit) - sigmoid(logit - shap);
            String direction = shap > 0.01 ? "INCREASES RISK" : shap < -0.01 ? "REDUCES RISK" : "NEUTRAL";
            double magnitude = Math.abs(shap);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("feature", f.name);
            row.put("value", round(actual));
            row.put("reference", round(f.reference));
            row.put("shapValue", round(shap));
            row.put("impact", round(shap));
            row.put("probabilityImpact", round(probabilityDelta * 100));
            row.put("direction", direction);
            row.put("importance", round(Math.min(100, magnitude * 18)));
            shapRows.add(row);

            Map<String, Object> simple = new LinkedHashMap<>();
            simple.put("feature", f.name);
            simple.put("impact", (shap >= 0 ? "+" : "") + round(shap));
            simple.put("direction", direction);
            simple.put("importance", round(Math.min(100, magnitude * 18)));
            explanationRows.add(simple);
        }

        double probability = sigmoid(logit);
        double percent = round(probability * 100);
        String level = percent >= 60 ? "HIGH" : percent >= 30 ? "MODERATE" : "LOW";

        shapRows.sort((a, b) -> Double.compare(Math.abs(((Number) b.get("shapValue")).doubleValue()),
                Math.abs(((Number) a.get("shapValue")).doubleValue())));
        explanationRows.sort((a, b) -> Double.compare(Math.abs(parse((String) b.get("impact"))),
                Math.abs(parse((String) a.get("impact")))));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", percent);
        result.put("percentage", percent);
        result.put("level", level);
        result.put("horizon", "12 months");
        result.put("prediction", model.name);
        result.put("topDrivers", explanationRows.stream().limit(5).toList());

        Map<String, Object> shapPayload = new LinkedHashMap<>();
        shapPayload.put("baseValue", round(model.baseValue));
        shapPayload.put("modelOutputLogOdds", round(logit));
        shapPayload.put("predictionProbability", percent);
        shapPayload.put("features", shapRows);
        shapPayload.put("additivityCheck", round(model.baseValue + shapRows.stream()
                .mapToDouble(r -> ((Number) r.get("shapValue")).doubleValue()).sum()));

        return new Prediction(percent, result, shapRows, shapPayload);
    }

    private Map<String, Object> modelInfo(Prediction cardio, Prediction diab) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", "MediSphere Explainable Future-Risk Model");
        m.put("version", "M2-SHAP-3.0");
        m.put("algorithm", "Logistic risk model");
        m.put("predictionHorizon", "12 months");
        m.put("outputs", List.of("Cardiovascular risk", "Diabetes risk"));
        m.put("explainability", "Exact SHAP values for the linear/logistic model");
        m.put("calculation", "Probability = sigmoid(base log-odds + sum(SHAP values))");
        return m;
    }

    private Map<String, Object> federated(double cardio, double diabetes) {
        double[] weights = {0.92, 1.04, 0.98};
        String[] names = {"Hospital-A", "Hospital-B", "Hospital-C"};
        List<Map<String, Object>> nodes = new ArrayList<>();
        double weighted = 0;
        double totalWeight = 0;
        for (int i = 0; i < names.length; i++) {
            double local = Math.min(100, ((cardio + diabetes) / 2.0) * weights[i]);
            nodes.add(Map.of("name", names[i], "localRisk", round(local), "weight", weights[i], "rawDataShared", false));
            weighted += local * weights[i];
            totalWeight += weights[i];
        }
        return Map.of(
                "status", "SIMULATED",
                "hospitalsParticipating", 3,
                "aggregation", "Weighted federated score aggregation",
                "privacyLevel", "Raw patient data stays local",
                "globalRiskSignal", round(weighted / totalWeight),
                "nodes", nodes
        );
    }

    private List<Map<String, Object>> mergeExplanations(List<Map<String, Object>> a, List<Map<String, Object>> b) {
        List<Map<String, Object>> out = new ArrayList<>();
        a.stream().limit(5).forEach(x -> { Map<String,Object> m = new LinkedHashMap<>(x); m.put("riskType", "CARDIOVASCULAR"); out.add(m); });
        b.stream().limit(5).forEach(x -> { Map<String,Object> m = new LinkedHashMap<>(x); m.put("riskType", "DIABETES"); out.add(m); });
        return out;
    }

    private List<String> recommendations(double cardio, double diabetes, Vital v, double glucose) {
        List<String> out = new ArrayList<>();
        if (cardio >= 60) out.add("Cardiovascular model predicts elevated 12-month risk; clinician review is recommended.");
        else if (cardio >= 30) out.add("Cardiovascular model predicts moderate 12-month risk; continue monitoring BP and heart-rate trends.");
        if (diabetes >= 60) out.add("Diabetes model predicts elevated 12-month risk; review recent glucose/HbA1c trends with a clinician.");
        else if (diabetes >= 30) out.add("Diabetes model predicts moderate 12-month risk; continue glucose monitoring.");
        if (v.oxygen != null && v.oxygen < 92) out.add("Low oxygen is a major positive SHAP contributor to the cardiovascular prediction.");
        if (v.systolic != null && v.systolic > 140) out.add("Elevated systolic BP is a major positive SHAP contributor.");
        if (glucose > 140) out.add("Elevated glucose is increasing the diabetes prediction.");
        if (out.isEmpty()) out.add("No major positive risk driver was detected in the currently available data.");
        return out;
    }

    private int countAvailable(Vital v, double glucose, Patient p) {
        int n = 0;
        if (v.heartRate != null) n++;
        if (v.systolic != null) n++;
        if (v.diastolic != null) n++;
        if (v.oxygen != null) n++;
        if (glucose > 0) n++;
        if (p.conditions != null && !p.conditions.isEmpty()) n++;
        return n;
    }

    private double value(Double value, double fallback) { return value == null ? fallback : value; }
    private double sigmoid(double z) { return 1.0 / (1.0 + Math.exp(-z)); }
    private double round(double x) { return Math.round(x * 100.0) / 100.0; }
    private double parse(String s) { try { return Double.parseDouble(s); } catch (Exception e) { return 0; } }

    private int age(String dob) {
        if (dob == null || dob.isBlank()) return 0;
        try { return Period.between(LocalDate.parse(dob), LocalDate.now()).getYears(); }
        catch (Exception ignored) { return 0; }
    }

    private boolean containsCondition(Patient p, String... needles) {
        if (p.conditions == null) return false;
        return p.conditions.stream().filter(Objects::nonNull).map(String::toLowerCase)
                .anyMatch(c -> Arrays.stream(needles).anyMatch(c::contains));
    }

    private double firstNumericLab(List<Lab> labs, String... names) {
        for (Lab l : labs) {
            String n = l.testName == null ? "" : l.testName.toLowerCase();
            if (Arrays.stream(names).anyMatch(n::contains)) {
                try {
                    String cleaned = l.result == null ? "" : l.result.replaceAll("[^0-9.\\-]", "");
                    if (!cleaned.isBlank()) return Double.parseDouble(cleaned);
                } catch (Exception ignored) {}
            }
        }
        return 0;
    }

    private record Feature(String name, double coefficient, double reference) {}
    private record RiskModel(String name, double baseValue, List<Feature> features) {}
    private record Prediction(double percent, Map<String,Object> result,
                              List<Map<String,Object>> shap,
                              Map<String,Object> shapPayload) {}
}
