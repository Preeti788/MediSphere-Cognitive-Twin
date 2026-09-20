package com.medisphere.repo;

import com.medisphere.model.Models.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppointmentRepo extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientIdOrderByDateAscTimeAsc(String patientId);
}