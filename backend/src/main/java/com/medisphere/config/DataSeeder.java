package com.medisphere.config;

import com.medisphere.model.Models.*;
import com.medisphere.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(
            UserRepo users, PatientRepo patients, VitalRepo vitals, MedicineRepo medicines, ConsentRepo consents,
            AppointmentRepo appointments, AlertRepo alerts, CarePlanRepo carePlans, LabRepo labs,
            PasswordEncoder encoder) {

        return args -> {
            seedUsers(users, encoder);
            seedPatients(patients);
            seedVitals(vitals);
            seedLabs(labs);
            seedAppointments(appointments);
            seedAlerts(alerts);
            seedCarePlans(carePlans);
            seedConsents(consents);
            seedMedicines(medicines);
        };
    }

    private void seedUsers(UserRepo users, PasswordEncoder encoder) {
        ensureUser(users, encoder, "Dr. Aarav Mehta", "aarav.mehta", "aarav@medisphere.local", "DOCTOR", "Aarav@2026");
        ensureUser(users, encoder, "Sia Verma", "siya", "siya@medisphere.local", "RECEPTIONIST", "Siya@2026");
        ensureUser(users, encoder, "Neha Nurse", "neha.nurse", "nurse@medisphere.local", "NURSE", "Nurse@2026");
        ensureUser(users, encoder, "MediSphere Admin", "clinic.admin", "admin@medisphere.local", "ADMIN", "Clinic@2026");
    }

    private void ensureUser(UserRepo users, PasswordEncoder encoder, String name, String username, String email, String role, String password) {
        User u = users.findByEmail(email).orElseGet(User::new);
        u.name=name; u.username=username; u.email=email; u.role=role; u.password=encoder.encode(password); u.active=true;
        users.save(u);
    }

    private void seedPatients(PatientRepo patients) {
        ensurePatient(patients, patient("P1002", "MS-10002", "Ananya Verma", "Female", "1987-04-14", "9876543210", "ananya@example.com", "A+", "Type 2 Diabetes", "Penicillin"));
        ensurePatient(patients, patient("P1003", "MS-10003", "Vikram Singh", "Male", "1979-11-02", "9876501234", "vikram@example.com", "B+", "Hypertension, Type 2 Diabetes", "None"));
        ensurePatient(patients, patient("P1001", "MS-10001", "Rahul Kumar", "Male", "1995-08-21", "9876512345", "rahul@example.com", "O+", "Routine wellness", "None"));
    }

    private void ensurePatient(PatientRepo patients, Patient incoming) {
        Patient existing = patients.findById(incoming.id).orElseGet(() -> patients.findByNameContainingIgnoreCase(incoming.name).stream().findFirst().orElse(new Patient()));
        existing.id = incoming.id; existing.mrn=incoming.mrn; existing.name=incoming.name; existing.gender=incoming.gender; existing.dateOfBirth=incoming.dateOfBirth;
        existing.phone=incoming.phone; existing.email=incoming.email; existing.bloodGroup=incoming.bloodGroup; existing.address=incoming.address;
        existing.emergencyContact=incoming.emergencyContact; existing.allergies=incoming.allergies; existing.conditions=incoming.conditions;
        patients.save(existing);
    }

    private Patient patient(String id, String mrn, String name, String gender, String dob, String phone, String email, String blood, String condition, String allergy) {
        Patient p = new Patient();
        p.id=id; p.mrn=mrn; p.name=name; p.gender=gender; p.dateOfBirth=dob; p.phone=phone; p.email=email; p.bloodGroup=blood;
        p.conditions = new ArrayList<>(Arrays.asList(condition.split(", ")));
        p.allergies = new ArrayList<>(List.of(allergy));
        p.address = "MediSphere Demo Residence";
        p.emergencyContact = "+91 90000 12345";
        return p;
    }

    private void seedVitals(VitalRepo vitals) {
        if (vitals.count() != 0) return;
        List<Vital> all = new ArrayList<>();
        seedSeries(all, "P1002", new double[]{145,182,105,88,285,36.9}, true);
        seedSeries(all, "P1003", new double[]{118,158,96,94,218,37.1}, false);
        seedSeries(all, "P1001", new double[]{78,122,80,98,108,36.7}, false);
        vitals.saveAll(all);
    }

    private void seedSeries(List<Vital> target, String patientId, double[] latest, boolean high) {
        Random r = new Random(patientId.hashCode());
        for (int i=19;i>=0;i--) {
            Vital v = new Vital();
            v.patientId=patientId;
            double phase=i/3.0;
            v.heartRate = Math.max(55, latest[0] + (r.nextDouble()-0.5)*(high && i<3 ? 14 : 8) - (i>3? (high? 10: 2):0));
            v.systolic = Math.max(95, latest[1] + (r.nextDouble()-0.5)*10 - (i>3? (high? 10:2):0));
            v.diastolic = Math.max(60, latest[2] + (r.nextDouble()-0.5)*8 - (i>3? (high? 5:1):0));
            v.oxygen = Math.min(99, Math.max(88, latest[3] + (r.nextDouble()-0.5)*2 + (high && i<2 ? -1 : 0)));
            v.glucose = Math.max(70, latest[4] + (r.nextDouble()-0.5)*(high?28:16) - (i>4 && high ? 12:0));
            v.temperature = Math.max(36.2, Math.min(39.5, latest[5] + (r.nextDouble()-0.5)*0.4));
            if (i==0) { v.heartRate=latest[0]; v.systolic=latest[1]; v.diastolic=latest[2]; v.oxygen=latest[3]; v.glucose=latest[4]; v.temperature=latest[5]; }
            v.source="WEARABLE-SIMULATOR";
            v.recordedAt=Instant.now().minus(i*10L, ChronoUnit.MINUTES);
            target.add(v);
        }
    }

    private void seedLabs(LabRepo labs) {
        if (labs.count()!=0) return;
        Lab a=new Lab(); a.id="L1002"; a.patientId="P1002"; a.testName="HbA1c"; a.result="8.9"; a.unit="%"; a.referenceRange="< 5.7";
        Lab b=new Lab(); b.id="L1003"; b.patientId="P1003"; b.testName="Fasting Glucose"; b.result="186"; b.unit="mg/dL"; b.referenceRange="70–99";
        Lab c=new Lab(); c.id="L1001"; c.patientId="P1001"; c.testName="HbA1c"; c.result="5.4"; c.unit="%"; c.referenceRange="< 5.7";
        labs.saveAll(List.of(a,b,c));
    }

    private void seedAppointments(AppointmentRepo appointments) {
        if (appointments.count()!=0) return;
        String d=java.time.LocalDate.now().toString();
        Appointment a=appt("P1001","Rahul Kumar","Dr. Arjun Sharma","General Medicine",d,"10:30","IN_PROGRESS","General Checkup");
        Appointment b=appt("P1002","Ananya Verma","Dr. Nikhil Sethi","Endocrinology",d,"11:00","SCHEDULED","Diabetes Follow-up");
        Appointment c=appt("P1003","Vikram Singh","Dr. Aarav Mehta","Cardiology",d,"12:00","SCHEDULED","Blood Pressure Review");
        appointments.saveAll(List.of(a,b,c));
    }

    private Appointment appt(String pid,String pn,String doc,String spec,String date,String time,String status,String reason){
        Appointment a=new Appointment(); a.patientId=pid;a.patientName=pn;a.doctorName=doc;a.specialty=spec;a.date=date;a.time=time;a.status=status;a.reason=reason;return a;
    }

    private void seedAlerts(AlertRepo alerts) {
        if (alerts.count()!=0) return;
        Alert a = alert("P1002","CRITICAL","M3_HEART_RATE","Heart rate is 145.0 bpm", false);
        Alert b = alert("P1002","WARNING","M3_OXYGEN","SpO₂ is 88.0%", false);
        Alert c = alert("P1003","WARNING","M3_BLOOD_PRESSURE","Systolic blood pressure is 158.0 mmHg", false);
        alerts.saveAll(List.of(a,b,c));
    }

    private Alert alert(String pid,String sev,String type,String message,boolean ack){
        Alert a=new Alert();a.patientId=pid;a.severity=sev;a.type=type;a.message=message;a.acknowledged=ack;a.createdAt=Instant.now().minus(35,ChronoUnit.MINUTES);return a;
    }

    private void seedCarePlans(CarePlanRepo carePlans) {
        if (carePlans.count()!=0) return;
        CarePlan cp=new CarePlan();
        cp.id="CP1002"; cp.patientId="P1002"; cp.title="Diabetes Management Plan";
        cp.goal="Improve day-to-day glucose control through consistent monitoring and follow-up.";
        cp.status="ACTIVE"; cp.category="DIABETES"; cp.priority="HIGH"; cp.adherence=83; cp.progress=83;
        cp.followUpDate=java.time.LocalDate.now().plusDays(28).toString(); cp.generatedBy="CARE TEAM";
        cp.actions=new ArrayList<>(List.of(
                "DONE::Take prescribed medicines as scheduled",
                "DONE::Check blood pressure regularly and record readings",
                "Check glucose as advised and record readings",
                "DONE::Maintain regular physical activity as advised",
                "DONE::Follow a balanced meal plan and healthy routine",
                "DONE::Attend the scheduled follow-up appointment"
        ));
        carePlans.save(cp);
    }

    private void seedConsents(ConsentRepo consents) {
        if (consents.count()!=0) return;
        Consent c=new Consent(); c.id="C1002";c.patientId="P1002";c.dataSharing=true;c.wearableAccess=true;c.aiProcessing=true;c.fhirExchange=true;consents.save(c);
    }

    private void seedMedicines(MedicineRepo medicines) {
        if (medicines.count()!=0) return;
        medicines.saveAll(List.of(
                med("Amlodipine","5 mg",120,12.5,"Cardiology"),
                med("Metformin","500 mg",90,8.0,"Diabetes"),
                med("Atorvastatin","20 mg",18,15.0,"Cardiology"),
                med("Glucose Test Strips","50 strips",12,19.0,"Diabetes")
        ));
    }

    private User user(String name,String username,String email,String role,String password,PasswordEncoder encoder){
        User u=new User();u.name=name;u.username=username;u.email=email;u.role=role;u.password=encoder.encode(password);u.active=true;return u;
    }

    private Medicine med(String name,String strength,int stock,double price,String category){
        Medicine m=new Medicine();m.name=name;m.strength=strength;m.stock=stock;m.price=price;m.category=category;m.batchNumber="MS-"+Math.abs(name.hashCode());m.expiryDate="2027-12-31";m.supplier="MediSphere Central Pharmacy";m.reorderLevel=20;return m;
    }
}
