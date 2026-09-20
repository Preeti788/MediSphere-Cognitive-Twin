package com.medisphere.repo;

import com.medisphere.model.Models.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AlertRepo extends MongoRepository<Alert, String> {

    List<Alert> findByPatientIdOrderByCreatedAtDesc(String patientId);

    List<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc();
}