package com.medisphere.repo;

import com.medisphere.model.Models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.*;

public final class Repositories {
    private Repositories() {}

    public interface UserRepo extends MongoRepository<User,String> {
        Optional<User> findByEmail(String email);
    }
    public interface PatientRepo extends MongoRepository<Patient,String> {
        List<Patient> findByNameContainingIgnoreCase(String name);
    }
    public interface VitalRepo extends MongoRepository<Vital,String> {
        List<Vital> findTop20ByPatientIdOrderByRecordedAtDesc(String patientId);
    }
    public interface LabRepo extends MongoRepository<Lab,String> {
        List<Lab> findByPatientIdOrderByCollectedAtDesc(String patientId);
    }
    public interface AppointmentRepo extends MongoRepository<Appointment,String> {
        List<Appointment> findByPatientIdOrderByDateAscTimeAsc(String patientId);
    }
    public interface ConsentRepo extends MongoRepository<Consent,String> {
        Optional<Consent> findByPatientId(String patientId);
    }
    public interface AlertRepo extends MongoRepository<Alert,String> {
        List<Alert> findByPatientIdOrderByCreatedAtDesc(String patientId);
        List<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc();
    }
    public interface CarePlanRepo extends MongoRepository<CarePlan,String> {
        List<CarePlan> findByPatientIdOrderByFollowUpDateAsc(String patientId);
    }
    public interface MedicineRepo extends MongoRepository<Medicine,String> {}
    public interface AuditRepo extends MongoRepository<AuditLog,String> {}
}
