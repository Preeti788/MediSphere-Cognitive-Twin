package com.medisphere.repo;

import com.medisphere.model.Models.Vital;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VitalRepo extends MongoRepository<Vital, String> {

    List<Vital> findTop20ByPatientIdOrderByRecordedAtDesc(String patientId);
}
