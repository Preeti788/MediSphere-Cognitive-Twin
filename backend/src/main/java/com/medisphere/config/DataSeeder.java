package com.medisphere.config;

import com.medisphere.model.Models.*;
import com.medisphere.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Configuration
public class DataSeeder {
  @Bean CommandLineRunner seed(UserRepo users, PatientRepo patients, VitalRepo vitals, MedicineRepo medicines,
      ConsentRepo consents, PasswordEncoder encoder) {
    return args -> {
      if(users.count()==0){
        users.saveAll(List.of(
          user("System Admin","admin@medisphere.local","ADMIN","Admin@123",encoder),
          user("Dr. Arjun Sharma","doctor@medisphere.local","DOCTOR","Doctor@123",encoder),
          user("Priya Nurse","nurse@medisphere.local","NURSE","Nurse@123",encoder),
          user("Rahul Reception","reception@medisphere.local","RECEPTIONIST","Reception@123",encoder),
          user("Neha Pharmacist","pharmacist@medisphere.local","PHARMACIST","Pharmacy@123",encoder),
          user("Rahul Kumar","patient@medisphere.local","PATIENT","Patient@123",encoder)
        ));
      }
      if(patients.count()==0){
        Patient p=new Patient();p.mrn="MS-10001";p.name="Rahul Kumar";p.gender="Male";p.dateOfBirth="1998-04-12";
        p.phone="+91 98765 43210";p.email="patient@medisphere.local";p.bloodGroup="O+";
        p.conditions=List.of("Hypertension");p.allergies=List.of("Penicillin");patients.save(p);
        Vital v=new Vital();v.patientId=p.id;v.heartRate=85.0;v.systolic=120.0;v.diastolic=80.0;v.oxygen=98.0;v.temperature=36.8;v.glucose=104.0;v.source="WEARABLE";vitals.save(v);
        Consent c=new Consent();c.patientId=p.id;c.dataSharing=true;c.wearableAccess=true;c.aiProcessing=true;c.fhirExchange=true;consents.save(c);
      }
      if(medicines.count()==0){
        medicines.saveAll(List.of(med("Amlodipine","5 mg",120,12.5,"Cardiology"),
          med("Metformin","500 mg",90,8.0,"Diabetes"),med("Salbutamol","100 mcg",45,65.0,"Respiratory")));
      }
    };
  }
  private User user(String n,String e,String r,String p,PasswordEncoder enc){var u=new User();u.name=n;u.email=e;u.role=r;u.password=enc.encode(p);return u;}
  private Medicine med(String n,String s,int stock,double price,String cat){var m=new Medicine();m.name=n;m.strength=s;m.stock=stock;m.price=price;m.category=cat;return m;}
}
