package com.medisphere.repo;

import com.medisphere.model.Models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepo extends MongoRepository<Notification, String> {
    List<Notification> findTop50ByOrderByCreatedAtDesc();
    List<Notification> findByPatientIdOrderByCreatedAtDesc(String patientId);
}
