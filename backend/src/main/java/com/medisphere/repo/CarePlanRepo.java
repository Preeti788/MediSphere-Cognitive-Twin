package com.medisphere.repo;

import com.medisphere.model.Models.CarePlan;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CarePlanRepo extends MongoRepository<CarePlan, String> {

    List<CarePlan> findByPatientIdOrderByFollowUpDateAsc(String patientId);
}