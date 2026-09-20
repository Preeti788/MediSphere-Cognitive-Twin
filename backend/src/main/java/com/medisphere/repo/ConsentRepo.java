package com.medisphere.repo;

import com.medisphere.model.Models.Consent;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ConsentRepo extends MongoRepository<Consent, String> {

    Optional<Consent> findByPatientId(String patientId);
}