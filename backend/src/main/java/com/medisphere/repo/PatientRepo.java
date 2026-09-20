package com.medisphere.repo;

import com.medisphere.model.Models.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PatientRepo extends MongoRepository<Patient, String> {

    List<Patient> findByNameContainingIgnoreCase(String name);
}