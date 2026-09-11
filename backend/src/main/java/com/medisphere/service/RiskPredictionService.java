package com.medisphere.service;

import com.medisphere.model.Models.Vital;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Milestone 2: Explainable AI Risk Prediction.
 *
 * This is a self-contained demonstration implementation so the project
 * can run locally without a separate Python server.
 *
 * Federated learning:
 * - Three simulated clinical clients train a small logistic model locally.
 * - Only model weights are aggregated; raw client rows are never shared.
 * - The server averages the client weights (FedAvg).
 *
 * SHAP:
 * - For this linear model, the additive feature contribution is exact
 *   relative to the healthy baseline used by the demo.
 * - contribution = weight * (feature - baseline)
 *
 * This is a project/demo model, not a clinical diagnostic model.
 */
@Service
public class RiskPredictionService {

    private static final String[] FEATURES = {
            "heartRate", "systolicBP", "diastolicBP",
            "oxygen", "glucose", "temperature"
    };

    private static final double[] BASELINE = {
            75.0, 120.0, 80.0, 98.0, 100.0, 36.8
    };

    private static final int CLIENTS = 3;

    public Map<String, Object> predict(Vital vital) {
        double[] x = extract(vital);

        Model cardio = federatedTrain("CARDIOVASCULAR", 101);
        Model diabetes = federatedTrain("DIABETES_COMPLICATION", 202);

        Map<String, Object> cardiovascular =
                explain("CARDIOVASCULAR", x, cardio);
        Map<String, Object> diabetesRisk =
                explain("DIABETES_COMPLICATION", x, diabetes);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("engine", "FEDERATED_LOGISTIC_REGRESSION");
        result.put("federatedLearning", true);
        result.put("federatedClients", CLIENTS);
        result.put("aggregation", "FedAvg");
        result.put("explainability", "SHAP-style exact additive contributions for linear model");
        result.put("patientId", vital.patientId);
        result.put("input", inputMap(x));
        result.put("cardiovascular", cardiovascular);
        result.put("diabetes", diabetesRisk);
        result.put("note",
                "Educational/demo risk prediction only. It is not a clinical diagnosis or treatment recommendation.");
        return result;
    }

    private double[] extract(Vital v) {
        return new double[] {
                safe(v.heartRate, 75),
                safe(v.systolic, 120),
                safe(v.diastolic, 80),
                safe(v.oxygen, 98),
                safe(v.glucose, 100),
                safe(v.temperature, 36.8)
        };
    }

    private double safe(Double value, double fallback) {
        return value == null ? fallback : value;
    }

