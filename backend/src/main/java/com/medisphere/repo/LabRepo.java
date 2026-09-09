package com.medisphere.repo;

import com.medisphere.model.Models.Lab;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface LabRepo extends MongoRepository<Lab, String> {

    List<Lab> findByPatientIdOrderByCollectedAtDesc(String patientId);
}