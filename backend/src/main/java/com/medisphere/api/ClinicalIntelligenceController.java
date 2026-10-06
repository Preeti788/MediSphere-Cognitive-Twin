package com.medisphere.api;

import com.medisphere.model.Models.*;
import com.medisphere.repo.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clinical")
public class ClinicalIntelligenceController {
    private final PatientRepo patients;
    private final VitalRepo vitals;
    private final LabRepo labs;
    private final MedicineRepo medicines;
    private final PrescriptionRepo prescriptions;
    private final MedicationEventRepo medicationEvents;
    private final MedicalDocumentRepo documents;
    private final NotificationRepo notifications;

    public ClinicalIntelligenceController(PatientRepo patients, VitalRepo vitals, LabRepo labs,
                                          MedicineRepo medicines, PrescriptionRepo prescriptions,
                                          MedicationEventRepo medicationEvents, MedicalDocumentRepo documents,
                                          NotificationRepo notifications) {
        this.patients = patients; this.vitals = vitals; this.labs = labs; this.medicines = medicines;
        this.prescriptions = prescriptions; this.medicationEvents = medicationEvents;
        this.documents = documents; this.notifications = notifications;
    }

    @GetMapping("/analytics")
    public Map<String,Object> analytics() {
        long critical = notifications.findTop50ByOrderByCreatedAtDesc().stream().filter(n -> "CRITICAL".equals(n.severity) && !n.read).count();
        long lowStock = medicines.findAll().stream().filter(m -> m.stock <= m.reorderLevel).count();
        return Map.of("patients", patients.count(), "prescriptions", prescriptions.count(),
                "medicines", medicines.count(), "lowStock", lowStock,
                "criticalNotifications", critical, "medicationEvents", medicationEvents.count(),
                "documents", documents.count());
    }

    @GetMapping("/patient/{patientId}/qr")
    public Map<String,Object> patientQr(@PathVariable String patientId) throws Exception {
        Patient p = patients.findById(patientId).orElseThrow();
        String payload = "MEDISPHERE:PATIENT:" + patientId;
        var matrix = new MultiFormatWriter().encode(payload, BarcodeFormat.QR_CODE, 320, 320);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return Map.of("patientId", patientId, "patientName", p.name == null ? "" : p.name,
                "payload", payload, "image", "data:image/png;base64," + Base64.getEncoder().encodeToString(out.toByteArray()));
    }

