package com.medisphere.ai;

import com.medisphere.model.Models.*;
import com.medisphere.model.RiskModels.*;
import com.medisphere.repo.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AiRiskService {
    private final VitalRepo vitals; private final PatientRepo patients; private final RiskAssessmentRepo history;
    public AiRiskService(VitalRepo vitals, PatientRepo patients, RiskAssessmentRepo history){this.vitals=vitals;this.patients=patients;this.history=history;}
    public RiskAssessment assess(String patientId){
        Patient p=patients.findById(patientId).orElseThrow(); List<Vital> vs=vitals.findTop20ByPatientIdOrderByRecordedAtDesc(patientId); Vital v=vs.isEmpty()?new Vital():vs.get(0);
        RiskAssessment r=new RiskAssessment(); r.patientId=patientId; r.cardiovascularFactors=cv(v,p); r.diabetesFactors=diabetes(v,p);
        r.cardiovascularScore=score(r.cardiovascularFactors); r.diabetesScore=score(r.diabetesFactors); r.cardiovascularLevel=level(r.cardiovascularScore); r.diabetesLevel=level(r.diabetesScore); return history.save(r);
    }
    public List<RiskAssessment> history(String id){return history.findTop20ByPatientIdOrderByAssessedAtDesc(id);}
    public Map<String,Object> federatedDemo(){
        List<Map<String,Object>> h=List.of(update("Hospital A",.72,1200),update("Hospital B",.68,980),update("Hospital C",.75,1100));
        double avg=h.stream().mapToDouble(x->((Number)x.get("localModelWeight")).doubleValue()).average().orElse(0);
        return Map.of("status","FEDERATED_DEMO_READY","algorithm","FedAvg-style weighted aggregation","hospitals",h,"aggregatedModelWeight",Math.round(avg*1000.0)/1000.0,"privacy","Raw patient data stays at each hospital; only model updates are aggregated.");
    }
    private Map<String,Object> update(String name,double weight,int samples){return Map.of("hospital",name,"samples",samples,"localModelWeight",weight,"dataShared",false);}
    private List<FeatureContribution> cv(Vital v,Patient p){
        List<FeatureContribution> f=new ArrayList<>();
        if(v.systolic!=null) f.add(fc("Systolic blood pressure",v.systolic,"mmHg",contribution(v.systolic,120,180,35),v.systolic>130,"Higher systolic pressure contributes to cardiovascular risk."));
        if(v.heartRate!=null) f.add(fc("Heart rate",v.heartRate,"bpm",contribution(v.heartRate,70,120,25),Math.abs(v.heartRate-70)>20,"Heart rate is used as a current physiologic signal."));
        if(v.oxygen!=null) f.add(fc("Oxygen saturation",v.oxygen,"%",contribution(100-v.oxygen,0,10,15),v.oxygen<95,"Lower oxygen saturation increases the model contribution."));
        if(v.glucose!=null) f.add(fc("Glucose",v.glucose,"mg/dL",contribution(v.glucose,100,200,15),v.glucose>140,"Elevated glucose is a metabolic risk signal."));
        if(p.conditions!=null&&p.conditions.stream().anyMatch(x->x.toLowerCase().contains("hypertension"))) f.add(fc("Hypertension history",1.0,"condition",10,true,"Recorded hypertension history increases baseline cardiovascular contribution."));
        return f;
    }
    private List<FeatureContribution> diabetes(Vital v,Patient p){
        List<FeatureContribution> f=new ArrayList<>();
        if(v.glucose!=null) f.add(fc("Blood glucose",v.glucose,"mg/dL",contribution(v.glucose,100,220,45),v.glucose>140,"Higher glucose contributes more strongly to diabetes complication risk."));
        if(v.systolic!=null) f.add(fc("Systolic blood pressure",v.systolic,"mmHg",contribution(v.systolic,120,180,20),v.systolic>130,"Blood pressure is included as a comorbidity signal."));
        if(v.heartRate!=null) f.add(fc("Heart rate",v.heartRate,"bpm",contribution(v.heartRate,70,120,10),Math.abs(v.heartRate-70)>20,"Current heart rate contributes a physiologic signal."));
        if(p.conditions!=null&&p.conditions.stream().anyMatch(x->x.toLowerCase().contains("diabet"))) f.add(fc("Diabetes history",1.0,"condition",30,true,"Recorded diabetes history increases baseline complication risk."));
        return f;
    }

    private FeatureContribution fc(String name,double value,String unit,double c,boolean inc,String exp){return new FeatureContribution(name,value,unit,c,inc?"INCREASES_RISK":"LOWERS_RISK",exp);}
    private double contribution(double value,double low,double high,double max){double n=Math.max(0,Math.min(1,(value-low)/Math.max(1,high-low)));return Math.round(n*max*10.0)/10.0;}
    private double score(List<FeatureContribution> f){return Math.min(100,Math.round(f.stream().mapToDouble(x->x.contribution==null?0:x.contribution).sum()*10.0)/10.0);}
    private String level(double s){return s>=60?"HIGH":s>=30?"MODERATE":"LOW";}
}
