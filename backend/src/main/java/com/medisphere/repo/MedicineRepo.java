package com.medisphere.repo;

import com.medisphere.model.Models.Medicine;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MedicineRepo extends MongoRepository<Medicine, String> {
}