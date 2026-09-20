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
        Patient rahul=new Patient();rahul.mrn="MS-10001";rahul.name="Rahul Kumar";rahul.gender="Male";rahul.dateOfBirth="1998-04-12";
        rahul.phone="+91 98765 43210";rahul.email="patient@medisphere.local";rahul.bloodGroup="O+";
        rahul.conditions=List.of("Hypertension");rahul.allergies=List.of("Penicillin");patients.save(rahul);
        saveVital(vitals,rahul.id,85,120,80,98,36.8,104,"WEARABLE");

        Patient ananya=new Patient();ananya.mrn="MS-10002";ananya.name="Ananya Verma";ananya.gender="Female";ananya.dateOfBirth="1995-09-21";
        ananya.phone="+91 98765 43211";ananya.email="ananya@medisphere.local";ananya.bloodGroup="A+";
        ananya.conditions=List.of("Type 2 Diabetes");ananya.allergies=List.of();patients.save(ananya);
        saveVital(vitals,ananya.id,92,145,92,98,37.0,190,"CLINIC");

        Patient vikram=new Patient();vikram.mrn="MS-10003";vikram.name="Vikram Singh";vikram.gender="Male";vikram.dateOfBirth="1989-02-16";
        vikram.phone="+91 98765 43212";vikram.email="vikram@medisphere.local";vikram.bloodGroup="B+";
        vikram.conditions=List.of("Hypertension","Type 2 Diabetes");vikram.allergies=List.of("Sulfa drugs");patients.save(vikram);
        saveVital(vitals,vikram.id,105,170,105,94,37.4,280,"REMOTE_MONITOR");

        Consent c1=new Consent();c1.patientId=rahul.id;c1.dataSharing=true;c1.wearableAccess=true;c1.aiProcessing=true;c1.fhirExchange=true;consents.save(c1);
        Consent c2=new Consent();c2.patientId=ananya.id;c2.dataSharing=true;c2.wearableAccess=true;c2.aiProcessing=true;c2.fhirExchange=true;consents.save(c2);
        Consent c3=new Consent();c3.patientId=vikram.id;c3.dataSharing=true;c3.wearableAccess=true;c3.aiProcessing=true;c3.fhirExchange=true;consents.save(c3);
      }
      if(medicines.count()==0){
        medicines.saveAll(List.of(med("Amlodipine","5 mg",120,12.5,"Cardiology"),
          med("Metformin","500 mg",90,8.0,"Diabetes"),med("Salbutamol","100 mcg",45,65.0,"Respiratory")));
      }
    };
  }
  private void saveVital(VitalRepo vitals,String patientId,double hr,double sys,double dia,double oxy,double temp,double glucose,String source){
    Vital v=new Vital();v.patientId=patientId;v.heartRate=hr;v.systolic=sys;v.diastolic=dia;v.oxygen=oxy;v.temperature=temp;v.glucose=glucose;v.source=source;vitals.save(v);
  }
  private User user(String n,String e,String r,String p,PasswordEncoder enc){var u=new User();u.name=n;u.email=e;u.role=r;u.password=enc.encode(p);return u;}
  private Medicine med(String n,String s,int stock,double price,String cat){var m=new Medicine();m.name=n;m.strength=s;m.stock=stock;m.price=price;m.category=cat;return m;}
}
