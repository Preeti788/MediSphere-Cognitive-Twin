package com.medisphere.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.*;

public final class Models {
    private Models() {}

    @Document("users")
    public static class User {
        @Id public String id;
        public String name;
        public String email;
        public String password;
        public String role;
        public boolean active = true;
    }

    @Document("patients")
    public static class Patient {
        @Id public String id;
        public String mrn;
        public String name;
        public String gender;
        public String dateOfBirth;
        public String phone;
        public String email;
        public String bloodGroup;
        public String address;
        public String emergencyContact;
        public List<String> allergies = new ArrayList<>();
        public List<String> conditions = new ArrayList<>();
        public Instant createdAt = Instant.now();
    }

    @Document("vitals")
    public static class Vital {
        @Id public String id;
        public String patientId;
        public Double heartRate;
        public Double systolic;
        public Double diastolic;
        public Double oxygen;
        public Double temperature;
        public Double glucose;
        public String source = "MANUAL";
        public Instant recordedAt = Instant.now();
    }

    @Document("labs")
    public static class Lab {
        @Id public String id;
        public String patientId;
        public String testName;
        public String result;
        public String unit;
        public String referenceRange;
        public Instant collectedAt = Instant.now();
    }

    @Document("appointments")
    public static class Appointment {
        @Id public String id;
        public String patientId;
        public String patientName;
        public String doctorName;
        public String specialty;
        public String date;
        public String time;
        public String status = "SCHEDULED";
        public String reason;
    }

    @Document("consents")
    public static class Consent {
        @Id public String id;
        public String patientId;
        public boolean dataSharing;
        public boolean wearableAccess;
        public boolean aiProcessing;
        public boolean fhirExchange;
        public Instant updatedAt = Instant.now();
    }

    @Document("alerts")
    public static class Alert {
        @Id public String id;
        public String patientId;
        public String severity;
        public String type;
        public String message;
        public String recipient;
        public String notificationStatus = "NOTIFICATION_QUEUED";
        public Double observedValue;
        public String unit;
        public String threshold;
        public boolean acknowledged;
        public Instant createdAt = Instant.now();
    }

    @Document("care_plans")
    public static class CarePlan {
        @Id public String id;
        public String patientId;
        public String title;
        public String goal;
        public String status = "ACTIVE";
        public List<String> actions = new ArrayList<>();
        public String followUpDate;
    }

    @Document("medicines")
    public static class Medicine {
        @Id public String id;
        public String name;
        public String strength;
        public int stock;
        public double price;
        public String category;
    }

    @Document("audit_logs")
    public static class AuditLog {
        @Id public String id;
        public String actor;
        public String action;
        public String resource;
        public Instant createdAt = Instant.now();
    }
}