    @GetMapping("/patient/{patientId}")
    public Map<String,Object> patientClinical(@PathVariable String patientId) {
        Patient p = patients.findById(patientId).orElseThrow();
        return Map.of("patient", p,
                "prescriptions", prescriptions.findByPatientIdOrderByCreatedAtDesc(patientId),
                "medicationEvents", medicationEvents.findByPatientIdOrderByRecordedAtDesc(patientId),
                "documents", documents.findByPatientIdOrderByUploadedAtDesc(patientId),
                "labs", labs.findByPatientIdOrderByCollectedAtDesc(patientId),
                "vitals", vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId));
    }

    @PostMapping("/prescriptions")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public Prescription createPrescription(@RequestBody Prescription p) {
        patients.findById(p.patientId).orElseThrow();
        p.id = null; p.createdAt = Instant.now(); p.status = p.status == null ? "ACTIVE" : p.status;
        Prescription saved = prescriptions.save(p);
        Notification n = new Notification(); n.patientId = p.patientId; n.title = "Prescription created";
        n.message = p.medicineName + " " + (p.strength == null ? "" : p.strength) + " was added to the active medication plan.";
        n.severity = "INFO"; notifications.save(n);
        return saved;
    }

    @PutMapping("/prescriptions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public Prescription updatePrescription(@PathVariable String id, @RequestBody Prescription p) {
        p.id = id; return prescriptions.save(p);
    }

    @GetMapping("/prescriptions/{patientId}")
    public List<Prescription> prescriptions(@PathVariable String patientId) { return prescriptions.findByPatientIdOrderByCreatedAtDesc(patientId); }

    @PostMapping("/medication-events")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PHARMACIST')")
    public MedicationEvent medicationEvent(@RequestBody MedicationEvent e) {
        e.id = null; e.recordedAt = Instant.now(); MedicationEvent saved = medicationEvents.save(e);
        if ("MISSED".equalsIgnoreCase(e.eventType)) {
            Notification n = new Notification(); n.patientId = e.patientId; n.title = "Medication missed";
            n.message = "A scheduled dose of " + e.medicineName + " was marked missed."; n.severity = "WARNING"; notifications.save(n);
        }
        return saved;
    }

    @GetMapping("/medication-events/{patientId}")
    public List<MedicationEvent> medicationEvents(@PathVariable String patientId) { return medicationEvents.findByPatientIdOrderByRecordedAtDesc(patientId); }


    @PostMapping(value = "/documents/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PHARMACIST')")
    public MedicalDocument uploadDocument(@RequestPart("file") MultipartFile file,
                                          @RequestPart("patientId") String patientId,
                                          @RequestPart(value = "documentType", required = false) String documentType,
                                          @RequestPart(value = "description", required = false) String description) throws Exception {
        patients.findById(patientId).orElseThrow();
        if (file.isEmpty()) throw new IllegalArgumentException("Uploaded file is empty");
        String safeName = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
        String key = "uploads/" + patientId + "/" + System.currentTimeMillis() + "-" + safeName;
        java.nio.file.Path target = java.nio.file.Paths.get(key);
        java.nio.file.Files.createDirectories(target.getParent());
        java.nio.file.Files.write(target, file.getBytes());
        MedicalDocument d = new MedicalDocument(); d.patientId = patientId; d.name = safeName;
        d.documentType = documentType == null ? "OTHER" : documentType; d.description = description; d.storageKey = key;
        return documents.save(d);
    }

    @PostMapping("/documents")
    public MedicalDocument document(@RequestBody MedicalDocument d) { d.id = null; d.uploadedAt = Instant.now(); return documents.save(d); }

    @GetMapping("/documents/{patientId}")
    public List<MedicalDocument> documents(@PathVariable String patientId) { return documents.findByPatientIdOrderByUploadedAtDesc(patientId); }

    @GetMapping("/notifications")
    public List<Notification> notifications() { return notifications.findTop50ByOrderByCreatedAtDesc(); }

    @PutMapping("/notifications/{id}/read")
    public Notification readNotification(@PathVariable String id) { Notification n = notifications.findById(id).orElseThrow(); n.read = true; return notifications.save(n); }

    @PostMapping("/assistant")
    public Map<String,Object> assistant(@RequestBody Map<String,Object> body) {
        String patientId = String.valueOf(body.getOrDefault("patientId", ""));
        String question = String.valueOf(body.getOrDefault("question", "")).toLowerCase();
        Patient p = patients.findById(patientId).orElseThrow();
        List<Vital> vs = vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId);
        List<Lab> ls = labs.findByPatientIdOrderByCollectedAtDesc(patientId);
        List<Prescription> ps = prescriptions.findByPatientIdOrderByCreatedAtDesc(patientId);
        Vital v = vs.isEmpty() ? null : vs.get(0);
        List<String> highlights = new ArrayList<>();
        if (v != null && v.systolic != null) highlights.add("BP " + v.systolic + "/" + (v.diastolic == null ? "—" : v.diastolic));
        if (v != null && v.oxygen != null) highlights.add("SpO₂ " + v.oxygen + "%");
        if (v != null && v.glucose != null) highlights.add("Glucose " + v.glucose + " mg/dL");
        highlights.add(ps.size() + " prescriptions"); highlights.add(ls.size() + " lab reports");
        String answer;
        if (question.contains("medicine") || question.contains("medication")) {
            answer = "The patient currently has " + ps.size() + " prescription record(s). Review each medication with the recorded allergies, labs and current vitals before changing therapy.";
        } else if (question.contains("risk")) {
            double score = 0; if (v != null) { if (v.systolic != null && v.systolic > 140) score += 30; if (v.oxygen != null && v.oxygen < 95) score += 30; if (v.heartRate != null && v.heartRate > 100) score += 25; if (v.glucose != null && v.glucose > 140) score += 15; }
            answer = "The current rule-based signal is approximately " + Math.min(100, score) + "%. This is a decision-support signal, not a diagnosis.";
        } else {
            answer = "Patient " + (p.name == null ? "record" : p.name) + " has " + vs.size() + " recent vital records, " + ls.size() + " lab reports, " + ps.size() + " prescriptions and " + (p.allergies == null ? 0 : p.allergies.size()) + " recorded allergies. Use the clinical panels to review the underlying data.";
        }
        return Map.of("title", "MediSphere Clinical Summary", "answer", answer, "highlights", highlights, "disclaimer", "Decision-support only. Verify patient data and clinical decisions with a qualified healthcare professional.");
    }

    @GetMapping("/medicine/recommendations/{patientId}")
    public Map<String,Object> recommendations(@PathVariable String patientId, @RequestParam(required=false) String diagnosis) {
        Patient p = patients.findById(patientId).orElseThrow();
        String dx = diagnosis == null ? "" : diagnosis.toLowerCase();
        List<Medicine> inventory = medicines.findAll();
        List<Map<String,Object>> suggestions = new ArrayList<>();
        for (Medicine m : inventory) {
            String c = String.valueOf(m.category).toLowerCase();
            boolean match = dx.isBlank() || c.contains(dx) || (dx.contains("diabet") && c.contains("diabet")) || (dx.contains("cardio") && c.contains("cardio"));
            if (match) {
                String warning = "";
                if (p.allergies != null && p.allergies.stream().anyMatch(a -> a != null && m.name != null && m.name.toLowerCase().contains(a.toLowerCase()))) warning = "Possible allergy name conflict — clinician review required.";
                suggestions.add(Map.of("medicine", m.name, "strength", m.strength == null ? "" : m.strength,
                        "category", m.category == null ? "GENERAL" : m.category, "stock", m.stock,
                        "warning", warning, "requiresClinicianReview", true));
            }
        }
        if (suggestions.isEmpty()) {
            suggestions = inventory.stream().limit(5).map(m -> Map.<String,Object>of("medicine", m.name, "strength", m.strength == null ? "" : m.strength,
                    "category", m.category == null ? "GENERAL" : m.category, "stock", m.stock,
                    "warning", "No diagnosis-specific match; clinician review required.", "requiresClinicianReview", true)).collect(Collectors.toList());
        }
        return Map.of("patientId", patientId, "diagnosis", diagnosis == null ? "" : diagnosis,
                "suggestions", suggestions, "disclaimer", "Decision-support only. A licensed clinician must review and approve any prescription.");
    }

    @PostMapping("/medicine/interactions")
    public Map<String,Object> interactions(@RequestBody Map<String,Object> body) {
        String a = String.valueOf(body.getOrDefault("medicineA", "")).toLowerCase();
        String b = String.valueOf(body.getOrDefault("medicineB", "")).toLowerCase();
        List<Map<String,String>> rules = List.of(
                rule("warfarin", "aspirin", "HIGH", "May increase bleeding risk."),
                rule("warfarin", "ibuprofen", "HIGH", "May increase bleeding risk."),
                rule("metformin", "contrast", "MODERATE", "Renal function review may be required around contrast exposure."),
                rule("simvastatin", "clarithromycin", "HIGH", "May increase statin exposure and muscle toxicity risk.")
        );
        List<Map<String,String>> hits = rules.stream().filter(r -> (a.contains(r.get("a")) && b.contains(r.get("b"))) || (a.contains(r.get("b")) && b.contains(r.get("a")))).toList();
        return Map.of("safe", hits.isEmpty(), "interactions", hits, "message", hits.isEmpty() ? "No rule-based interaction found in the demo knowledge base." : "Potential interaction detected. Clinician/pharmacist review required.");
    }

    private Map<String,String> rule(String a, String b, String severity, String message) { return Map.of("a",a,"b",b,"severity",severity,"message",message); }
}
