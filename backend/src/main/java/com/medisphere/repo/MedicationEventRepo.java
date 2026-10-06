package com.medisphere.repo;

import com.medisphere.model.Models.MedicationEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MedicationEventRepo extends MongoRepository<MedicationEvent, String> {
    List<MedicationEvent> findByPatientIdOrderByRecordedAtDesc(String patientId);
}
