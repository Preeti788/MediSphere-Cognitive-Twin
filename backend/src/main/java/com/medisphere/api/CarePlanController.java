package com.medisphere.api;

import com.medisphere.ai.AiRiskM2Service;
import com.medisphere.model.Models.CarePlan;
import com.medisphere.repo.CarePlanRepo;
import com.medisphere.repo.PatientRepo;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

/**
 * Milestone 4 - Care Plan & Treatment API.
 * The generated plan is intentionally demo-level and is based on the
 * existing M2 explainable risk engine output; it is not clinical advice.
 */
@RestController
@RequestMapping("/api/care-plans")
public class CarePlanController {
    private final CarePlanRepo carePlans;
    private final PatientRepo patients;
    private final AiRiskM2Service aiRisk;

    public CarePlanController(CarePlanRepo carePlans, PatientRepo patients, AiRiskM2Service aiRisk) {
        this.carePlans = carePlans;
        this.patients = patients;
        this.aiRisk = aiRisk;
    }

    @GetMapping("/{patientId}")
    public List<CarePlan> list(@PathVariable String patientId) {
        ensurePatient(patientId);
        return carePlans.findByPatientIdOrderByFollowUpDateAsc(patientId);
    }

    @PostMapping
    public CarePlan create(@RequestBody CarePlan plan) {
        validatePatient(plan.patientId);
        plan.id = null;
        normalize(plan);
        plan.generatedBy = plan.generatedBy == null || plan.generatedBy.isBlank() ? "CLINICIAN" : plan.generatedBy;
        plan.updatedAt = Instant.now();
        return carePlans.save(plan);
    }

    @PutMapping("/{id}")
    public CarePlan update(@PathVariable String id, @RequestBody CarePlan incoming) {
        CarePlan existing = carePlans.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Care plan not found"));
        validatePatient(incoming.patientId != null ? incoming.patientId : existing.patientId);
        incoming.id = id;
        if (incoming.patientId == null || incoming.patientId.isBlank()) incoming.patientId = existing.patientId;
        normalize(incoming);
        incoming.updatedAt = Instant.now();
        return carePlans.save(incoming);
    }

    @DeleteMapping("/{id}")
    public Map<String,Object> delete(@PathVariable String id) {
        if (!carePlans.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Care plan not found");
        carePlans.deleteById(id);
        return Map.of("success", true, "id", id);
    }

    @PostMapping("/generate/{patientId}")
    public CarePlan generate(@PathVariable String patientId) {
        var patient = ensurePatient(patientId);
        Map<String,Object> risk = aiRisk.predict(patientId);

        Map<String,Object> cardio = map(risk.get("cardiovascular"));
        Map<String,Object> diabetes = map(risk.get("diabetes"));
        double cardioScore = number(cardio.get("score"));
        double diabetesScore = number(diabetes.get("score"));

        String category;
        String title;
        String goal;
        String priority;
        if (cardioScore >= diabetesScore && cardioScore >= 60) {
            category = "CARDIOVASCULAR";
            title = "Cardiovascular Risk Reduction Plan";
            goal = "Improve cardiovascular risk factors and maintain stable vital trends.";
            priority = "HIGH";
        } else if (diabetesScore >= 30) {
            category = "DIABETES";
            title = "Metabolic & Diabetes Management Plan";
            goal = "Improve glucose-related risk factors and support healthy metabolic trends.";
            priority = diabetesScore >= 60 ? "HIGH" : "MEDIUM";
        } else {
            category = "PREVENTIVE";
            title = "Preventive Health & Monitoring Plan";
            goal = "Maintain stable health indicators through monitoring, prevention and follow-up.";
            priority = "LOW";
        }

        List<String> actions = new ArrayList<>();
        Object recs = risk.get("recommendations");
        if (recs instanceof List<?> list) {
            for (Object item : list) if (item != null) actions.add(String.valueOf(item));
        }
        if (actions.isEmpty()) {
            actions.add("Review latest vital signs and laboratory results");
            actions.add("Continue routine monitoring and scheduled follow-up");
        }
        actions = actions.stream().distinct().limit(6).toList();

        CarePlan plan = new CarePlan();
        plan.patientId = patient.id;
        plan.title = title;
        plan.goal = goal;
        plan.status = "ACTIVE";
        plan.actions = new ArrayList<>(actions);
        plan.followUpDate = LocalDate.now().plusWeeks(4).toString();
        plan.progress = 0;
        plan.adherence = 0;
        plan.priority = priority;
        plan.category = category;
        plan.generatedBy = "M2-AI-DEMO";
        plan.updatedAt = Instant.now();
        return carePlans.save(plan);
    }

    private com.medisphere.model.Models.Patient ensurePatient(String id) {
        return patients.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
    private void validatePatient(String id) { if (id == null || id.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId is required"); ensurePatient(id); }
    private void normalize(CarePlan p) {
        p.status = p.status == null || p.status.isBlank() ? "ACTIVE" : p.status.toUpperCase();
        p.priority = p.priority == null || p.priority.isBlank() ? "MEDIUM" : p.priority.toUpperCase();
        p.category = p.category == null || p.category.isBlank() ? "GENERAL" : p.category.toUpperCase();
        p.progress = clamp(p.progress);
        p.adherence = clamp(p.adherence);
        if (p.actions == null) p.actions = new ArrayList<>();
    }
    private int clamp(Integer v) { return Math.max(0, Math.min(100, v == null ? 0 : v)); }
    @SuppressWarnings("unchecked") private Map<String,Object> map(Object x) { return x instanceof Map<?,?> m ? (Map<String,Object>)m : Map.of(); }
    private double number(Object x) { return x instanceof Number n ? n.doubleValue() : 0d; }
}
