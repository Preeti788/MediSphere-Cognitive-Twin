package com.medisphere.api;

import com.medisphere.repo.*;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/digital-twin")
public class DigitalTwinController {

    private final MongoTemplate mongoTemplate;
    private final PatientRepo patients;
    private final VitalRepo vitals;
    private final LabRepo labs;
    private final AppointmentRepo appointments;
    private final AlertRepo alerts;
    private final CarePlanRepo carePlans;
    private final ConsentRepo consents;

    public DigitalTwinController(
            MongoTemplate mongoTemplate,
            PatientRepo patients,
            VitalRepo vitals,
            LabRepo labs,
            AppointmentRepo appointments,
            AlertRepo alerts,
            CarePlanRepo carePlans,
            ConsentRepo consents) {

        this.mongoTemplate = mongoTemplate;
        this.patients = patients;
        this.vitals = vitals;
        this.labs = labs;
        this.appointments = appointments;
        this.alerts = alerts;
        this.carePlans = carePlans;
        this.consents = consents;
    }

    // =====================================================
    // CREATE / REFRESH DIGITAL TWIN
    // =====================================================

    @PostMapping("/{patientId}")
    public Map<String, Object> createOrRefreshTwin(
            @PathVariable String patientId) {

        var patient = patients.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found: " + patientId));

        // -------------------------------------------------
        // Patient related data
        // -------------------------------------------------

        var patientVitals =
                vitals.findTop20ByPatientIdOrderByRecordedAtDesc(
                        patientId);

        var patientLabs =
                labs.findByPatientIdOrderByCollectedAtDesc(
                        patientId);

        var patientAppointments =
                appointments.findByPatientIdOrderByDateAscTimeAsc(
                        patientId);

        var patientAlerts =
                alerts.findByPatientIdOrderByCreatedAtDesc(
                        patientId);

        var patientCarePlans =
                carePlans.findByPatientIdOrderByFollowUpDateAsc(
                        patientId);

        var consent =
                consents.findByPatientId(patientId)
                        .orElse(null);

        // =================================================
        // FHIR INTEGRATION
        // =================================================

        /*
         * Current FHIR integration stores the linked
         * patient information in MongoDB's "patients"
         * collection.
         *
         * Therefore Digital Twin reads the same patient
         * record from MongoDB.
         */

        Document fhirPatient =
                mongoTemplate.findById(
                        patientId,
                        Document.class,
                        "patients"
                );

        if (fhirPatient != null) {
            fhirPatient.remove("_id");
        }

        // =================================================
        // DIGITAL TWIN OBJECT
        // =================================================

        String twinId =
                "TWIN-" + patientId;

        String now =
                Instant.now().toString();

        Map<String, Object> twin =
                new LinkedHashMap<>();

        twin.put(
                "twinId",
                twinId
        );

        twin.put(
                "patientId",
                patientId
        );

        twin.put(
                "status",
                "ACTIVE"
        );

        twin.put(
                "createdAt",
                now
        );

        twin.put(
                "updatedAt",
                now
        );

        // -------------------------------------------------
        // Core Patient
        // -------------------------------------------------

        twin.put(
                "patient",
                patient
        );

        // -------------------------------------------------
        // FHIR Patient
        // -------------------------------------------------

        twin.put(
                "fhirPatient",
                fhirPatient
        );

        boolean fhirIntegrated =
                fhirPatient != null;

        twin.put(
                "fhirIntegrated",
                fhirIntegrated
        );

        // -------------------------------------------------
        // Clinical Information
        // -------------------------------------------------

        twin.put(
                "vitals",
                patientVitals
        );

        twin.put(
                "labs",
                patientLabs
        );

        twin.put(
                "appointments",
                patientAppointments
        );

        twin.put(
                "alerts",
                patientAlerts
        );

        twin.put(
                "carePlans",
                patientCarePlans
        );

        twin.put(
                "consent",
                consent
        );

        // =================================================
        // DIGITAL TWIN SUMMARY
        // =================================================

        Map<String, Object> summary =
                new LinkedHashMap<>();

        summary.put(
                "vitalsCount",
                patientVitals.size()
        );

        summary.put(
                "labsCount",
                patientLabs.size()
        );

        summary.put(
                "appointmentsCount",
                patientAppointments.size()
        );

        summary.put(
                "alertsCount",
                patientAlerts.size()
        );

        summary.put(
                "carePlansCount",
                patientCarePlans.size()
        );

        summary.put(
                "consentAvailable",
                consent != null
        );

        summary.put(
                "fhirIntegrated",
                fhirIntegrated
        );

        twin.put(
                "summary",
                summary
        );

        // =================================================
        // SAVE DIGITAL TWIN TO MONGODB
        // =================================================

        Document twinDocument =
                new Document(twin);

        /*
         * Fixed MongoDB ID allows us to retrieve the same
         * Digital Twin later.
         */

        twinDocument.put(
                "_id",
                twinId
        );

        mongoTemplate.save(
                twinDocument,
                "digital_health_twins"
        );

        return twin;
    }


    // =====================================================
    // BUILD DIGITAL TWIN
    // =====================================================

    @PostMapping("/{patientId}/build")
    public Map<String, Object> buildTwin(
            @PathVariable String patientId) {

        return createOrRefreshTwin(patientId);
    }


    // =====================================================
    // GET DIGITAL TWIN
    // =====================================================

    @GetMapping("/{patientId}")
    public Map<String, Object> getTwin(
            @PathVariable String patientId) {

        Document twin =
                mongoTemplate.findById(
                        "TWIN-" + patientId,
                        Document.class,
                        "digital_health_twins"
                );

        /*
         * If Digital Twin does not exist,
         * create it automatically.
         */

        if (twin == null) {
            return createOrRefreshTwin(patientId);
        }

        twin.remove("_id");

        return twin;
    }


    // =====================================================
    // DIGITAL TWIN SUMMARY
    // =====================================================

    @GetMapping("/{patientId}/summary")
    public Map<String, Object> twinSummary(
            @PathVariable String patientId) {

        Document twin =
                mongoTemplate.findById(
                        "TWIN-" + patientId,
                        Document.class,
                        "digital_health_twins"
                );

        if (twin == null) {
            return createOrRefreshTwin(patientId)
                    .entrySet()
                    .stream()
                    .collect(
                            LinkedHashMap::new,
                            (map, entry) ->
                                    map.put(
                                            entry.getKey(),
                                            entry.getValue()
                                    ),
                            Map::putAll
                    );
        }

        Object summary =
                twin.get("summary");

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "patientId",
                patientId
        );

        result.put(
                "twinId",
                "TWIN-" + patientId
        );

        result.put(
                "status",
                twin.getOrDefault(
                        "status",
                        "ACTIVE"
                )
        );

        result.put(
                "fhirIntegrated",
                twin.getOrDefault(
                        "fhirIntegrated",
                        false
                )
        );

        result.put(
                "summary",
                summary == null
                        ? Map.of()
                        : summary
        );

        return result;
    }
}