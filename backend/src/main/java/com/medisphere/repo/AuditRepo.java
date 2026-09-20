package com.medisphere.repo;

import com.medisphere.model.Models.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuditRepo extends MongoRepository<AuditLog, String> {
}