package com.medisphere.api;

import com.medisphere.model.Models.*;
import com.medisphere.repo.LabRepo;
import com.medisphere.repo.PatientRepo;
import com.medisphere.repo.VitalRepo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/fhir")
public class FhirController {

    private final PatientRepo patientRepo;
    private final VitalRepo vitalRepo;
    private final LabRepo labRepo;

    public FhirController(
            PatientRepo patientRepo,
            VitalRepo vitalRepo,
            LabRepo labRepo) {

        this.patientRepo = patientRepo;
        this.vitalRepo = vitalRepo;
        this.labRepo = labRepo;
    }

    // =========================================================
    // FHIR R4 CAPABILITY STATEMENT
    // =========================================================

    @GetMapping("/metadata")
    public Map<String, Object> metadata() {

        return Map.of(
                "resourceType", "CapabilityStatement",
                "id", "medisphere-fhir-r4",
                "status", "active",
                "kind", "instance",
                "fhirVersion", "4.0.1",
                "format", List.of("json"),

                "implementation",
                Map.of(
                        "description",
                        "MediSphere FHIR R4 Integration Server"
                ),

                "rest",
                List.of(
                        Map.of(
                                "mode", "server",

                                "resource",
                                List.of(

                                        Map.of(
                                                "type", "Patient",
                                                "interaction",
                                                List.of(
                                                        Map.of("code", "read"),
                                                        Map.of("code", "search-type"),
                                                        Map.of("code", "create")
                                                )
                                        ),

                                        Map.of(
                                                "type", "Observation",
                                                "interaction",
                                                List.of(
                                                        Map.of("code", "read"),
                                                        Map.of("code", "search-type"),
                                                        Map.of("code", "create")
                                                )
                                        ),

                                        Map.of(
                                                "type", "DiagnosticReport",
                                                "interaction",
                                                List.of(
                                                        Map.of("code", "read"),
                                                        Map.of("code", "search-type"),
                                                        Map.of("code", "create")
                                                )
                                        )
                                )
                        )
                )
        );
    }

    // =========================================================
    // FHIR PATIENT → MONGODB PATIENT
    // =========================================================

