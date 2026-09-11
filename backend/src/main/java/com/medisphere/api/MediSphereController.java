package com.medisphere.api;

import com.medisphere.model.Models.*;
import com.medisphere.model.RiskModels.RiskAssessment;
import com.medisphere.ai.AiRiskService;
import com.medisphere.repo.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api")
public class MediSphereController {
    private final PatientRepo patients; private final VitalRepo vitals; private final LabRepo labs;
    private final AppointmentRepo appointments; private final ConsentRepo consents; private final AlertRepo alerts;
    private final CarePlanRepo carePlans; private final MedicineRepo medicines; private final UserRepo users; private final AuditRepo audit;
    private final KafkaTemplate<String,Object> kafka; private final String topic; private final AiRiskService aiRisk;

    public MediSphereController(PatientRepo patients,VitalRepo vitals,LabRepo labs,AppointmentRepo appointments,
      ConsentRepo consents,AlertRepo alerts,CarePlanRepo carePlans,MedicineRepo medicines,UserRepo users,
      AuditRepo audit,KafkaTemplate<String,Object> kafka,@Value("${medisphere.kafka-topic}") String topic, AiRiskService aiRisk){
      this.patients=patients;this.vitals=vitals;this.labs=labs;this.appointments=appointments;this.consents=consents;
      this.alerts=alerts;this.carePlans=carePlans;this.medicines=medicines;this.users=users;this.audit=audit;this.kafka=kafka;this.topic=topic;this.aiRisk=aiRisk;
    }

    @GetMapping("/dashboard")
    public Map<String,Object> dashboard(){
      return Map.of("patients",patients.count(),"appointments",appointments.count(),
                    "activeAlerts",alerts.findByAcknowledgedFalseOrderByCreatedAtDesc().size(),
                    "medicines",medicines.count());
    }

    @GetMapping("/patients") public List<Patient> patients(){return patients.findAll();}
    @GetMapping("/patients/{id}") public Map<String,Object> patient360(@PathVariable String id){
      var p=patients.findById(id).orElseThrow();
      return Map.of("patient",p,"vitals",vitals.findTop20ByPatientIdOrderByRecordedAtDesc(id),
        "labs",labs.findByPatientIdOrderByCollectedAtDesc(id),"appointments",appointments.findByPatientIdOrderByDateAscTimeAsc(id),
        "alerts",alerts.findByPatientIdOrderByCreatedAtDesc(id),"carePlans",carePlans.findByPatientIdOrderByFollowUpDateAsc(id),
        "consent",consents.findByPatientId(id).orElseGet(()->new Consent()));
    }
    @PostMapping("/patients") public Patient createPatient(@RequestBody Patient p){p.id=null;return patients.save(p);}
    @PutMapping("/patients/{id}") public Patient updatePatient(@PathVariable String id,@RequestBody Patient p){p.id=id;return patients.save(p);}

    @GetMapping("/vitals/{patientId}") public List<Vital> getVitals(@PathVariable String patientId){return vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId);}
    @PostMapping("/vitals") public Vital ingestVital(@RequestBody Vital v){
      v.id=null;v.recordedAt=Instant.now();vitals.save(v);
      try{kafka.send(topic,v.patientId,v);}catch(Exception ignored){}
      if(v.heartRate!=null && (v.heartRate>120 || v.heartRate<45)) {
        Alert a=new Alert();a.patientId=v.patientId;a.severity="HIGH";a.type="HEART_RATE";a.message="Abnormal heart rate: "+v.heartRate+" bpm";alerts.save(a);
      }
      if(v.oxygen!=null && v.oxygen<92) {
        Alert a=new Alert();a.patientId=v.patientId;a.severity="CRITICAL";a.type="OXYGEN";a.message="Low oxygen saturation: "+v.oxygen+"%";alerts.save(a);
      }
      return v;
    }

    @GetMapping("/labs/{patientId}") public List<Lab> labs(@PathVariable String patientId){return labs.findByPatientIdOrderByCollectedAtDesc(patientId);}
    @PostMapping("/labs") public Lab createLab(@RequestBody Lab l){l.id=null;return labs.save(l);}

    @GetMapping("/appointments") public List<Appointment> appointments(){return appointments.findAll();}
    @PostMapping("/appointments") public Appointment createAppointment(@RequestBody Appointment a){a.id=null;return appointments.save(a);}
    @PutMapping("/appointments/{id}") public Appointment updateAppointment(@PathVariable String id,@RequestBody Appointment a){a.id=id;return appointments.save(a);}

    @GetMapping("/alerts") public List<Alert> alerts(){return alerts.findByAcknowledgedFalseOrderByCreatedAtDesc();}
    @PutMapping("/alerts/{id}/acknowledge") public Alert acknowledge(@PathVariable String id){
      var a=alerts.findById(id).orElseThrow();a.acknowledged=true;return alerts.save(a);
    }

    @GetMapping("/consents/{patientId}") public Consent consent(@PathVariable String patientId){return consents.findByPatientId(patientId).orElseGet(()->{var c=new Consent();c.patientId=patientId;return c;});}
    @PutMapping("/consents/{patientId}") public Consent updateConsent(@PathVariable String patientId,@RequestBody Consent c){c.id=consents.findByPatientId(patientId).map(x->x.id).orElse(null);c.patientId=patientId;c.updatedAt=Instant.now();return consents.save(c);}

    @GetMapping("/care-plans/{patientId}") public List<CarePlan> carePlans(@PathVariable String patientId){return carePlans.findByPatientIdOrderByFollowUpDateAsc(patientId);}
    @PostMapping("/care-plans") public CarePlan createCarePlan(@RequestBody CarePlan c){c.id=null;return carePlans.save(c);}

    @GetMapping("/medicines") public List<Medicine> medicines(){return medicines.findAll();}
    @PostMapping("/medicines") @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')") public Medicine createMedicine(@RequestBody Medicine m){m.id=null;return medicines.save(m);}
    @PutMapping("/medicines/{id}") @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')") public Medicine updateMedicine(@PathVariable String id,@RequestBody Medicine m){m.id=id;return medicines.save(m);}

    @GetMapping("/users") @PreAuthorize("hasRole('ADMIN')") public List<User> users(){return users.findAll().stream().peek(u->u.password=null).toList();}

    @PostMapping("/ai/risk/{patientId}")
    public RiskAssessment risk(@PathVariable String patientId){ return aiRisk.assess(patientId); }

    @GetMapping("/ai/risk/{patientId}/history")
    public List<RiskAssessment> riskHistory(@PathVariable String patientId){ return aiRisk.history(patientId); }

    @GetMapping("/ai/federated-demo")
    public Map<String,Object> federatedDemo(){ return aiRisk.federatedDemo(); }

    @GetMapping("/smart/authorize") public Map<String,Object> smartAuthorize(@RequestParam String client_id,@RequestParam String redirect_uri){
      return Map.of("client_id",client_id,"redirect_uri",redirect_uri,"scope","patient/*.read openid fhirUser",
        "status","CONSENT_REQUIRED","message","Demo SMART on FHIR authorization handshake.");
    }

    @GetMapping("/health/summary/{patientId}") public Map<String,Object> healthSummary(@PathVariable String patientId){
      var vs=vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId);
      return Map.of("patientId",patientId,"latestVital",vs.isEmpty()?Map.of():vs.get(0),
        "alerts",alerts.findByPatientIdOrderByCreatedAtDesc(patientId).size(),
        "labs",labs.findByPatientIdOrderByCollectedAtDesc(patientId).size());
    }
}
