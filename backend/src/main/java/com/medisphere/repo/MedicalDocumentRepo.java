package com.medisphere.repo;

import com.medisphere.model.Models.MedicalDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MedicalDocumentRepo extends MongoRepository<MedicalDocument, String> {
    List<MedicalDocument> findByPatientIdOrderByUploadedAtDesc(String patientId);
}