    private Map<String, Object> inputMap(double[] x) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < FEATURES.length; i++) {
            m.put(FEATURES[i], round(x[i]));
        }
        return m;
    }

    /**
     * Simulates independent hospitals/clinics. Each client creates local
     * observations and trains locally. The raw observations are not returned
     * or aggregated; only weights are averaged.
     */
    private Model federatedTrain(String type, long seed) {
        Random random = new Random(seed);
        double[] global = new double[FEATURES.length + 1];

        for (int round = 0; round < 5; round++) {
            double[][] localWeights = new double[CLIENTS][FEATURES.length + 1];

            for (int client = 0; client < CLIENTS; client++) {
                double[] w = Arrays.copyOf(global, global.length);

                for (int epoch = 0; epoch < 80; epoch++) {
                    for (int row = 0; row < 90; row++) {
                        double[] raw = syntheticPatient(random, type, client);
                        double[] z = normalize(raw);
                        int y = label(raw, type);

                        double p = sigmoid(dot(w, z));
                        double error = p - y;
                        double lr = 0.025;

                        w[0] -= lr * error; // intercept
                        for (int j = 0; j < z.length; j++) {
                            w[j + 1] -= lr * error * z[j];
                        }
                    }
                }
                localWeights[client] = w;
            }

            Arrays.fill(global, 0);
            for (double[] local : localWeights) {
                for (int j = 0; j < global.length; j++) {
                    global[j] += local[j] / CLIENTS;
                }
            }
        }

        return new Model(global);
    }

    private double[] syntheticPatient(Random r, String type, int client) {
        // Small client-specific distribution shift, similar to different sites.
        double siteShift = (client - 1) * 2.0;
        return new double[] {
                clamp(75 + r.nextGaussian() * 18 + siteShift, 45, 140),
                clamp(120 + r.nextGaussian() * 22 + siteShift, 85, 190),
                clamp(80 + r.nextGaussian() * 13, 50, 120),
                clamp(98 + r.nextGaussian() * 3, 84, 100),
                clamp(105 + r.nextGaussian() * 45 + (client * 3), 55, 320),
                clamp(36.8 + r.nextGaussian() * 0.7, 35, 40.5)
        };
    }

    private int label(double[] x, String type) {
        double score;
        if ("CARDIOVASCULAR".equals(type)) {
            score =
                    0.030 * Math.max(0, x[0] - 85) +
                    0.040 * Math.max(0, x[1] - 130) +
                    0.025 * Math.max(0, x[2] - 85) +
                    0.080 * Math.max(0, 95 - x[3]) +
                    0.010 * Math.max(0, x[4] - 130);
        } else {
            score =
                    0.045 * Math.max(0, x[4] - 110) +
                    0.018 * Math.max(0, x[1] - 130) +
                    0.012 * Math.max(0, x[2] - 85) +
                    0.025 * Math.max(0, 95 - x[3]) +
                    0.10 * Math.max(0, x[5] - 37.5);
        }
        return score >= ("CARDIOVASCULAR".equals(type) ? 2.0 : 1.8) ? 1 : 0;
    }

    private Map<String, Object> explain(String type, double[] x, Model model) {
        double[] z = normalize(x);
        double logit = model.weights[0] + dot(Arrays.copyOfRange(model.weights, 1, model.weights.length), z);
        double probability = sigmoid(logit);
        int score = (int) Math.round(probability * 100);

        List<Map<String, Object>> contributions = new ArrayList<>();
        for (int i = 0; i < FEATURES.length; i++) {
            double contribution = model.weights[i + 1] * z[i];

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("feature", pretty(FEATURES[i]));
            item.put("value", round(x[i]));
            item.put("baseline", round(BASELINE[i]));
            item.put("shapValue", round(contribution));
            item.put("impact", contribution > 0.02 ? "INCREASES_RISK"
                    : contribution < -0.02 ? "DECREASES_RISK" : "LOW_IMPACT");
            contributions.add(item);
        }

        contributions.sort((a, b) ->
                Double.compare(
                        Math.abs((Double) b.get("shapValue")),
                        Math.abs((Double) a.get("shapValue"))));

        List<String> topReasons = new ArrayList<>();
        for (Map<String, Object> c : contributions) {
            if (topReasons.size() == 3) break;
            String impact = (String) c.get("impact");
            if ("INCREASES_RISK".equals(impact)) {
                topReasons.add(c.get("feature") + " is contributing to higher risk");
            }
        }

        String level = score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW";

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("riskType", type);
        out.put("score", score);
        out.put("probability", round(probability * 100));
        out.put("level", level);
        out.put("shapValues", contributions);
        out.put("topReasons", topReasons);
        out.put("model", "Federated logistic regression + SHAP");
        return out;
    }

    private double[] normalize(double[] x) {
        // Scale around the healthy baseline. The scale keeps different units
        // comparable during local gradient descent.
        double[] scale = {20, 25, 15, 5, 60, 1.0};
        double[] z = new double[x.length];
        for (int i = 0; i < x.length; i++) {
            z[i] = (x[i] - BASELINE[i]) / scale[i];
        }
        return z;
    }

    private double dot(double[] a, double[] b) {
        double sum = 0;
        for (int i = 0; i < Math.min(a.length, b.length); i++) {
            sum += a[i] * b[i];
        }
        return sum;
    }

    private double sigmoid(double value) {
        value = Math.max(-30, Math.min(30, value));
        return 1.0 / (1.0 + Math.exp(-value));
    }

    private double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    private double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private String pretty(String key) {
        return switch (key) {
            case "heartRate" -> "Heart rate";
            case "systolicBP" -> "Systolic BP";
            case "diastolicBP" -> "Diastolic BP";
            case "oxygen" -> "Oxygen saturation";
            case "glucose" -> "Glucose";
            case "temperature" -> "Temperature";
            default -> key;
        };
    }

    private static class Model {
        final double[] weights;
        Model(double[] weights) {
            this.weights = weights;
        }
    }
}