    @PostMapping("/Patient")
    public ResponseEntity<?> createPatient(
            @RequestBody Map<String, Object> resource) {

        if (!"Patient".equals(resource.get("resourceType"))) {

            return badRequest(
                    "resourceType must be Patient"
            );
        }

        String fhirId = getString(resource, "id");

        if (fhirId == null || fhirId.isBlank()) {
            fhirId = UUID.randomUUID().toString();
        }

        // -----------------------------------------------------
        // Create MediSphere Patient
        // -----------------------------------------------------

        Patient patient = new Patient();

        patient.id = fhirId;

        // MRN / Identifier
        patient.mrn = extractMrn(resource);

        // Name
        patient.name = extractPatientName(resource);

        // Gender
        patient.gender =
                getString(resource, "gender");

        // Date of birth
        patient.dateOfBirth =
                getString(resource, "birthDate");

        // Phone / Email
        Map<String, Object> telecom =
                extractTelecom(resource);

        patient.phone =
                telecom.get("phone") != null
                        ? telecom.get("phone").toString()
                        : null;

        patient.email =
                telecom.get("email") != null
                        ? telecom.get("email").toString()
                        : null;

        // Address
        patient.address =
                extractAddress(resource);

        // Emergency contact
        patient.emergencyContact =
                extractEmergencyContact(resource);

        patient.createdAt = Instant.now();

        // -----------------------------------------------------
        // Save into MongoDB
        // patients collection
        // -----------------------------------------------------

        Patient saved =
                patientRepo.save(patient);

        // -----------------------------------------------------
        // Return FHIR Patient
        // -----------------------------------------------------

        Map<String, Object> response =
                new LinkedHashMap<>(resource);

        response.put(
                "id",
                saved.id
        );

        response.put(
                "meta",
                Map.of(
                        "versionId", "1",
                        "lastUpdated",
                        Instant.now().toString()
                )
        );

        response.put(
                "_medisphere",
                Map.of(
                        "mongodbCollection", "patients",
                        "mongodbId", saved.id,
                        "status", "STORED"
                )
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET FHIR PATIENT
    // =========================================================

    @GetMapping("/Patient/{id}")
    public ResponseEntity<?> getPatient(
            @PathVariable String id) {

        Optional<Patient> patient =
                patientRepo.findById(id);

        if (patient.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                toFhirPatient(patient.get())
        );
    }

    // =========================================================
    // SEARCH PATIENTS
    // =========================================================

    @GetMapping("/Patient")
    public List<Map<String, Object>> searchPatients() {

        return patientRepo.findAll()
                .stream()
                .map(this::toFhirPatient)
                .toList();
    }

    // =========================================================
    // FHIR OBSERVATION → MONGODB VITAL
    // =========================================================

    @PostMapping("/Observation")
    public ResponseEntity<?> createObservation(
            @RequestBody Map<String, Object> resource) {

        if (!"Observation".equals(
                resource.get("resourceType"))) {

            return badRequest(
                    "resourceType must be Observation"
            );
        }

        String patientId =
                extractPatientId(resource);

        if (patientId == null) {

            return badRequest(
                    "Observation must contain subject.reference"
            );
        }

        // Verify patient exists
        if (!patientRepo.existsById(patientId)) {

            return ResponseEntity.status(404).body(
                    Map.of(
                            "resourceType",
                            "OperationOutcome",

                            "issue",
                            List.of(
                                    Map.of(
                                            "severity",
                                            "error",

                                            "code",
                                            "not-found",

                                            "diagnostics",
                                            "Patient not found: "
                                                    + patientId
                                    )
                            )
                    )
            );
        }

        Vital vital = new Vital();

        vital.id = null;
        vital.patientId = patientId;

        // -----------------------------------------------------
        // Observation code
        // -----------------------------------------------------

        String code =
                extractObservationCode(resource);

        // -----------------------------------------------------
        // Simple vital observation
        // -----------------------------------------------------

        Double value =
                extractObservationValue(resource);

        if (code != null) {

            switch (code) {

                // Heart Rate
                case "8867-4" ->
                        vital.heartRate = value;

                // Oxygen Saturation
                case "59408-5" ->
                        vital.oxygen = value;

                // Blood Glucose
                case "2339-0" ->
                        vital.glucose = value;

                // Body Temperature
                case "8310-5" ->
                        vital.temperature = value;
            }
        }

        // -----------------------------------------------------
        // Blood Pressure
        // LOINC 85354-9
        // -----------------------------------------------------

        if ("85354-9".equals(code)) {

            Map<String, Object> components =
                    extractBloodPressure(resource);

            if (components.get("systolic") != null) {

                vital.systolic =
                        Double.valueOf(
                                components
                                        .get("systolic")
                                        .toString()
                        );
            }

            if (components.get("diastolic") != null) {

                vital.diastolic =
                        Double.valueOf(
                                components
                                        .get("diastolic")
                                        .toString()
                        );
            }
        }

        vital.source = "FHIR";

        vital.recordedAt =
                extractEffectiveDate(resource);

        // -----------------------------------------------------
        // Save to MongoDB
        // vitals collection
        // -----------------------------------------------------

        Vital saved =
                vitalRepo.save(vital);

        // -----------------------------------------------------
        // Return FHIR response
        // -----------------------------------------------------

        Map<String, Object> response =
                new LinkedHashMap<>(resource);

        response.put(
                "id",
                saved.id != null
                        ? saved.id
                        : UUID.randomUUID().toString()
        );

        response.put(
                "meta",
                Map.of(
                        "versionId", "1",
                        "lastUpdated",
                        Instant.now().toString()
                )
        );

        response.put(
                "_medisphere",
                Map.of(
                        "mongodbCollection", "vitals",
                        "patientId", patientId,
                        "status", "STORED"
                )
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET FHIR OBSERVATION
    // =========================================================

    @GetMapping("/Observation/{id}")
    public ResponseEntity<?> getObservation(
            @PathVariable String id) {

        Optional<Vital> vital =
                vitalRepo.findById(id);

        if (vital.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                toFhirObservation(vital.get())
        );
    }

    // =========================================================
    // SEARCH OBSERVATIONS
    // =========================================================

    @GetMapping("/Observation")
    public List<Map<String, Object>> searchObservations(
            @RequestParam(required = false)
            String patient) {

        if (patient != null &&
                !patient.isBlank()) {

            return vitalRepo
                    .findTop20ByPatientIdOrderByRecordedAtDesc(
                            patient
                    )
                    .stream()
                    .map(this::toFhirObservation)
                    .toList();
        }

        return vitalRepo.findAll()
                .stream()
                .map(this::toFhirObservation)
                .toList();
    }

    // =========================================================
    // FHIR DIAGNOSTIC REPORT → LAB
    // =========================================================

    @PostMapping("/DiagnosticReport")
    public ResponseEntity<?> createDiagnosticReport(
            @RequestBody Map<String, Object> resource) {

        if (!"DiagnosticReport".equals(
                resource.get("resourceType"))) {

            return badRequest(
                    "resourceType must be DiagnosticReport"
            );
        }

        String patientId =
                extractPatientId(resource);

        if (patientId == null) {

            return badRequest(
                    "DiagnosticReport must contain subject.reference"
            );
        }

        if (!patientRepo.existsById(patientId)) {

            return ResponseEntity.status(404).body(
                    Map.of(
                            "resourceType",
                            "OperationOutcome",

                            "issue",
                            List.of(
                                    Map.of(
                                            "severity",
                                            "error",
                                            "code",
                                            "not-found",
                                            "diagnostics",
                                            "Patient not found: "
                                                    + patientId
                                    )
                            )
                    )
            );
        }

        Lab lab = new Lab();

        lab.id = null;
        lab.patientId = patientId;

        lab.testName =
                extractDiagnosticReportName(resource);

        lab.result =
                extractDiagnosticResult(resource);

        lab.unit =
                extractDiagnosticUnit(resource);

        lab.referenceRange = null;

        lab.collectedAt =
                extractEffectiveDate(resource);

        // -----------------------------------------------------
        // Save laboratory result
        // -----------------------------------------------------

        Lab saved =
                labRepo.save(lab);

        Map<String, Object> response =
                new LinkedHashMap<>(resource);

        response.put(
                "id",
                saved.id != null
                        ? saved.id
                        : UUID.randomUUID().toString()
        );

        response.put(
                "meta",
                Map.of(
                        "versionId", "1",
                        "lastUpdated",
                        Instant.now().toString()
                )
        );

        response.put(
                "_medisphere",
                Map.of(
                        "mongodbCollection", "labs",
                        "patientId", patientId,
                        "status", "STORED"
                )
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET DIAGNOSTIC REPORT
    // =========================================================

    @GetMapping("/DiagnosticReport/{id}")
    public ResponseEntity<?> getDiagnosticReport(
            @PathVariable String id) {

        Optional<Lab> lab =
                labRepo.findById(id);

        if (lab.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                toFhirDiagnosticReport(lab.get())
        );
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private ResponseEntity<?> badRequest(
            String message) {

        return ResponseEntity.badRequest().body(
                Map.of(
                        "resourceType",
                        "OperationOutcome",

                        "issue",
                        List.of(
                                Map.of(
                                        "severity",
                                        "error",
                                        "code",
                                        "invalid",
                                        "diagnostics",
                                        message
                                )
                        )
                )
        );
    }

    private String getString(
            Map<String, Object> map,
            String key) {

        Object value = map.get(key);

        return value == null
                ? null
                : value.toString();
    }

    // =========================================================
    // PATIENT NAME
    // =========================================================

    @SuppressWarnings("unchecked")
    private String extractPatientName(
            Map<String, Object> resource) {

        Object nameObject =
                resource.get("name");

        if (!(nameObject instanceof List<?> names) ||
                names.isEmpty()) {

            return null;
        }

        Object first = names.get(0);

        if (!(first instanceof Map<?, ?> raw)) {
            return null;
        }

        Map<String, Object> name =
                (Map<String, Object>) raw;

        String text =
                getString(name, "text");

        if (text != null) {
            return text;
        }

        String given = "";

        Object givenObject =
                name.get("given");

        if (givenObject instanceof List<?> list) {

            given = list.stream()
                    .map(Object::toString)
                    .reduce(
                            "",
                            (a, b) ->
                                    a.isBlank()
                                            ? b
                                            : a + " " + b
                    );
        }

        String family =
                getString(name, "family");

        return (given + " " +
                (family == null ? "" : family))
                .trim();
    }

    // =========================================================
    // MRN
    // =========================================================

    @SuppressWarnings("unchecked")
    private String extractMrn(
            Map<String, Object> resource) {

        Object identifierObject =
                resource.get("identifier");

        if (!(identifierObject instanceof List<?> list)) {
            return null;
        }

        for (Object item : list) {

            if (!(item instanceof Map<?, ?> raw)) {
                continue;
            }

            Map<String, Object> identifier =
                    (Map<String, Object>) raw;

            String value =
                    getString(identifier, "value");

            if (value != null) {
                return value;
            }
        }

        return null;
    }

    // =========================================================
    // TELECOM
    // =========================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractTelecom(
            Map<String, Object> resource) {

        Map<String, Object> result =
                new HashMap<>();

        Object telecomObject =
                resource.get("telecom");

        if (!(telecomObject instanceof List<?> list)) {
            return result;
        }

        for (Object item : list) {

            if (!(item instanceof Map<?, ?> raw)) {
                continue;
            }

            Map<String, Object> telecom =
                    (Map<String, Object>) raw;

            String system =
                    getString(telecom, "system");

            String value =
                    getString(telecom, "value");

            if ("phone".equals(system)) {
                result.put("phone", value);
            }

            if ("email".equals(system)) {
                result.put("email", value);
            }
        }

        return result;
    }

    // =========================================================
    // ADDRESS
    // =========================================================

    @SuppressWarnings("unchecked")
    private String extractAddress(
            Map<String, Object> resource) {

        Object addressObject =
                resource.get("address");

        if (!(addressObject instanceof List<?> list) ||
                list.isEmpty()) {

            return null;
        }

        Object first = list.get(0);

        if (!(first instanceof Map<?, ?> raw)) {
            return null;
        }

        Map<String, Object> address =
                (Map<String, Object>) raw;

        String text =
                getString(address, "text");

        if (text != null) {
            return text;
        }

        List<String> parts =
                new ArrayList<>();

        Object lines =
                address.get("line");

        if (lines instanceof List<?> lineList) {

            lineList.forEach(
                    x -> parts.add(x.toString())
            );
        }

        String city =
                getString(address, "city");

        String state =
                getString(address, "state");

        String postal =
                getString(address, "postalCode");

        if (city != null) parts.add(city);
        if (state != null) parts.add(state);
        if (postal != null) parts.add(postal);

        return String.join(", ", parts);
    }

    // =========================================================
    // EMERGENCY CONTACT
    // =========================================================

    @SuppressWarnings("unchecked")
    private String extractEmergencyContact(
            Map<String, Object> resource) {

        Object contactObject =
                resource.get("contact");

        if (!(contactObject instanceof List<?> list) ||
                list.isEmpty()) {

            return null;
        }

        Object first = list.get(0);

        if (!(first instanceof Map<?, ?> raw)) {
            return null;
        }

        Map<String, Object> contact =
                (Map<String, Object>) raw;

        Object name =
                contact.get("name");

        if (name instanceof Map<?, ?> nameMap) {

            Object text =
                    nameMap.get("text");

            if (text != null) {
                return text.toString();
            }
        }

        return null;
    }

    // =========================================================
    // OBSERVATION PATIENT
    // =========================================================

    @SuppressWarnings("unchecked")
    private String extractPatientId(
            Map<String, Object> resource) {

        Object subjectObject =
                resource.get("subject");

        if (!(subjectObject instanceof Map<?, ?> raw)) {
            return null;
        }

        Map<String, Object> subject =
                (Map<String, Object>) raw;

        String reference =
                getString(subject, "reference");

        if (reference == null) {
            return null;
        }

        if (reference.startsWith("Patient/")) {
            return reference.substring(8);
        }

        return reference;
    }

    // =========================================================
    // OBSERVATION CODE
    // =========================================================

    @SuppressWarnings("unchecked")
    private String extractObservationCode(
            Map<String, Object> resource) {

        Object codeObject =
                resource.get("code");

        if (!(codeObject instanceof Map<?, ?> raw)) {
            return null;
        }

        Map<String, Object> code =
                (Map<String, Object>) raw;

        Object codingObject =
                code.get("coding");

        if (!(codingObject instanceof List<?> list) ||
                list.isEmpty()) {

            return null;
        }

        Object first = list.get(0);

        if (!(first instanceof Map<?, ?> codingRaw)) {
            return null;
        }

        Map<String, Object> coding =
                (Map<String, Object>) codingRaw;

        return getString(coding, "code");
    }

    // =========================================================
    // OBSERVATION VALUE
    // =========================================================

    @SuppressWarnings("unchecked")
    private Double extractObservationValue(
            Map<String, Object> resource) {

        Object value =
                resource.get("valueQuantity");

        if (!(value instanceof Map<?, ?> raw)) {
            return null;
        }

        Map<String, Object> quantity =
                (Map<String, Object>) raw;

        Object number =
                quantity.get("value");

        if (number == null) {
            return null;
        }

        try {
            return Double.valueOf(number.toString());
        } catch (Exception e) {
            return null;
        }
    }

    // =========================================================
    // BLOOD PRESSURE COMPONENTS
    // =========================================================

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractBloodPressure(
            Map<String, Object> resource) {

        Map<String, Object> result =
                new HashMap<>();

        Object componentObject =
                resource.get("component");

        if (!(componentObject instanceof List<?> list)) {
            return result;
        }

        for (Object item : list) {

            if (!(item instanceof Map<?, ?> raw)) {
                continue;
            }

            Map<String, Object> component =
                    (Map<String, Object>) raw;

            Object codeObject =
                    component.get("code");

            if (!(codeObject instanceof Map<?, ?> codeRaw)) {
                continue;
            }

            Map<String, Object> code =
                    (Map<String, Object>) codeRaw;

            Object codingObject =
                    code.get("coding");

            if (!(codingObject instanceof List<?> codingList) ||
                    codingList.isEmpty()) {
                continue;
            }

            Object first =
                    codingList.get(0);

            if (!(first instanceof Map<?, ?> codingRaw)) {
                continue;
            }

            Map<String, Object> coding =
                    (Map<String, Object>) codingRaw;

            String codeValue =
                    getString(coding, "code");

            Object quantityObject =
                    component.get("valueQuantity");

            if (!(quantityObject instanceof Map<?, ?> quantityRaw)) {
                continue;
            }

            Map<String, Object> quantity =
                    (Map<String, Object>) quantityRaw;

            Object value =
                    quantity.get("value");

            if (value == null) {
                continue;
            }

            if ("8480-6".equals(codeValue)) {
                result.put("systolic", value);
            }

            if ("8462-4".equals(codeValue)) {
                result.put("diastolic", value);
            }
        }

        return result;
    }

    // =========================================================
    // DATE
    // =========================================================

    private Instant extractEffectiveDate(
            Map<String, Object> resource) {

        String date =
                getString(
                        resource,
                        "effectiveDateTime"
                );

        if (date == null) {
            return Instant.now();
        }

        try {
            return Instant.parse(date);
        } catch (Exception e) {
            return Instant.now();
        }
    }

    // =========================================================
    // DIAGNOSTIC REPORT NAME
    // =========================================================

    @SuppressWarnings("unchecked")
    private String extractDiagnosticReportName(
            Map<String, Object> resource) {

        Object codeObject =
                resource.get("code");

        if (!(codeObject instanceof Map<?, ?> raw)) {
            return "Diagnostic Report";
        }

        Map<String, Object> code =
                (Map<String, Object>) raw;

        String text =
                getString(code, "text");

        return text != null
                ? text
                : "Diagnostic Report";
    }

    // =========================================================
    // DIAGNOSTIC RESULT
    // =========================================================

    private String extractDiagnosticResult(
            Map<String, Object> resource) {

        Object conclusion =
                resource.get("conclusion");

        if (conclusion != null) {
            return conclusion.toString();
        }

        return "Diagnostic report received";
    }

    private String extractDiagnosticUnit(
            Map<String, Object> resource) {

        return null;
    }

    // =========================================================
    // CONVERT MONGODB PATIENT → FHIR
    // =========================================================

    private Map<String, Object> toFhirPatient(
            Patient patient) {

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "resourceType",
                "Patient"
        );

        result.put(
                "id",
                patient.id
        );

        if (patient.mrn != null) {

            result.put(
                    "identifier",
                    List.of(
                            Map.of(
                                    "system",
                                    "urn:medisphere:mrn",
                                    "value",
                                    patient.mrn
                            )
                    )
            );
        }

        if (patient.name != null) {

            result.put(
                    "name",
                    List.of(
                            Map.of(
                                    "text",
                                    patient.name
                            )
                    )
            );
        }

        if (patient.gender != null) {
            result.put("gender", patient.gender);
        }

        if (patient.dateOfBirth != null) {
            result.put(
                    "birthDate",
                    patient.dateOfBirth
            );
        }

        List<Map<String, Object>> telecom =
                new ArrayList<>();

        if (patient.phone != null) {

            telecom.add(
                    Map.of(
                            "system", "phone",
                            "value", patient.phone
                    )
            );
        }

        if (patient.email != null) {

            telecom.add(
                    Map.of(
                            "system", "email",
                            "value", patient.email
                    )
            );
        }

        if (!telecom.isEmpty()) {
            result.put("telecom", telecom);
        }

        return result;
    }

    // =========================================================
    // CONVERT VITAL → FHIR OBSERVATION
    // =========================================================

    private Map<String, Object> toFhirObservation(
            Vital vital) {

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "resourceType",
                "Observation"
        );

        result.put(
                "id",
                vital.id
        );

        result.put(
                "status",
                "final"
        );

        result.put(
                "subject",
                Map.of(
                        "reference",
                        "Patient/" + vital.patientId
                )
        );

        result.put(
                "effectiveDateTime",
                vital.recordedAt != null
                        ? vital.recordedAt.toString()
                        : Instant.now().toString()
        );

        result.put(
                "source",
                vital.source
        );

        return result;
    }

    // =========================================================
    // CONVERT LAB → FHIR DIAGNOSTIC REPORT
    // =========================================================

    private Map<String, Object> toFhirDiagnosticReport(
            Lab lab) {

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "resourceType",
                "DiagnosticReport"
        );

        result.put(
                "id",
                lab.id
        );

        result.put(
                "status",
                "final"
        );

        result.put(
                "subject",
                Map.of(
                        "reference",
                        "Patient/" + lab.patientId
                )
        );

        result.put(
                "code",
                Map.of(
                        "text",
                        lab.testName != null
                                ? lab.testName
                                : "Diagnostic Report"
                )
        );

        if (lab.result != null) {

            result.put(
                    "conclusion",
                    lab.result
            );
        }

        return result;
    }
}