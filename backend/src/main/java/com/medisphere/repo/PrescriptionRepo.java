package com.medisphere.repo;

import com.medisphere.model.Models.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PrescriptionRepo extends MongoRepository<Prescription, String> {
    List<Prescription> findByPatientIdOrderByCreatedAtDesc(String patientId);
}
