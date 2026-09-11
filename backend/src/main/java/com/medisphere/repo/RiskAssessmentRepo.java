package com.medisphere.repo;

import com.medisphere.model.RiskModels.RiskAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.*;

public interface RiskAssessmentRepo extends MongoRepository<RiskAssessment, String> {
    List<RiskAssessment> findTop20ByPatientIdOrderByAssessedAtDesc(String patientId);
}
