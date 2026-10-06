package com.medisphere.monitoring;

import com.medisphere.model.Models.Alert;
import com.medisphere.model.Models.Vital;
import com.medisphere.repo.AlertRepo;
import com.medisphere.repo.VitalRepo;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class MonitoringService {
    private final AlertRepo alerts;
    private final VitalRepo vitals;

    public MonitoringService(AlertRepo alerts, VitalRepo vitals) {
        this.alerts = alerts;
        this.vitals = vitals;
    }

    public List<Alert> evaluate(Vital v) {
        List<AlertCandidate> candidates = new ArrayList<>();
        if (v.heartRate != null) {
            if (v.heartRate > 120 || v.heartRate < 45) candidates.add(new AlertCandidate("CRITICAL", "HEART_RATE", "Heart rate is " + fmt(v.heartRate) + " bpm"));
            else if (v.heartRate > 100 || v.heartRate < 60) candidates.add(new AlertCandidate("WARNING", "HEART_RATE", "Heart rate is " + fmt(v.heartRate) + " bpm"));
        }
        if (v.oxygen != null) {
            if (v.oxygen < 92) candidates.add(new AlertCandidate("CRITICAL", "OXYGEN", "SpO₂ is " + fmt(v.oxygen) + "%"));
            else if (v.oxygen < 95) candidates.add(new AlertCandidate("WARNING", "OXYGEN", "SpO₂ is " + fmt(v.oxygen) + "%"));
        }
        if (v.systolic != null) {
            if (v.systolic > 180 || v.systolic < 90) candidates.add(new AlertCandidate("CRITICAL", "BLOOD_PRESSURE", "Systolic blood pressure is " + fmt(v.systolic) + " mmHg"));
            else if (v.systolic > 140 || v.systolic < 100) candidates.add(new AlertCandidate("WARNING", "BLOOD_PRESSURE", "Systolic blood pressure is " + fmt(v.systolic) + " mmHg"));
        }
        if (v.diastolic != null) {
            if (v.diastolic > 120 || v.diastolic < 60) candidates.add(new AlertCandidate("CRITICAL", "BLOOD_PRESSURE", "Diastolic blood pressure is " + fmt(v.diastolic) + " mmHg"));
            else if (v.diastolic > 90 || v.diastolic < 65) candidates.add(new AlertCandidate("WARNING", "BLOOD_PRESSURE", "Diastolic blood pressure is " + fmt(v.diastolic) + " mmHg"));
        }
        if (v.glucose != null) {
            if (v.glucose > 250 || v.glucose < 55) candidates.add(new AlertCandidate("CRITICAL", "GLUCOSE", "Glucose is " + fmt(v.glucose) + " mg/dL"));
            else if (v.glucose > 180 || v.glucose < 70) candidates.add(new AlertCandidate("WARNING", "GLUCOSE", "Glucose is " + fmt(v.glucose) + " mg/dL"));
        }
        if (v.temperature != null) {
            if (v.temperature >= 39 || v.temperature < 35) candidates.add(new AlertCandidate("CRITICAL", "TEMPERATURE", "Temperature is " + fmt(v.temperature) + " °C"));
            else if (v.temperature > 37.5) candidates.add(new AlertCandidate("WARNING", "TEMPERATURE", "Temperature is " + fmt(v.temperature) + " °C"));
        }

        List<Alert> created = new ArrayList<>();
        for (AlertCandidate c : candidates) {
            if (v.patientId == null || v.patientId.isBlank()) continue;
            boolean exists = alerts.existsByPatientIdAndTypeAndMessageAndAcknowledgedFalse(v.patientId, "M3_" + c.type, c.message);
            if (!exists) {
                Alert a = new Alert();
                a.patientId = v.patientId;
                a.severity = c.severity;
                a.type = "M3_" + c.type;
                a.message = c.message;
                a.createdAt = Instant.now();
                created.add(alerts.save(a));
            }
        }
        return created;
    }

    public Map<String, Object> overview() {
        List<Vital> latest = new ArrayList<>();
        List<Map<String,Object>> patients = new ArrayList<>();
        Set<String> ids = new LinkedHashSet<>();
        for (Vital v : vitals.findAll()) if (v.patientId != null) ids.add(v.patientId);
        for (String id : ids) {
            List<Vital> history = vitals.findTop20ByPatientIdOrderByRecordedAtDesc(id);
            if (!history.isEmpty()) {
                Vital v = history.get(0); latest.add(v);
                patients.add(snapshot(v, alerts.findByPatientIdOrderByCreatedAtDesc(id)));
            }
        }
        long critical = alerts.findByAcknowledgedFalseOrderByCreatedAtDesc().stream().filter(a -> "CRITICAL".equalsIgnoreCase(a.severity)).count();
        long warning = alerts.findByAcknowledgedFalseOrderByCreatedAtDesc().stream().filter(a -> "WARNING".equalsIgnoreCase(a.severity)).count();
        return Map.of("patientsMonitored", patients.size(), "criticalAlerts", critical, "warningAlerts", warning,
                "latestVitals", latest, "patientSnapshots", patients, "serverTime", Instant.now());
    }

    public Map<String,Object> patient(String patientId) {
        List<Vital> history = vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId);
        List<Alert> historyAlerts = alerts.findByPatientIdOrderByCreatedAtDesc(patientId);
        return Map.of("patientId", patientId, "latest", history.isEmpty() ? Map.of() : history.get(0),
                "vitals", history, "alerts", historyAlerts, "status", history.isEmpty() ? "OFFLINE" : status(history.get(0)),
                "updatedAt", history.isEmpty() ? Instant.now() : history.get(0).recordedAt);
    }

    private Map<String,Object> snapshot(Vital v, List<Alert> alertsForPatient) {
        long active = alertsForPatient.stream().filter(a -> !a.acknowledged).count();
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("patientId", v.patientId); m.put("status", status(v)); m.put("activeAlerts", active);
        m.put("latest", v); m.put("updatedAt", v.recordedAt); return m;
    }

    public String status(Vital v) {
        boolean critical = (v.heartRate != null && (v.heartRate > 120 || v.heartRate < 45)) ||
                (v.oxygen != null && v.oxygen < 92) || (v.systolic != null && (v.systolic > 180 || v.systolic < 90)) ||
                (v.diastolic != null && (v.diastolic > 120 || v.diastolic < 60)) ||
                (v.glucose != null && (v.glucose > 250 || v.glucose < 55)) ||
                (v.temperature != null && (v.temperature >= 39 || v.temperature < 35));
        if (critical) return "CRITICAL";
        boolean warning = (v.heartRate != null && (v.heartRate > 100 || v.heartRate < 60)) ||
                (v.oxygen != null && v.oxygen < 95) || (v.systolic != null && (v.systolic > 140 || v.systolic < 100)) ||
                (v.diastolic != null && (v.diastolic > 90 || v.diastolic < 65)) ||
                (v.glucose != null && (v.glucose > 180 || v.glucose < 70)) ||
                (v.temperature != null && v.temperature > 37.5);
        return warning ? "WARNING" : "NORMAL";
    }

    private String fmt(Double value) { return value == null ? "—" : String.format(Locale.US, "%.1f", value); }
    private record AlertCandidate(String severity, String type, String message) {}
}
