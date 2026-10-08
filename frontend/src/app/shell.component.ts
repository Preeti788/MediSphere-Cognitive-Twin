import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="app clinical-app">

  <div class="mobile-backdrop" *ngIf="sidebarOpen" (click)="closeSidebar()"></div>

  <aside class="clinical-sidebar" [class.mobile-open]="sidebarOpen">
    <div class="logo clinical-logo">
      <span class="logo-mark">✚</span>
      <div>
        <b>MediSphere</b>
        <small>Clinical Intelligence</small>
      </div>
    </div>

    <div class="sidebar-label">WORKSPACE</div>
    <button *ngFor="let x of nav" class="nav-item" [class.active]="tab===x.id" (click)="navigateTo(x.id)">
      <span class="nav-icon">{{x.icon}}</span>
      <span>{{x.label}}</span>
      <span class="nav-arrow" *ngIf="tab===x.id">›</span>
    </button>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="doctor-avatar-small">{{user?.name?.charAt(0) || 'D'}}</div>
        <div><b>{{user?.name || 'Clinical User'}}</b><small>{{user?.role || 'CARE TEAM'}}</small></div>
      </div>
      <button class="logout-btn" (click)="logout()">↪ <span>Logout</span></button>
    </div>
  </aside>

  <main class="clinical-main">
    <div class="clinical-topbar">
      <button type="button" class="mobile-menu-btn" (click)="toggleSidebar()" aria-label="Open navigation">☰</button>
      <div class="page-context">
        <span class="context-kicker">MEDISPHERE / {{title() | uppercase}}</span>
        <h1>{{title()}}</h1>
      </div>

      <div class="milestone-strip">
        <button [class.active]="tab==='patient360' || tab==='patients'" (click)="navigateTo('patient360')">M1 <span>Foundation</span></button>
        <button [class.active]="tab==='aiRisk'" (click)="navigateTo('aiRisk')">M2 <span>AI Risk</span></button>
        <button [class.active]="tab==='monitoring' || tab==='vitals'" (click)="navigateTo('monitoring')">M3 <span>Monitoring</span></button>
        <button [class.active]="tab==='careplans'" (click)="navigateTo('careplans')">M4 <span>Care Plan</span></button>
      </div>

      <div class="topbar-actions">
        <div class="global-search clinical-search">
          <span>⌕</span>
          <input [(ngModel)]="globalSearch" (keyup.enter)="runGlobalSearch()" placeholder="Search patient, MRN...">
          <button type="button" class="search-btn" (click)="runGlobalSearch()">Search</button>
        </div>
        <button type="button" class="top-icon-btn" title="Open clinical alerts" (click)="navigateTo('alerts')">◇<span class="alert-badge" *ngIf="dash.activeAlerts">{{dash.activeAlerts}}</span></button>
        <span class="system-state"><i></i> System online</span>
        <button type="button" class="refresh-btn" (click)="refresh()">↻ Refresh</button>
      </div>
    </div>

    <div class="patient-context-bar" *ngIf="selected?.patient">
      <div class="selected-patient-chip">
        <div class="avatar">{{(selected.patient.name || 'P').charAt(0)}}</div>
        <div><b>{{selected.patient.name}}</b><small>{{selected.patient.mrn}} · {{selected.patient.bloodGroup || 'Blood group —'}}</small></div>
      </div>
      <div class="context-actions">
        <button type="button" (click)="navigateTo('patient360')">Patient 360</button>
        <button type="button" (click)="addVital()">+ Record Vital</button>
        <button type="button" (click)="navigateTo('monitoring')">Live Monitoring</button>
      </div>
    </div>


    <!-- ================================================= -->
    <!-- DASHBOARD: OVERVIEW ONLY -->
    <!-- ================================================= -->

    <section *ngIf="tab==='dashboard'" class="content dashboard-overview-only">
      <div class="hero">
        <div>
          <span class="eyebrow">MEDISPHERE · CLINICAL WORKSPACE</span>
          <h2>Patient care, connected.</h2>
          <p>Use the dashboard for a quick overview. Open each milestone to view its own working module.</p>
        </div>
        <div class="hero-icon">♥</div>
      </div>

      <div class="cards dashboard-kpis">
        <div class="metric"><span>Patients</span><b>{{dash.patients}}</b><small>Registered records</small></div>
        <div class="metric"><span>Appointments</span><b>{{dash.appointments}}</b><small>Across care teams</small></div>
        <div class="metric warn"><span>Active alerts</span><b>{{dash.activeAlerts}}</b><small>Needs attention</small></div>
        <div class="metric"><span>Medicines</span><b>{{dash.medicines}}</b><small>Pharmacy inventory</small></div>
      </div>

      <div class="panel dashboard-purpose-card">
        <div class="panel-head">
          <div>
            <span class="card-kicker">MILESTONE WORKSPACE</span>
            <h3>Open the module you need</h3>
            <p>Each milestone has its own page. The dashboard does not contain the detailed M1, M2, M3 or M4 outputs.</p>
          </div>
        </div>
        <div class="dashboard-module-grid">
          <button type="button" class="dashboard-module-card" (click)="navigateTo('patient360')">
            <span class="module-badge m1">M1</span>
            <div><h3>Patient 360 & Digital Twin</h3><p>FHIR, patient profile, vitals, labs and consent.</p></div>
            <b>Open M1 →</b>
          </button>
          <button type="button" class="dashboard-module-card" (click)="navigateTo('aiRisk')">
            <span class="module-badge m2">M2</span>
            <div><h3>AI Risk Prediction</h3><p>Cardiovascular and diabetes risk with explanations.</p></div>
            <b>Open M2 →</b>
          </button>
          <button type="button" class="dashboard-module-card" (click)="navigateTo('monitoring')">
            <span class="module-badge m3">M3</span>
            <div><h3>Live Monitoring</h3><p>Vitals, trends, thresholds and clinical alerts.</p></div>
            <b>Open M3 →</b>
          </button>
          <button type="button" class="dashboard-module-card" (click)="navigateTo('careplans')">
            <span class="module-badge m4">M4</span>
            <div><h3>Care Plan & Treatment</h3><p>Personalized actions, adherence and progress.</p></div>
            <b>Open M4 →</b>
          </button>
        </div>
      </div>

      <div class="dashboard-two-col">
        <div class="panel">
          <div class="panel-head"><div><span class="card-kicker">TODAY</span><h3>Quick clinical summary</h3></div></div>
          <div class="dashboard-summary-list">
            <div><span>Patients requiring attention</span><b>{{dash.activeAlerts || 0}}</b></div>
            <div><span>Appointments scheduled</span><b>{{dash.appointments || 0}}</b></div>
            <div><span>Care plans available</span><b>{{dash.carePlans || 0}}</b></div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><span class="card-kicker">PATIENT CONTEXT</span><h3>Selected patient</h3></div></div>
          <div class="dashboard-selected-patient" *ngIf="selected?.patient; else noDashboardPatient">
            <div class="avatar">{{(selected.patient.name || 'P').charAt(0)}}</div>
            <div><b>{{selected.patient.name}}</b><small>{{selected.patient.mrn}} · {{selected.patient.gender || 'Gender —'}}</small></div>
            <button type="button" (click)="navigateTo('patient360')">Open Patient 360</button>
          </div>
          <ng-template #noDashboardPatient><div class="empty">Select a patient from Patients to start the milestone workflow.</div></ng-template>
        </div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- PATIENTS -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='patients'"
      class="content">

      <div class="toolbar">

        <input
          [(ngModel)]="search"
          placeholder="Search patients…">


        <button
          class="primary"
          (click)="newPatient()">

          + Add patient

        </button>

      </div>


      <div class="panel table">

        <table>

          <thead>

            <tr>

              <th>
                MRN
              </th>

              <th>
                Patient
              </th>

              <th>
                Condition
              </th>

              <th>
                Blood
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              *ngFor="let p of filteredPatients()">

              <td>
                {{p.mrn}}
              </td>


              <td>

                <b>
                  {{p.name}}
                </b>

                <small>
                  {{p.email}}
                </small>

              </td>


              <td>
                {{p.conditions?.join(', ') || '—'}}
              </td>


              <td>
                {{p.bloodGroup || '—'}}
              </td>


              <td class="patient-actions">

                <button
                  (click)="selectPatient(p)">

                  Patient 360

                </button>

                <button
                  class="danger-btn"
                  (click)="deletePatient(p)">

                  Delete

                </button>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>


    <!-- ================================================= -->
    <!-- PATIENT 360 -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='patient360'"
      class="content">


      <div
        *ngIf="!selected"
        class="empty">

        Select a patient from
        Patients → Patient 360.

      </div>


      <div
        *ngIf="selected as s">


        <!-- PATIENT PROFILE -->

        <div class="profile">

          <div class="avatar">

            {{s.patient?.name?.[0] || '?'}}

          </div>


          <div class="profile-info">

            <h2>
              {{s.patient?.name}}
            </h2>

            <p>

              {{s.patient?.mrn}}
              ·
              {{s.patient?.gender}}
              ·
              {{s.patient?.bloodGroup}}

            </p>

          </div>


          <button
            class="primary"
            (click)="buildTwin(s.patient.id)">

            Build / Refresh Digital Twin

          </button>


          <button
            (click)="runRisk(s.patient.id)">

            Run AI Risk

          </button>

        </div>


        <!-- BASIC VITAL CARDS -->

        <div class="cards">


          <div class="metric">

            <span>
              Heart Rate
            </span>

            <b>

              {{latest(s.vitals)?.heartRate || '—'}}

            </b>

            <small>
              bpm
            </small>

          </div>


          <div class="metric">

            <span>
              Blood Pressure
            </span>

            <b>

              {{latest(s.vitals)?.systolic || '—'}}
              /
              {{latest(s.vitals)?.diastolic || '—'}}

            </b>

            <small>
              mmHg
            </small>

          </div>


          <div class="metric">

            <span>
              Oxygen
            </span>

            <b>

              {{latest(s.vitals)?.oxygen || '—'}}

            </b>

            <small>
              % SpO₂
            </small>

          </div>


          <div class="metric">

            <span>
              Active Alerts
            </span>

            <b>
              {{s.alerts?.length || 0}}
            </b>

            <small>
              Patient history
            </small>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- DIGITAL HEALTH TWIN -->
        <!-- ================================================= -->

        <div
          *ngIf="twin"
          class="panel twin-panel">


          <div class="twin-header">

            <div>

              <h3>

                Digital Health Twin

                <span class="pill">

                  {{twin.status || 'ACTIVE'}}

                </span>

              </h3>


              <p class="twin-meta">

                Persisted in MongoDB
                ·
                Last updated

                {{twin.updatedAt | date:'medium'}}

              </p>

            </div>


            <span class="twin-badge">

              DIGITAL TWIN

            </span>

          </div>


          <!-- TWIN SUMMARY -->

          <div class="twin-grid">


            <div>

              <b>
                FHIR Integration
              </b>

              <span
                [class.success-text]="twin.fhirIntegrated">

                {{
                  twin.fhirIntegrated
                  ? 'Integrated'
                  : 'Not linked'
                }}

              </span>

            </div>


            <div>

              <b>
                Vitals
              </b>

              <span>

                {{twin.vitals?.length || 0}}
                records

              </span>

            </div>


            <div>

              <b>
                Labs
              </b>

              <span>

                {{twin.labs?.length || 0}}
                reports

              </span>

            </div>


            <div>

              <b>
                Alerts
              </b>

              <span>

                {{twin.alerts?.length || 0}}

              </span>

            </div>


            <div>

              <b>
                Appointments
              </b>

              <span>

                {{twin.appointments?.length || 0}}

              </span>

            </div>


            <div>

              <b>
                Care Plans
              </b>

              <span>

                {{twin.carePlans?.length || 0}}

              </span>

            </div>


            <div>

              <b>
                Consent
              </b>

              <span>

                {{
                  twin.consent
                  ? 'Available'
                  : 'Not available'
                }}

              </span>

            </div>

          </div>


          <!-- ================================================= -->
          <!-- FHIR PATIENT INFORMATION -->
          <!-- ================================================= -->

          <div
            *ngIf="twin.fhirPatient"
            class="fhir-preview">

            <h4>
              FHIR Patient Information
            </h4>


            <div class="fhir-info">


              <div>

                <b>
                  Resource Type
                </b>

                <span>
                  {{twin.fhirPatient.resourceType || 'Patient'}}
                </span>

              </div>


              <div>

                <b>
                  FHIR ID
                </b>

                <span>
                  {{twin.fhirPatient.id}}
                </span>

              </div>


              <div>

                <b>
                  Gender
                </b>

                <span>
                  {{twin.fhirPatient.gender || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Birth Date
                </b>

                <span>
                  {{twin.fhirPatient.birthDate || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Name
                </b>

                <span>
                  {{twin.fhirPatient.name?.[0]?.text || s.patient?.name || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Identifier
                </b>

                <span>

                  {{
                    twin.fhirPatient.identifier?.[0]?.value
                    || s.patient?.mrn
                    || '—'
                  }}

                </span>

              </div>


              <div>

                <b>
                  Phone
                </b>

                <span>

                  {{
                    twin.fhirPatient.telecom?.[0]?.value
                    || s.patient?.phone
                    || '—'
                  }}

                </span>

              </div>


              <div>

                <b>
                  Address
                </b>

                <span>

                  {{
                    twin.fhirPatient.address?.[0]?.text
                    || s.patient?.address
                    || '—'
                  }}

                </span>

              </div>


            </div>

          </div>


          <!-- ================================================= -->
          <!-- PATIENT COMPLETE INFORMATION -->
          <!-- ================================================= -->

          <div
            class="complete-info">

            <h4>
              Complete Patient Information
            </h4>


            <div class="info-grid">


              <div>

                <b>
                  Patient Name
                </b>

                <span>
                  {{s.patient?.name || '—'}}
                </span>

              </div>


              <div>

                <b>
                  MRN
                </b>

                <span>
                  {{s.patient?.mrn || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Gender
                </b>

                <span>
                  {{s.patient?.gender || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Date of Birth
                </b>

                <span>
                  {{s.patient?.dateOfBirth || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Phone
                </b>

                <span>
                  {{s.patient?.phone || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Email
                </b>

                <span>
                  {{s.patient?.email || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Blood Group
                </b>

                <span>
                  {{s.patient?.bloodGroup || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Address
                </b>

                <span>
                  {{s.patient?.address || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Emergency Contact
                </b>

                <span>
                  {{s.patient?.emergencyContact || '—'}}
                </span>

              </div>


              <div>

                <b>
                  Allergies
                </b>

                <span>
                  {{s.patient?.allergies?.join(', ') || 'None recorded'}}
                </span>

              </div>


              <div>

                <b>
                  Conditions
                </b>

                <span>
                  {{s.patient?.conditions?.join(', ') || 'None recorded'}}
                </span>

              </div>

            </div>

          </div>


        </div>


        <!-- ================================================= -->
        <!-- VITALS + CONSENT -->
        <!-- ================================================= -->

        <div class="grid2">


          <div class="panel">

            <h3>
              Vitals & Wearable Stream
            </h3>


            <button
              class="primary"
              (click)="addVital()">

              + Record wearable vital

            </button>


            <div class="mini-list">


              <div
                *ngFor="let v of s.vitals">

                <span>

                  {{v.recordedAt | date:'short'}}

                </span>

                <b>

                  {{v.heartRate || '—'}}
                  bpm
                  ·
                  {{v.oxygen || '—'}}%

                </b>

              </div>


              <div
                *ngIf="!s.vitals?.length">

                No vitals recorded.

              </div>

            </div>

          </div>


          <div class="panel">

            <h3>
              Consent Management
            </h3>


            <label
              *ngFor="let key of consentKeys">

              <input
                type="checkbox"
                [(ngModel)]="s.consent[key]">

              {{pretty(key)}}

            </label>


            <button
              class="primary"
              (click)="saveConsent(s.consent)">

              Save Consent

            </button>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- LABS + APPOINTMENTS -->
        <!-- ================================================= -->

        <div class="grid2">


          <div class="panel">

            <h3>
              Laboratory Reports
            </h3>


            <div
              *ngFor="let l of s.labs"
              class="row">

              <b>
                {{l.testName}}
              </b>

              <span>

                {{l.result}}
                {{l.unit}}

              </span>

            </div>


            <div
              *ngIf="!s.labs?.length"
              class="empty-small">

              No laboratory reports available.

            </div>

          </div>


          <div class="panel">

            <h3>
              Appointments
            </h3>


            <div
              *ngFor="let a of s.appointments"
              class="row">

              <b>

                {{a.date}}
                {{a.time}}

              </b>

              <span>

                {{a.doctorName}}
                ·
                {{a.status}}

              </span>

            </div>


            <div
              *ngIf="!s.appointments?.length"
              class="empty-small">

              No appointments available.

            </div>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- ALERTS + CARE PLANS -->
        <!-- ================================================= -->

        <div class="grid2">


          <div class="panel">

            <h3>
              Clinical Alerts
            </h3>


            <div
              *ngFor="let a of s.alerts"
              class="row">

              <b>

                {{a.severity}}
                ·
                {{a.type}}

              </b>

              <span>
                {{a.message}}
              </span>

            </div>


            <div
              *ngIf="!s.alerts?.length"
              class="empty-small">

              No clinical alerts.

            </div>

          </div>


          <div class="panel">

            <div class="panel-head">
              <div><h3>Care Plans</h3><p>M4 personalized treatment workflow</p></div>
              <button type="button" (click)="openCarePlansForSelected()">Open M4</button>
            </div>


            <div
              *ngFor="let c of s.carePlans"
              class="row">

              <b>
                {{c.title}}
              </b>

              <span>
                {{c.status}}
              </span>

            </div>


            <div
              *ngIf="!s.carePlans?.length"
              class="empty-small">

              No care plans available.

            </div>

          </div>

        </div>


        <!-- ================================================= -->
        <!-- AI RISK -->
        <!-- ================================================= -->

        <div
          *ngIf="risk"
          class="panel risk">

          <h3>
            AI Risk Explanation
          </h3>


          <b>

            {{risk.level}}
            ·
            {{risk.score}}/100

          </b>


          <p>

            {{risk.explanations?.join(' · ')
            || 'No major factors detected'}}

          </p>


          <small>

            {{risk.note}}

          </small>

        </div>


      </div>

    </section>


    <!-- ================================================= -->
    <!-- M2 AI RISK - SEPARATE MODULE -->
    <!-- ================================================= -->
    <section *ngIf="tab==='aiRisk'" class="content milestone-page m2-page">
      <div class="module-hero">
        <div><span class="eyebrow">M2 · WEEKS 3–4</span><h2>AI Risk Prediction</h2><p>Run cardiovascular and diabetes risk analysis for the selected patient.</p></div>
        <div class="module-status">● M2 READY</div>
      </div>
      <div class="module-toolbar">
        <div><span class="card-kicker">SELECT PATIENT</span><h3>{{selected?.patient?.name || 'Choose a patient'}}</h3><small>{{selected?.patient?.mrn || 'Select a patient to run the prediction'}}</small></div>
        <div class="module-controls">
          <select [ngModel]="selected?.patient?.id || ''" (ngModelChange)="selectModulePatient($event)"><option value="">Select patient</option><option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option></select>
          <button class="primary" [disabled]="!selected?.patient?.id" (click)="runRisk(selected.patient.id)">Run Prediction</button>
          <button type="button" (click)="refresh()">↻ Refresh</button>
        </div>
      </div>
      <div class="risk-empty" *ngIf="!risk"><div class="risk-empty-icon">✦</div><h3>No prediction yet</h3><p>Select a patient and click <b>Run Prediction</b> to generate the M2 result.</p></div>
      <div *ngIf="risk" class="risk-workspace">
        <div class="risk-score-grid">
          <div class="risk-score-card cardio"><span>Cardiovascular Risk</span><b>{{risk.cardiovascular?.score ?? '—'}}%</b><strong>{{risk.cardiovascular?.level ?? '—'}}</strong><small>{{risk.predictionHorizon || '12 months'}}</small></div>
          <div class="risk-score-card diabetes"><span>Diabetes Risk</span><b>{{risk.diabetes?.score ?? '—'}}%</b><strong>{{risk.diabetes?.level ?? '—'}}</strong><small>{{risk.predictionHorizon || '12 months'}}</small></div>
          <div class="risk-score-card privacy"><span>Federated Learning</span><b>{{risk.federatedLearning?.globalRiskSignal ?? '—'}}%</b><strong>{{risk.federatedLearning?.status || 'SIMULATED'}}</strong><small>Raw patient data stays local</small></div>
          <div class="risk-score-card quality"><span>Data Quality</span><b>{{risk.dataQuality?.confidence ?? '—'}}%</b><strong>{{risk.dataQuality?.level || 'LIMITED'}}</strong><small>Available features: {{risk.dataQuality?.availableFeatures ?? '—'}}</small></div>
        </div>
        <div class="risk-two-col">
          <div class="panel risk-panel"><div class="panel-head"><div><span class="card-kicker">EXPLAINABILITY</span><h3>Contributing factors</h3><p>Feature-level explanation for the prediction.</p></div></div><div class="factor-list"><div class="factor-row" *ngFor="let f of (risk.explanations || []).slice(0,8)"><div><b>{{f.feature}}</b><small>{{f.riskType || ''}} · {{f.direction || ''}}</small></div><strong>{{f.impact ?? f.importance ?? 0}}</strong></div><div class="empty-small" *ngIf="!(risk.explanations || []).length">No explanation data returned.</div></div></div>
          <div class="panel risk-panel"><div class="panel-head"><div><span class="card-kicker">MODEL INPUTS</span><h3>Patient inputs used</h3></div></div><div class="input-grid"><div><span>Age</span><b>{{risk.inputs?.age ?? '—'}}</b></div><div><span>Heart rate</span><b>{{risk.inputs?.heartRate ?? '—'}} bpm</b></div><div><span>Blood pressure</span><b>{{risk.inputs?.systolic ?? '—'}} / {{risk.inputs?.diastolic ?? '—'}}</b></div><div><span>SpO₂</span><b>{{risk.inputs?.oxygen ?? '—'}}%</b></div><div><span>Glucose</span><b>{{risk.inputs?.glucose ?? '—'}} mg/dL</b></div><div class="wide"><span>Conditions</span><b>{{risk.inputs?.conditions || 'None recorded'}}</b></div></div></div>
        </div>
        <div class="panel recommendations-panel"><div class="panel-head"><div><span class="card-kicker">MODEL OUTPUT</span><h3>Recommendations for review</h3></div><span class="pill">Demo model</span></div><div class="recommendation-list"><div *ngFor="let r of (risk.recommendations || [])">• {{r}}</div><div *ngIf="!(risk.recommendations || []).length">No recommendation text returned.</div></div><small class="module-note">Academic risk demonstration; not a clinical diagnosis.</small></div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- M3 LIVE MONITORING - SEPARATE MODULE -->
    <!-- ================================================= -->
    <section *ngIf="tab==='monitoring'" class="content milestone-page m3-page">
      <div class="module-hero"><div><span class="eyebrow">M3 · WEEKS 5–6</span><h2>Live Monitoring & Alerts</h2><p>Continuously observe patient vitals, evaluate thresholds and surface abnormal readings.</p></div><div class="module-status" [class.live-on]="simulationRunning">● {{simulationRunning ? 'LIVE STREAM' : 'MONITOR READY'}}</div></div>
      <div class="module-toolbar"><div><span class="card-kicker">MONITOR PATIENT</span><h3>{{monitorPatientId ? patientName(monitorPatientId) : 'Choose a patient'}}</h3><small>{{patientMrn(monitorPatientId)}} · {{monitoringUpdated ? (monitoringUpdated | date:'mediumTime') : 'Waiting for data'}}</small></div><div class="module-controls"><select [ngModel]="monitorPatientId" (ngModelChange)="selectMonitorPatient($event)"><option value="">Select patient</option><option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option></select><button type="button" class="primary" [disabled]="!monitorPatientId" (click)="toggleLiveSimulation()">{{simulationRunning ? '■ Stop Live Demo' : '▶ Start Live Demo'}}</button><button type="button" class="critical-btn" [disabled]="!monitorPatientId" (click)="loadCriticalMonitoringDemo()">Simulate HR 145</button></div></div>
      <div class="monitor-empty" *ngIf="!monitorPatient"><div class="monitor-empty-icon">♥</div><h3>Select a patient stream</h3><p>Choose a patient above. Their latest vitals and monitoring history will appear here.</p></div>
      <div *ngIf="monitorPatient" class="monitor-workspace">
        <div class="monitor-vital-grid"><div class="monitor-vital"><span>Heart Rate</span><b>{{monitorPatient.latest?.heartRate ?? '—'}}</b><small>bpm</small><em [class]="valueStatus('heartRate',monitorPatient.latest?.heartRate)">{{valueStatus('heartRate',monitorPatient.latest?.heartRate)}}</em></div><div class="monitor-vital"><span>Blood Pressure</span><b>{{monitorPatient.latest?.systolic ?? '—'}} / {{monitorPatient.latest?.diastolic ?? '—'}}</b><small>mmHg</small><em [class]="valueStatus('bp',monitorPatient.latest)">{{valueStatus('bp',monitorPatient.latest)}}</em></div><div class="monitor-vital"><span>SpO₂</span><b>{{monitorPatient.latest?.oxygen ?? '—'}}</b><small>% saturation</small><em [class]="valueStatus('oxygen',monitorPatient.latest?.oxygen)">{{valueStatus('oxygen',monitorPatient.latest?.oxygen)}}</em></div><div class="monitor-vital"><span>Glucose</span><b>{{monitorPatient.latest?.glucose ?? '—'}}</b><small>mg/dL</small><em [class]="valueStatus('glucose',monitorPatient.latest?.glucose)">{{valueStatus('glucose',monitorPatient.latest?.glucose)}}</em></div><div class="monitor-vital"><span>Temperature</span><b>{{monitorPatient.latest?.temperature ?? '—'}}</b><small>°C</small><em [class]="valueStatus('temperature',monitorPatient.latest?.temperature)">{{valueStatus('temperature',monitorPatient.latest?.temperature)}}</em></div></div>
        <div class="monitor-two-col"><div class="panel trend-panel"><div class="panel-head"><div><span class="card-kicker">LIVE TREND</span><h3>{{trendKey | titlecase}} history</h3></div><select [(ngModel)]="trendKey"><option *ngFor="let k of trendKeys" [value]="k">{{k | titlecase}}</option></select></div><svg viewBox="0 0 640 190" class="trend-chart"><line x1="10" y1="25" x2="630" y2="25"/><line x1="10" y1="95" x2="630" y2="95"/><line x1="10" y1="175" x2="630" y2="175"/><polyline *ngIf="trendPolyline()" [attr.points]="trendPolyline()" fill="none"/></svg><div class="trend-stats"><span>Min <b>{{trendMin()}}</b></span><span>Max <b>{{trendMax()}}</b></span><span>Readings <b>{{trendPoints().length}}</b></span></div></div>
          <div class="panel alert-panel"><div class="panel-head"><div><span class="card-kicker">CLINICAL ALERTS</span><h3>Recent monitoring alerts</h3></div><span class="pill">{{monitorPatient.alerts?.length || 0}}</span></div><div class="monitor-alert" *ngFor="let a of (monitorPatient.alerts || []).slice(0,6)"><div><b>{{a.severity}}</b><span>{{a.type}}</span><p>{{a.message}}</p></div><button *ngIf="!a.acknowledged" type="button" (click)="ack(a)">Acknowledge</button></div><div class="empty-small" *ngIf="!monitorPatient.alerts?.length">No monitoring alerts.</div></div></div>
        <div class="panel monitor-flow-panel"><div><span class="card-kicker">M3 WORKFLOW</span><h3>Observe → Evaluate → Alert → Respond</h3></div><div class="flow-steps"><span>New vital arrives</span><i>→</i><span>Threshold check</span><i>→</i><span>Status classified</span><i>→</i><span>Alert saved</span><i>→</i><span>Care team reviews</span></div><small class="module-note">Software simulation for demonstration; physical wearable connectivity is a future integration.</small></div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- M4 CARE PLAN - SEPARATE MODULE -->
    <!-- ================================================= -->
    <section *ngIf="tab==='careplans'" class="content milestone-page m4-page">
      <div class="module-hero"><div><span class="eyebrow">M4 · WEEKS 7–8</span><h2>Care Plan & Treatment</h2><p>Create a patient-specific care plan and track progress and adherence.</p></div><div class="module-status">● M4 READY</div></div>
      <div class="module-toolbar"><div><span class="card-kicker">CARE PATIENT</span><h3>{{carePlanPatientId ? patientName(carePlanPatientId) : 'Choose a patient'}}</h3><small>{{patientMrn(carePlanPatientId)}} · {{carePlans.length}} saved plan(s)</small></div><div class="module-controls"><select [ngModel]="carePlanPatientId" (ngModelChange)="selectCarePlanPatient($event)"><option value="">Select patient</option><option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option></select><button type="button" class="primary" [disabled]="!carePlanPatientId || carePlanBusy" (click)="generateCarePlan()">{{carePlanBusy ? 'Generating…' : 'Generate Care Plan'}}</button><button type="button" (click)="openCarePlanForm()" [disabled]="!carePlanPatientId">+ Create Manually</button></div></div>
      <div class="care-empty" *ngIf="!carePlans.length"><div class="care-empty-icon">✓</div><h3>No care plan for this patient</h3><p>Select a patient and click <b>Generate Care Plan</b> to create the M4 plan.</p></div>
      <div *ngIf="carePlans.length" class="care-workspace"><div class="care-stat-grid"><div class="care-stat"><span>Active Plans</span><b>{{careActiveCount()}}</b></div><div class="care-stat"><span>Completed Plans</span><b>{{careCompletedCount()}}</b></div><div class="care-stat"><span>Average Progress</span><b>{{careAverageProgress()}}%</b></div><div class="care-stat"><span>Average Adherence</span><b>{{careAverageAdherence()}}%</b></div></div>
        <div class="care-plan-list"><article class="panel care-plan-card" *ngFor="let cp of carePlans"><div class="care-title-row"><div><span class="card-kicker">{{cp.category || 'CARE PLAN'}}</span><h3>{{cp.title}}</h3><small>{{cp.goal}}</small></div><div class="care-badges"><span class="pill">{{cp.priority || 'MEDIUM'}}</span><span class="pill">{{cp.status || 'ACTIVE'}}</span></div></div><div class="care-progress-block"><div><span>Progress</span><b>{{cp.progress || 0}}%</b></div><div class="progress-track"><i [style.width.%]="cp.progress || 0"></i></div></div><div class="care-progress-block"><div><span>Adherence</span><b>{{cp.adherence || 0}}%</b></div><div class="progress-track adherence"><i [style.width.%]="cp.adherence || 0"></i></div></div><div class="treatment-box"><div class="treatment-head"><div><b>Treatment actions</b><small>Tick an action when completed.</small></div><span>{{completedActionCount(cp)}} / {{cp.actions?.length || 0}}</span></div><label class="treatment-action" *ngFor="let action of (cp.actions || [])" [class.done-action]="actionDone(action)"><input type="checkbox" [checked]="actionDone(action)" (change)="toggleTreatmentAction(cp,action)"><span>{{actionLabel(action)}}</span></label><div class="empty-small" *ngIf="!cp.actions?.length">No treatment actions saved.</div></div><div class="care-meta-row"><span>Follow-up <b>{{cp.followUpDate || 'Not set'}}</b></span><span>Generated by <b>{{cp.generatedBy || 'CLINICIAN'}}</b></span><span>Updated <b>{{cp.updatedAt | date:'short'}}</b></span></div><div class="care-actions"><button (click)="changeCareProgress(cp,10)">+10% Progress</button><button (click)="changeCareAdherence(cp,10)">+10% Adherence</button><button (click)="setCareStatus(cp,'COMPLETED')">Mark Completed</button><button (click)="openCarePlanForm(cp)">Edit</button><button class="danger-btn" (click)="deleteCarePlan(cp)">Delete</button></div></article></div>
        <div class="panel care-history-panel"><div class="panel-head"><div><span class="card-kicker">PLAN HISTORY</span><h3>Previous care plans</h3></div><span class="pill">{{carePlans.length}} plan(s)</span></div><div class="history-row" *ngFor="let cp of carePlans"><div><b>{{cp.title}}</b><small>{{cp.category}} · {{cp.followUpDate || 'No follow-up'}}</small></div><span>{{cp.progress || 0}}%</span><span>{{cp.status || 'ACTIVE'}}</span></div></div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- APPOINTMENTS -->
    <!-- ================================================= -->

    <section *ngIf="tab==='appointments'" class="content">
      <div class="appointment-hero">
        <div><span class="eyebrow">CLINICAL APPOINTMENT SCHEDULER</span><h2>Doctors & availability</h2><p>Select a department, doctor and an available time slot. Bookings are saved through the existing appointment API.</p></div>
        <button class="primary" (click)="addAppointment()">+ New appointment</button>
      </div>

      <div class="department-strip">
        <button *ngFor="let d of appointmentDepartments" [class.active]="appointmentDepartment===d" (click)="selectAppointmentDepartment(d)">{{d}}</button>
      </div>

      <div class="appointment-layout">
        <div class="panel doctor-panel">
          <div class="panel-head"><div><h3>{{appointmentDepartment}} specialists</h3><p>Doctors available in this department</p></div><span class="availability-badge">{{filteredDoctors().length}} doctors</span></div>
          <div class="doctor-card" *ngFor="let d of filteredDoctors()" [class.selected-doctor]="appointmentDoctor?.id===d.id" (click)="selectAppointmentDoctor(d)">
            <div class="doctor-avatar">{{d.name.replace('Dr. ','').charAt(0)}}</div>
            <div class="doctor-main"><b>{{d.name}}</b><span>{{d.specialty}}</span><small>{{d.experience}} · {{d.room}}</small></div>
            <div class="doctor-status"><i></i> Available</div>
          </div>
        </div>

        <div class="panel schedule-panel" *ngIf="appointmentDoctor as d">
          <div class="panel-head"><div><h3>{{d.name}}</h3><p>{{d.specialty}} · {{d.department}}</p></div><span class="live-badge">● SCHEDULE LIVE</span></div>
          <div class="doctor-schedule-summary"><div><span>Consultation days</span><b>{{d.days.join(' · ')}}</b></div><div><span>Clinic hours</span><b>{{d.hours}}</b></div></div>
          <label class="date-picker-label">Choose appointment date<input type="date" [(ngModel)]="appointmentForm.date" (ngModelChange)="refreshAppointmentSlots()" [min]="todayDate"></label>
          <div class="slot-title">Available time slots <small>{{appointmentDayLabel()}}</small></div>
          <div class="slot-grid" *ngIf="availableAppointmentSlots.length"><button *ngFor="let slot of availableAppointmentSlots" [class.selected-slot]="appointmentForm.time===slot" (click)="appointmentForm.time=slot">{{slot}}</button></div>
          <div class="empty-slot" *ngIf="!availableAppointmentSlots.length"><b>No slots on this date.</b><span>{{d.name}} is available on {{d.days.join(', ')}}.</span></div>
          <div class="quick-book" *ngIf="availableAppointmentSlots.length"><div><b>Selected:</b> {{appointmentForm.date || 'Choose date'}} · {{appointmentForm.time || 'Choose time'}}</div><button class="primary" (click)="openNewAppointment(d)">Book with {{d.name}}</button></div>
        </div>

        <div class="panel schedule-panel empty-doctor" *ngIf="!appointmentDoctor"><div class="empty-icon">◷</div><h3>Select a doctor</h3><p>Choose a doctor from the {{appointmentDepartment}} department to view their weekly schedule and available slots.</p></div>
      </div>

      <div class="panel table appointment-history">
        <div class="panel-head"><div><h3>Booked appointments</h3><p>Appointments already stored in MediSphere.</p></div><button (click)="refreshAppointments()">↻ Refresh appointments</button></div>
        <table><thead><tr><th>Date & time</th><th>Patient</th><th>Doctor</th><th>Department</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let a of appointments"><td>{{a.date}} {{a.time}}</td><td><b>{{a.patientName}}</b></td><td>{{a.doctorName}}</td><td>{{a.specialty}}</td><td><span class="pill">{{a.status || 'SCHEDULED'}}</span></td></tr></tbody>
        </table>
        <div class="empty" *ngIf="!appointments.length">No appointments booked yet.</div>
      </div>
    </section>

    <!-- APPOINTMENT BOOKING MODAL -->
    <div class="modal-backdrop" *ngIf="showAppointmentForm" (click)="closeAppointmentForm()">
      <div class="appointment-modal" (click)="$event.stopPropagation()">
        <div class="modal-head"><div><span class="eyebrow modal-eyebrow">CONFIRM APPOINTMENT</span><h2>Book consultation</h2><p>{{appointmentDoctor?.name}} · {{appointmentDepartment}}</p></div><button class="close-btn" type="button" (click)="closeAppointmentForm()">×</button></div>
        <div class="appointment-form-grid">
          <label>Patient *<select [(ngModel)]="appointmentForm.patientId"><option value="">Select patient</option><option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option></select></label>
          <label>Department<input [value]="appointmentDepartment" readonly></label>
          <label>Doctor<input [value]="appointmentDoctor?.name || ''" readonly></label>
          <label>Date<input type="date" [(ngModel)]="appointmentForm.date" [min]="todayDate" (ngModelChange)="refreshAppointmentSlots()"></label>
          <label>Time<select [(ngModel)]="appointmentForm.time"><option value="">Select time</option><option *ngFor="let slot of availableAppointmentSlots" [value]="slot">{{slot}}</option></select></label>
          <label>Status<select [(ngModel)]="appointmentForm.status"><option>SCHEDULED</option><option>CONFIRMED</option><option>FOLLOW-UP</option></select></label>
          <label class="full-field">Reason<input [(ngModel)]="appointmentForm.reason" placeholder="Reason for consultation"></label>
        </div>
        <div class="modal-actions"><button type="button" (click)="closeAppointmentForm()">Cancel</button><button class="primary" type="button" [disabled]="savingAppointment" (click)="saveAppointment()">{{savingAppointment ? '⟳ Booking...' : '✓ Confirm appointment'}}</button></div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- VITALS -->
    <!-- ================================================= -->
    <section *ngIf="tab==='vitals'" class="content vitals-page">
      <div class="section-hero clinical-page-hero">
        <div>
          <span class="eyebrow">M1 · WEARABLE CONNECTIVITY</span>
          <h2>Record a clinical vital</h2>
          <p>Enter one patient reading. The same API persists it in MongoDB, evaluates M3 thresholds and creates an alert when required.</p>
        </div>
        <div class="hero-stat"><span>Patient-linked</span><b>{{vital.patientId ? patientName(vital.patientId) : 'Not selected'}}</b></div>
      </div>

      <div class="vitals-layout">
        <div class="panel vital-entry-card">
          <div class="panel-head">
            <div><span class="card-kicker">NEW MEASUREMENT</span><h3>Vital signs</h3><p>Every field is labelled with its unit so the correct value is clear.</p></div>
            <span class="entry-status">● Ready to record</span>
          </div>

          <div class="vital-form-grid">
            <label class="field field-wide">Patient
              <select [(ngModel)]="vital.patientId">
                <option value="">Select patient</option>
                <option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option>
              </select>
            </label>

            <label class="field">Heart Rate <span>(bpm)</span>
              <input type="number" min="20" max="250" [(ngModel)]="vital.heartRate" placeholder="e.g. 78">
              <small>Typical adult reference: 60–100 bpm</small>
            </label>

            <label class="field">Systolic BP <span>(mmHg)</span>
              <input type="number" min="50" max="300" [(ngModel)]="vital.systolic" placeholder="e.g. 120">
              <small>Enter the upper blood-pressure value</small>
            </label>

            <label class="field">Diastolic BP <span>(mmHg)</span>
              <input type="number" min="30" max="200" [(ngModel)]="vital.diastolic" placeholder="e.g. 80">
              <small>Enter the lower blood-pressure value</small>
            </label>

            <label class="field">SpO₂ <span>(%)</span>
              <input type="number" min="50" max="100" [(ngModel)]="vital.oxygen" placeholder="e.g. 98">
              <small>Oxygen saturation</small>
            </label>

            <label class="field">Temperature <span>(°C)</span>
              <input type="number" min="25" max="45" step="0.1" [(ngModel)]="vital.temperature" placeholder="e.g. 36.8">
              <small>Body temperature</small>
            </label>

            <label class="field">Blood Glucose <span>(mg/dL)</span>
              <input type="number" min="20" max="800" [(ngModel)]="vital.glucose" placeholder="e.g. 100">
              <small>Enter the measured glucose value</small>
            </label>

            <label class="field">Measurement Source
              <select [(ngModel)]="vital.source">
                <option value="MANUAL">Manual entry</option>
                <option value="WEARABLE">Wearable device</option>
                <option value="WEARABLE-SIMULATOR">Demo wearable simulator</option>
              </select>
              <small>Use simulator only for project demonstration</small>
            </label>
          </div>

          <div class="vital-form-footer">
            <div class="demo-note"><b>Need a critical demo?</b><span>Use the demo button to intentionally load abnormal values. Nothing is saved until you click Save Vital Reading.</span></div>
            <div class="form-actions">
              <button type="button" (click)="clearVitalForm()">Clear</button>
              <button type="button" class="demo-critical-btn" (click)="loadCriticalDemo()">⚠ Load Critical Demo</button>
              <button type="button" class="primary" [disabled]="vitalSaving" (click)="sendVital()">{{vitalSaving ? 'Saving…' : '✓ Save Vital Reading'}}</button>
            </div>
          </div>
        </div>

        <div class="panel vital-guide-card">
          <div class="card-kicker">WHAT THE SYSTEM DOES</div>
          <h3>From reading to clinical alert</h3>
          <div class="vital-flow-step"><span>01</span><div><b>Capture</b><small>Patient + five supported vital measurements</small></div></div>
          <div class="vital-flow-step"><span>02</span><div><b>Persist</b><small>Saved through <code>POST /vitals</code></small></div></div>
          <div class="vital-flow-step"><span>03</span><div><b>Evaluate</b><small>M3 threshold service checks abnormal values</small></div></div>
          <div class="vital-flow-step"><span>04</span><div><b>Alert</b><small>Critical/warning alerts appear in Clinical Alerts</small></div></div>
          <div class="vital-flow-step"><span>05</span><div><b>Monitor</b><small>Reading becomes part of the patient trend history</small></div></div>
          <button type="button" class="guide-link" (click)="navigateTo('monitoring')">Open Live Monitoring →</button>
        </div>
      </div>

      <div class="panel recent-vitals-card" *ngIf="vital.patientId">
        <div class="panel-head"><div><span class="card-kicker">PATIENT HISTORY</span><h3>Recent readings · {{patientName(vital.patientId)}}</h3></div><button type="button" (click)="loadRecentVitalHistory()">↻ Refresh history</button></div>
        <div class="recent-vital-row" *ngFor="let v of recentVitalHistory | slice:0:5">
          <span>{{v.recordedAt | date:'short'}}</span><b>{{v.heartRate ?? '—'}} bpm</b><b>{{v.systolic ?? '—'}} / {{v.diastolic ?? '—'}} mmHg</b><b>{{v.oxygen ?? '—'}}%</b><b>{{v.temperature ?? '—'}} °C</b><b>{{v.glucose ?? '—'}} mg/dL</b>
        </div>
        <div class="empty-small" *ngIf="!recentVitalHistory.length">No previous vital readings for this patient.</div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- ALERTS -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='alerts'"
      class="content">


      <div class="panel table">

        <table>

          <thead>

            <tr>

              <th>
                Severity
              </th>

              <th>
                Type
              </th>

              <th>
                Message
              </th>

              <th>
                Created
              </th>

              <th></th>

            </tr>

          </thead>


          <tbody>

            <tr
              *ngFor="let a of alerts">

              <td>

                <span
                  class="severity"
                  [class.critical]="a.severity==='CRITICAL'">

                  {{a.severity}}

                </span>

              </td>

              <td>
                {{a.type}}
              </td>

              <td>
                {{a.message}}
              </td>

              <td>
                {{a.createdAt | date:'short'}}
              </td>

              <td>

                <button
                  (click)="ack(a.id)">

                  Acknowledge

                </button>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>


    <!-- ================================================= -->
    <!-- PHARMACY -->
    <!-- ================================================= -->

    <section *ngIf="tab==='pharmacy'" class="content">
      <div class="section-hero clinical-page-hero neon-hero">
        <div><span class="eyebrow">PHARMACY OPERATIONS</span><h2>Medication inventory & safety</h2><p>Live inventory from MongoDB with low-stock visibility and a direct path into prescription safety workflows.</p></div>
        <div class="hero-stat"><span>Low stock</span><b>{{lowStockMedicineCount()}}</b></div>
      </div>
      <div class="cards pharmacy-metrics"><div class="metric"><span>Total medicines</span><b>{{medicines.length}}</b><small>Catalogued</small></div><div class="metric warn"><span>Low stock</span><b>{{lowStockMedicineCount()}}</b><small>At or below reorder level</small></div><div class="metric"><span>Prescription workspace</span><b>Ready</b><small>Doctor review required</small></div></div>
      <div class="panel table">

        <table>

          <thead>

            <tr>

              <th>
                Medicine
              </th>

              <th>
                Category
              </th>

              <th>
                Strength
              </th>

              <th>
                Stock
              </th>

              <th>
                Price
              </th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Status</th>

            </tr>

          </thead>


          <tbody>

            <tr
              *ngFor="let m of medicines">

              <td>
                <b>{{m.name}}</b>
              </td>

              <td>
                {{m.category}}
              </td>

              <td>
                {{m.strength}}
              </td>

              <td>
                {{m.stock}}
              </td>

              <td>
                ₹{{m.price}}
              </td>
              <td>{{m.batchNumber || '—'}}</td>
              <td>{{m.expiryDate || '—'}}</td>
              <td><span class="pill" [class.success]="!medicineStockLow(m)">{{medicineStockLow(m) ? 'LOW STOCK' : 'AVAILABLE'}}</span></td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>


    <!-- ================================================= -->
    <!-- FHIR / SMART -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='fhir'"
      class="content">


      <div class="grid2">


        <div class="panel">

          <h3>
            FHIR Integration
          </h3>


          <p>

            FHIR R4-ready endpoints accept Patient,
            Observation and DiagnosticReport resources.

          </p>


          <button
            class="primary"
            (click)="checkFhir()">

            Check FHIR metadata

          </button>


          <pre
            *ngIf="fhir">

            {{fhir | json}}

          </pre>

        </div>


        <div class="panel">

          <h3>
            SMART on FHIR
          </h3>


          <p>

            Authorization handshake endpoint for
            app launch / scoped access.

          </p>


          <button
            (click)="checkSmart()">

            Test SMART handshake

          </button>


          <pre
            *ngIf="smart">

            {{smart | json}}

          </pre>

        </div>

      </div>

    </section>


    <!-- ================================================= -->
    <!-- SETTINGS -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='settings'"
      class="content">


      <div class="panel">

        <h3>
          Deployment & Security
        </h3>


        <p>

          Docker Compose includes MongoDB and Kafka.
          Kubernetes manifests are included.
          JWT authentication and role-based API
          protection are enabled.

        </p>


        <div class="tags">

          <span>
            Java 25
          </span>

          <span>
            Spring Boot 4
          </span>

          <span>
            Angular 20
          </span>

          <span>
            MongoDB
          </span>

          <span>
            Kafka
          </span>

          <span>
            FHIR R4
          </span>

          <span>
            Docker
          </span>

          <span>
            Kubernetes
          </span>

        </div>

      </div>

    </section>

    <!-- ================================================= -->
    <!-- ADVANCED CLINICAL INTELLIGENCE HUB -->
    <!-- ================================================= -->
    <section *ngIf="tab==='clinical'" class="content clinical-hub">
      <div class="section-hero clinical-page-hero neon-hero">
        <div>
          <span class="eyebrow">MEDISPHERE · CLINICAL INTELLIGENCE</span>
          <h2>One command center for care.</h2>
          <p>Prescriptions, medication safety, labs, documents, adherence, notifications and AI clinical support are connected to the selected patient.</p>
        </div>
        <div class="hero-orbit"><span>AI</span><i></i><b></b></div>
      </div>

      <div class="hub-toolbar panel">
        <label class="hub-patient-select">Patient
          <select [(ngModel)]="clinicalPatientId" (ngModelChange)="loadClinicalPatient($event)">
            <option value="">Select patient</option>
            <option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option>
          </select>
        </label>
        <div class="hub-actions">
          <button type="button" (click)="loadClinicalPatient(clinicalPatientId)">↻ Sync patient</button>
          <button type="button" (click)="loadPatientQr()">Patient QR</button><button type="button" class="primary" (click)="addVital()">+ Record vital</button>
          <button type="button" (click)="navigateTo('appointments')">Book appointment</button>
        </div>
      </div>

      <div class="hub-grid" *ngIf="clinicalPatientId">
        <div class="panel ai-assistant-panel">
          <div class="panel-head"><div><span class="card-kicker">AI CLINICAL ASSISTANT</span><h3>Ask about this patient</h3><p>Answers are generated from the patient's stored MediSphere data.</p></div><span class="ai-live">● CONTEXT LINKED</span></div>
          <textarea [(ngModel)]="assistantQuestion" rows="3" placeholder="e.g. Summarize the patient, explain the current risk, or review medicines."></textarea>
          <div class="hub-actions"><button class="primary" [disabled]="assistantBusy || !assistantQuestion.trim()" (click)="askAssistant()">{{assistantBusy ? 'Thinking…' : 'Ask MediSphere AI'}}</button><button (click)="assistantQuestion='Summarize this patient'">Use summary prompt</button></div>
          <div class="assistant-answer" *ngIf="assistantAnswer"><b>{{assistantAnswer.title}}</b><p>{{assistantAnswer.answer}}</p><div class="answer-chips"><span *ngFor="let x of assistantAnswer.highlights">{{x}}</span></div><small>{{assistantAnswer.disclaimer}}</small></div>
        </div>

        <div class="panel risk-command-panel">
          <div class="panel-head"><div><span class="card-kicker">PATIENT SIGNAL</span><h3>Live clinical snapshot</h3></div><button (click)="runRisk(clinicalPatientId)">Run risk</button></div>
          <div class="signal-row"><span>Latest HR</span><b>{{latest(clinicalData?.vitals)?.heartRate || '—'}} <small>bpm</small></b></div>
          <div class="signal-row"><span>BP</span><b>{{latest(clinicalData?.vitals)?.systolic || '—'}} / {{latest(clinicalData?.vitals)?.diastolic || '—'}}</b></div>
          <div class="signal-row"><span>SpO₂</span><b>{{latest(clinicalData?.vitals)?.oxygen || '—'}}%</b></div>
          <div class="signal-row"><span>Active medicines</span><b>{{clinicalData?.prescriptions?.length || 0}}</b></div>
          <div class="signal-row"><span>Lab reports</span><b>{{clinicalData?.labs?.length || 0}}</b></div>
          <div class="risk-inline" *ngIf="risk"><strong>{{risk.level}}</strong><span>{{risk.score}}% risk score</span></div>
        </div>
      </div>

      <div class="hub-grid" *ngIf="clinicalPatientId">
        <div class="panel">
          <div class="panel-head"><div><span class="card-kicker">SMART PRESCRIBING</span><h3>Prescription workspace</h3><p>Doctor review is required before a medication becomes an active prescription.</p></div><span class="pill success">FHIR MedicationRequest</span></div>
          <div class="hub-form-grid">
            <label>Medicine<select [(ngModel)]="prescriptionForm.medicineName"><option value="">Select medicine</option><option *ngFor="let m of medicines" [value]="m.name">{{m.name}} · {{m.strength}}</option></select></label>
            <label>Strength<input [(ngModel)]="prescriptionForm.strength" placeholder="500 mg"></label>
            <label>Dosage<input [(ngModel)]="prescriptionForm.dosage" placeholder="1 tablet"></label>
            <label>Frequency<select [(ngModel)]="prescriptionForm.frequency"><option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option></select></label>
            <label>Timing<select [(ngModel)]="prescriptionForm.timing"><option>Before meal</option><option>After meal</option><option>With meal</option><option>At bedtime</option></select></label>
            <label>Duration (days)<input type="number" min="1" [(ngModel)]="prescriptionForm.durationDays"></label>
            <label class="full-field">Diagnosis / clinical context<input [(ngModel)]="prescriptionForm.diagnosis" placeholder="e.g. Type 2 Diabetes"></label>
            <label class="full-field">Instructions<textarea [(ngModel)]="prescriptionForm.instructions" rows="2" placeholder="Additional instructions"></textarea></label>
          </div>
          <div class="hub-actions"><button class="primary" [disabled]="prescriptionBusy" (click)="createPrescription()">{{prescriptionBusy ? 'Saving…' : 'Create prescription'}}</button><button (click)="recommendMedicines()">Suggest options</button></div>
          <div class="recommendation-box" *ngIf="medicineRecommendations.length"><div class="rec-head"><b>Decision-support suggestions</b><small>Clinician approval required</small></div><div class="rec-item" *ngFor="let r of medicineRecommendations"><div><b>{{r.medicine}} {{r.strength}}</b><small>{{r.category}} · stock {{r.stock}}</small></div><span [class.warn-text]="r.warning">{{r.warning || 'No rule conflict found'}}</span><button (click)="useRecommendation(r)">Use</button></div></div>
          <div class="rx-list"><div class="rx-item" *ngFor="let rx of clinicalData?.prescriptions"><div><b>{{rx.medicineName}} {{rx.strength}}</b><small>{{rx.dosage}} · {{rx.frequency}} · {{rx.durationDays}} days</small></div><span class="pill success">{{rx.status}}</span><button (click)="recordMedicationEvent(rx,'TAKEN')">✓ Taken</button><button (click)="recordMedicationEvent(rx,'MISSED')">Missed</button></div><div class="empty-small" *ngIf="!clinicalData?.prescriptions?.length">No active prescriptions for this patient.</div></div>
        </div>

        <div class="panel safety-panel">
          <div class="panel-head"><div><span class="card-kicker">MEDICATION SAFETY</span><h3>Interaction checker</h3><p>Rule-based safety checks in the current demo knowledge base.</p></div><span class="safety-orb">✓</span></div>
          <label>Medicine A<input [(ngModel)]="interactionA" placeholder="e.g. Warfarin"></label>
          <label>Medicine B<input [(ngModel)]="interactionB" placeholder="e.g. Aspirin"></label>
          <button class="primary full-btn" (click)="checkInteraction()">Check interaction</button>
          <div class="interaction-result" *ngIf="interactionResult" [class.danger]="!interactionResult.safe"><b>{{interactionResult.safe ? 'No known rule hit' : 'Potential interaction detected'}}</b><p>{{interactionResult.message}}</p><span *ngFor="let x of interactionResult.interactions">{{x.severity}} · {{x.message}}</span></div>
        </div>
      </div>

      <div class="hub-grid" *ngIf="clinicalPatientId">
        <div class="panel">
          <div class="panel-head"><div><span class="card-kicker">LAB INTELLIGENCE</span><h3>Record & review results</h3></div><button (click)="loadClinicalPatient(clinicalPatientId)">↻ Refresh</button></div>
          <div class="hub-form-grid compact">
            <label>Test name<input [(ngModel)]="labForm.testName" placeholder="HbA1c"></label><label>Result<input [(ngModel)]="labForm.result" placeholder="7.8"></label><label>Unit<input [(ngModel)]="labForm.unit" placeholder="%"></label><label>Reference range<input [(ngModel)]="labForm.referenceRange" placeholder="4.0–5.6"></label>
          </div>
          <button class="primary" [disabled]="labBusy" (click)="saveLab()">{{labBusy ? 'Saving…' : 'Save lab result'}}</button>
          <div class="data-list"><div *ngFor="let l of clinicalLabs"><span><b>{{l.testName}}</b><small>{{l.collectedAt | date:'medium'}}</small></span><strong>{{l.result}} {{l.unit}}</strong></div></div>
        </div>

        <div class="panel">
          <div class="panel-head"><div><span class="card-kicker">DOCUMENT VAULT</span><h3>Medical documents</h3><p>Store document metadata now; the record is patient-linked and auditable.</p></div></div>
          <div class="hub-form-grid compact"><label>Document name<input [(ngModel)]="documentForm.name" placeholder="Blood report Oct 2026"></label><label>Type<select [(ngModel)]="documentForm.documentType"><option>LAB_REPORT</option><option>PRESCRIPTION</option><option>X_RAY</option><option>MRI</option><option>CT_SCAN</option><option>DISCHARGE_SUMMARY</option><option>OTHER</option></select></label><label class="full-field">Description<textarea [(ngModel)]="documentForm.description" rows="2"></textarea></label>
            <label class="full-field">Upload file<input type="file" (change)="onDocumentFile($event)" accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"></label></div>
          <button class="primary" [disabled]="documentBusy" (click)="saveDocument()">{{documentBusy ? 'Uploading…' : 'Upload & link document'}}</button>
          <div class="data-list"><div *ngFor="let d of clinicalData?.documents"><span><b>{{d.name}}</b><small>{{d.documentType}} · {{d.uploadedAt | date:'medium'}}</small></span><span class="pill">Linked</span></div><div class="empty-small" *ngIf="!clinicalData?.documents?.length">No documents linked.</div></div>
        </div>
      </div>

      <div class="panel qr-panel" *ngIf="qrImage">
        <div class="panel-head"><div><span class="card-kicker">PATIENT IDENTITY</span><h3>Secure patient QR</h3><p>Scan the patient payload inside your MediSphere workflow.</p></div><button (click)="qrImage=''">Close</button></div>
        <div class="qr-content"><img [src]="qrImage" alt="Patient QR code"><div><b>{{clinicalData?.patient?.name}}</b><p>{{qrPayload}}</p><button (click)="copyQrPayload()">Copy payload</button></div></div>
      </div>

      <div class="panel notification-panel">
        <div class="panel-head"><div><span class="card-kicker">CARE SIGNALS</span><h3>Notification center</h3></div><button (click)="loadClinicalNotifications()">↻ Refresh</button></div>
        <div class="notification-grid"><div class="notification-card" *ngFor="let n of clinicalNotifications | slice:0:8" [class.unread]="!n.read"><span class="notification-dot"></span><div><b>{{n.title}}</b><p>{{n.message}}</p><small>{{n.createdAt | date:'short'}}</small></div><button *ngIf="!n.read" (click)="markNotificationRead(n.id)">Mark read</button></div><div class="empty-small" *ngIf="!clinicalNotifications.length">No new clinical notifications.</div></div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- M4 CARE PLAN MODAL -->
    <!-- ================================================= -->
    <div class="modal-backdrop" *ngIf="carePlanFormOpen" (click)="closeCarePlanForm()">
      <div class="care-modal" (click)="$event.stopPropagation()">
        <div class="modal-head"><div><span class="eyebrow modal-eyebrow">MILESTONE 4 · TREATMENT</span><h2>{{editingCarePlan ? 'Edit Care Plan' : 'Create Care Plan'}}</h2><p>Persisted to MongoDB through the M4 Care Plan API.</p></div><button class="close-btn" type="button" (click)="closeCarePlanForm()">×</button></div>
        <div class="care-form-grid">
          <label>Patient<select [(ngModel)]="carePlanForm.patientId"><option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option></select></label>
          <label>Title<input [(ngModel)]="carePlanForm.title" placeholder="e.g. Diabetes Management Plan"></label>
          <label>Category<select [(ngModel)]="carePlanForm.category"><option>GENERAL</option><option>PREVENTIVE</option><option>CARDIOVASCULAR</option><option>DIABETES</option><option>RECOVERY</option></select></label>
          <label>Priority<select [(ngModel)]="carePlanForm.priority"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
          <label>Status<select [(ngModel)]="carePlanForm.status"><option>ACTIVE</option><option>ON_HOLD</option><option>COMPLETED</option></select></label>
          <label>Follow-up date<input type="date" [(ngModel)]="carePlanForm.followUpDate"></label>
          <label>Progress %<input type="number" min="0" max="100" [(ngModel)]="carePlanForm.progress"></label>
          <label>Adherence %<input type="number" min="0" max="100" [(ngModel)]="carePlanForm.adherence"></label>
          <label class="full-field">Goal<textarea [(ngModel)]="carePlanForm.goal" rows="3" placeholder="Define the measurable care objective"></textarea></label>
          <label class="full-field">Treatment actions<textarea [(ngModel)]="carePlanForm.actionsText" rows="6" placeholder="One action per line"></textarea></label>
        </div>
        <div class="modal-actions"><button type="button" (click)="closeCarePlanForm()">Cancel</button><button type="button" class="primary" [disabled]="carePlanBusy" (click)="saveCarePlan()">{{carePlanBusy ? 'Saving…' : 'Save Care Plan'}}</button></div>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- ADD PATIENT MODAL -->
    <!-- ================================================= -->
    <div class="modal-backdrop" *ngIf="showPatientForm" (click)="cancelNewPatient()">
      <div class="patient-modal" (click)="$event.stopPropagation()">
        <div class="modal-head">
          <div>
            <span class="eyebrow modal-eyebrow">PATIENT REGISTRATION</span>
            <h2>Add New Patient</h2>
            <p>Create a complete patient record and store it in MongoDB.</p>
          </div>
          <button class="close-btn" type="button" (click)="cancelNewPatient()">×</button>
        </div>

        <div class="patient-form-grid">
          <label>MRN<input [(ngModel)]="newPatientForm.mrn" placeholder="Medical Record Number"></label>
          <label>Full Name *<input [(ngModel)]="newPatientForm.name" placeholder="Patient name"></label>
          <label>Gender<select [(ngModel)]="newPatientForm.gender"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></label>
          <label>Date of Birth<input type="date" [(ngModel)]="newPatientForm.dateOfBirth"></label>
          <label>Phone<input [(ngModel)]="newPatientForm.phone" placeholder="+91"></label>
          <label>Email<input type="email" [(ngModel)]="newPatientForm.email" placeholder="patient@example.com"></label>
          <label>Blood Group<select [(ngModel)]="newPatientForm.bloodGroup"><option value="">Select</option><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option></select></label>
          <label>Emergency Contact<input [(ngModel)]="newPatientForm.emergencyContact" placeholder="Emergency contact"></label>
          <label class="full-field">Address<input [(ngModel)]="newPatientForm.address" placeholder="Full address"></label>
          <label class="full-field">Allergies<input [(ngModel)]="newPatientForm.allergiesText" placeholder="e.g. Penicillin, Dust"></label>
          <label class="full-field">Medical Conditions<input [(ngModel)]="newPatientForm.conditionsText" placeholder="e.g. Diabetes, Hypertension"></label>
        </div>

        <div class="modal-actions">
          <button type="button" (click)="cancelNewPatient()">Cancel</button>
          <button type="button" class="primary" [disabled]="savingPatient" (click)="saveNewPatient()">
            {{savingPatient ? 'Saving…' : 'Create Patient'}}
          </button>
        </div>
      </div>
    </div>

  </main>

</div>
`,

  styles: [`

:host{
  font-family:Inter,Arial,sans-serif;
  color:#17324d;
}

.app{
  display:flex;
  min-height:100vh;
  background:#f5f8fa;
}

aside{
  width:245px;
  background:#082336;
  color:#d9e9ef;
  padding:22px 14px;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
}

.logo{
  display:flex;
  gap:10px;
  align-items:center;
  padding:8px 10px 28px;
}

.logo>span{
  width:38px;
  height:38px;
  background:#0da58e;
  border-radius:11px;
  display:grid;
  place-items:center;
  color:#fff;
  font-size:21px;
}

.logo small{
  display:block;
  color:#7f9baa;
  font-size:10px;
  margin-top:3px;
}

aside button{
  border:0;
  background:transparent;
  color:#a9bfca;
  text-align:left;
  padding:12px 13px;
  border-radius:10px;
  margin:2px 0;
  cursor:pointer;
  font-size:13px;
}

aside button.active,
aside button:hover{
  background:#123b50;
  color:#fff;
}

.side-bottom{
  margin-top:auto;
  border-top:1px solid #1b4153;
  padding-top:15px;
}

.user-mini{
  font-weight:700;
  font-size:12px;
  padding:5px 10px;
}

.user-mini small{
  display:block;
  color:#7997a5;
  margin-top:4px;
}

.side-bottom button{
  width:100%;
}

main{
  flex:1;
  min-width:0;
}

header{
  height:84px;
  background:#fff;
  border-bottom:1px solid #e3ebef;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 34px;
  box-sizing:border-box;
}

header h1{
  margin:0;
  font-size:23px;
}

header p{
  margin:4px 0;
  color:#8294a2;
  font-size:12px;
}

.header-actions{
  display:flex;
  align-items:center;
  gap:16px;
}

.live{
  color:#0b8f7b;
  font-size:12px;
}

.content{
  padding:30px 34px;
}

.hero{
  background:linear-gradient(110deg,#0a5364,#0d8c7d);
  border-radius:20px;
  padding:30px;
  color:#fff;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.eyebrow{
  font-size:10px;
  letter-spacing:2px;
  opacity:.75;
}

.hero h2{
  font-size:30px;
  margin:10px 0;
}

.hero p{
  max-width:640px;
  color:#d9f3ef;
}

.hero-icon{
  font-size:90px;
  opacity:.25;
}

.cards{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:16px;
  margin:20px 0;
}

.metric{
  background:#fff;
  border:1px solid #e6eef2;
  border-radius:15px;
  padding:20px;
}

.metric span{
  font-size:12px;
  color:#728694;
}

.metric b{
  display:block;
  font-size:29px;
  margin:7px 0;
}

.metric small{
  color:#94a3ad;
}

.metric.warn b{
  color:#c86d00;
}

.grid2{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
  margin-top:18px;
}

.panel{
  background:#fff;
  border:1px solid #e5edf1;
  border-radius:15px;
  padding:20px;
}

.panel h3{
  margin:0 0 14px;
}

.flow{
  display:flex;
  align-items:center;
  gap:10px;
  flex-wrap:wrap;
}

.flow span,
.tags span{
  padding:9px 12px;
  background:#eef8f7;
  border-radius:20px;
  color:#0b776b;
  font-size:12px;
  font-weight:700;
}

.toolbar{
  display:flex;
  justify-content:space-between;
  margin-bottom:15px;
}

.toolbar input{
  width:320px;
  padding:12px;
  border:1px solid #d9e5eb;
  border-radius:9px;
}

button{
  padding:9px 12px;
  border:1px solid #dbe5ea;
  border-radius:8px;
  background:#fff;
  cursor:pointer;
  font-weight:700;
  color:#375269;
}

.primary{
  background:#0c9f8a!important;
  color:#fff!important;
  border:0!important;
}

.table{
  overflow:auto;
}

table{
  width:100%;
  border-collapse:collapse;
}

th,
td{
  padding:13px 10px;
  text-align:left;
  border-bottom:1px solid #edf1f3;
  font-size:13px;
}

td small{
  display:block;
  color:#8a9aa5;
  margin-top:3px;
}

.profile{
  background:#fff;
  border:1px solid #e5edf1;
  border-radius:15px;
  padding:20px;
  display:flex;
  align-items:center;
  gap:15px;
}

.profile button{
  margin-left:auto;
}

.profile button + button{
  margin-left:0;
}

.profile-info{
  flex:1;
}

.avatar{
  width:52px;
  height:52px;
  border-radius:15px;
  background:#dff4f0;
  color:#08796d;
  display:grid;
  place-items:center;
  font-size:21px;
  font-weight:800;
}

.profile h2{
  margin:0;
}

.profile p{
  margin:4px 0;
  color:#7a8d99;
}

.mini-list div{
  display:flex;
  justify-content:space-between;
  padding:9px 0;
  border-bottom:1px solid #edf1f3;
  font-size:12px;
}

.row{
  display:flex;
  justify-content:space-between;
  padding:10px 0;
  border-bottom:1px solid #edf1f3;
  font-size:12px;
  gap:20px;
}

.risk{
  border-left:4px solid #0c9f8a;
  margin-top:18px;
}

.risk b{
  color:#0b8f7b;
}

.severity{
  font-size:10px;
  padding:5px 8px;
  border-radius:15px;
  background:#fff2d8;
  color:#9b6200;
}

.severity.critical{
  background:#ffe3e0;
  color:#a62318;
}

.pill{
  background:#edf7f5;
  color:#087b6d;
  border-radius:15px;
  padding:5px 9px;
  font-size:10px;
}

.form-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
  margin:15px 0;
}

.form-grid input{
  padding:11px;
  border:1px solid #d9e5eb;
  border-radius:8px;
}

.tags{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.empty{
  background:#fff;
  padding:40px;
  border-radius:15px;
  text-align:center;
  color:#789;
}

.empty-small{
  color:#8a9aa5;
  font-size:12px;
  padding:12px 0;
}

pre{
  background:#0a2030;
  color:#cce7e4;
  padding:14px;
  border-radius:10px;
  overflow:auto;
}


/* ===================================================== */
/* DIGITAL HEALTH TWIN */
/* ===================================================== */

.twin-panel{
  margin-top:18px;
  border:1px solid #b9e5de;
  background:#fbfffe;
}

.twin-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:18px;
}

.twin-header h3{
  margin-bottom:6px;
}

.twin-meta{
  margin:0;
  color:#82949f;
  font-size:12px;
}

.twin-badge{
  background:#e5f8f4;
  color:#087b6d;
  border-radius:20px;
  padding:7px 12px;
  font-size:10px;
  font-weight:800;
  letter-spacing:1px;
}

.twin-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;
}

.twin-grid>div{
  border:1px solid #e4eeee;
  border-radius:12px;
  padding:14px;
  background:#fff;
}

.twin-grid b{
  display:block;
  font-size:11px;
  color:#728694;
  margin-bottom:6px;
}

.twin-grid span{
  display:block;
  font-size:16px;
  font-weight:800;
  color:#17324d;
}

.success-text{
  color:#0b8f7b!important;
}

.fhir-preview{
  margin-top:18px;
  padding-top:18px;
  border-top:1px solid #e5eeee;
}

.fhir-preview h4,
.complete-info h4{
  margin:0 0 14px;
}

.fhir-info{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;
}

.fhir-info>div,
.info-grid>div{
  border:1px solid #e6eeee;
  background:#fff;
  border-radius:10px;
  padding:12px;
}

.fhir-info b,
.info-grid b{
  display:block;
  font-size:10px;
  color:#7b8e99;
  margin-bottom:5px;
}

.fhir-info span,
.info-grid span{
  font-size:12px;
  font-weight:700;
  word-break:break-word;
}

.complete-info{
  margin-top:18px;
  padding-top:18px;
  border-top:1px solid #e5eeee;
}

.info-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:12px;
}


@media(max-width:1100px){

  .cards{
    grid-template-columns:repeat(2,1fr);
  }

  .twin-grid,
  .fhir-info,
  .info-grid{
    grid-template-columns:repeat(2,1fr);
  }

}


.patient-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.danger-btn{border-color:#f0caca!important;color:#b32828!important;background:#fff7f7!important}.danger-btn:hover{background:#ffeaea!important;border-color:#e8aaaa!important}

@media(max-width:900px){

  aside{
    width:70px;
  }

  .logo div,
  aside button span,
  .user-mini{
    display:none;
  }

  .cards,
  .grid2{
    grid-template-columns:1fr 1fr;
  }

  .content{
    padding:18px;
  }

  .hero-icon{
    display:none;
  }

}


@media(max-width:600px){

  .cards,
  .grid2,
  .form-grid,
  .twin-grid,
  .fhir-info,
  .info-grid{
    grid-template-columns:1fr;
  }

  header{
    padding:0 15px;
  }

  .content{
    padding:15px;
  }

  .profile{
    flex-wrap:wrap;
  }

  .profile button{
    margin-left:0;
  }

}


.monitor-hero{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:26px 28px;border:1px solid #dcebea;border-radius:22px;background:linear-gradient(135deg,#effbf8,#f7fbff);margin-bottom:20px}.monitor-hero h2{margin:6px 0;font-size:30px}.monitor-hero p{margin:0;color:#667781}.monitor-live{padding:10px 14px;border-radius:999px;background:#fff;border:1px solid #cfe4e0;font-weight:800;color:#087c6b;white-space:nowrap}.monitor-live small{font-weight:500;color:#71818a;margin-left:8px}.pulse-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#10a88f;box-shadow:0 0 0 5px #d9f5ee;margin-right:6px}.danger{border-color:#f2d1d1!important}.live-text{font-size:18px!important;color:#0b9a84}.monitor-grid{display:grid;grid-template-columns:1fr 1.35fr;gap:20px}.panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;margin-bottom:16px}.panel-head h3{margin:0}.panel-head p{margin:5px 0 0;color:#75858d;font-size:13px}.monitor-patient{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid #e5eeee;border-radius:14px;margin-bottom:9px;cursor:pointer;transition:.15s}.monitor-patient:hover,.selected-monitor{border-color:#b9ddd7;background:#f4fbf9}.status-dot{width:10px;height:10px;border-radius:50%;flex:none}.status-dot.normal{background:#16a085}.status-dot.warning{background:#e7a22b}.status-dot.critical{background:#dc5a5a}.monitor-patient-main{flex:1;display:flex;flex-direction:column}.monitor-patient-main small,.monitor-alert small{color:#7b8990;margin-top:3px}.status-pill{font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px}.status-pill.normal{background:#e4f7f2;color:#087e6c}.status-pill.warning{background:#fff1d5;color:#9b6700}.status-pill.critical{background:#ffe3e3;color:#b32828}.alert-count{font-size:11px;color:#9b6700}.vital-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.live-vital{position:relative;border:1px solid #e3eeee;border-radius:15px;padding:14px;background:#fbfefe}.live-vital span,.live-vital small{display:block;color:#73828a;font-size:12px}.live-vital b{display:block;font-size:22px;margin:8px 0 2px}.live-vital em{font-style:normal;font-size:10px;font-weight:800}.trend-tabs{display:flex;gap:7px;margin-bottom:10px;flex-wrap:wrap}.trend-tabs button{border:1px solid #dbe7e6;background:#fff;border-radius:9px;padding:7px 10px}.trend-tabs button.active{background:#0c9f8a;color:#fff;border-color:#0c9f8a}.trend-chart{height:210px;border:1px solid #e2eceb;border-radius:14px;padding:10px;background:linear-gradient(#fff,#f7fcfb)}.trend-chart svg{width:100%;height:175px;color:#0b9a84}.chart-labels{display:flex;justify-content:space-between;color:#75858d;font-size:11px}.chart-labels b{color:#243b45}.monitor-alert{display:flex;align-items:center;gap:10px;border-top:1px solid #edf1f1;padding:11px 0}.monitor-alert>div{flex:1;display:flex;flex-direction:column}.monitor-alert button{font-size:11px}.monitor-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.live-demo-btn{border:1px solid #0c9f8a!important;color:#087e6c!important;background:#eefaf7!important}.live-demo-btn.running{background:#fff0f0!important;border-color:#e0a0a0!important;color:#b32828!important}.live-chart{position:relative;overflow:hidden}.chart-live-badge{position:absolute;top:8px;right:10px;z-index:2;font-size:10px;font-weight:800;color:#087e6c;background:#e8f8f4;border:1px solid #cfeee7;border-radius:999px;padding:5px 8px}.chart-sweep{position:absolute;top:0;bottom:22px;width:2px;background:linear-gradient(transparent,#0c9f8a,transparent);box-shadow:0 0 10px rgba(12,159,138,.35);animation:monitorSweep 2.2s linear infinite;z-index:1;opacity:.8}@keyframes monitorSweep{from{left:2%}to{left:98%}}.stream-note{margin-top:10px;padding:10px 12px;border:1px dashed #cfe3e1;border-radius:10px;background:#f8fcfb;color:#6f8088;font-size:11px;line-height:1.5}.stream-note b{color:#35515c}.stream-note code{font-size:10px}.monitor-info{display:flex;gap:13px;padding:16px;border:1px solid #e2eceb;border-radius:14px;margin-bottom:12px;background:#fbfefe}.monitor-info>span{font-size:20px}.monitor-info p{margin:5px 0 0;color:#708089;font-size:13px;line-height:1.5}@media(max-width:900px){.monitor-grid{grid-template-columns:1fr}.vital-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.monitor-hero{flex-direction:column;align-items:flex-start}.vital-grid{grid-template-columns:1fr}}



/* ===================================================== */
/* ADD PATIENT MODAL */
/* ===================================================== */
.modal-backdrop{position:fixed;inset:0;background:rgba(5,24,35,.58);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:24px;z-index:1000}.patient-modal{width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(8,35,54,.25);padding:24px}.modal-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;border-bottom:1px solid #edf1f3;padding-bottom:18px;margin-bottom:20px}.modal-head h2{margin:6px 0 4px;font-size:24px;color:#17324d}.modal-head p{margin:0;color:#7a8b95;font-size:13px}.modal-eyebrow{color:#0c9f8a!important;opacity:1}.close-btn{border:0!important;background:#f2f6f7!important;border-radius:50%!important;width:36px;height:36px;padding:0!important;font-size:24px;line-height:1}.patient-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.patient-form-grid label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;color:#536b78}.patient-form-grid input,.patient-form-grid select{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d9e5eb;border-radius:9px;background:#fff;color:#17324d;font:inherit;font-weight:500;outline:none}.patient-form-grid input:focus,.patient-form-grid select:focus{border-color:#0c9f8a;box-shadow:0 0 0 3px #e2f6f2}.full-field{grid-column:1/-1}.modal-actions{display:flex;justify-content:flex-end;gap:10px;border-top:1px solid #edf1f3;padding-top:18px;margin-top:20px}.modal-actions button:disabled{opacity:.55;cursor:not-allowed}@media(max-width:600px){.modal-backdrop{padding:10px}.patient-modal{padding:18px}.patient-form-grid{grid-template-columns:1fr}.full-field{grid-column:auto}}

/* APPOINTMENT SCHEDULER */
.appointment-hero{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:25px 28px;border:1px solid #dcebea;border-radius:22px;background:linear-gradient(135deg,#effbf8,#f7fbff);margin-bottom:18px}.appointment-hero h2{margin:6px 0;font-size:30px}.appointment-hero p{margin:0;color:#71818a;max-width:720px}.department-strip{display:flex;gap:8px;overflow-x:auto;padding:3px 1px 14px}.department-strip button{white-space:nowrap;border:1px solid #dbe7e6;background:#fff;color:#35505d;border-radius:999px;padding:9px 14px;font-weight:700}.department-strip button.active{background:#0c9f8a;color:#fff;border-color:#0c9f8a}.appointment-layout{display:grid;grid-template-columns:1fr 1.25fr;gap:18px;margin-bottom:18px}.doctor-panel,.schedule-panel{min-height:420px}.availability-badge,.live-badge{font-size:10px;font-weight:800;padding:7px 10px;border-radius:999px;background:#e5f8f3;color:#087e6c}.doctor-card{display:flex;align-items:center;gap:12px;border:1px solid #e3eeee;border-radius:15px;padding:13px;margin-bottom:9px;cursor:pointer;transition:.15s}.doctor-card:hover,.doctor-card.selected-doctor{border-color:#9ed7ce;background:#f2fbf9;box-shadow:0 5px 18px rgba(12,159,138,.08)}.doctor-avatar{width:44px;height:44px;border-radius:13px;background:#e2f5f1;color:#087e6c;display:grid;place-items:center;font-weight:900;font-size:18px}.doctor-main{flex:1;display:flex;flex-direction:column;gap:3px}.doctor-main b{font-size:14px}.doctor-main span{font-size:12px;color:#0b8f7b}.doctor-main small{font-size:11px;color:#7b8990}.doctor-status{font-size:10px;color:#087e6c;font-weight:800}.doctor-status i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#13a986;margin-right:4px}.doctor-schedule-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}.doctor-schedule-summary div{border:1px solid #e2eceb;border-radius:13px;padding:12px;background:#fbfefe}.doctor-schedule-summary span{display:block;color:#7a8a92;font-size:10px;font-weight:800;text-transform:uppercase}.doctor-schedule-summary b{display:block;margin-top:6px;font-size:13px}.date-picker-label{display:flex;flex-direction:column;gap:7px;font-size:11px;font-weight:800;color:#536b78;margin-bottom:18px}.date-picker-label input{padding:11px;border:1px solid #d9e5eb;border-radius:9px;font:inherit;color:#17324d}.slot-title{font-weight:800;margin-bottom:10px}.slot-title small{font-weight:500;color:#7a8a92;margin-left:8px}.slot-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.slot-grid button{border:1px solid #dbe7e6;background:#fff;border-radius:9px;padding:9px 7px;color:#35505d;font-weight:700}.slot-grid button:hover,.slot-grid button.selected-slot{background:#0c9f8a;color:#fff;border-color:#0c9f8a}.empty-slot{padding:25px;border-radius:14px;background:#fff8e8;border:1px solid #f1dfb5;color:#866100;display:flex;flex-direction:column;gap:5px}.empty-slot span{font-size:12px}.quick-book{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:18px;padding:13px;border-top:1px solid #e9eeee;font-size:12px}.empty-doctor{display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center}.empty-icon{width:58px;height:58px;border-radius:18px;background:#e8f7f4;display:grid;place-items:center;color:#0b9a84;font-size:26px}.empty-doctor p{max-width:420px;color:#75858d;line-height:1.5}.appointment-history{margin-top:8px}.appointment-modal{width:min(720px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(8,35,54,.25);padding:24px}.appointment-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.appointment-form-grid label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;color:#536b78}.appointment-form-grid input,.appointment-form-grid select{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d9e5eb;border-radius:9px;background:#fff;color:#17324d;font:inherit;font-weight:500;outline:none}.appointment-form-grid input:focus,.appointment-form-grid select:focus{border-color:#0c9f8a;box-shadow:0 0 0 3px #e2f6f2}.appointment-form-grid .full-field{grid-column:1/-1}.appointment-modal .modal-actions button:disabled{opacity:.55;cursor:not-allowed}@media(max-width:1000px){.appointment-layout{grid-template-columns:1fr}}@media(max-width:600px){.appointment-hero{flex-direction:column;align-items:flex-start}.doctor-schedule-summary,.appointment-form-grid{grid-template-columns:1fr}.slot-grid{grid-template-columns:repeat(2,1fr)}.quick-book{flex-direction:column;align-items:flex-start}}
.command-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;margin-top:18px}.command-panel{min-height:210px}.command-status{font-size:10px;font-weight:800;color:#0b8f7b;background:#e9f8f4;padding:6px 9px;border-radius:999px}.patient-quick{display:flex;align-items:center;gap:11px;padding:10px;border:1px solid #e8eff1;border-radius:12px;margin-top:8px;cursor:pointer;transition:.15s}.patient-quick:hover{border-color:#b8ddd7;background:#f6fcfa}.patient-quick>div:nth-child(2){flex:1;display:flex;flex-direction:column}.patient-quick small{color:#7b8c94;margin-top:3px}.patient-quick>span{font-size:22px;color:#7b8c94}.avatar{width:32px;height:32px;border-radius:10px;background:#e8f7f4;color:#0b8f7b;display:grid;place-items:center;font-weight:900}.orchestration{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.orchestration div{padding:15px 10px;border:1px solid #e3ecee;border-radius:13px;background:#fbfefe;text-align:center}.orchestration b{display:block;font-size:24px;color:#17324d}.orchestration small{color:#7a8a92;font-size:10px}.command-note{color:#6b7d86;font-size:12px;line-height:1.5;margin-bottom:0}@media(max-width:1000px){.command-grid{grid-template-columns:1fr}}
/* =========================================================
   STYLE 4 · PREMIUM CLINICAL COMMAND CENTER + M4
   ========================================================= */
.global-search{display:flex;align-items:center;width:390px;height:38px;border:1px solid #dce7eb;border-radius:12px;background:#f9fcfd;padding:0 5px 0 11px;box-sizing:border-box}.global-search span{color:#8aa0aa;font-size:17px}.global-search input{border:0;outline:0;background:transparent;flex:1;padding:0 9px;font:inherit;font-size:12px;color:#17324d}.search-btn{background:#0c9f8a;color:#fff;border:0;border-radius:9px;padding:8px 12px;font-size:11px}.icon-btn{position:relative;width:38px;height:38px;padding:0;border-radius:11px;background:#fff}.alert-badge{position:absolute;right:-4px;top:-5px;background:#dc5a5a;color:#fff;border-radius:999px;padding:2px 6px;font-size:9px}.care-metric{border-left:3px solid #0c9f8a}.care-hero{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:28px 30px;border:1px solid #dcebea;border-radius:22px;background:linear-gradient(135deg,#effbf8,#f8fbff);margin-bottom:18px}.care-hero h2{margin:8px 0;font-size:30px;color:#17324d}.care-hero p{margin:0;max-width:780px;color:#667983;line-height:1.55}.care-hero-stat{min-width:150px;text-align:center;background:#fff;border:1px solid #dcebe8;border-radius:18px;padding:17px}.care-hero-stat b{display:block;font-size:31px;color:#087e6c}.care-hero-stat span{font-size:11px;color:#71828a}.care-toolbar{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-bottom:18px}.care-toolbar label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;color:#526975}.care-toolbar select{min-width:320px;padding:11px 12px;border:1px solid #d9e5eb;border-radius:10px;background:#fff;color:#17324d}.care-actions{display:flex;gap:8px;flex-wrap:wrap}.care-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.care-card{background:#fff;border:1px solid #e0eaed;border-radius:18px;padding:20px;box-shadow:0 8px 24px rgba(12,50,65,.05)}.care-card-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.priority,.category{display:inline-block;font-size:9px;font-weight:900;border-radius:999px;padding:5px 8px;margin-right:6px}.priority.low{background:#e6f7f1;color:#087e6c}.priority.medium{background:#fff2d9;color:#986500}.priority.high{background:#ffe4e4;color:#b32828}.category{background:#eef4f6;color:#60757f}.care-card h3{font-size:18px;margin:15px 0 8px}.care-goal{color:#657781;min-height:42px;line-height:1.45}.progress-row,.care-meta{display:flex;justify-content:space-between;font-size:11px;color:#6d7e87}.progress-row b,.care-meta b{color:#17324d}.progress-track{height:8px;background:#e8f0f1;border-radius:999px;overflow:hidden;margin:7px 0 12px}.progress-track span{display:block;height:100%;background:#0c9f8a;border-radius:999px}.care-meta{padding:10px 0;border-top:1px solid #edf2f3;border-bottom:1px solid #edf2f3}.care-actions-list{display:flex;gap:7px;margin-top:12px}.care-actions-list button{font-size:11px}.danger-btn{color:#b32828}.action-list{margin-top:14px;font-size:11px;color:#5f727c}.action-list ol{margin:8px 0 0;padding-left:19px}.action-list li{margin:5px 0;line-height:1.35}.care-empty{text-align:center;padding:45px 25px}.empty-icon{margin:auto;width:46px;height:46px;border-radius:14px;background:#eaf8f5;color:#0c9f8a;display:grid;place-items:center;font-size:22px}.care-empty h3{margin:13px 0 5px}.care-empty p{color:#71818a;max-width:650px;margin:0 auto;line-height:1.5}.care-modal{width:min(760px,92vw);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;box-shadow:0 24px 70px rgba(8,35,54,.25);padding:24px}.care-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.care-form-grid label{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;color:#536b78}.care-form-grid input,.care-form-grid select,.care-form-grid textarea{box-sizing:border-box;width:100%;padding:11px 12px;border:1px solid #d9e5eb;border-radius:9px;background:#fff;color:#17324d;font:inherit;font-weight:500;outline:none}.care-form-grid textarea{resize:vertical}.care-form-grid .full-field{grid-column:1/-1}.care-form-grid input:focus,.care-form-grid select:focus,.care-form-grid textarea:focus{border-color:#0c9f8a;box-shadow:0 0 0 3px #e2f6f2}
@media(max-width:1250px){.global-search{width:300px}.cards{grid-template-columns:repeat(3,1fr)}.care-grid{grid-template-columns:1fr}}
@media(max-width:1000px){.header-actions{gap:7px}.global-search{width:240px}.care-toolbar{align-items:stretch;flex-direction:column}.care-toolbar select{width:100%}}
@media(max-width:700px){header{padding:12px 16px;height:auto;align-items:flex-start}.header-actions{flex-wrap:wrap;justify-content:flex-end}.global-search{order:3;width:100%}.content{padding:18px}.care-hero{flex-direction:column;align-items:flex-start}.care-form-grid{grid-template-columns:1fr}.care-form-grid .full-field{grid-column:auto}}


/* =====================================================
   STYLE 4 · PATIENT-360 CLINICAL COMMAND CENTER
   ===================================================== */
.clinical-app{background:#f4f7f9;color:#18344b;min-height:100vh}.clinical-sidebar{width:258px;background:#09283b;padding:18px 14px 14px;border-right:1px solid #0f3b51}.clinical-logo{padding:8px 10px 24px}.logo-mark{width:42px!important;height:42px!important;border-radius:13px!important;background:#0fb39b!important;box-shadow:0 8px 20px rgba(15,179,155,.22)}.sidebar-label{padding:6px 12px 8px;color:#6f93a3;font-size:9px;font-weight:800;letter-spacing:1.8px}.nav-item{position:relative;display:flex;align-items:center;gap:11px;width:100%;padding:11px 12px!important;margin:3px 0!important;border:1px solid transparent!important;background:transparent!important;color:#a9c0ca!important;border-radius:12px!important;font-size:12px!important}.nav-item:hover{background:#103b51!important;color:#fff!important}.nav-item.active{background:#123f54!important;color:#fff!important;border-color:#1a566a!important;box-shadow:inset 3px 0 #10b29a}.nav-icon{width:18px;text-align:center;color:#83b8c1;font-size:13px}.nav-item.active .nav-icon{color:#56ddc7}.nav-arrow{margin-left:auto;color:#56ddc7;font-size:18px}.sidebar-footer{margin-top:auto;border-top:1px solid #1a4254;padding:15px 4px 2px}.sidebar-user{display:flex;align-items:center;gap:9px;padding:4px 7px 12px}.sidebar-user b{display:block;font-size:11px;color:#e5f2f5}.sidebar-user small{display:block;margin-top:3px;color:#6f929f;font-size:9px}.doctor-avatar-small{width:31px;height:31px;border-radius:10px;background:#d9f5ef;color:#087d6f;display:grid;place-items:center;font-size:10px;font-weight:900}.logout-btn{width:100%!important;background:#0d3044!important;color:#9bb8c3!important;border:1px solid #16465a!important;text-align:center!important}.clinical-main{background:#f4f7f9}.clinical-topbar{min-height:86px;background:#fff;border-bottom:1px solid #e2eaee;display:grid;grid-template-columns:220px 1fr auto;align-items:center;gap:18px;padding:13px 24px}.context-kicker{display:block;color:#8297a3;font-size:8px;font-weight:900;letter-spacing:1.5px}.page-context h1{margin:3px 0 0;font-size:21px;color:#12324a}.milestone-strip{display:flex;justify-content:center;gap:5px}.milestone-strip button{padding:8px 12px;border:1px solid #e0eaed;background:#f8fbfc;border-radius:10px;color:#617986;font-size:10px}.milestone-strip button span{margin-left:4px;font-weight:500}.milestone-strip button.active{background:#e8f8f5;border-color:#bde7df;color:#087b6d}.topbar-actions{display:flex;align-items:center;gap:9px}.clinical-search{display:flex!important;align-items:center;width:260px;height:38px!important;border:1px solid #dce7eb!important;border-radius:11px!important;background:#f9fbfc}.clinical-search input{border:0!important;background:transparent!important;outline:0;width:145px!important;padding:0!important}.search-btn{padding:7px 10px!important;border:0!important;border-radius:8px!important;background:#0eaa91!important;color:#fff!important;font-size:10px!important}.top-icon-btn{position:relative;width:38px;height:38px;padding:0;border-radius:11px;background:#fff;border:1px solid #dce7eb}.alert-badge{position:absolute;right:-4px;top:-6px;background:#e45c59;color:#fff;border-radius:999px;padding:2px 5px;font-size:8px}.system-state{font-size:10px;color:#087b6d;white-space:nowrap}.system-state i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#14aa91;margin-right:4px}.refresh-btn{height:38px;border-radius:11px!important}.patient-context-bar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 28px;background:#fbfdfd;border-bottom:1px solid #e5edef}.selected-patient-chip{display:flex;align-items:center;gap:9px}.selected-patient-chip .avatar{width:34px;height:34px;border-radius:10px;font-size:13px}.selected-patient-chip b{font-size:11px;display:block}.selected-patient-chip small{font-size:9px;color:#82939c}.context-actions{display:flex;gap:7px}.context-actions button{font-size:10px;padding:7px 10px}.content{padding:24px 28px!important;max-width:1600px;margin:auto;width:100%}.hero,.section-hero,.clinical-page-hero,.monitor-hero,.care-hero{border-radius:20px!important;border:1px solid #dcebea!important;background:linear-gradient(135deg,#eefaf7,#f8fbfd)!important;color:#17344b!important;box-shadow:0 10px 30px rgba(28,65,80,.05)}.hero{padding:26px 30px!important}.hero h2,.clinical-page-hero h2,.monitor-hero h2,.care-hero h2{color:#14364d!important}.hero p,.clinical-page-hero p,.monitor-hero p,.care-hero p{color:#637883!important}.hero-icon{color:#0aa58d!important;opacity:.16!important}.panel{border:1px solid #e0eaed!important;border-radius:16px!important;box-shadow:0 8px 24px rgba(28,65,80,.045);background:#fff}.metric{border:1px solid #e0eaed!important;border-radius:15px!important;box-shadow:0 7px 18px rgba(28,65,80,.04)}.metric b{color:#15384f}.metric.warn b{color:#c47708}.command-grid{gap:18px}.patient-quick{border:1px solid #e5edef!important;border-radius:12px!important;background:#fbfdfd!important}.patient-quick:hover{background:#f0faf8!important;border-color:#bfe4dc!important}.command-status,.entry-status{font-size:9px;color:#087d6e;background:#e8f8f5;border-radius:999px;padding:5px 8px}.table{border-radius:16px}.table table th{color:#78909b;font-size:9px;letter-spacing:.5px;text-transform:uppercase}.toolbar input,.form-grid input,.form-grid select,.care-toolbar select{border:1px solid #dce7eb!important;border-radius:10px!important;background:#fbfdfd}.primary{background:#0ca88f!important;border-radius:10px!important}.danger-btn{border-radius:9px!important}.section-hero{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 26px;margin-bottom:18px}.hero-stat{min-width:190px;padding:15px 18px;border-radius:14px;background:#fff;border:1px solid #dcebea}.hero-stat span{display:block;font-size:9px;color:#7c909a;text-transform:uppercase;letter-spacing:1px}.hero-stat b{display:block;margin-top:5px;font-size:15px}.vitals-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.65fr);gap:18px}.vital-entry-card{padding:22px}.card-kicker{display:block;color:#0a9581;font-size:8px;font-weight:900;letter-spacing:1.5px;margin-bottom:4px}.vital-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:18px}.field{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:800;color:#315166}.field span{font-weight:600;color:#80939e}.field input,.field select{width:100%;height:42px;padding:0 12px;border:1px solid #dce7eb;border-radius:10px;background:#fbfdfd;outline:0;color:#18364c}.field input:focus,.field select:focus{border-color:#77cfc0;box-shadow:0 0 0 3px #e7f8f4}.field small{font-size:9px;color:#8a9ba4;font-weight:500}.field-wide{grid-column:1/-1}.vital-form-footer{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-top:18px;padding-top:16px;border-top:1px solid #e9eff1}.demo-note{display:flex;flex-direction:column;gap:3px;max-width:55%;font-size:9px;color:#7a8d97}.demo-note b{font-size:10px;color:#38586b}.form-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.demo-critical-btn{border-color:#efc9c6!important;color:#ad3b32!important;background:#fff7f6!important}.vital-guide-card{padding:22px}.vital-guide-card h3{margin:3px 0 20px}.vital-flow-step{display:flex;gap:11px;padding:13px 0;border-bottom:1px solid #edf2f3}.vital-flow-step>span{width:26px;height:26px;border-radius:8px;background:#e9f8f5;color:#0b8d79;display:grid;place-items:center;font-size:9px;font-weight:900}.vital-flow-step b{display:block;font-size:11px}.vital-flow-step small{display:block;color:#7f929c;font-size:9px;margin-top:3px}.guide-link{margin-top:16px;width:100%;background:#f0faf8!important;color:#087b6d!important;border-color:#ccebe5!important}.recent-vitals-card{margin-top:18px}.recent-vital-row{display:grid;grid-template-columns:1.2fr repeat(5,1fr);gap:10px;padding:11px 0;border-bottom:1px solid #edf1f3;font-size:10px;color:#5e7480}.recent-vital-row b{color:#17384e}.monitor-grid{gap:18px}.monitor-hero{padding:24px 26px!important}.vital-grid{grid-template-columns:repeat(5,1fr)!important}.live-vital{min-height:125px}.trend-tabs button.active{background:#e8f8f5!important;color:#087d6e!important;border-color:#bde7df!important}.care-hero{padding:24px 26px!important}.care-toolbar{border-radius:15px!important}.care-card{border-radius:16px!important;box-shadow:0 8px 22px rgba(28,65,80,.045)!important}.modal{backdrop-filter:blur(5px)}
@media(max-width:1200px){.clinical-topbar{grid-template-columns:180px 1fr}.topbar-actions{grid-column:1/-1;justify-content:flex-end}.milestone-strip{justify-content:flex-start}.vitals-layout{grid-template-columns:1fr}.vital-grid{grid-template-columns:repeat(3,1fr)!important}}
@media(max-width:800px){.clinical-sidebar{width:72px}.clinical-logo>div,.sidebar-label,.nav-item>span:not(.nav-icon):not(.nav-arrow),.sidebar-user>div:not(.doctor-avatar-small),.logout-btn span{display:none}.clinical-topbar{display:block;padding:12px 15px}.milestone-strip{overflow:auto;margin:10px 0}.topbar-actions{justify-content:stretch;flex-wrap:wrap}.clinical-search{width:100%}.patient-context-bar{padding:9px 15px;flex-wrap:wrap}.content{padding:16px!important}.vital-form-grid{grid-template-columns:1fr}.field-wide{grid-column:auto}.vital-form-footer{align-items:flex-start;flex-direction:column}.demo-note{max-width:100%}.recent-vital-row{grid-template-columns:1fr 1fr}.vital-grid{grid-template-columns:repeat(2,1fr)!important}}
@media(max-width:520px){.clinical-sidebar{width:60px}.milestone-strip button span{display:none}.vital-grid{grid-template-columns:1fr!important}.form-actions{width:100%}.form-actions button{flex:1}.context-actions{width:100%;overflow:auto}.system-state{display:none}}




/* ============================================================
   MEDISPHERE — STYLE 4 EXACT DIRECTION
   Patient 360 Focused / Clean Clinical Workspace
   UI ONLY: existing Angular/API logic remains unchanged.
   ============================================================ */

:host{
  --s4-bg:#f5f8fa;
  --s4-card:#ffffff;
  --s4-border:#e3eaee;
  --s4-text:#173b52;
  --s4-muted:#7b8e99;
  --s4-teal:#0db09a;
  --s4-teal-dark:#078b79;
  --s4-teal-soft:#e7f8f4;
  --s4-blue:#2475d8;
  --s4-red:#e45858;
  --s4-amber:#d99a26;
  font-family:Inter,"Segoe UI",Arial,sans-serif !important;
  color:var(--s4-text) !important;
  background:var(--s4-bg) !important;
}

/* ---------- APPLICATION SHELL ---------- */

.app,
.clinical-app{
  min-height:100vh !important;
  display:flex !important;
  background:var(--s4-bg) !important;
}

/* ---------- LEFT SIDEBAR: STYLE 4 IS LIGHT ---------- */

.clinical-sidebar,
aside{
  width:224px !important;
  min-width:224px !important;
  background:#fff !important;
  color:#496272 !important;
  border-right:1px solid #e2e9ed !important;
  padding:18px 12px !important;
  box-sizing:border-box !important;
  box-shadow:2px 0 12px rgba(22,52,69,.025) !important;
}

.clinical-logo,
.logo{
  padding:6px 9px 23px !important;
  display:flex !important;
  align-items:center !important;
  gap:10px !important;
}

.logo-mark,
.logo>span{
  width:36px !important;
  height:36px !important;
  border-radius:11px !important;
  background:linear-gradient(135deg,#11b6a0,#087d9a) !important;
  color:#fff !important;
  display:grid !important;
  place-items:center !important;
  font-size:18px !important;
  box-shadow:none !important;
}

.logo b{
  display:block !important;
  color:#173b52 !important;
  font-size:15px !important;
  font-weight:800 !important;
}

.logo small{
  display:block !important;
  margin-top:2px !important;
  color:#91a0a8 !important;
  font-size:8px !important;
}

.sidebar-label{
  margin:4px 10px 7px !important;
  color:#a2afb6 !important;
  font-size:8px !important;
  font-weight:800 !important;
  letter-spacing:1.3px !important;
}

.clinical-sidebar .nav-item,
aside button{
  width:100% !important;
  min-height:35px !important;
  padding:8px 10px !important;
  margin:2px 0 !important;
  border:1px solid transparent !important;
  border-radius:9px !important;
  background:transparent !important;
  color:#637883 !important;
  font-size:10px !important;
  font-weight:600 !important;
  text-align:left !important;
  box-shadow:none !important;
}

.clinical-sidebar .nav-item:hover,
aside button:hover{
  background:#f1f8f7 !important;
  color:#147d70 !important;
  transform:none !important;
}

.clinical-sidebar .nav-item.active,
aside button.active{
  background:#e7f7f4 !important;
  color:#087f71 !important;
  border-color:#c8ebe5 !important;
  font-weight:800 !important;
  box-shadow:none !important;
}

.nav-icon{
  display:inline-flex !important;
  width:20px !important;
  color:#71858f !important;
}

.nav-item.active .nav-icon{
  color:#0ca28e !important;
}

.nav-arrow{
  float:right !important;
  color:#10a38f !important;
}

.sidebar-footer{
  margin-top:auto !important;
  padding-top:12px !important;
  border-top:1px solid #e8edef !important;
}

.sidebar-user{
  padding:7px 8px !important;
  display:flex !important;
  align-items:center !important;
  gap:8px !important;
}

.doctor-avatar-small{
  width:30px !important;
  height:30px !important;
  border-radius:50% !important;
  background:#e8f4f2 !important;
  color:#078474 !important;
  display:grid !important;
  place-items:center !important;
  font-size:11px !important;
  font-weight:800 !important;
}

.sidebar-user b{
  display:block !important;
  color:#29495a !important;
  font-size:10px !important;
}

.sidebar-user small{
  display:block !important;
  color:#9aa8af !important;
  font-size:8px !important;
  margin-top:2px !important;
}

.logout-btn{
  color:#84959e !important;
  font-size:9px !important;
}

/* ---------- MAIN / TOP BAR ---------- */

.clinical-main,
main{
  flex:1 !important;
  min-width:0 !important;
  background:var(--s4-bg) !important;
}

.clinical-topbar{
  min-height:72px !important;
  padding:12px 22px !important;
  background:#fff !important;
  border-bottom:1px solid #e4eaed !important;
  display:grid !important;
  grid-template-columns:1fr auto 1fr !important;
  align-items:center !important;
  gap:18px !important;
  box-sizing:border-box !important;
}

.page-context .context-kicker{
  display:block !important;
  color:#99a7ad !important;
  font-size:8px !important;
  font-weight:800 !important;
  letter-spacing:.9px !important;
  margin-bottom:3px !important;
}

.page-context h1{
  margin:0 !important;
  color:#173b52 !important;
  font-size:19px !important;
  font-weight:800 !important;
}

.milestone-strip{
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;
  gap:4px !important;
}

.milestone-strip button{
  border:0 !important;
  border-radius:8px !important;
  background:transparent !important;
  color:#7d8e97 !important;
  padding:7px 9px !important;
  font-size:9px !important;
  font-weight:700 !important;
}

.milestone-strip button span{
  color:#a0adb3 !important;
  font-weight:500 !important;
}

.milestone-strip button.active{
  background:#e8f8f4 !important;
  color:#087f71 !important;
}

.milestone-strip button.active span{
  color:#159787 !important;
}

.topbar-actions{
  display:flex !important;
  justify-content:flex-end !important;
  align-items:center !important;
  gap:7px !important;
}

.global-search.clinical-search{
  width:240px !important;
  height:35px !important;
  background:#f7fafb !important;
  border:1px solid #dfe8eb !important;
  border-radius:9px !important;
  padding:0 4px 0 10px !important;
  box-sizing:border-box !important;
}

.clinical-search input{
  border:0 !important;
  outline:0 !important;
  background:transparent !important;
  color:#28495a !important;
  font-size:9px !important;
}

.search-btn{
  border:0 !important;
  border-radius:7px !important;
  background:#0ca993 !important;
  color:#fff !important;
  padding:7px 10px !important;
  font-size:9px !important;
}

.top-icon-btn,
.refresh-btn{
  min-height:34px !important;
  border:1px solid #dfe7ea !important;
  background:#fff !important;
  color:#536d7b !important;
  border-radius:8px !important;
  font-size:9px !important;
}

.alert-badge{
  background:#e85b5b !important;
  color:#fff !important;
  border-radius:999px !important;
  padding:2px 5px !important;
  font-size:7px !important;
}

.system-state{
  color:#657d88 !important;
  font-size:9px !important;
  white-space:nowrap !important;
}

.system-state i{
  display:inline-block !important;
  width:6px !important;
  height:6px !important;
  border-radius:50% !important;
  background:#15b39d !important;
  margin-right:4px !important;
}

/* ---------- PATIENT CONTEXT ---------- */

.patient-context-bar{
  min-height:55px !important;
  padding:8px 24px !important;
  background:#fff !important;
  border-bottom:1px solid #e5ecef !important;
  display:flex !important;
  justify-content:space-between !important;
  align-items:center !important;
}

.selected-patient-chip{
  display:flex !important;
  align-items:center !important;
  gap:9px !important;
}

.selected-patient-chip .avatar{
  width:34px !important;
  height:34px !important;
  border-radius:50% !important;
  display:grid !important;
  place-items:center !important;
  background:#e5f5f3 !important;
  color:#087e70 !important;
  font-size:11px !important;
  font-weight:800 !important;
}

.selected-patient-chip b{
  display:block !important;
  color:#27495b !important;
  font-size:10px !important;
}

.selected-patient-chip small{
  display:block !important;
  margin-top:2px !important;
  color:#8d9ba2 !important;
  font-size:8px !important;
}

.context-actions{
  display:flex !important;
  gap:5px !important;
}

.context-actions button{
  border:1px solid #dce7ea !important;
  background:#fff !important;
  color:#607682 !important;
  border-radius:7px !important;
  padding:7px 9px !important;
  font-size:8px !important;
}

.context-actions button:hover{
  color:#087f71 !important;
  border-color:#a8ddd4 !important;
  background:#f4fbfa !important;
}

/* ---------- CONTENT ---------- */

.content{
  padding:20px 24px 28px !important;
  max-width:1500px !important;
  margin:0 auto !important;
}

/* ---------- HERO / PATIENT 360 ---------- */

.hero,
.section-hero,
.care-hero,
.monitor-hero,
.appointment-hero{
  background:#fff !important;
  border:1px solid var(--s4-border) !important;
  border-radius:15px !important;
  box-shadow:0 5px 18px rgba(27,62,78,.035) !important;
  color:var(--s4-text) !important;
}

.hero{
  padding:22px 24px !important;
  display:flex !important;
  justify-content:space-between !important;
  align-items:center !important;
  background:linear-gradient(120deg,#ffffff 0%,#f1faf8 100%) !important;
}

.hero h2,
.section-hero h2,
.care-hero h2,
.monitor-hero h2,
.appointment-hero h2{
  color:#173b52 !important;
  font-size:23px !important;
  font-weight:800 !important;
  margin:5px 0 7px !important;
}

.hero p,
.section-hero p,
.care-hero p,
.monitor-hero p,
.appointment-hero p{
  color:#7a8c95 !important;
  font-size:10px !important;
  line-height:1.55 !important;
}

.eyebrow{
  color:#0c9d89 !important;
  font-size:8px !important;
  font-weight:900 !important;
  letter-spacing:1.2px !important;
}

.hero-icon{
  width:68px !important;
  height:68px !important;
  display:grid !important;
  place-items:center !important;
  border-radius:18px !important;
  background:#e5f7f3 !important;
  color:#0ba38f !important;
}

/* ---------- METRICS ---------- */

.cards{
  display:grid !important;
  grid-template-columns:repeat(4,minmax(0,1fr)) !important;
  gap:11px !important;
  margin:14px 0 !important;
}

.metric{
  background:#fff !important;
  border:1px solid #e1e9ec !important;
  border-radius:13px !important;
  padding:15px 16px !important;
  box-shadow:0 4px 14px rgba(27,62,78,.03) !important;
}

.metric:hover{
  border-color:#c8e5df !important;
  transform:translateY(-1px) !important;
}

.metric span{
  display:block !important;
  color:#7d9099 !important;
  font-size:8px !important;
  font-weight:800 !important;
  text-transform:uppercase !important;
  letter-spacing:.55px !important;
}

.metric b{
  display:block !important;
  margin-top:5px !important;
  color:#173b52 !important;
  font-size:22px !important;
  font-weight:800 !important;
}

.metric small{
  display:block !important;
  margin-top:3px !important;
  color:#9aa7ad !important;
  font-size:8px !important;
}

.metric.warn{
  border-top:2px solid #e7b34d !important;
}

.metric.danger{
  border-top:2px solid #e35d5d !important;
}

.metric.care-metric{
  border-top:2px solid #876be2 !important;
}

/* ---------- PANELS ---------- */

.panel{
  background:#fff !important;
  border:1px solid #e0e9ec !important;
  border-radius:14px !important;
  box-shadow:0 4px 15px rgba(27,62,78,.028) !important;
  color:#284a5b !important;
}

.panel h3{
  color:#1c4054 !important;
  font-size:13px !important;
  font-weight:800 !important;
}

.panel h4{
  color:#35596b !important;
  font-size:10px !important;
}

.panel p{
  color:#81919a !important;
  font-size:9px !important;
}

.panel-head{
  display:flex !important;
  justify-content:space-between !important;
  align-items:center !important;
  gap:10px !important;
}

.panel-head button{
  border:1px solid #dce7ea !important;
  background:#fff !important;
  color:#617986 !important;
  border-radius:7px !important;
  padding:6px 9px !important;
  font-size:8px !important;
}

.panel-head button.primary,
.primary{
  background:#0ca992 !important;
  color:#fff !important;
  border-color:#0ca992 !important;
}

/* ---------- PATIENT 360 PROFILE ---------- */

.profile{
  background:#fff !important;
  border:1px solid #e0e9ec !important;
  border-radius:15px !important;
  padding:16px 18px !important;
  display:flex !important;
  align-items:center !important;
  gap:12px !important;
  box-shadow:0 5px 18px rgba(27,62,78,.035) !important;
}

.profile .avatar{
  width:50px !important;
  height:50px !important;
  border-radius:50% !important;
  display:grid !important;
  place-items:center !important;
  background:#e5f5f3 !important;
  color:#087f71 !important;
  font-size:17px !important;
  font-weight:800 !important;
}

.profile-info h2{
  margin:0 !important;
  color:#183d52 !important;
  font-size:16px !important;
}

.profile-info p{
  color:#82929b !important;
  font-size:9px !important;
}

.profile .primary{
  margin-left:auto !important;
}

/* Patient 360 tabs if present */
.patient-tabs{
  display:flex !important;
  gap:3px !important;
  padding:8px 0 !important;
  border-bottom:1px solid #e5ecef !important;
}

.patient-tabs button{
  border:0 !important;
  background:transparent !important;
  color:#758993 !important;
  padding:7px 10px !important;
  border-radius:7px !important;
  font-size:8px !important;
}

.patient-tabs button.active{
  color:#087f71 !important;
  background:#e9f8f5 !important;
  font-weight:800 !important;
}

/* ---------- DIGITAL TWIN ---------- */

.twin-panel{
  margin-top:12px !important;
  padding:18px !important;
}

.twin-header{
  display:flex !important;
  justify-content:space-between !important;
  align-items:center !important;
}

.twin-header h3{
  margin:0 !important;
}

.twin-meta{
  color:#93a0a7 !important;
  font-size:8px !important;
}

.twin-badge{
  background:#edf8f6 !important;
  color:#0a8f7e !important;
  border:1px solid #cde9e4 !important;
  border-radius:999px !important;
  padding:5px 8px !important;
  font-size:7px !important;
  font-weight:800 !important;
}

.twin-grid{
  display:grid !important;
  grid-template-columns:repeat(4,1fr) !important;
  gap:7px !important;
  margin-top:13px !important;
}

.twin-grid>div{
  background:#f8fbfc !important;
  border:1px solid #e6edef !important;
  border-radius:9px !important;
  padding:10px !important;
}

.twin-grid b{
  display:block !important;
  color:#456474 !important;
  font-size:8px !important;
}

.twin-grid span{
  display:block !important;
  margin-top:4px !important;
  color:#82939c !important;
  font-size:8px !important;
}

/* ---------- VITAL CARDS ---------- */

.vital-grid{
  display:grid !important;
  grid-template-columns:repeat(5,minmax(0,1fr)) !important;
  gap:9px !important;
}

.live-vital{
  position:relative !important;
  background:#fff !important;
  border:1px solid #e0e9ec !important;
  border-radius:12px !important;
  padding:13px !important;
}

.live-vital span{
  display:block !important;
  color:#80929b !important;
  font-size:8px !important;
  font-weight:700 !important;
}

.live-vital b{
  display:block !important;
  margin-top:6px !important;
  color:#183d52 !important;
  font-size:20px !important;
}

.live-vital small{
  color:#97a5ab !important;
  font-size:8px !important;
}

.live-vital em{
  display:inline-block !important;
  margin-top:6px !important;
  padding:3px 6px !important;
  border-radius:999px !important;
  font-style:normal !important;
  font-size:7px !important;
  font-weight:800 !important;
}

.live-vital em.normal{
  background:#e4f7f2 !important;
  color:#087e6c !important;
}

.live-vital em.warning{
  background:#fff3d9 !important;
  color:#a36a00 !important;
}

.live-vital em.critical{
  background:#ffe5e5 !important;
  color:#b72d2d !important;
}

/* ---------- VITAL ENTRY: LIGHT STYLE 4 ---------- */

.vitals-layout{
  display:grid !important;
  grid-template-columns:minmax(0,1.55fr) minmax(285px,.7fr) !important;
  gap:14px !important;
  margin-top:14px !important;
}

.vital-entry-card{
  padding:18px !important;
  border-top:3px solid #0ca993 !important;
}

.vital-form-grid{
  display:grid !important;
  grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  gap:11px !important;
  margin-top:14px !important;
}

.field{
  display:flex !important;
  flex-direction:column !important;
  gap:5px !important;
  color:#3b5c6c !important;
  font-size:9px !important;
  font-weight:800 !important;
}

.field span{
  color:#94a1a8 !important;
  font-weight:600 !important;
}

.field small{
  color:#9aa8ae !important;
  font-size:7px !important;
  font-weight:500 !important;
}

.field input,
.field select,
.vital-form-grid input,
.vital-form-grid select{
  width:100% !important;
  min-height:38px !important;
  padding:0 10px !important;
  box-sizing:border-box !important;
  border:1px solid #dce6e9 !important;
  border-radius:8px !important;
  background:#fbfcfd !important;
  color:#23475a !important;
  font-size:10px !important;
  outline:none !important;
}

.field input:focus,
.field select:focus{
  border-color:#70c9bb !important;
  box-shadow:0 0 0 3px #eaf8f5 !important;
}

.field-wide{
  grid-column:1/-1 !important;
}

.vital-form-footer{
  margin-top:15px !important;
  padding-top:13px !important;
  border-top:1px solid #e8eef0 !important;
}

.demo-note{
  display:flex !important;
  gap:8px !important;
  align-items:center !important;
  margin-bottom:10px !important;
  padding:9px 10px !important;
  border-radius:9px !important;
  background:#f7fafb !important;
  border:1px solid #e6edef !important;
}

.demo-note b{
  color:#556f7d !important;
  font-size:8px !important;
  white-space:nowrap !important;
}

.demo-note span{
  color:#8b9aa1 !important;
  font-size:8px !important;
}

.form-actions{
  display:flex !important;
  justify-content:flex-end !important;
  gap:6px !important;
}

.form-actions button{
  min-height:34px !important;
  padding:7px 11px !important;
  border-radius:7px !important;
  border:1px solid #dce6e9 !important;
  background:#fff !important;
  color:#627984 !important;
  font-size:8px !important;
}

.form-actions .demo-critical-btn{
  background:#fff6e8 !important;
  border-color:#efd09a !important;
  color:#9b6700 !important;
}

.form-actions .primary{
  color:#fff !important;
  background:#0ca993 !important;
  border-color:#0ca993 !important;
}

.vital-guide-card{
  padding:18px !important;
}

.card-kicker{
  color:#0b9c88 !important;
  font-size:8px !important;
  font-weight:900 !important;
  letter-spacing:1px !important;
}

.vital-flow-step{
  display:flex !important;
  gap:9px !important;
  padding:11px 0 !important;
  border-bottom:1px solid #edf1f3 !important;
}

.vital-flow-step>span{
  width:24px !important;
  height:24px !important;
  border-radius:7px !important;
  display:grid !important;
  place-items:center !important;
  background:#e8f8f5 !important;
  color:#0a907e !important;
  font-size:7px !important;
  font-weight:900 !important;
  flex:none !important;
}

.vital-flow-step b{
  display:block !important;
  color:#3c5c6c !important;
  font-size:9px !important;
}

.vital-flow-step small{
  display:block !important;
  margin-top:2px !important;
  color:#8c9ba2 !important;
  font-size:7px !important;
}

.guide-link{
  width:100% !important;
  margin-top:12px !important;
  padding:8px !important;
  border:1px solid #bfe4dd !important;
  border-radius:8px !important;
  background:#eefaf8 !important;
  color:#087f71 !important;
  font-size:8px !important;
}

/* ---------- TABLES / LISTS ---------- */

.table{
  overflow:auto !important;
}

table{
  width:100% !important;
  border-collapse:collapse !important;
}

th{
  background:#f8fafb !important;
  color:#8a9aa2 !important;
  padding:10px !important;
  font-size:7px !important;
  text-transform:uppercase !important;
  letter-spacing:.7px !important;
  text-align:left !important;
}

td{
  padding:10px !important;
  border-bottom:1px solid #edf1f3 !important;
  color:#526f7d !important;
  font-size:9px !important;
}

tr:hover td{
  background:#fbfdfd !important;
}

.row{
  display:flex !important;
  justify-content:space-between !important;
  gap:10px !important;
  padding:9px 0 !important;
  border-bottom:1px solid #edf1f3 !important;
  color:#71858f !important;
  font-size:8px !important;
}

.row b{
  color:#35576a !important;
}

/* ---------- MONITORING ---------- */

.monitor-hero,
.care-hero,
.appointment-hero{
  padding:20px 22px !important;
  display:flex !important;
  justify-content:space-between !important;
  align-items:center !important;
}

.monitor-live{
  color:#0b9a87 !important;
  background:#e9f8f5 !important;
  border:1px solid #ccebe5 !important;
  border-radius:999px !important;
  padding:7px 10px !important;
  font-size:8px !important;
  font-weight:800 !important;
}

.pulse-dot{
  display:inline-block !important;
  width:6px !important;
  height:6px !important;
  border-radius:50% !important;
  background:#13ae97 !important;
  margin-right:4px !important;
}

.monitor-grid,
.command-grid{
  display:grid !important;
  grid-template-columns:1fr 1fr !important;
  gap:14px !important;
}

.monitor-patient{
  display:flex !important;
  align-items:center !important;
  gap:8px !important;
  padding:10px !important;
  border-bottom:1px solid #edf1f3 !important;
  cursor:pointer !important;
}

.monitor-patient:hover,
.monitor-patient.selected-monitor{
  background:#f2faf8 !important;
}

.status-dot{
  width:7px !important;
  height:7px !important;
  border-radius:50% !important;
  background:#13aa94 !important;
}

.status-dot.critical{
  background:#e45a5a !important;
}

.status-dot.warning{
  background:#dda02d !important;
}

.monitor-patient-main{
  flex:1 !important;
}

.monitor-patient-main b{
  display:block !important;
  color:#35576a !important;
  font-size:9px !important;
}

.monitor-patient-main small{
  color:#99a6ac !important;
  font-size:7px !important;
}

.status-pill{
  border-radius:999px !important;
  padding:4px 7px !important;
  background:#edf7f5 !important;
  color:#0a8a78 !important;
  font-size:7px !important;
  font-weight:800 !important;
}

.status-pill.critical{
  background:#ffe7e7 !important;
  color:#b52c2c !important;
}

.status-pill.warning{
  background:#fff2d9 !important;
  color:#9b6800 !important;
}

/* ---------- AI / CARE PLAN ---------- */

.risk{
  border-left:3px solid #16aa96 !important;
}

.care-grid{
  display:grid !important;
  grid-template-columns:repeat(3,minmax(0,1fr)) !important;
  gap:12px !important;
  margin-top:13px !important;
}

.care-card{
  background:#fff !important;
  border:1px solid #e0e9ec !important;
  border-radius:13px !important;
  padding:15px !important;
  box-shadow:0 4px 14px rgba(27,62,78,.03) !important;
}

.care-card h3{
  color:#24485b !important;
  font-size:12px !important;
}

.progress-track{
  height:5px !important;
  background:#edf2f3 !important;
  border-radius:99px !important;
  overflow:hidden !important;
}

.progress-track span{
  display:block !important;
  height:100% !important;
  background:#13b399 !important;
  border-radius:99px !important;
}

/* ---------- FORMS / MODALS ---------- */

input,select,textarea{
  font-family:inherit !important;
}

.modal-backdrop{
  background:rgba(31,54,67,.22) !important;
  backdrop-filter:blur(3px) !important;
}

.appointment-modal,
.care-modal,
.patient-modal{
  background:#fff !important;
  border:1px solid #dfe8eb !important;
  border-radius:16px !important;
  box-shadow:0 20px 60px rgba(20,49,64,.18) !important;
}

.modal-head{
  border-bottom:1px solid #e8eef0 !important;
}

.close-btn{
  background:#f5f8f9 !important;
  color:#6b808a !important;
  border:0 !important;
  border-radius:8px !important;
}

label{
  color:#526d7b !important;
  font-size:9px !important;
  font-weight:700 !important;
}

label input,
label select,
label textarea,
.appointment-form-grid input,
.appointment-form-grid select,
.care-form-grid input,
.care-form-grid select,
.care-form-grid textarea,
.patient-form-grid input,
.patient-form-grid select{
  border:1px solid #dce6e9 !important;
  background:#fbfcfd !important;
  color:#26495b !important;
  border-radius:8px !important;
  min-height:37px !important;
}

/* ---------- SMALL SCREEN ---------- */

@media(max-width:1200px){
  .clinical-topbar{
    grid-template-columns:1fr !important;
    gap:7px !important;
  }

  .milestone-strip{
    justify-content:flex-start !important;
    overflow:auto !important;
  }

  .topbar-actions{
    justify-content:flex-start !important;
    flex-wrap:wrap !important;
  }

  .cards{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  .vital-grid{
    grid-template-columns:repeat(2,minmax(0,1fr)) !important;
  }

  .vitals-layout,
  .monitor-grid,
  .command-grid{
    grid-template-columns:1fr !important;
  }

  .care-grid{
    grid-template-columns:1fr 1fr !important;
  }
}

@media(max-width:800px){
  .clinical-sidebar,
  aside{
    width:68px !important;
    min-width:68px !important;
  }

  .logo div,
  .sidebar-label,
  .clinical-sidebar .nav-item span:not(.nav-icon),
  aside button span:not(.nav-icon),
  .sidebar-user>div:not(.doctor-avatar-small){
    display:none !important;
  }

  .content{
    padding:14px !important;
  }

  .cards,
  .vital-grid,
  .vital-form-grid,
  .care-grid{
    grid-template-columns:1fr !important;
  }

  .field-wide{
    grid-column:auto !important;
  }
}



/* M4 CARE PLAN — STYLE 4 */
.careplans-page .care-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:16px 0}.care-summary-card{background:#fff;border:1px solid #e1ebee;border-radius:15px;padding:17px;box-shadow:0 6px 18px rgba(20,60,80,.04)}.care-summary-card span{display:block;color:#80939d;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px}.care-summary-card b{display:block;color:#163c52;font-size:25px;margin:5px 0}.care-summary-card small{color:#93a1a8;font-size:9px}.care-title-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.care-title-row h3{margin:5px 0 2px}.care-title-row small{color:#8a9aa2;font-size:9px}.review-badge{padding:5px 8px;border-radius:999px;font-size:9px;font-weight:800;white-space:nowrap}.review-ok{background:#e8f7f3;color:#087d6d}.review-soon{background:#fff3da;color:#946100}.review-overdue{background:#ffe5e5;color:#b32727}.review-complete{background:#edf1f3;color:#657781}.review-none{background:#f1f4f5;color:#75868e}.care-goal-box{margin:13px 0;padding:12px;border-radius:11px;background:#f7fbfb;border:1px solid #e5eeee}.care-goal-box span{font-size:8px;color:#0a9985;font-weight:900;letter-spacing:1px}.care-goal-box p{margin:5px 0 0;color:#526c79;font-size:10px;line-height:1.5}.progress-quick{display:flex;gap:5px;margin-top:7px}.progress-quick button,.care-quick-actions button{border:1px solid #dbe7ea;background:#fff;color:#55717e;border-radius:7px;padding:5px 8px;font-size:9px}.care-metrics-row{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:13px 0}.care-metrics-row div{background:#f8fafb;border:1px solid #e6edef;border-radius:9px;padding:9px}.care-metrics-row span{display:block;color:#8a9aa2;font-size:8px}.care-metrics-row b{display:block;color:#244a5d;font-size:11px;margin-top:3px}.treatment-actions-box{border:1px solid #e0ebed;border-radius:12px;padding:12px;background:#fff}.treatment-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.treatment-head b{display:block;color:#284c5d;font-size:11px}.treatment-head small{display:block;color:#8b9aa2;font-size:8px;margin-top:2px}.treatment-head button{border:0;background:#eaf8f5;color:#087d6d;border-radius:7px;padding:6px 9px;font-size:9px}.treatment-action{display:flex!important;align-items:center!important;gap:9px!important;padding:9px 0!important;border-bottom:1px solid #edf2f3!important;color:#486572!important;font-size:10px!important}.treatment-action:last-child{border-bottom:0!important}.treatment-action input{accent-color:#0da58e!important}.done-action{text-decoration:line-through;color:#91a0a7}.no-actions{color:#909fa6;font-size:9px;padding:10px 0}.care-quick-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.care-quick-actions button:disabled{opacity:.45}.care-quick-actions .complete-plan-btn{border-color:#bde3d9;background:#edf9f6;color:#087d6d}.care-card-footer{display:flex;justify-content:flex-end;gap:7px;border-top:1px solid #edf2f3;margin-top:12px;padding-top:10px}.care-card-footer button{border:0;background:transparent;color:#58727e;font-size:9px}.care-card-footer .danger-btn{color:#b33a3a}.care-patient-select{min-width:270px}.care-patient-select select{min-width:270px}@media(max-width:1000px){.careplans-page .care-summary-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){.careplans-page .care-summary-grid{grid-template-columns:1fr}.care-metrics-row{grid-template-columns:1fr}.care-title-row{display:block}.review-badge{display:inline-block;margin-top:6px}}


/* =========================================================
   STYLE 4.5 — VISUAL CLINICAL COMMAND CENTER
   ========================================================= */
:host{--s4-ink:#183b52;--s4-muted:#728894;--s4-bg:#f3f8fa;--s4-card:#ffffff;--s4-line:#dce9ed;--s4-teal:#0aa58f;--s4-teal2:#0c8e7c;--s4-blue:#4a78d4;--s4-purple:#8067d9;display:block;background:var(--s4-bg);}
*{box-sizing:border-box}
.app.clinical-app{background:radial-gradient(circle at 78% 12%,rgba(39,180,163,.09),transparent 26%),linear-gradient(135deg,#f7fbfc,#eef5f7);color:var(--s4-ink);min-height:100vh}
.clinical-sidebar{width:252px!important;min-width:252px!important;background:linear-gradient(180deg,#ffffff 0%,#f7fbfc 100%)!important;color:var(--s4-ink)!important;border-right:1px solid #dce8ec!important;box-shadow:8px 0 30px rgba(32,70,85,.055);position:relative;z-index:5}
.clinical-sidebar:after{content:"";position:absolute;right:-1px;top:90px;width:2px;height:120px;background:linear-gradient(#0aa58f,transparent);opacity:.8}
.clinical-logo{padding:10px 12px 26px!important}
.clinical-logo .logo-mark{background:linear-gradient(135deg,#0bb59d,#2b8fd0)!important;box-shadow:0 10px 24px rgba(10,165,143,.24);animation:logoFloat 4s ease-in-out infinite}
.clinical-logo b{color:#123b52!important;font-size:16px!important}.clinical-logo small{color:#8a9da7!important}
.sidebar-label{color:#93a6ae!important;letter-spacing:1.7px;font-size:9px!important;font-weight:900;margin:8px 12px}
.clinical-sidebar .nav-item{color:#587180!important;background:transparent!important;border:1px solid transparent!important;min-height:42px;margin:3px 7px!important;border-radius:12px!important;position:relative;overflow:hidden;transition:all .22s ease!important}
.clinical-sidebar .nav-item:hover{background:#eef8f6!important;color:#087f70!important;transform:translateX(3px)}
.clinical-sidebar .nav-item.active{background:linear-gradient(90deg,#dff7f2,#edf9f7)!important;color:#087d6d!important;border-color:#c4e9e2!important;box-shadow:0 7px 18px rgba(10,165,143,.08),inset 3px 0 #0aa58f!important}
.clinical-sidebar .nav-item.active:after{content:"";position:absolute;right:10px;top:50%;width:6px;height:6px;border-radius:50%;background:#0aa58f;box-shadow:0 0 0 5px rgba(10,165,143,.10);transform:translateY(-50%);animation:statusPulse 1.8s infinite}
.nav-icon{color:#0b9d88!important}.nav-arrow{color:#0aa58f!important}
.sidebar-footer{border-top:1px solid #e2ecef!important}.sidebar-user{background:#f5fafb;border:1px solid #e2ecef;border-radius:13px;padding:9px!important}.doctor-avatar-small{background:linear-gradient(135deg,#dff8f3,#e3efff)!important;color:#087f70!important}.sidebar-user b{color:#21465a!important}.sidebar-user small{color:#8b9da5!important}
.logout-btn{color:#728995!important}.logout-btn:hover{background:#fff0f0!important;color:#b33c3c!important}
.clinical-main{background:transparent!important}
.clinical-topbar{background:rgba(255,255,255,.88)!important;backdrop-filter:blur(14px);border-bottom:1px solid #dfeaec!important;box-shadow:0 5px 24px rgba(40,75,88,.035);position:sticky;top:0;z-index:4}
.context-kicker,.eyebrow{color:#0a9a85!important;font-weight:900;letter-spacing:1.35px!important;font-size:9px!important}.page-context h1{color:#173d53!important}
.milestone-strip button{background:#f7fbfc!important;border-color:#dce8ec!important;color:#718792!important;border-radius:11px!important;transition:all .2s ease}.milestone-strip button:hover{transform:translateY(-2px);border-color:#a9ddd4!important}.milestone-strip button.active{background:#e4f8f4!important;border-color:#b4e3da!important;color:#087c6c!important;box-shadow:0 5px 14px rgba(10,165,143,.08)}
.clinical-search{background:#f7fafb!important;border-color:#dce8ec!important;box-shadow:inset 0 1px 2px rgba(0,0,0,.02)}.search-btn{background:linear-gradient(135deg,#0aa58f,#087f70)!important;box-shadow:0 5px 14px rgba(10,165,143,.16)}
.top-icon-btn{background:#fff!important;border:1px solid #dce8ec!important;color:#456575!important;border-radius:11px!important;position:relative}.alert-badge{animation:badgePulse 1.7s infinite}.system-state{color:#5f7d88!important}.system-state i{background:#0aa58f!important;box-shadow:0 0 0 5px rgba(10,165,143,.10);animation:statusPulse 1.8s infinite}.refresh-btn{background:#fff!important;border:1px solid #dce8ec!important;color:#486576!important;border-radius:10px!important}
.patient-context-bar{background:rgba(255,255,255,.92)!important;border-bottom:1px solid #e1ebee!important;box-shadow:0 3px 18px rgba(28,65,80,.025)}
.selected-patient-chip .avatar,.avatar{background:linear-gradient(135deg,#dff7f2,#e4efff)!important;color:#087e6d!important;border:1px solid #c9e9e4}
.context-actions button{background:#fff!important;border-color:#d9e6ea!important;color:#476473!important}.context-actions button:hover{border-color:#8fd4c8!important;color:#087f70!important}
.content{animation:pageEnter .42s ease both}
.hero,.care-hero,.monitor-hero,.section-hero{background:linear-gradient(120deg,#ffffff 0%,#eef9f7 55%,#eef5ff 100%)!important;border:1px solid #d8e9e9!important;box-shadow:0 15px 35px rgba(36,76,91,.07)!important;position:relative;overflow:hidden}
.hero:after,.care-hero:after,.monitor-hero:after{content:"";position:absolute;width:230px;height:230px;border-radius:50%;right:-80px;top:-120px;background:radial-gradient(circle,rgba(10,165,143,.15),transparent 65%);animation:orbFloat 7s ease-in-out infinite}
.hero-icon{background:linear-gradient(135deg,#0aa58f,#4778d5)!important;box-shadow:0 14px 30px rgba(10,165,143,.20)!important;animation:heroIconPulse 3s ease-in-out infinite}
.cards{gap:14px!important}.metric{border:1px solid #dce8ec!important;background:rgba(255,255,255,.92)!important;border-radius:16px!important;box-shadow:0 8px 24px rgba(36,76,91,.055)!important;position:relative;overflow:hidden;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}.metric:before{content:"";position:absolute;left:0;top:0;width:100%;height:3px;background:linear-gradient(90deg,#0aa58f,#4a78d4);opacity:.85}.metric:hover{transform:translateY(-4px);box-shadow:0 15px 30px rgba(36,76,91,.09)!important;border-color:#c7e2e2!important}.metric b{color:#163c53!important}.metric span{color:#78909b!important}.metric.warn:before{background:linear-gradient(90deg,#f0ad45,#ef7e57)}.metric.danger:before{background:linear-gradient(90deg,#e75c63,#d73c68)}.care-metric:before{background:linear-gradient(90deg,#8067d9,#4a78d4)}
.panel{border:1px solid #dce8ec!important;background:rgba(255,255,255,.94)!important;border-radius:17px!important;box-shadow:0 8px 25px rgba(36,76,91,.045)!important;transition:box-shadow .2s ease,border-color .2s ease}.panel:hover{border-color:#cfe2e5!important;box-shadow:0 13px 30px rgba(36,76,91,.065)!important}.panel h3{color:#193f55!important}.panel p{color:#78909b!important}
.command-grid{gap:16px!important}.patient-quick{border:1px solid #e3edef!important;background:#fbfdfd!important;border-radius:12px!important;transition:all .2s ease}.patient-quick:hover{transform:translateX(4px);border-color:#bfe2db!important;background:#f1faf8!important}
/* ANALYTICS */
.style4-analytics-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:16px;margin-top:16px}.analytics-panel,.architecture-panel,.registry-panel{overflow:hidden}.analytics-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.analytics-heading h3{margin:3px 0 4px!important;font-size:16px!important}.analytics-heading p{margin:0!important;font-size:10px!important}.analytics-live{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:#e8f8f4;color:#087d6d;font-size:8px;font-weight:900;letter-spacing:.8px;white-space:nowrap}.analytics-live i{width:6px;height:6px;border-radius:50%;background:#0aa58f;box-shadow:0 0 0 4px rgba(10,165,143,.1);animation:statusPulse 1.5s infinite}.bar-chart{display:flex;flex-direction:column;gap:16px}.bar-row{display:grid;gap:7px}.bar-label{display:flex;justify-content:space-between;align-items:center;font-size:10px}.bar-label span{color:#6e8792}.bar-label b{color:#244b5f;font-size:11px}.bar-track{height:10px;background:#edf4f5;border-radius:999px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(20,60,70,.06)}.bar-track>span{display:block;height:100%;min-width:0;border-radius:999px;background:linear-gradient(90deg,#0aa58f,#55cdbb);box-shadow:0 3px 8px rgba(10,165,143,.18);animation:barGrow .8s cubic-bezier(.2,.8,.2,1) both}.alert-track>span{background:linear-gradient(90deg,#f0aa4c,#e45b68)}.care-track>span{background:linear-gradient(90deg,#8067d9,#4a78d4)}.workflow-figure{height:190px;display:grid;place-items:center;background:linear-gradient(145deg,#f7fcfc,#f2f7fd);border:1px solid #e1ecef;border-radius:14px;overflow:hidden}.workflow-figure svg{width:100%;height:100%}.flow-line{stroke:url(#msFlow);stroke-width:4;stroke-linecap:round;stroke-dasharray:8 10;animation:flowMove 2s linear infinite}.flow-node{fill:#fff;stroke:#b8ddd7;stroke-width:2;filter:drop-shadow(0 5px 8px rgba(20,90,90,.08))}.flow-pulse{fill:#0aa58f;animation:nodePulse 2s ease-in-out infinite}.flow-pulse:nth-of-type(2){animation-delay:.2s}.flow-pulse:nth-of-type(3){animation-delay:.4s}.flow-pulse:nth-of-type(4){animation-delay:.6s}.flow-pulse:nth-of-type(5){animation-delay:.8s}.workflow-figure text{fill:#496775;font:700 11px Inter,Arial,sans-serif}.workflow-caption{margin-top:10px;color:#718994;font-size:9px}.workflow-caption span{color:#0aa58f}.registry-panel{margin-top:16px}.table-wrap{overflow:auto;border:1px solid #e2ecef;border-radius:13px}.style4-table{width:100%;border-collapse:separate;border-spacing:0;min-width:760px;background:#fff}.style4-table th{background:#f6fafb!important;color:#718792!important;font-size:8px!important;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #e2ecef!important;padding:12px 14px!important}.style4-table td{padding:12px 14px!important;border-bottom:1px solid #edf2f4!important;color:#4a6674;font-size:10px}.style4-table tbody tr{cursor:pointer;transition:background .18s ease,transform .18s ease}.style4-table tbody tr:hover{background:#f2faf8;box-shadow:inset 3px 0 #0aa58f}.table-patient{display:flex;align-items:center;gap:9px}.table-patient>span{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#e5f7f3;color:#087d6d;font-weight:900}.table-patient b{display:block;color:#23495d;font-size:10px}.table-patient small{display:block;color:#94a4ab;margin-top:2px}.style4-table code{font-size:9px;color:#4a6b7b;background:#f3f7f8;padding:4px 6px;border-radius:6px}.table-status{display:inline-flex;align-items:center;gap:5px;background:#eff9f7;color:#087d6d;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:800}.table-status i{width:5px;height:5px;border-radius:50%;background:#0aa58f}.table-link{background:#eef9f7!important;border:1px solid #c7e7e1!important;color:#087d6d!important;border-radius:9px!important;padding:8px 11px!important;font-size:9px!important}.row-open{background:#fff!important;border:1px solid #d7e6e9!important;color:#477080!important;border-radius:8px!important;padding:6px 9px!important;font-size:8px!important}.row-open:hover{border-color:#9bd5cb!important;color:#087d6d!important}
/* tables across app */
table{border:1px solid #dfeaec!important;border-radius:14px!important;border-collapse:separate!important;border-spacing:0!important;overflow:hidden;background:#fff}thead th{background:linear-gradient(#f8fbfc,#f3f8f9)!important;color:#718893!important;border-bottom:1px solid #dfeaec!important}tbody tr{transition:background .18s ease}tbody tr:hover{background:#f4faf9}td{border-bottom:1px solid #edf2f4!important}
/* inputs */
input,select,textarea{border:1px solid #d8e6ea!important;background:#fbfdfd!important;color:#23485c!important;border-radius:10px!important;transition:border-color .2s,box-shadow .2s,background .2s!important}input:focus,select:focus,textarea:focus{border-color:#72cbbd!important;box-shadow:0 0 0 3px rgba(10,165,143,.10)!important;background:#fff!important;outline:none!important}
button{transition:transform .18s ease,box-shadow .18s ease,background .18s ease,border-color .18s ease!important}button:hover:not(:disabled){transform:translateY(-2px)}button:active:not(:disabled){transform:translateY(0) scale(.98)}button.primary{background:linear-gradient(135deg,#0aa58f,#087e6d)!important;box-shadow:0 7px 17px rgba(10,165,143,.16)!important}button.primary:hover:not(:disabled){box-shadow:0 11px 23px rgba(10,165,143,.23)!important}
.live-vital{border:1px solid #dce9ec!important;background:linear-gradient(145deg,#fff,#f7fbfc)!important;position:relative;overflow:hidden}.live-vital:after{content:"";position:absolute;width:80px;height:80px;right:-30px;bottom:-35px;border-radius:50%;background:rgba(10,165,143,.06)}.pulse-dot{animation:statusPulse 1.5s infinite}.trend-chart{border:1px solid #dce9ec!important;background:linear-gradient(180deg,#fbfefe,#f2f8f9)!important;box-shadow:inset 0 1px 12px rgba(20,70,80,.025)}.chart-sweep{background:linear-gradient(90deg,transparent,rgba(10,165,143,.22),transparent)!important;animation:sweep 2.2s linear infinite!important}
@keyframes pageEnter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes logoFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(1deg)}}@keyframes heroIconPulse{0%,100%{box-shadow:0 14px 30px rgba(10,165,143,.18);transform:scale(1)}50%{box-shadow:0 18px 38px rgba(10,165,143,.28);transform:scale(1.035)}}@keyframes statusPulse{0%{box-shadow:0 0 0 0 rgba(10,165,143,.30)}70%{box-shadow:0 0 0 7px rgba(10,165,143,0)}100%{box-shadow:0 0 0 0 rgba(10,165,143,0)}}@keyframes badgePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}@keyframes orbFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,14px)}}@keyframes barGrow{from{width:0;opacity:.35}to{opacity:1}}@keyframes flowMove{to{stroke-dashoffset:-36}}@keyframes nodePulse{0%,100%{opacity:.75;transform:scale(1);transform-origin:center}50%{opacity:1;transform:scale(1.45);transform-origin:center}}@keyframes sweep{from{transform:translateX(-120%)}to{transform:translateX(520%)}}
@media(max-width:1050px){.style4-analytics-grid{grid-template-columns:1fr}.clinical-sidebar{width:220px!important;min-width:220px!important}}
@media(max-width:800px){.clinical-sidebar{width:74px!important;min-width:74px!important}.clinical-sidebar .logo div,.sidebar-label,.clinical-sidebar .nav-item span:not(.nav-icon),.sidebar-user>div:not(.doctor-avatar-small){display:none!important}.style4-analytics-grid{grid-template-columns:1fr}.clinical-topbar{height:auto!important;min-height:84px!important;flex-wrap:wrap!important;gap:10px!important;padding:12px!important}.topbar-actions{flex-wrap:wrap!important}.content{padding:18px!important}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}

/* =========================================================
   MEDISPHERE 2026 UI SYSTEM — visual layer only
   ========================================================= */

:host {
  --ms-bg: #f4f7fb;
  --ms-surface: rgba(255,255,255,.92);
  --ms-surface-solid: #ffffff;
  --ms-ink: #10243e;
  --ms-muted: #70839a;
  --ms-line: #e5ebf3;
  --ms-primary: #4f46e5;
  --ms-primary-2: #06b6a4;
  --ms-blue: #3b82f6;
  --ms-danger: #ef4444;
  --ms-warning: #f59e0b;
  --ms-shadow: 0 16px 45px rgba(20, 43, 76, .08);
  --ms-shadow-lg: 0 24px 70px rgba(20, 43, 76, .13);
}

.app.clinical-app {
  background:
    radial-gradient(circle at 82% 0%, rgba(79,70,229,.07), transparent 27%),
    radial-gradient(circle at 25% 18%, rgba(6,182,164,.045), transparent 28%),
    var(--ms-bg);
  color: var(--ms-ink);
}

/* Sidebar */
.clinical-sidebar {
  width: 270px;
  padding: 18px 13px 14px;
  background:
    radial-gradient(circle at 10% 0%, rgba(99,102,241,.16), transparent 30%),
    linear-gradient(180deg, #10182d 0%, #0c1426 58%, #0a1120 100%);
  border-right: 1px solid rgba(255,255,255,.07);
  box-shadow: 12px 0 35px rgba(9,18,38,.10);
  position: relative;
  z-index: 50;
}

.clinical-logo {
  padding: 10px 12px 22px;
  margin-bottom: 8px;
}
.clinical-logo .logo-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg,#6366f1,#14b8a6);
  box-shadow: 0 10px 26px rgba(79,70,229,.32);
}
.clinical-logo b { color:#f8fbff; font-size:16px; letter-spacing:-.2px; }
.clinical-logo small { color:#8492ad; font-size:9px; letter-spacing:.8px; text-transform:uppercase; }

.sidebar-label {
  padding: 12px 13px 8px;
  color:#65738e;
  font-size:9px;
  font-weight:800;
  letter-spacing:1.8px;
}

.clinical-sidebar .nav-item {
  width:100%;
  min-height:45px;
  margin:3px 0;
  padding:0 12px;
  border:1px solid transparent;
  border-radius:12px;
  color:#9ba9bf;
  background:transparent;
  display:flex;
  align-items:center;
  gap:11px;
  font-size:12px;
  font-weight:650;
  transition:transform .2s ease, background .2s ease, color .2s ease, border-color .2s ease;
}
.clinical-sidebar .nav-item:hover {
  transform:translateX(2px);
  color:#eef3ff;
  background:rgba(255,255,255,.055);
  border-color:rgba(255,255,255,.06);
}
.clinical-sidebar .nav-item.active {
  color:#fff;
  background:linear-gradient(90deg,rgba(99,102,241,.25),rgba(20,184,166,.11));
  border-color:rgba(129,140,248,.20);
  box-shadow:inset 3px 0 0 #818cf8, 0 8px 24px rgba(0,0,0,.10);
}
.nav-icon {
  width:29px;
  height:29px;
  display:grid;
  place-items:center;
  flex:0 0 29px;
  border-radius:9px;
  background:rgba(255,255,255,.045);
  color:#aebaff;
  font-size:14px;
}
.nav-item.active .nav-icon { background:rgba(129,140,248,.16); color:#c7d2fe; }
.nav-arrow { margin-left:auto; color:#8b96ff; font-size:20px; line-height:1; }

.sidebar-footer {
  border-top:1px solid rgba(255,255,255,.07);
  padding:14px 5px 2px;
}
.sidebar-user {
  display:flex;
  align-items:center;
  gap:10px;
  padding:9px;
  border-radius:12px;
  background:rgba(255,255,255,.035);
}
.sidebar-user b { color:#edf2ff; font-size:11px; }
.sidebar-user small { color:#74819a; font-size:8px; letter-spacing:1px; }
.doctor-avatar-small {
  width:34px; height:34px; border-radius:11px;
  display:grid; place-items:center;
  color:#fff; font-weight:800; font-size:12px;
  background:linear-gradient(135deg,#6366f1,#14b8a6);
}
.logout-btn {
  width:100%; margin-top:8px; border:0; background:transparent;
  color:#7f8ba3; border-radius:10px; padding:9px 10px;
  text-align:left; cursor:pointer;
}
.logout-btn:hover { color:#fff; background:rgba(239,68,68,.09); }

/* Topbar */
.clinical-main { min-width:0; }
.clinical-topbar {
  min-height:88px;
  height:auto;
  padding:16px 28px;
  gap:20px;
  background:rgba(255,255,255,.82);
  border-bottom:1px solid rgba(226,232,240,.86);
  backdrop-filter:blur(20px);
  position:sticky;
  top:0;
  z-index:30;
}
.page-context { min-width:175px; }
.page-context .context-kicker {
  color:#8997aa; font-size:8px; font-weight:800; letter-spacing:1.5px;
}
.page-context h1 {
  margin:5px 0 0;
  font-size:22px;
  line-height:1.1;
  letter-spacing:-.7px;
  color:#172b49;
}
.milestone-strip {
  display:flex; gap:4px; padding:4px;
  border:1px solid #e8edf5;
  background:#f6f8fc;
  border-radius:13px;
}
.milestone-strip button {
  border:0; background:transparent; color:#8391a5;
  padding:7px 9px; border-radius:9px; font-size:9px; cursor:pointer;
  white-space:nowrap;
}
.milestone-strip button span { display:block; font-size:8px; margin-top:2px; opacity:.7; }
.milestone-strip button.active {
  color:#3730a3;
  background:#fff;
  box-shadow:0 4px 13px rgba(29,41,72,.08);
}
.topbar-actions { gap:8px; }
.clinical-search {
  height:39px;
  border:1px solid #e2e8f0;
  border-radius:11px;
  background:#fff;
  box-shadow:0 4px 14px rgba(31,50,78,.035);
}
.clinical-search input { border:0!important; outline:0; background:transparent; color:#263a54; }
.search-btn {
  border:0!important; border-radius:8px!important;
  background:#f1f3ff!important; color:#4f46e5!important;
  font-size:10px!important; padding:7px 10px!important;
}
.top-icon-btn,.refresh-btn {
  min-height:39px;
  border:1px solid #e4e9f1!important;
  border-radius:11px!important;
  background:#fff!important;
  color:#52657e!important;
  box-shadow:0 4px 14px rgba(31,50,78,.035);
}
.top-icon-btn:hover,.refresh-btn:hover { border-color:#c7d2fe!important; color:#4338ca!important; }
.system-state { padding:8px 10px; border-radius:10px; background:#ecfdf8; color:#087f70; font-size:9px; font-weight:800; }
.system-state i { display:inline-block; width:6px; height:6px; margin-right:6px; border-radius:50%; background:#10b981; box-shadow:0 0 0 4px rgba(16,185,129,.10); }

/* Selected patient */
.patient-context-bar {
  margin:14px 28px 0;
  padding:9px 11px;
  border:1px solid #e4eaf2;
  border-radius:14px;
  background:rgba(255,255,255,.84);
  box-shadow:0 8px 25px rgba(25,45,75,.05);
  backdrop-filter:blur(12px);
}
.selected-patient-chip .avatar {
  width:34px; height:34px; border-radius:10px;
  background:linear-gradient(135deg,#eef2ff,#dff8f4);
  color:#4f46e5;
}
.selected-patient-chip b { font-size:11px; color:#203653; }
.selected-patient-chip small { color:#8795a8; font-size:8px; }
.context-actions button {
  border:1px solid #e2e8f0!important;
  border-radius:9px!important;
  background:#fff!important;
  color:#53667e!important;
  padding:8px 10px!important;
  font-size:10px!important;
}
.context-actions button:hover { color:#4338ca!important; border-color:#c7d2fe!important; }

/* Page canvas */
.content { padding:24px 28px 44px; max-width:1600px; margin:0 auto; }

/* Hero */
.hero {
  border:1px solid rgba(129,140,248,.16);
  border-radius:22px;
  padding:32px 34px;
  min-height:180px;
  background:
    radial-gradient(circle at 82% 15%, rgba(20,184,166,.22), transparent 27%),
    radial-gradient(circle at 65% 100%, rgba(99,102,241,.28), transparent 30%),
    linear-gradient(135deg,#18264b,#172044 52%,#123d48);
  box-shadow:0 20px 55px rgba(28,40,78,.18);
  overflow:hidden;
  position:relative;
}
.hero:after {
  content:""; position:absolute; width:260px; height:260px; right:-100px; top:-130px;
  border:1px solid rgba(255,255,255,.08); border-radius:50%;
  box-shadow:0 0 0 40px rgba(255,255,255,.025),0 0 0 80px rgba(255,255,255,.018);
}
.hero .eyebrow { color:#a5b4fc; }
.hero h2 { color:#fff; font-size:31px; letter-spacing:-1px; }
.hero p { color:#b9c6db; max-width:650px; }
.hero-icon { color:#8b9cf7; opacity:.23; font-size:105px; }

/* Metrics */
.cards { grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px; margin:16px 0; }
.metric {
  border:1px solid #e6ebf3;
  border-radius:16px;
  padding:17px 18px;
  background:rgba(255,255,255,.92);
  box-shadow:0 8px 25px rgba(25,45,75,.045);
  position:relative;
  overflow:hidden;
}
.metric:before {
  content:""; position:absolute; left:0; top:0; bottom:0; width:3px;
  background:linear-gradient(#6366f1,#14b8a6);
}
.metric span { color:#8794a7; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:1px; }
.metric b { color:#182d49; font-size:28px; letter-spacing:-1px; }
.metric small { color:#9aa6b7; font-size:9px; }

/* Panels / cards */
.panel {
  border:1px solid #e5eaf2;
  border-radius:17px;
  background:rgba(255,255,255,.94);
  box-shadow:var(--ms-shadow);
}
.panel:hover { box-shadow:0 18px 45px rgba(25,45,75,.075); }
.panel h3 { color:#1b304c; letter-spacing:-.3px; }
.panel p { color:#78899d; line-height:1.65; }
.command-grid,.grid2 { gap:14px; }
.command-panel { padding:18px; }
.panel-head { gap:12px; }
.panel-head h3 { font-size:15px; }
.panel-head p { font-size:10px; }
.command-status,.entry-status {
  padding:6px 9px; border-radius:999px;
  background:#f1f3ff; color:#5148c9; font-size:8px; font-weight:800;
}
.patient-quick {
  border:1px solid transparent!important;
  border-bottom:1px solid #eef1f5!important;
  padding:11px 4px!important;
  transition:.18s;
}
.patient-quick:hover { background:#f8f9ff; border-radius:10px; transform:translateX(2px); }
.patient-quick .avatar { width:34px; height:34px; border-radius:10px; background:#eef2ff; color:#4f46e5; }
.orchestration > div {
  border:1px solid #e9edf4; border-radius:12px; background:#fafbfe;
  padding:13px;
}
.orchestration b { color:#293d59; }

/* Tables */
.table,.table-wrap { border-radius:15px; }
table { border-collapse:separate; border-spacing:0; }
th {
  background:#f7f8fc;
  color:#7d8ba0;
  font-size:8px;
  letter-spacing:1px;
  text-transform:uppercase;
  font-weight:800;
}
th:first-child { border-radius:10px 0 0 10px; }
th:last-child { border-radius:0 10px 10px 0; }
td { color:#4c6078; border-bottom:1px solid #edf0f5; }
tbody tr { transition:.16s; }
tbody tr:hover { background:#fafbff; }
.row-open {
  border:1px solid #dfe5f0!important; background:#fff!important; color:#4f46e5!important;
  border-radius:8px!important; font-size:9px!important;
}
.severity { font-weight:800; letter-spacing:.3px; }

/* Forms */
input,select,textarea {
  border-color:#dfe6ef!important;
  border-radius:10px!important;
  background:#fff!important;
  color:#263b56!important;
  transition:border-color .18s, box-shadow .18s, background .18s;
}
input:focus,select:focus,textarea:focus {
  border-color:#818cf8!important;
  box-shadow:0 0 0 3px rgba(99,102,241,.11)!important;
}
button { transition:transform .16s, box-shadow .16s, border-color .16s, background .16s; }
button:not(:disabled):hover { transform:translateY(-1px); }
button:disabled { opacity:.55; cursor:not-allowed; }
.primary {
  background:linear-gradient(135deg,#5b54e8,#4f46e5)!important;
  box-shadow:0 8px 20px rgba(79,70,229,.18);
}
.primary:hover:not(:disabled) { box-shadow:0 11px 26px rgba(79,70,229,.25); }

/* Modern analytics */
.style4-analytics-grid { gap:14px!important; }
.analytics-panel,.architecture-panel,.registry-panel { border-radius:17px!important; }
.bar-track { background:#edf0f6!important; }
.bar-track span { background:linear-gradient(90deg,#6366f1,#14b8a6)!important; }
.alert-track span { background:linear-gradient(90deg,#f59e0b,#ef4444)!important; }
.care-track span { background:linear-gradient(90deg,#14b8a6,#3b82f6)!important; }
.workflow-figure { background:linear-gradient(180deg,#fbfcff,#f6f8fc)!important; border:1px solid #e9edf4; border-radius:14px; }

/* Modals */
.modal-backdrop {
  background:rgba(10,18,34,.56)!important;
  backdrop-filter:blur(8px);
}
.care-modal,.patient-modal {
  border:1px solid rgba(255,255,255,.55)!important;
  border-radius:22px!important;
  box-shadow:0 30px 100px rgba(4,13,32,.30)!important;
}
.modal-head { border-bottom:1px solid #edf0f5!important; }
.close-btn {
  width:36px!important; height:36px!important; border-radius:11px!important;
  background:#f4f6fa!important; color:#64748b!important;
}

/* Loading system */
.app-loading-overlay {
  position:fixed;
  inset:0;
  z-index:9999;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:14px;
  background:rgba(244,247,251,.56);
  backdrop-filter:blur(5px);
  animation:msFadeIn .16s ease-out;
}
.app-loading-overlay .loading-copy {
  min-width:190px;
  padding:13px 16px;
  border:1px solid rgba(255,255,255,.8);
  border-radius:13px;
  background:rgba(255,255,255,.92);
  box-shadow:0 18px 55px rgba(20,43,76,.13);
}
.loading-copy b { display:block; color:#233954; font-size:11px; }
.loading-copy small { color:#8a98aa; font-size:9px; }
.loading-orb {
  width:42px; height:42px; border-radius:50%;
  display:grid; place-items:center;
  background:conic-gradient(#6366f1,#14b8a6,#6366f1);
  animation:msSpin .9s linear infinite;
  box-shadow:0 10px 28px rgba(79,70,229,.18);
}
.loading-orb span {
  width:30px; height:30px; border-radius:50%; background:#fff;
}
@keyframes msSpin { to { transform:rotate(360deg); } }
@keyframes msFadeIn { from { opacity:0; } to { opacity:1; } }

.mobile-menu-btn,.mobile-backdrop { display:none; }

/* Responsive */
@media (max-width:1200px) {
  .clinical-topbar { flex-wrap:wrap; }
  .page-context { flex:1; }
  .milestone-strip { order:3; width:100%; justify-content:center; }
  .topbar-actions { margin-left:auto; }
  .cards { grid-template-columns:repeat(3,1fr); }
}
@media (max-width:850px) {
  .clinical-sidebar {
    position:fixed; inset:0 auto 0 0; height:100vh;
    transform:translateX(-105%); transition:transform .24s ease;
    z-index:1001;
  }
  .clinical-sidebar.mobile-open { transform:translateX(0); }
  .mobile-menu-btn {
    display:grid; place-items:center; flex:0 0 38px; width:38px; height:38px;
    border:1px solid #e3e8f1; border-radius:10px; background:#fff; color:#45566d;
  }
  .mobile-backdrop {
    display:block; position:fixed; inset:0; z-index:1000;
    background:rgba(8,15,29,.42); backdrop-filter:blur(2px);
  }
  .clinical-topbar { padding:12px 16px; }
  .topbar-actions { width:100%; }
  .clinical-search { flex:1; }
  .system-state { display:none; }
  .patient-context-bar,.content { margin-left:16px; margin-right:16px; }
  .content { padding:18px 0 35px; }
  .cards { grid-template-columns:repeat(2,1fr); }
  .grid2,.command-grid,.style4-analytics-grid { grid-template-columns:1fr!important; }
}
@media (max-width:560px) {
  .page-context h1 { font-size:18px; }
  .page-context .context-kicker { display:none; }
  .milestone-strip { overflow:auto; justify-content:flex-start; }
  .milestone-strip button { flex:0 0 auto; }
  .topbar-actions { flex-wrap:wrap; }
  .clinical-search { min-width:100%; }
  .refresh-btn { flex:1; }
  .cards { grid-template-columns:1fr 1fr; }
  .hero { padding:24px; }
  .hero h2 { font-size:25px; }
  .hero-icon { display:none; }
  .patient-context-bar { flex-direction:column; align-items:stretch!important; gap:8px; }
  .context-actions { flex-wrap:wrap; }
  .context-actions button { flex:1; }
}

/* ===================== MEDISPHERE 2026 DARK SYSTEM ===================== */
.clinical-app{--bg:#070a13;--surface:#0d1220;--surface2:#111827;--line:#253047;--text:#edf4ff;--muted:#91a0b8;--violet:#8b5cf6;--cyan:#22d3ee;--mint:#2dd4bf;--lime:#a3e635;--rose:#fb7185;--amber:#fbbf24;--shadow:0 22px 70px rgba(0,0,0,.36);background:radial-gradient(circle at 72% -10%,rgba(139,92,246,.16),transparent 32%),radial-gradient(circle at 20% 10%,rgba(34,211,238,.08),transparent 30%),var(--bg)!important;color:var(--text)!important;min-height:100vh}
.clinical-app *{box-sizing:border-box}.clinical-sidebar{background:linear-gradient(180deg,#0a0e19,#080b13)!important;border-right:1px solid #202a3d!important;box-shadow:18px 0 60px rgba(0,0,0,.22)!important}.clinical-logo{border-bottom:1px solid #1e293b!important}.clinical-logo .logo-mark{background:linear-gradient(135deg,var(--violet),var(--cyan))!important;box-shadow:0 0 28px rgba(139,92,246,.35)!important;color:white!important}.clinical-logo b{color:#fff!important}.clinical-logo small,.sidebar-label,.sidebar-user small{color:#71809a!important}.nav-item{color:#8795ad!important;background:transparent!important;border:1px solid transparent!important;border-radius:14px!important;margin:3px 10px!important;width:calc(100% - 20px)!important}.nav-item:hover{background:#121a2b!important;color:#f4f7ff!important;border-color:#24304a!important}.nav-item.active{background:linear-gradient(90deg,rgba(139,92,246,.20),rgba(34,211,238,.06))!important;color:#fff!important;border-color:rgba(139,92,246,.28)!important;box-shadow:inset 3px 0 0 var(--violet)!important}.nav-item.active .nav-icon{color:#a78bfa!important}.sidebar-footer{border-top:1px solid #1e293b!important}.sidebar-user{background:#0d1422!important;border:1px solid #202b40!important;border-radius:15px!important}.doctor-avatar-small{background:linear-gradient(135deg,var(--violet),var(--cyan))!important}.sidebar-user b{color:#eaf1ff!important}.logout-btn{color:#91a0b8!important;background:#101725!important;border:1px solid #253047!important}.clinical-main{background:transparent!important}.clinical-topbar{background:rgba(7,10,19,.78)!important;border-bottom:1px solid #1c2639!important;backdrop-filter:blur(22px)!important;position:sticky!important;top:0!important;z-index:100!important}.page-context .context-kicker{color:#667892!important}.page-context h1{color:#f5f8ff!important}.milestone-strip button{background:#0d1421!important;border:1px solid #202b40!important;color:#8190a9!important}.milestone-strip button.active{background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(34,211,238,.10))!important;border-color:rgba(139,92,246,.35)!important;color:#fff!important}.topbar-actions .clinical-search{background:#0d1421!important;border-color:#243149!important}.clinical-search input{color:#f4f7ff!important}.clinical-search input::placeholder{color:#65748c!important}.search-btn,.refresh-btn,.top-icon-btn{background:#101827!important;color:#b8c4d8!important;border-color:#26334a!important}.system-state{color:#8fa0ba!important}.system-state i{background:var(--mint)!important;box-shadow:0 0 14px rgba(45,212,191,.7)!important}.patient-context-bar{background:rgba(13,18,32,.92)!important;border:1px solid #243049!important;box-shadow:var(--shadow)!important}.selected-patient-chip .avatar{background:linear-gradient(135deg,var(--violet),var(--cyan))!important}.selected-patient-chip b{color:#fff!important}.selected-patient-chip small{color:#7f90aa!important}.context-actions button{background:#111a2b!important;border-color:#293650!important;color:#c9d4e7!important}.content{color:var(--text)!important}.hero,.section-hero{background:radial-gradient(circle at 85% 20%,rgba(34,211,238,.10),transparent 28%),radial-gradient(circle at 30% 10%,rgba(139,92,246,.13),transparent 36%),linear-gradient(135deg,#0e1524,#0b101c)!important;border:1px solid #26334b!important;box-shadow:var(--shadow)!important}.hero h2,.section-hero h2{color:#fff!important}.hero p,.section-hero p{color:#93a3bb!important}.eyebrow,.card-kicker{color:#a78bfa!important;letter-spacing:.16em!important}.hero-icon{background:linear-gradient(135deg,rgba(139,92,246,.24),rgba(34,211,238,.14))!important;border:1px solid rgba(139,92,246,.3)!important;color:#c4b5fd!important}.metric,.panel,.table,.command-panel{background:linear-gradient(180deg,rgba(17,24,39,.94),rgba(11,17,29,.96))!important;border:1px solid #243149!important;box-shadow:0 18px 55px rgba(0,0,0,.23)!important;color:#e9f0fc!important}.metric span,.metric small,.panel p,.panel small{color:#8292aa!important}.metric b,.panel-head h3,.panel h3,.panel h4{color:#f5f8ff!important}.panel-head button,.panel button,.table button{background:#111a2b!important;color:#bfcbe0!important;border:1px solid #2a3851!important}.panel button.primary,.primary{background:linear-gradient(135deg,#7c3aed,#06b6d4)!important;border-color:transparent!important;color:#fff!important;box-shadow:0 12px 28px rgba(124,58,237,.25)!important}.metric.warn{background:linear-gradient(180deg,rgba(120,53,15,.16),rgba(11,17,29,.96))!important;border-color:rgba(251,191,36,.22)!important}input,select,textarea{background:#0a111e!important;color:#edf4ff!important;border:1px solid #2a3851!important;border-radius:11px!important}input:focus,select:focus,textarea:focus{outline:none!important;border-color:var(--violet)!important;box-shadow:0 0 0 3px rgba(139,92,246,.12)!important}.table th{color:#70819b!important;background:#0b1220!important;border-bottom:1px solid #26334a!important}.table td{color:#cbd6e8!important;border-bottom:1px solid #1e293b!important}.pill{background:#151f32!important;color:#9fb0c8!important;border:1px solid #2a3851!important}.pill.success{background:rgba(45,212,191,.10)!important;color:#5eead4!important;border-color:rgba(45,212,191,.25)!important}.severity{background:rgba(251,191,36,.10)!important;color:#fbbf24!important}.severity.critical{background:rgba(251,113,133,.12)!important;color:#fb7185!important}.mini-list>div,.patient-quick,.orchestration,.recent-vital-row,.data-list>div,.rx-item,.notification-card,.recommendation-box,.interaction-result,.assistant-answer{background:#0b1321!important;border-color:#243149!important;color:#dbe5f4!important}.patient-quick b,.rx-item b,.data-list b,.notification-card b{color:#f5f8ff!important}.patient-quick small,.rx-item small,.data-list small,.notification-card small{color:#7f90a8!important}.modal-backdrop{background:rgba(2,5,12,.78)!important;backdrop-filter:blur(12px)!important}.app-loading-overlay{background:rgba(2,5,12,.24)!important;backdrop-filter:none!important}.appointment-modal,.care-modal,.patient-modal{background:#0d1422!important;border:1px solid #2b3953!important;box-shadow:0 35px 100px rgba(0,0,0,.55)!important;color:#edf4ff!important}.modal-head{border-bottom:1px solid #243149!important}.close-btn{background:#121b2b!important;color:#aebbd0!important;border-color:#293750!important}.app-loading-overlay{z-index:9999!important}.loading-orb{background:conic-gradient(from 0deg,var(--violet),var(--cyan),var(--mint),var(--violet))!important;box-shadow:0 0 55px rgba(139,92,246,.25)!important}.loading-copy{background:rgba(13,20,34,.96)!important;border-color:#2b3953!important;box-shadow:0 24px 70px rgba(0,0,0,.42)!important}.loading-copy b{color:#f8fbff!important}.loading-copy small{color:#9aabc2!important}
.neon-hero{overflow:hidden;position:relative}.hero-orbit{width:118px;height:118px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(139,92,246,.32);background:radial-gradient(circle,rgba(139,92,246,.18),rgba(34,211,238,.04) 60%,transparent 61%);box-shadow:0 0 55px rgba(139,92,246,.16)}.hero-orbit span{font-size:28px;font-weight:900;color:#d8ccff}.hero-orbit i,.hero-orbit b{position:absolute;width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 18px var(--cyan)}.hero-orbit i{transform:translate(50px,-22px)}.hero-orbit b{transform:translate(-40px,38px);background:var(--lime);box-shadow:0 0 18px var(--lime)}.hub-toolbar{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:18px}.hub-patient-select{display:flex;flex-direction:column;gap:8px;min-width:320px;color:#93a3bb}.hub-actions{display:flex;gap:9px;flex-wrap:wrap}.hub-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(320px,.9fr);gap:18px;margin-bottom:18px}.hub-form-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.hub-form-grid.compact{grid-template-columns:repeat(4,1fr);margin-bottom:12px}.hub-form-grid label,.safety-panel>label{display:flex;flex-direction:column;gap:7px;color:#a9b7cb;font-size:12px;font-weight:700}.full-field{grid-column:1/-1}.ai-live{color:#5eead4;font-size:10px;font-weight:800;letter-spacing:.1em}.assistant-answer{margin-top:15px;padding:15px;border:1px solid #2a3851;border-radius:14px}.assistant-answer p{color:#c4d0e2!important;line-height:1.65}.assistant-answer small{display:block;margin-top:10px;color:#687b96!important}.answer-chips{display:flex;gap:7px;flex-wrap:wrap}.answer-chips span{font-size:11px;padding:6px 9px;border-radius:999px;background:rgba(139,92,246,.10);color:#c4b5fd;border:1px solid rgba(139,92,246,.22)}.signal-row{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid #1e293b}.signal-row span{color:#7f90aa}.signal-row b{color:#f5f8ff}.risk-inline{display:flex;align-items:center;justify-content:space-between;margin-top:15px;padding:12px;border-radius:13px;background:linear-gradient(90deg,rgba(139,92,246,.12),rgba(34,211,238,.05));border:1px solid rgba(139,92,246,.22)}.risk-inline strong{color:#fbbf24}.recommendation-box{margin-top:15px;border:1px solid #28364f;border-radius:14px;overflow:hidden}.rec-head{display:flex;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #253149}.rec-head small{color:#fbbf24!important}.rec-item{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid #1d293d}.rec-item:last-child{border-bottom:0}.rec-item small{display:block}.rec-item span{font-size:11px;color:#6f8098}.warn-text{color:#fbbf24!important}.rx-list,.data-list{margin-top:15px;display:grid;gap:8px}.rx-item,.data-list>div{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border:1px solid #243149;border-radius:12px}.rx-item button{padding:7px 9px!important;font-size:11px!important}.safety-orb{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(45,212,191,.10);color:#5eead4;border:1px solid rgba(45,212,191,.25)}.full-btn{width:100%;margin:12px 0}.interaction-result{margin-top:12px;padding:14px;border:1px solid rgba(45,212,191,.22);border-radius:13px}.interaction-result.danger{border-color:rgba(251,113,133,.35);background:rgba(127,29,29,.12)!important}.interaction-result b{color:#5eead4}.interaction-result.danger b{color:#fb7185}.interaction-result span{display:block;margin-top:6px;color:#fbbf24;font-size:11px}.notification-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.notification-card{display:flex;gap:10px;align-items:flex-start;padding:13px;border:1px solid #243149;border-radius:13px}.notification-card.unread{border-color:rgba(139,92,246,.30);box-shadow:inset 2px 0 var(--violet)}.notification-dot{width:8px;height:8px;border-radius:50%;background:#64748b;margin-top:5px;flex:0 0 auto}.notification-card.unread .notification-dot{background:var(--cyan);box-shadow:0 0 12px rgba(34,211,238,.7)}.notification-card p{margin:4px 0;color:#91a0b8!important;font-size:12px;line-height:1.5}.notification-card button{margin-left:auto!important;white-space:nowrap}@media(max-width:1050px){.hub-grid{grid-template-columns:1fr}.hub-form-grid,.hub-form-grid.compact{grid-template-columns:repeat(2,1fr)}.notification-grid{grid-template-columns:1fr}}@media(max-width:700px){.hub-toolbar{align-items:stretch;flex-direction:column}.hub-patient-select{min-width:0}.hub-form-grid,.hub-form-grid.compact{grid-template-columns:1fr}.full-field{grid-column:auto}.notification-grid{grid-template-columns:1fr}.hero-orbit{display:none}}

/* ============================================================
   MEDISPHERE — FINAL READABILITY / DARK SURFACE PATCH
   Fixes the old light Style-4 selectors overriding the dark theme.
   UI/CSS only — no API or component logic changes.
   ============================================================ */

.clinical-app,
.clinical-app .clinical-main,
.clinical-app .content {
  color: #edf4ff !important;
}

/* Every major content surface */
.clinical-app .panel,
.clinical-app .metric,
.clinical-app .table,
.clinical-app .command-panel,
.clinical-app .care-card,
.clinical-app .care-summary-card,
.clinical-app .care-toolbar,
.clinical-app .registry-panel,
.clinical-app .analytics-panel,
.clinical-app .architecture-panel,
.clinical-app .schedule-panel,
.clinical-app .vital-entry-card,
.clinical-app .vital-guide-card,
.clinical-app .recent-vitals-card,
.clinical-app .monitor-alert,
.clinical-app .twin-panel,
.clinical-app .qr-panel,
.clinical-app .ai-assistant-panel,
.clinical-app .risk-command-panel,
.clinical-app .pharmacy-metrics,
.clinical-app .notification-panel,
.clinical-app .safety-panel {
  background: linear-gradient(180deg, #111827 0%, #0b111d 100%) !important;
  color: #edf4ff !important;
  border-color: #26344d !important;
  box-shadow: 0 18px 55px rgba(0,0,0,.22) !important;
}

/* Patient / appointment / pharmacy / alert tables */
.clinical-app .table-wrap,
.clinical-app .table-wrap table,
.clinical-app .style4-table,
.clinical-app .panel.table,
.clinical-app .panel.table table {
  background: #0b111d !important;
  color: #edf4ff !important;
  border-color: #26344d !important;
}

.clinical-app table {
  background: #0b111d !important;
  color: #dbe5f4 !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

.clinical-app table thead,
.clinical-app table thead tr,
.clinical-app .style4-table thead,
.clinical-app .style4-table thead tr {
  background: #0d1626 !important;
}

.clinical-app table th,
.clinical-app .style4-table th,
.clinical-app .table table th {
  background: #0d1626 !important;
  color: #91a4be !important;
  border-bottom: 1px solid #2a3851 !important;
  font-weight: 800 !important;
}

.clinical-app table td,
.clinical-app .style4-table td,
.clinical-app .table table td {
  background: #0b111d !important;
  color: #d5dfed !important;
  border-bottom: 1px solid #202d42 !important;
}

.clinical-app table tbody tr,
.clinical-app .style4-table tbody tr {
  background: #0b111d !important;
}

.clinical-app table tbody tr:hover,
.clinical-app .style4-table tbody tr:hover {
  background: #111c2e !important;
}

/* Strong readable table text */
.clinical-app table td b,
.clinical-app .style4-table td b,
.clinical-app .table-patient b,
.clinical-app .table-patient small,
.clinical-app .table-patient code {
  color: #f3f7ff !important;
}

.clinical-app table td small,
.clinical-app table td span,
.clinical-app .style4-table td small {
  color: #a8b8cc !important;
}

.clinical-app .style4-table code {
  background: #151f32 !important;
  color: #b9c8dc !important;
}

/* Buttons inside tables */
.clinical-app .table button,
.clinical-app .table-link,
.clinical-app .row-open {
  background: #111b2d !important;
  color: #dce7f5 !important;
  border: 1px solid #30405a !important;
}

.clinical-app .table button:hover,
.clinical-app .table-link:hover,
.clinical-app .row-open:hover {
  background: #17243a !important;
  color: #ffffff !important;
  border-color: #526783 !important;
}

/* Patient/registry table status pills */
.clinical-app .table-status,
.clinical-app .pill {
  background: rgba(45,212,191,.10) !important;
  color: #5eead4 !important;
  border: 1px solid rgba(45,212,191,.25) !important;
}

/* Analytics / workflow surfaces */
.clinical-app .workflow-figure {
  background: linear-gradient(145deg, #101827, #0b1321) !important;
  border-color: #26344d !important;
}

.clinical-app .workflow-figure text {
  fill: #aebed1 !important;
}

.clinical-app .workflow-caption,
.clinical-app .bar-label span,
.clinical-app .bar-label b {
  color: #aebed1 !important;
}

.clinical-app .bar-track {
  background: #1b2638 !important;
}

/* Forms — readable text and placeholders everywhere */
.clinical-app input,
.clinical-app select,
.clinical-app textarea {
  background: #0a111e !important;
  color: #edf4ff !important;
  border-color: #2d3b55 !important;
  caret-color: #22d3ee !important;
}

.clinical-app input::placeholder,
.clinical-app textarea::placeholder {
  color: #71829b !important;
  opacity: 1 !important;
}

.clinical-app option {
  background: #0d1422 !important;
  color: #edf4ff !important;
}

.clinical-app label,
.clinical-app .field,
.clinical-app .hub-form-grid label,
.clinical-app .safety-panel > label {
  color: #c5d1e1 !important;
}

/* Headings and descriptions inside cards */
.clinical-app .panel h2,
.clinical-app .panel h3,
.clinical-app .panel h4,
.clinical-app .metric h3,
.clinical-app .care-card h3,
.clinical-app .care-card h4,
.clinical-app .schedule-panel h3,
.clinical-app .registry-panel h3 {
  color: #f5f8ff !important;
}

.clinical-app .panel p,
.clinical-app .panel small,
.clinical-app .care-card p,
.clinical-app .care-card small,
.clinical-app .schedule-panel p,
.clinical-app .registry-panel p {
  color: #93a3bb !important;
}

/* Data lists, medication rows, notifications and alerts */
.clinical-app .data-list > div,
.clinical-app .mini-list > div,
.clinical-app .recent-vital-row,
.clinical-app .rx-item,
.clinical-app .notification-card,
.clinical-app .recommendation-box,
.clinical-app .interaction-result,
.clinical-app .assistant-answer,
.clinical-app .patient-quick,
.clinical-app .orchestration {
  background: #0b1321 !important;
  color: #dbe5f4 !important;
  border-color: #26344d !important;
}

.clinical-app .data-list b,
.clinical-app .rx-item b,
.clinical-app .notification-card b,
.clinical-app .patient-quick b {
  color: #f5f8ff !important;
}

.clinical-app .data-list small,
.clinical-app .rx-item small,
.clinical-app .notification-card small,
.clinical-app .patient-quick small {
  color: #8fa1b9 !important;
}

/* Clinical alerts */
.clinical-app .alert-track,
.clinical-app .monitor-alert {
  color: #dbe5f4 !important;
}

/* Remove the old white Style-4 surfaces that were making text disappear */
.clinical-app .style4-table,
.clinical-app .style4-table tbody tr,
.clinical-app .style4-table tbody tr:hover,
.clinical-app .style4-table td,
.clinical-app .style4-table th,
.clinical-app .row-open,
.clinical-app .hero-stat {
  background-color: #0b111d !important;
}

.clinical-app .hero-stat {
  color: #dbe5f4 !important;
  border-color: #26344d !important;
}

.clinical-app .hero-stat span,
.clinical-app .hero-stat b {
  color: #dbe5f4 !important;
}



/* =========================================================
   M1–M4 SEPARATED WORKSPACE STYLES
   ========================================================= */
.milestone-page{padding-bottom:30px}.module-hero{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;background:linear-gradient(135deg,#101d35,#0b1528);border:1px solid #243a5d;border-radius:18px;padding:22px;margin-bottom:14px;box-shadow:0 18px 42px rgba(0,0,0,.24)}.module-hero h2{margin:5px 0 7px;color:#f6f9ff;font-size:25px}.module-hero p{margin:0;color:#8da4c3;font-size:12px}.module-status{border:1px solid #345071;color:#91a8c9;border-radius:999px;padding:9px 12px;font-size:9px;font-weight:800;white-space:nowrap}.module-status.live-on{border-color:#0ca58f;color:#49e1c1}.module-toolbar{display:flex;justify-content:space-between;gap:16px;align-items:center;background:#0d1930;border:1px solid #243a5e;border-radius:16px;padding:15px 18px;margin-bottom:14px}.module-toolbar h3{margin:4px 0 2px;color:#f3f7ff;font-size:17px}.module-toolbar small{color:#7891b3;font-size:10px}.module-controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.module-controls select,.module-controls button{min-height:38px}.module-controls select{min-width:250px}.module-controls button{background:#132540!important;border:1px solid #2a4265!important;color:#dbe7f6!important;border-radius:8px!important;padding:8px 13px!important;font-size:10px!important;font-weight:800!important}.module-controls .primary{background:#2878e6!important;border-color:#2878e6!important;color:#fff!important}.module-controls .critical-btn{background:#5a1823!important;border-color:#9e3342!important;color:#ffc0c8!important}.risk-empty,.monitor-empty,.care-empty{background:#0b1629;border:1px dashed #2c456c;border-radius:16px;padding:52px 18px;text-align:center}.risk-empty-icon,.monitor-empty-icon,.care-empty-icon{width:50px;height:50px;display:grid;place-items:center;margin:0 auto 11px;border-radius:13px;background:#162844;border:1px solid #35537c;color:#75a8ff}.risk-empty h3,.monitor-empty h3,.care-empty h3{margin:0 0 6px;color:#f3f7ff}.risk-empty p,.monitor-empty p,.care-empty p{margin:0;color:#8299ba;font-size:10px}.risk-workspace,.monitor-workspace,.care-workspace{display:flex;flex-direction:column;gap:14px}.risk-score-grid,.monitor-vital-grid,.care-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.risk-score-card,.monitor-vital,.care-stat{background:#0d1930;border:1px solid #243a5f;border-radius:14px;padding:15px}.risk-score-card span,.monitor-vital span,.care-stat span{display:block;color:#7891b3;font-size:8px;text-transform:uppercase;letter-spacing:.8px;font-weight:900}.risk-score-card b,.monitor-vital b,.care-stat b{display:block;color:#f2f7ff;font-size:25px;margin:7px 0 2px}.risk-score-card strong{display:block;color:#4bdcc0;font-size:9px}.risk-score-card small{display:block;color:#7188a8;font-size:8px;margin-top:5px}.risk-score-card.cardio{box-shadow:inset 0 2px 0 #4c86ff}.risk-score-card.diabetes{box-shadow:inset 0 2px 0 #35cf9c}.risk-score-card.privacy{box-shadow:inset 0 2px 0 #a377ff}.risk-score-card.quality{box-shadow:inset 0 2px 0 #f0a63a}.risk-two-col,.monitor-two-col{display:grid;grid-template-columns:1.15fr .85fr;gap:14px}.risk-panel,.trend-panel,.alert-panel,.recommendations-panel,.monitor-flow-panel,.care-history-panel,.care-plan-card{background:#0d1930!important;border-color:#243a5f!important;box-shadow:none!important}.factor-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #203552}.factor-row b{display:block;color:#e3edf9;font-size:10px}.factor-row small{display:block;color:#6f87a8;font-size:8px;margin-top:2px}.factor-row strong{color:#77a7ff;font-size:11px}.input-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.input-grid div{background:#111f37;border:1px solid #233858;border-radius:9px;padding:10px}.input-grid .wide{grid-column:1/-1}.input-grid span{display:block;color:#7188a8;font-size:8px}.input-grid b{display:block;color:#e5eef8;font-size:10px;margin-top:3px}.recommendation-list{display:grid;gap:7px;color:#adc0d7;font-size:10px;line-height:1.5}.monitor-vital{position:relative}.monitor-vital small{color:#7289a9;font-size:8px}.monitor-vital em{display:inline-block;margin-top:7px;padding:4px 7px;border-radius:999px;font-size:7px;font-style:normal;font-weight:900;background:#182946;color:#a0b7d5}.monitor-vital em.CRITICAL{background:#541722;color:#ff929c}.monitor-vital em.WARNING{background:#544012;color:#ffd56c}.monitor-vital em.NORMAL{background:#0f4239;color:#58dfbf}.trend-chart{width:100%;height:225px;background:#091426;border:1px solid #1f3555;border-radius:11px;margin-top:4px}.trend-chart line{stroke:#1e3454;stroke-width:1}.trend-chart polyline{stroke:#2bd6b0;stroke-width:3;filter:drop-shadow(0 0 5px rgba(43,214,176,.38))}.trend-stats{display:flex;justify-content:space-between;color:#7188a8;font-size:8px;margin-top:8px}.trend-stats b{color:#edf5ff}.panel-head select{background:#10203a!important;color:#dce9f7!important;border:1px solid #2a4262!important;border-radius:7px!important}.monitor-alert{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #203550}.monitor-alert b{color:#ff929c;font-size:8px;margin-right:7px}.monitor-alert span{color:#7289a8;font-size:8px}.monitor-alert p{margin:4px 0 0;color:#c3d2e6;font-size:9px}.monitor-alert button{height:28px;background:#122541;border:1px solid #315178;color:#a8c1e4;border-radius:7px;padding:0 8px;font-size:7px}.flow-steps{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:10px}.flow-steps span{background:#142640;border:1px solid #294464;color:#c8d6e8;border-radius:999px;padding:6px 9px;font-size:8px}.flow-steps i{color:#58759b;font-style:normal}.care-stat-grid{grid-template-columns:repeat(4,1fr)}.care-stat b{color:#5fe1c7}.care-title-row{display:flex;justify-content:space-between;gap:14px}.care-title-row h3{margin:5px 0 3px;color:#eef5ff;font-size:16px}.care-title-row small{color:#7991b1;font-size:8px;line-height:1.5}.care-badges{display:flex;gap:5px}.care-progress-block{margin-top:13px}.care-progress-block>div:first-child{display:flex;justify-content:space-between;color:#7890b1;font-size:8px}.care-progress-block b{color:#dce7f5}.progress-track{height:7px;margin-top:5px;background:#1a2c49;border:1px solid #29415f;border-radius:999px;overflow:hidden}.progress-track i{height:100%;display:block;background:#37d2b2;border-radius:999px}.progress-track.adherence i{background:#6f8cff}.treatment-box{margin-top:14px;padding:11px;border-radius:11px;background:#091426;border:1px solid #203756}.treatment-head{display:flex;justify-content:space-between;color:#b8c9df;font-size:9px}.treatment-head small{display:block;color:#6f86a5;font-size:7px;margin-top:2px}.treatment-action{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #1b2e4a;color:#c1d0e3;font-size:9px}.treatment-action:last-child{border-bottom:0}.treatment-action input{accent-color:#35d4b5}.done-action span{color:#718099;text-decoration:line-through}.care-meta-row{display:flex;gap:18px;flex-wrap:wrap;color:#7086a6;font-size:7px;padding-top:9px;margin-top:9px;border-top:1px solid #1c304d}.care-meta-row b{color:#bdcee2}.care-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.care-actions button{background:#11243f!important;border:1px solid #2a4466!important;color:#a8bdd7!important;border-radius:7px!important;padding:6px 8px!important;font-size:7px!important}.care-actions .danger-btn{color:#ff9da8!important;border-color:#70313f!important}.history-row{display:grid;grid-template-columns:1fr 70px 90px;gap:10px;padding:9px 0;border-bottom:1px solid #1d304d;color:#9db3ce}.history-row b{display:block;color:#dce7f4;font-size:9px}.history-row small{display:block;color:#7288a8;font-size:7px;margin-top:2px}.history-row>span{font-size:8px;align-self:center}.m2-page .pill,.m3-page .pill,.m4-page .pill{background:#142640!important;color:#a8bdd7!important;border-color:#2a4463!important}@media(max-width:1050px){.risk-score-grid,.monitor-vital-grid,.care-stat-grid{grid-template-columns:repeat(2,1fr)}.risk-two-col,.monitor-two-col{grid-template-columns:1fr}.module-toolbar{flex-direction:column;align-items:flex-start}}@media(max-width:650px){.risk-score-grid,.monitor-vital-grid,.care-stat-grid{grid-template-columns:1fr}.module-controls{width:100%}.module-controls select{min-width:0;width:100%}.care-title-row{display:block}.care-badges{margin-top:7px}.history-row{grid-template-columns:1fr}.flow-steps i{display:none}}

`]
})
export class ShellComponent {

  private api = inject(ApiService);
  private router = inject(Router);


  // =====================================================
  // BASIC STATE
  // =====================================================

  tab = 'dashboard';
  isLoading = false;
  sidebarOpen = false;

  search = '';
  globalSearch = '';


  user: any =
    JSON.parse(
      localStorage.getItem('medisphere_user') || 'null'
    );


  dash: any = {
    patients: 0,
    appointments: 0,
    activeAlerts: 0,
    medicines: 0,
    carePlans: 0
  };


  patients: any[] = [];

  appointments: any[] = [];

  alerts: any[] = [];

  medicines: any[] = [];


  // =====================================================
  // PATIENT 360
  // =====================================================

  selected: any = null;


  // =====================================================
  // DIGITAL HEALTH TWIN
  // =====================================================

  twin: any = null;


  risk: any = null;


  // =====================================================
  // FHIR / SMART
  // =====================================================

  fhir: any = null;

  smart: any = null;


  // =====================================================
  // VITAL
  // =====================================================

  vital: any = { source: 'MANUAL', patientId: '' };
  vitalSaving = false;
  recentVitalHistory: any[] = [];

  // ADD PATIENT FORM
  showPatientForm = false;
  savingPatient = false;
  newPatientForm: any = this.createEmptyPatientForm();

  // =====================================================
  // M3 REAL-TIME MONITORING
  // =====================================================
  monitorOverview: any = { patientsMonitored: 0, criticalAlerts: 0, warningAlerts: 0, patientSnapshots: [] };
  monitorPatient: any = null;
  monitorPatientId = '';
  monitoringLive = false;
  monitoringUpdated: any = null;
  monitoringTimer: any = null;
  trendKey = 'heartRate';
  trendKeys = ['heartRate', 'oxygen', 'systolic', 'glucose', 'temperature'];

  // =====================================================
  // APPOINTMENT SCHEDULER
  // =====================================================
  appointmentDepartments = ['Cardiology','Neurology','General Medicine','Orthopedics','Dermatology','Pediatrics','Gynecology','Endocrinology'];
  appointmentDepartment = 'Cardiology';
  appointmentDoctor: any = null;
  appointmentDoctors: any[] = [
    {id:'doc-card-1',name:'Dr. Ananya Mehta',department:'Cardiology',specialty:'Interventional Cardiology',experience:'12 yrs experience',room:'Cardiac Wing · Room 201',days:['Monday','Wednesday','Friday'],hours:'09:00 AM – 01:00 PM',slots:['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30']},
    {id:'doc-card-2',name:'Dr. Rohan Kapoor',department:'Cardiology',specialty:'Clinical Cardiology',experience:'9 yrs experience',room:'Cardiac Wing · Room 204',days:['Tuesday','Thursday','Saturday'],hours:'02:00 PM – 06:00 PM',slots:['14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']},
    {id:'doc-neuro-1',name:'Dr. Neha Verma',department:'Neurology',specialty:'Neurology & Stroke Care',experience:'11 yrs experience',room:'Neuro Wing · Room 301',days:['Monday','Tuesday','Thursday'],hours:'10:00 AM – 02:00 PM',slots:['10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30']},
    {id:'doc-neuro-2',name:'Dr. Arvind Rao',department:'Neurology',specialty:'Neurophysiology',experience:'8 yrs experience',room:'Neuro Wing · Room 305',days:['Wednesday','Friday','Saturday'],hours:'03:00 PM – 07:00 PM',slots:['15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']},
    {id:'doc-general-1',name:'Dr. Arjun Sharma',department:'General Medicine',specialty:'Internal Medicine',experience:'10 yrs experience',room:'Main OPD · Room 101',days:['Monday','Tuesday','Wednesday','Thursday','Friday'],hours:'09:00 AM – 01:00 PM',slots:['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30']},
    {id:'doc-general-2',name:'Dr. Priya Nair',department:'General Medicine',specialty:'Family Medicine',experience:'7 yrs experience',room:'Main OPD · Room 105',days:['Monday','Wednesday','Friday','Saturday'],hours:'02:00 PM – 06:00 PM',slots:['14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']},
    {id:'doc-ortho-1',name:'Dr. Vivek Malhotra',department:'Orthopedics',specialty:'Joint Replacement & Sports Injury',experience:'14 yrs experience',room:'Ortho Wing · Room 401',days:['Monday','Wednesday','Friday'],hours:'10:00 AM – 02:00 PM',slots:['10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30']},
    {id:'doc-ortho-2',name:'Dr. Kavya Singh',department:'Orthopedics',specialty:'Spine & Rehabilitation',experience:'8 yrs experience',room:'Ortho Wing · Room 405',days:['Tuesday','Thursday','Saturday'],hours:'03:00 PM – 07:00 PM',slots:['15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']},
    {id:'doc-derm-1',name:'Dr. Isha Gupta',department:'Dermatology',specialty:'Clinical Dermatology',experience:'9 yrs experience',room:'Skin Center · Room 501',days:['Tuesday','Thursday','Friday'],hours:'10:00 AM – 02:00 PM',slots:['10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30']},
    {id:'doc-derm-2',name:'Dr. Rahul Bhatia',department:'Dermatology',specialty:'Aesthetic & Laser Dermatology',experience:'10 yrs experience',room:'Skin Center · Room 504',days:['Monday','Wednesday','Saturday'],hours:'03:00 PM – 07:00 PM',slots:['15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']},
    {id:'doc-ped-1',name:'Dr. Meera Joshi',department:'Pediatrics',specialty:'Child & Adolescent Care',experience:'13 yrs experience',room:'Children Wing · Room 601',days:['Monday','Tuesday','Thursday'],hours:'09:00 AM – 01:00 PM',slots:['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30']},
    {id:'doc-ped-2',name:'Dr. Sameer Khan',department:'Pediatrics',specialty:'Pediatric Allergy & Immunology',experience:'8 yrs experience',room:'Children Wing · Room 604',days:['Wednesday','Friday','Saturday'],hours:'02:00 PM – 06:00 PM',slots:['14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']},
    {id:'doc-gyn-1',name:'Dr. Ritu Sharma',department:'Gynecology',specialty:'Obstetrics & Gynecology',experience:'15 yrs experience',room:'Women Care · Room 701',days:['Monday','Wednesday','Friday'],hours:'09:00 AM – 01:00 PM',slots:['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30']},
    {id:'doc-gyn-2',name:'Dr. Pooja Menon',department:'Gynecology',specialty:'Maternal & Reproductive Health',experience:'10 yrs experience',room:'Women Care · Room 704',days:['Tuesday','Thursday','Saturday'],hours:'02:00 PM – 06:00 PM',slots:['14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30']},
    {id:'doc-endo-1',name:'Dr. Nikhil Sethi',department:'Endocrinology',specialty:'Diabetes & Metabolic Medicine',experience:'12 yrs experience',room:'Metabolic Center · Room 801',days:['Monday','Tuesday','Thursday'],hours:'09:00 AM – 01:00 PM',slots:['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30']},
    {id:'doc-endo-2',name:'Dr. Aditi Rao',department:'Endocrinology',specialty:'Thyroid & Hormonal Disorders',experience:'9 yrs experience',room:'Metabolic Center · Room 805',days:['Wednesday','Friday','Saturday'],hours:'03:00 PM – 07:00 PM',slots:['15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']}
  ];
  availableAppointmentSlots: string[] = [];
  showAppointmentForm = false;
  savingAppointment = false;
  todayDate = new Date().toISOString().slice(0,10);
  appointmentForm: any = {patientId:'',date:this.todayDate,time:'',status:'SCHEDULED',reason:'General consultation'};

  // =====================================================
  // SEPARATE MILESTONE HELPERS
  // =====================================================
  ensureModulePatient(id: string) {
    if (!id || this.selected?.patient?.id === id) return;
    this.api.get<any>('/patients/' + id).subscribe({
      next: x => { this.selected = x; this.clinicalPatientId = id; },
      error: err => console.error('Module patient load failed', err)
    });
  }

  selectModulePatient(id: string) { if (id) this.ensureModulePatient(id); }

  selectCarePlanPatient(id: string) {
    this.carePlanPatientId = id || '';
    if (!id) { this.carePlans = []; return; }
    this.ensureModulePatient(id);
    this.loadCarePlans();
  }

  loadCriticalMonitoringDemo() {
    if (!this.monitorPatientId) return;
    this.stopLiveSimulation();
    const payload = {patientId:this.monitorPatientId,heartRate:145,systolic:190,diastolic:125,oxygen:84,glucose:320,temperature:40.2,source:'WEARABLE-SIMULATOR'};
    this.api.post<any>('/vitals', payload).subscribe({next:()=>{this.loadMonitorPatient(this.monitorPatientId);this.loadMonitoring(true);},error:e=>alert(e?.error?.message||'Unable to create monitoring demo reading.')});
  }

  // =====================================================
  // M4 CARE PLAN & TREATMENT
  // =====================================================
  carePlanPatientId = '';
  carePlans: any[] = [];
  carePlanBusy = false;
  carePlanFormOpen = false;
  editingCarePlan: any = null;
  carePlanForm: any = this.emptyCarePlanForm();

  // M3 demo wearable stream: posts changing readings to the real backend
  // so the MongoDB history and monitoring graph visibly update.
  simulationRunning = false;
  simulationTimer: any = null;

  medicineStockLow(m:any){ return Number(m?.stock||0) <= Number(m?.reorderLevel||20); }
  lowStockMedicineCount(){ return this.medicines.filter(m => this.medicineStockLow(m)).length; }

  loadClinicalAnalytics(){ this.api.get<any>('/clinical/analytics', false).subscribe({next:x=>this.clinicalAnalytics=x,error:()=>{}}); }

  // =====================================================
  // ADVANCED CLINICAL HUB
  // =====================================================
  clinicalPatientId = '';
  clinicalData: any = null;

  // Keep the template collection explicitly typed so Angular strict template
  // checking does not infer the value piped through `slice` as `unknown`.
  get clinicalLabs(): any[] {
    return Array.isArray(this.clinicalData?.labs) ? this.clinicalData.labs.slice(0, 6) : [];
  }
  clinicalAnalytics: any = {};
  clinicalNotifications: any[] = [];
  assistantQuestion = '';
  assistantAnswer: any = null;
  assistantBusy = false;
  recommendationDiagnosis = '';
  medicineRecommendations: any[] = [];
  interactionA = '';
  interactionB = '';
  interactionResult: any = null;
  prescriptionForm: any = { patientId:'', medicineName:'', strength:'', dosage:'1 tablet', frequency:'Once daily', timing:'After meal', durationDays:30, diagnosis:'', instructions:'' };
  prescriptionBusy = false;
  labForm: any = { patientId:'', testName:'', result:'', unit:'', referenceRange:'' };
  labBusy = false;
  documentForm: any = { patientId:'', name:'', documentType:'LAB_REPORT', description:'' };
  selectedDocumentFile: File | null = null;
  qrImage = '';
  qrPayload = '';
  documentBusy = false;

  nav = [

    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '⌂'
    },

    {
      id: 'patients',
      label: 'Patients',
      icon: '◉'
    },

    {
      id: 'patient360',
      label: 'Patient 360',
      icon: '◎'
    },

    {
      id: 'clinical',
      label: 'Clinical Intelligence',
      icon: '✧'
    },

    {
      id: 'aiRisk',
      label: 'AI Risk Lab',
      icon: '✦'
    },

    {
      id: 'appointments',
      label: 'Appointments',
      icon: '▣'
    },

    {
      id: 'vitals',
      label: 'Vitals & Twin',
      icon: '♥'
    },

    {
      id: 'monitoring',
      label: 'Live Monitoring',
      icon: '◌'
    },

    {
      id: 'careplans',
      label: 'Care Plan & Treatment',
      icon: '✓'
    },

    {
      id: 'alerts',
      label: 'Clinical Alerts',
      icon: '⚠'
    },

    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: '▤'
    },

    {
      id: 'fhir',
      label: 'FHIR / SMART',
      icon: '⇄'
    },

    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙'
    }

  ];


  consentKeys = [

    'dataSharing',

    'wearableAccess',

    'aiProcessing',

    'fhirExchange'

  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.refresh();
    this.loadMonitoring();
    this.monitoringTimer = setInterval(() => this.loadMonitoring(true), 5000);

  }

  navigateTo(id: string) {
    this.tab = id;
    this.sidebarOpen = false;
    const patientId = this.selected?.patient?.id || this.patients[0]?.id || '';
    if (id === 'clinical') {
      if (patientId) this.loadClinicalPatient(patientId);
    } else if (id === 'aiRisk') {
      if (patientId) this.ensureModulePatient(patientId);
    } else if (id === 'monitoring') {
      if (!this.monitorPatientId && patientId) this.monitorPatientId = patientId;
      this.loadMonitoring(true);
      if (this.monitorPatientId) this.loadMonitorPatient(this.monitorPatientId, true);
    } else if (id === 'careplans') {
      if (!this.carePlanPatientId && patientId) this.carePlanPatientId = patientId;
      if (this.carePlanPatientId) this.loadCarePlans();
    } else if (id === 'alerts') {
      this.refresh();
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }


  // =====================================================
  // TITLE
  // =====================================================

  title() {

    return this.nav.find(
      x => x.id === this.tab
    )?.label || 'MediSphere';

  }


  // =====================================================
  // REFRESH DASHBOARD DATA
  // =====================================================

  refresh() {

    this.api
      .get<any>('/dashboard')
      .subscribe(
        x => this.dash = x
      );


    this.api
      .get<any[]>('/patients')
      .subscribe(
        x => this.patients = x
      );


    this.api
      .get<any[]>('/appointments')
      .subscribe(
        x => this.appointments = x
      );


    this.api
      .get<any[]>('/alerts')
      .subscribe(
        x => this.alerts = x
      );


    this.api
      .get<any[]>('/medicines')
      .subscribe(
        x => this.medicines = x
      );

    this.loadClinicalAnalytics();

  }


  // =====================================================
  // PATIENT SEARCH
  // =====================================================

  filteredPatients() {

    return this.patients.filter(
      p =>

        !this.search ||

        p.name
          ?.toLowerCase()
          .includes(
            this.search.toLowerCase()
          ) ||

        p.mrn
          ?.toLowerCase()
          .includes(
            this.search.toLowerCase()
          )

    );

  }


  // =====================================================
  // SELECT PATIENT
  // =====================================================

  selectPatient(p: any) {

    this.api
      .get<any>(
        '/patients/' + p.id
      )
      .subscribe(

        x => {

          this.selected = x;

          this.twin = null;

          /*
           * Load existing Digital Twin.
           *
           * If it doesn't exist backend automatically
           * creates it.
           */

          this.api
            .get<any>(
              '/digital-twin/' + p.id
            )
            .subscribe(

              twin => {

                this.twin = twin;

              },

              () => {

                this.twin = null;

              }

            );


          this.tab = 'patient360';
          this.clinicalPatientId = p.id;
          this.prescriptionForm.patientId = p.id;
          this.labForm.patientId = p.id;
          this.documentForm.patientId = p.id;
          this.loadClinicalPatient(p.id);
          this.risk = null;

        }

      );

  }


  // =====================================================
  // BUILD / REFRESH DIGITAL TWIN
  // =====================================================

  buildTwin(id: string) {

    this.api
      .post<any>(
        '/digital-twin/' +
        id +
        '/build',
        {}
      )
      .subscribe(

        twin => {

          this.twin = twin;

          /*
           * Reload Patient 360 so all counts/data
           * are immediately refreshed.
           */

          this.api
            .get<any>(
              '/patients/' + id
            )
            .subscribe(
              x => this.selected = x
            );


          alert(
            'Digital Health Twin created / refreshed successfully.'
          );

        },

        error => {

          console.error(
            'Digital Twin error:',
            error
          );

          alert(
            'Unable to build Digital Twin.'
          );

        }

      );

  }


  // =====================================================
  // LATEST VITAL
  // =====================================================

  latest(v: any[]) {

    return v?.[0];

  }


  // =====================================================
  // AI RISK
  // =====================================================

  runRisk(id: string) {

    this.api
      .post<any>(
        '/ai/risk/' +
        id,
        {}
      )
      .subscribe(

        x => {

          this.risk = x;

        }

      );

  }


  // =====================================================
  // VITAL ENTRY
  // =====================================================

  addVital() {
    this.vital = {
      patientId: this.selected?.patient?.id || this.vital?.patientId || '',
      heartRate: null,
      systolic: null,
      diastolic: null,
      oxygen: null,
      temperature: null,
      glucose: null,
      source: 'MANUAL'
    };
    this.recentVitalHistory = [];
    this.tab = 'vitals';
    if (this.vital.patientId) this.loadRecentVitalHistory();
  }

  clearVitalForm() {
    const patientId = this.vital?.patientId || this.selected?.patient?.id || '';
    this.vital = { patientId, heartRate: null, systolic: null, diastolic: null, oxygen: null, temperature: null, glucose: null, source: 'MANUAL' };
    this.recentVitalHistory = [];
    if (patientId) this.loadRecentVitalHistory();
  }

  loadCriticalDemo() {
    const patientId = this.vital?.patientId || this.selected?.patient?.id || this.patients[0]?.id || '';
    this.vital = {
      patientId,
      heartRate: 145,
      systolic: 190,
      diastolic: 125,
      oxygen: 84,
      temperature: 40.2,
      glucose: 320,
      source: 'WEARABLE-SIMULATOR'
    };
    if (!patientId) alert('Select a patient before loading the critical demo.');
  }

  loadRecentVitalHistory() {
    if (!this.vital?.patientId) { this.recentVitalHistory = []; return; }
    this.api.get<any[]>('/vitals/' + this.vital.patientId).subscribe({
      next: x => this.recentVitalHistory = x || [],
      error: err => { console.error('Vital history load failed', err); this.recentVitalHistory = []; }
    });
  }

  sendVital() {
    const v = this.vital || {};
    const required = ['patientId','heartRate','systolic','diastolic','oxygen','temperature','glucose'];
    const missing = required.filter(k => v[k] === null || v[k] === undefined || v[k] === '');
    if (missing.length) {
      alert('Please enter all vital values: Heart Rate, Blood Pressure, SpO₂, Temperature and Glucose.');
      return;
    }
    if (!this.patients.some(p => String(p.id) === String(v.patientId))) {
      alert('Please select a valid patient.');
      return;
    }

    this.vitalSaving = true;
    this.api.post<any>('/vitals', {
      patientId: v.patientId,
      heartRate: Number(v.heartRate),
      systolic: Number(v.systolic),
      diastolic: Number(v.diastolic),
      oxygen: Number(v.oxygen),
      temperature: Number(v.temperature),
      glucose: Number(v.glucose),
      source: v.source || 'MANUAL'
    }).subscribe({
      next: () => {
        this.vitalSaving = false;
        this.loadRecentVitalHistory();
        this.loadMonitoring(true);
        this.refresh();
        alert('Vital reading saved. Monitoring thresholds and clinical alerts were evaluated.');
      },
      error: err => {
        this.vitalSaving = false;
        console.error('Vital save failed:', err);
        alert(err?.error?.message || 'Unable to save vital reading. Check the backend.');
      }
    });
  }

  // =====================================================
  // CONSENT
  // =====================================================

  saveConsent(c: any) {

    if (!this.selected) {

      return;

    }


    this.api
      .put(
        '/consents/' +
        this.selected.patient.id,
        c
      )
      .subscribe(

        () => {

          alert(
            'Consent saved successfully.'
          );


          this.selectPatient(
            this.selected.patient
          );

        }

      );

  }


  // =====================================================
  // APPOINTMENT SCHEDULER
  // =====================================================

  filteredDoctors() { return this.appointmentDoctors.filter(d => d.department === this.appointmentDepartment); }

  selectAppointmentDepartment(department: string) { this.appointmentDepartment = department; this.appointmentDoctor = null; this.availableAppointmentSlots = []; }

  selectAppointmentDoctor(doctor: any) { this.appointmentDoctor = doctor; this.appointmentForm.time = ''; this.refreshAppointmentSlots(); }

  refreshAppointmentSlots() {
    if (!this.appointmentDoctor || !this.appointmentForm.date) { this.availableAppointmentSlots = []; return; }
    const day = new Date(this.appointmentForm.date + 'T12:00:00').toLocaleDateString('en-US', {weekday:'long'});
    if (!this.appointmentDoctor.days.includes(day)) {
      this.availableAppointmentSlots = [];
      this.appointmentForm.time = '';
      return;
    }
    const booked = new Set((this.appointments || [])
      .filter(a => a.date === this.appointmentForm.date &&
                   a.doctorName === this.appointmentDoctor.name &&
                   String(a.status || '').toUpperCase() !== 'CANCELLED')
      .map(a => String(a.time || '')));
    this.availableAppointmentSlots = this.appointmentDoctor.slots.filter((slot: string) => !booked.has(slot));
    if (!this.availableAppointmentSlots.includes(this.appointmentForm.time)) this.appointmentForm.time = '';
  }

  appointmentDayLabel() {
    if (!this.appointmentForm.date) return 'Choose a date';
    return new Date(this.appointmentForm.date + 'T12:00:00').toLocaleDateString('en-US', {weekday:'long', month:'short', day:'numeric'});
  }

  addAppointment() {
    const doctor = this.appointmentDoctor || this.filteredDoctors()[0];
    if (doctor) this.selectAppointmentDoctor(doctor);
    this.openNewAppointment(doctor);
  }

  openNewAppointment(doctor: any = this.appointmentDoctor) {
    if (!doctor) { alert('Please select a doctor first.'); return; }
    this.appointmentDoctor = doctor; this.refreshAppointmentSlots();
    this.appointmentForm.patientId = this.appointmentForm.patientId || this.selected?.patient?.id || this.patients[0]?.id || '';
    this.appointmentForm.status = 'SCHEDULED';
    this.showAppointmentForm = true;
  }

  closeAppointmentForm() { if (!this.savingAppointment) this.showAppointmentForm = false; }

  saveAppointment() {
    const f = this.appointmentForm, doctor = this.appointmentDoctor, patient = this.patients.find(p => p.id === f.patientId);
    if (!patient || !doctor || !f.date || !f.time) { alert('Please select patient, doctor, date and an available time slot.'); return; }
    if (!this.availableAppointmentSlots.includes(f.time)) { alert('Selected time is not available for this doctor.'); return; }
    this.savingAppointment = true;
    const payload: any = {patientId:patient.id,patientName:patient.name,doctorName:doctor.name,specialty:doctor.department,department:doctor.department,doctorSpecialty:doctor.specialty,date:f.date,time:f.time,status:f.status||'SCHEDULED',reason:f.reason||'General consultation'};
    this.api.post<any>('/appointments', payload).subscribe({
      next: () => { this.savingAppointment=false; this.showAppointmentForm=false; this.refreshAppointments(); alert('Appointment booked successfully with '+doctor.name+' at '+f.time+'.'); },
      error: err => { this.savingAppointment=false; console.error('Appointment booking failed',err); alert(err?.error?.message||'Unable to book appointment. Please check the backend.'); }
    });
  }

  refreshAppointments() { this.api.get<any[]>('/appointments').subscribe({next:x=>this.appointments=x||[],error:err=>console.error('Appointment refresh failed',err)}); }

  // =====================================================
  // ACKNOWLEDGE ALERT
  // =====================================================

  ack(id: string) {

    this.api
      .put(
        '/alerts/' +
        id +
        '/acknowledge',
        {}
      )
      .subscribe(

        () => {

          this.refresh();

        }

      );

  }


  // =====================================================
  // NEW PATIENT
  // =====================================================

  createEmptyPatientForm() {
    return {
      mrn: 'MS-' + Math.floor(10000 + Math.random() * 89999),
      name: '',
      gender: 'Male',
      dateOfBirth: '',
      phone: '',
      email: '',
      bloodGroup: '',
      emergencyContact: '',
      address: '',
      allergiesText: '',
      conditionsText: ''
    };
  }

  newPatient() {
    this.newPatientForm = this.createEmptyPatientForm();
    this.showPatientForm = true;
  }

  cancelNewPatient() {
    if (this.savingPatient) return;
    this.showPatientForm = false;
  }

  saveNewPatient() {
    const f = this.newPatientForm;
    if (!String(f.name || '').trim()) {
      alert('Please enter patient name.');
      return;
    }

    this.savingPatient = true;
    const payload: any = {
      mrn: String(f.mrn || '').trim() || ('MS-' + Math.floor(10000 + Math.random() * 89999)),
      name: String(f.name || '').trim(),
      gender: f.gender || 'Male',
      dateOfBirth: f.dateOfBirth || null,
      phone: String(f.phone || '').trim(),
      email: String(f.email || '').trim(),
      bloodGroup: f.bloodGroup || '',
      emergencyContact: String(f.emergencyContact || '').trim(),
      address: String(f.address || '').trim(),
      allergies: String(f.allergiesText || '').split(',').map((x: string) => x.trim()).filter(Boolean),
      conditions: String(f.conditionsText || '').split(',').map((x: string) => x.trim()).filter(Boolean)
    };

    this.api.post('/patients', payload).subscribe({
      next: () => {
        this.savingPatient = false;
        this.showPatientForm = false;
        this.newPatientForm = this.createEmptyPatientForm();
        this.refresh();
        alert('Patient created successfully.');
      },
      error: (err) => {
        this.savingPatient = false;
        console.error('Patient creation failed', err);
        alert('Unable to create patient. Please check the backend and try again.');
      }
    });
  }


  // =====================================================
  // DELETE PATIENT
  // =====================================================

  deletePatient(p: any) {

    if (!p?.id) {
      alert('Invalid patient record.');
      return;
    }

    const name = p.name || p.email || 'this patient';

    const confirmed = confirm(
      'Delete ' + name + '?\n\n' +
      'This permanently removes the patient and associated clinical records.'
    );

    if (!confirmed) {
      return;
    }

    this.api
      .delete<any>('/patients/' + p.id)
      .subscribe({

        next: () => {

          if (this.selected?.patient?.id === p.id) {
            this.selected = null;
            this.twin = null;
            this.risk = null;
            this.monitorPatient = null;
            this.monitorPatientId = '';
          }

          this.refresh();

          if (this.tab === 'patient360') {
            this.tab = 'patients';
          }

          alert('Patient deleted successfully.');
        },

        error: (error) => {
          console.error('Delete patient error:', error);
          alert(
            error?.error?.message ||
            'Unable to delete patient. Check the backend.'
          );
        }

      });
  }


  dashboardBarWidth(value: any): number {
    const values = [this.dash?.patients, this.dash?.appointments, this.dash?.activeAlerts, this.dash?.carePlans]
      .map((x: any) => Number(x || 0));
    const max = Math.max(...values, 1);
    const n = Number(value || 0);
    return n > 0 ? Math.max(8, Math.round((n / max) * 100)) : 0;
  }

  // =====================================================
  // GLOBAL PATIENT SEARCH
  // =====================================================
  runGlobalSearch() {
    const q = String(this.globalSearch || '').trim().toLowerCase();
    if (!q) { this.tab = 'patients'; return; }
    const p = this.patients.find(x => String(x.name || '').toLowerCase().includes(q) || String(x.mrn || '').toLowerCase().includes(q));
    if (!p) { alert('No patient found for "' + this.globalSearch + '".'); return; }
    this.selectPatient(p);
    this.globalSearch = '';
  }

  // =====================================================
  // M4 CARE PLAN & TREATMENT
  // =====================================================
  emptyCarePlanForm() { return { patientId:'', title:'', goal:'', status:'ACTIVE', actionsText:'', followUpDate:'', progress:0, adherence:0, priority:'MEDIUM', category:'GENERAL', generatedBy:'CLINICIAN' }; }
  openCarePlansForSelected() { const id=this.selected?.patient?.id; if(!id){alert('Select a patient first.');return;} this.carePlanPatientId=id; this.tab='careplans'; this.loadCarePlans(); }
  loadCarePlans() { if(!this.carePlanPatientId){this.carePlans=[];return;} this.api.get<any[]>('/care-plans/'+this.carePlanPatientId).subscribe({next:x=>this.carePlans=x||[],error:err=>{console.error('Care plan load failed',err);alert('Unable to load care plans. Check the backend.');}}); }
  openCarePlanForm(cp:any=null){ this.editingCarePlan=cp; this.carePlanFormOpen=true; this.carePlanForm=cp?{patientId:cp.patientId,title:cp.title||'',goal:cp.goal||'',status:cp.status||'ACTIVE',actionsText:(cp.actions||[]).map((a:string)=>this.actionLabel(a)).join('\n'),followUpDate:cp.followUpDate||'',progress:cp.progress||0,adherence:cp.adherence||0,priority:cp.priority||'MEDIUM',category:cp.category||'GENERAL',generatedBy:cp.generatedBy||'CLINICIAN'}:{...this.emptyCarePlanForm(),patientId:this.carePlanPatientId,followUpDate:new Date(Date.now()+28*86400000).toISOString().slice(0,10)}; }
  closeCarePlanForm(){if(!this.carePlanBusy)this.carePlanFormOpen=false;}
  saveCarePlan(){const f=this.carePlanForm;if(!f.patientId||!String(f.title||'').trim()||!String(f.goal||'').trim()){alert('Patient, title and goal are required.');return;}const actions=String(f.actionsText||'').split(/\n|,/).map((x:string)=>x.trim()).filter(Boolean);const payload:any={...f,title:String(f.title).trim(),goal:String(f.goal).trim(),actions};delete payload.actionsText;this.carePlanBusy=true;const req=this.editingCarePlan?this.api.put<any>('/care-plans/'+this.editingCarePlan.id,payload):this.api.post<any>('/care-plans',payload);req.subscribe({next:()=>{this.carePlanBusy=false;this.carePlanFormOpen=false;this.loadCarePlans();this.refresh();},error:err=>{this.carePlanBusy=false;console.error('Care plan save failed',err);alert(err?.error?.message||'Unable to save care plan.');}});}
  generateCarePlan(){if(!this.carePlanPatientId)return;this.carePlanBusy=true;this.api.post<any>('/care-plans/generate/'+this.carePlanPatientId,{}).subscribe({next:()=>{this.carePlanBusy=false;this.loadCarePlans();this.refresh();},error:err=>{this.carePlanBusy=false;console.error('Care plan generation failed',err);alert(err?.error?.message||'Unable to generate care plan.');}});}
  private updateCarePlan(cp:any,patch:any,successMessage=''){if(!cp?.id)return;const payload:any={...cp,...patch,actions:Array.isArray(patch.actions)?patch.actions:(cp.actions||[])};delete payload._id;delete payload.actionsText;this.carePlanBusy=true;this.api.put<any>('/care-plans/'+cp.id,payload).subscribe({next:updated=>{this.carePlanBusy=false;const i=this.carePlans.findIndex(x=>x.id===cp.id);if(i>=0)this.carePlans[i]=updated||{...cp,...patch};this.carePlans=[...this.carePlans];if(successMessage)alert(successMessage);this.refresh();},error:err=>{this.carePlanBusy=false;console.error('Care plan update failed',err);alert(err?.error?.message||'Unable to update the care plan.');}});}
  actionDone(action:any){return String(action||'').startsWith('DONE::');}
  actionLabel(action:any){return String(action||'').replace(/^DONE::\s*/,'').trim();}
  completedActionCount(cp:any){return(cp?.actions||[]).filter((a:any)=>this.actionDone(a)).length;}
  toggleTreatmentAction(cp:any,action:any){const actions=[...(cp.actions||[])];const i=actions.indexOf(action);if(i<0)return;const done=this.actionDone(action);actions[i]=done?this.actionLabel(action):'DONE:: '+this.actionLabel(action);const total=actions.length;const completed=actions.filter((a:any)=>this.actionDone(a)).length;const progress=total?Math.round((completed/total)*100):Number(cp.progress||0);this.updateCarePlan(cp,{actions,progress});}
  changeCareProgress(cp:any,delta:number){this.updateCarePlan(cp,{progress:Math.max(0,Math.min(100,Number(cp.progress||0)+delta))});}
  changeCareAdherence(cp:any,delta:number){this.updateCarePlan(cp,{adherence:Math.max(0,Math.min(100,Number(cp.adherence||0)+delta))});}
  setCareStatus(cp:any,status:string){this.updateCarePlan(cp,{status},status==='COMPLETED'?'Care plan marked as completed.':'Care plan status updated.');}
  careActiveCount(){return this.carePlans.filter(cp=>String(cp.status||'ACTIVE')==='ACTIVE').length;}
  careCompletedCount(){return this.carePlans.filter(cp=>String(cp.status||'')==='COMPLETED').length;}
  careAverageProgress(){if(!this.carePlans.length)return 0;return Math.round(this.carePlans.reduce((s,cp)=>s+Number(cp.progress||0),0)/this.carePlans.length);}
  careAverageAdherence(){if(!this.carePlans.length)return 0;return Math.round(this.carePlans.reduce((s,cp)=>s+Number(cp.adherence||0),0)/this.carePlans.length);}
  careDueCount(){return this.carePlans.filter(cp=>this.isCareDue(cp)).length;}
  isCareDue(cp:any){if(!cp?.followUpDate||cp.status==='COMPLETED')return false;const due=new Date(cp.followUpDate+'T23:59:59').getTime();return due<=Date.now()+7*86400000;}
  careDueClass(cp:any){if(cp?.status==='COMPLETED')return'review-complete';if(!cp?.followUpDate)return'review-none';const due=new Date(cp.followUpDate+'T23:59:59').getTime();if(due<Date.now())return'review-overdue';if(due<=Date.now()+7*86400000)return'review-soon';return'review-ok';}
  careReviewLabel(cp:any){if(cp?.status==='COMPLETED')return'Completed';if(!cp?.followUpDate)return'No review date';const due=new Date(cp.followUpDate+'T23:59:59').getTime();if(due<Date.now())return'Review overdue';if(due<=Date.now()+7*86400000)return'Review soon';return'Review '+cp.followUpDate;}
  deleteCarePlan(cp:any){if(!cp?.id||!confirm('Delete this care plan permanently?'))return;this.api.delete<any>('/care-plans/'+cp.id).subscribe({next:()=>{this.loadCarePlans();this.refresh();},error:err=>{console.error('Care plan delete failed',err);alert(err?.error?.message||'Unable to delete care plan.');}});}
  priorityClass(priority:string){return String(priority||'MEDIUM').toLowerCase();}
  careStatusClass(status:string){return String(status||'ACTIVE').toLowerCase().replace('_','-');}

  // =====================================================
  // ADVANCED CLINICAL HUB
  // =====================================================
  loadClinicalPatient(id: string) {
    if (!id) return;
    this.clinicalPatientId = id;
    this.prescriptionForm.patientId = id;
    this.labForm.patientId = id;
    this.documentForm.patientId = id;
    this.api.get<any>('/clinical/patient/' + id).subscribe({ next: x => this.clinicalData = x, error: e => console.error('Clinical patient load failed', e) });
    this.api.get<any>('/clinical/analytics').subscribe({ next: x => this.clinicalAnalytics = x });
    this.loadClinicalNotifications();
  }

  loadClinicalNotifications() { this.api.get<any[]>('/clinical/notifications').subscribe({ next: x => this.clinicalNotifications = x || [] }); }

  askAssistant() {
    if (!this.clinicalPatientId || !this.assistantQuestion.trim()) return;
    this.assistantBusy = true;
    this.api.post<any>('/clinical/assistant', { patientId: this.clinicalPatientId, question: this.assistantQuestion.trim() }).subscribe({ next: x => { this.assistantAnswer = x; this.assistantBusy = false; }, error: e => { this.assistantBusy = false; alert(e?.error?.message || 'Unable to contact clinical assistant.'); } });
  }

  recommendMedicines() {
    if (!this.clinicalPatientId) return;
    this.api.get<any>('/clinical/medicine/recommendations/' + this.clinicalPatientId + '?diagnosis=' + encodeURIComponent(this.recommendationDiagnosis || this.prescriptionForm.diagnosis || '')).subscribe({ next: x => this.medicineRecommendations = x.suggestions || [], error: e => alert(e?.error?.message || 'Unable to load medication suggestions.') });
  }

  useRecommendation(r:any) { this.prescriptionForm.medicineName=r.medicine; this.prescriptionForm.strength=r.strength; }

  createPrescription() {
    const f=this.prescriptionForm;
    if(!this.clinicalPatientId || !f.medicineName){ alert('Select a patient and medicine.'); return; }
    const patient=this.patients.find(p=>String(p.id)===String(this.clinicalPatientId));
    this.prescriptionBusy=true;
    this.api.post<any>('/clinical/prescriptions',{...f,patientId:this.clinicalPatientId,patientName:patient?.name||'',doctorName:this.user?.name||'Clinical User'}).subscribe({next:()=>{this.prescriptionBusy=false;this.loadClinicalPatient(this.clinicalPatientId);alert('Prescription saved and linked to the patient.');},error:e=>{this.prescriptionBusy=false;alert(e?.error?.message||'Unable to save prescription.');}});
  }

  recordMedicationEvent(rx:any,eventType:string) {
    this.api.post<any>('/clinical/medication-events',{patientId:this.clinicalPatientId,prescriptionId:rx.id,medicineName:rx.medicineName,eventType,scheduledAt:new Date().toISOString(),notes:''}).subscribe({next:()=>this.loadClinicalPatient(this.clinicalPatientId),error:e=>alert(e?.error?.message||'Unable to record medication event.')});
  }

  checkInteraction() {
    if(!this.interactionA.trim() || !this.interactionB.trim()){alert('Enter both medicines.');return;}
    this.api.post<any>('/clinical/medicine/interactions',{medicineA:this.interactionA,medicineB:this.interactionB}).subscribe({next:x=>this.interactionResult=x,error:e=>alert(e?.error?.message||'Unable to check interaction.')});
  }

  saveLab() {
    const f=this.labForm;if(!this.clinicalPatientId||!f.testName||!f.result){alert('Test name and result are required.');return;}
    this.labBusy=true;this.api.post<any>('/labs',{...f,patientId:this.clinicalPatientId}).subscribe({next:()=>{this.labBusy=false;this.labForm={patientId:this.clinicalPatientId,testName:'',result:'',unit:'',referenceRange:''};this.loadClinicalPatient(this.clinicalPatientId);},error:e=>{this.labBusy=false;alert(e?.error?.message||'Unable to save lab result.');}});
  }

  onDocumentFile(event:any){ this.selectedDocumentFile = event?.target?.files?.[0] || null; if(this.selectedDocumentFile && !this.documentForm.name) this.documentForm.name=this.selectedDocumentFile.name; }

  saveDocument() {
    const f=this.documentForm;if(!this.clinicalPatientId||!f.name){alert('Document name is required.');return;}
    this.documentBusy=true;
    if(this.selectedDocumentFile){
      const data=new FormData(); data.append('file',this.selectedDocumentFile); data.append('patientId',this.clinicalPatientId); data.append('documentType',f.documentType||'OTHER'); data.append('description',f.description||'');
      this.api.upload<any>('/clinical/documents/upload',data).subscribe({next:()=>{this.documentBusy=false;this.selectedDocumentFile=null;this.documentForm={patientId:this.clinicalPatientId,name:'',documentType:'LAB_REPORT',description:''};this.loadClinicalPatient(this.clinicalPatientId);},error:e=>{this.documentBusy=false;alert(e?.error?.message||'Unable to upload document.');}});
    } else {
      this.api.post<any>('/clinical/documents',{...f,patientId:this.clinicalPatientId,storageKey:'METADATA/'+Date.now()}).subscribe({next:()=>{this.documentBusy=false;this.documentForm={patientId:this.clinicalPatientId,name:'',documentType:'LAB_REPORT',description:''};this.loadClinicalPatient(this.clinicalPatientId);},error:e=>{this.documentBusy=false;alert(e?.error?.message||'Unable to save document record.');}});
    }
  }

  loadPatientQr(){ if(!this.clinicalPatientId)return; this.api.get<any>('/clinical/patient/'+this.clinicalPatientId+'/qr').subscribe({next:x=>{this.qrImage=x.image;this.qrPayload=x.payload;},error:e=>alert(e?.error?.message||'Unable to generate patient QR.')}); }
  copyQrPayload(){ if(this.qrPayload) navigator.clipboard?.writeText(this.qrPayload); }

  markNotificationRead(id:string){this.api.put<any>('/clinical/notifications/'+id+'/read',{}).subscribe({next:()=>this.loadClinicalNotifications()});}

  // =====================================================
  // FHIR
  // =====================================================

  checkFhir() {

    this.api
      .get(
        '/fhir/metadata'
      )
      .subscribe(

        x => {

          this.fhir = x;

        }

      );

  }


  // =====================================================
  // SMART ON FHIR
  // =====================================================

  checkSmart() {

    this.api
      .get(
        '/smart/authorize?client_id=medisphere-demo&redirect_uri=http://localhost:4200/'
      )
      .subscribe(

        x => {

          this.smart = x;

        }

      );

  }


  // =====================================================
  // FORMAT CONSENT NAME
  // =====================================================

  pretty(k: string) {

    return k

      .replace(
        /([A-Z])/g,
        ' $1'
      )

      .replace(
        /^./,
        s => s.toUpperCase()
      );

  }


  // =====================================================
  // M3 MONITORING
  // =====================================================

  loadMonitoring(silent = false) {
    this.api.get<any>('/monitoring/overview', !silent).subscribe({
      next: x => { this.monitorOverview = x; this.monitoringLive = true; this.monitoringUpdated = new Date(); if (this.monitorPatientId) this.loadMonitorPatient(this.monitorPatientId, true); },
      error: () => { this.monitoringLive = false; if (!silent) alert('Monitoring service is unavailable. Check the backend.'); }
    });
  }

  selectMonitorPatient(id: string) { this.monitorPatientId = id; this.loadMonitorPatient(id); }

  loadMonitorPatient(id: string, silent = false) {
    this.api.get<any>('/monitoring/patient/' + id, !silent).subscribe({ next: x => this.monitorPatient = x, error: () => { if (!silent) alert('Unable to load patient monitoring data.'); } });
  }

  patientName(id: string) { return this.patients.find(p => p.id === id)?.name || ('Patient ' + id); }
  patientMrn(id: string) { return this.patients.find(p => p.id === id)?.mrn || '—'; }
  monitorStatusClass(status: string) { return String(status || '').toLowerCase(); }

  valueStatus(type: string, value: any): string {
    if (value === null || value === undefined || value === '') return 'NO DATA';
    const n = Number(value);
    if (type === 'heartRate') return n > 120 || n < 45 ? 'CRITICAL' : (n > 100 || n < 60 ? 'WARNING' : 'NORMAL');
    if (type === 'oxygen') return n < 92 ? 'CRITICAL' : (n < 95 ? 'WARNING' : 'NORMAL');
    if (type === 'glucose') return n > 250 || n < 55 ? 'CRITICAL' : (n > 180 || n < 70 ? 'WARNING' : 'NORMAL');
    if (type === 'temperature') return n >= 39 || n < 35 ? 'CRITICAL' : (n > 37.5 ? 'WARNING' : 'NORMAL');
    if (type === 'bp') { const s=Number(value?.systolic), d=Number(value?.diastolic); return s>180||s<90||d>120||d<60 ? 'CRITICAL' : (s>140||s<100||d>90||d<65 ? 'WARNING' : 'NORMAL'); }
    return 'NORMAL';
  }

  trendPoints(): number[] {
    if (!this.monitorPatient?.vitals) return [];
    return [...this.monitorPatient.vitals]
      .reverse()
      .map((v:any) => Number(v[this.trendKey]))
      .filter((v:number) => Number.isFinite(v))
      .slice(-30);
  }

  trendPolyline(): string {
    const pts = this.trendPoints(); if (!pts.length) return '';
    const min = Math.min(...pts), max = Math.max(...pts), range = max-min || 1;
    return pts.map((v,i) => `${(i/(Math.max(pts.length-1,1)))*620+10},${175-((v-min)/range)*145}`).join(' ');
  }
  trendMin() { const p=this.trendPoints(); return p.length ? Math.min(...p).toFixed(0) : '—'; }
  trendMax() { const p=this.trendPoints(); return p.length ? Math.max(...p).toFixed(0) : '—'; }

 // =====================================================
// LIVE WEARABLE DEMO STREAM
// =====================================================


private demoVitals: any = {
  heartRate: 82,
  systolic: 128,
  diastolic: 82,
  oxygen: 97,
  glucose: 118,
  temperature: 36.8
};

toggleLiveSimulation() {

  if (this.simulationRunning) {
    this.stopLiveSimulation();

  } else {
    this.startLiveSimulation();
  }

}

startLiveSimulation() {

  if (!this.monitorPatientId) {

    alert(
      'Select a patient stream first.'
    );

    return;
  }

  // Prevent duplicate timers
  this.stopLiveSimulation();

  this.simulationRunning = true;

  // Start from the currently displayed values
  const latest =
    this.monitorPatient?.latest || {};

  this.demoVitals = {

    heartRate:
      Number(latest.heartRate) || 82,

    systolic:
      Number(latest.systolic) || 128,

    diastolic:
      Number(latest.diastolic) || 82,

    oxygen:
      Number(latest.oxygen) || 97,

    glucose:
      Number(latest.glucose) || 118,

    temperature:
      Number(latest.temperature) || 36.8

  };

  // Immediately send first reading
  this.pushSimulatedVital();

  // Continue sending readings every 2.5 seconds
  this.simulationTimer =
    setInterval(() => {

      if (this.simulationRunning) {
        this.pushSimulatedVital();
      }

    }, 2500);

}

stopLiveSimulation() {

  this.simulationRunning = false;

  if (this.simulationTimer) {

    clearInterval(
      this.simulationTimer
    );

    this.simulationTimer = null;
  }

}

private randomDrift(
  value: number,
  amount: number,
  min: number,
  max: number
): number {

  const change =
    (Math.random() * 2 - 1) * amount;

  const next =
    value + change;

  return Math.max(
    min,
    Math.min(
      max,
      next
    )
  );

}

private randomInteger(
  value: number,
  amount: number,
  min: number,
  max: number
): number {

  return Math.round(
    this.randomDrift(
      value,
      amount,
      min,
      max
    )
  );

}

pushSimulatedVital() {

  if (
    !this.monitorPatientId ||
    !this.simulationRunning
  ) {

    return;
  }

  // ---------------------------------------------------
  // Generate continuously changing wearable values
  // ---------------------------------------------------

  this.demoVitals.heartRate =
    this.randomInteger(
      this.demoVitals.heartRate,
      7,
      60,
      115
    );

  this.demoVitals.systolic =
    this.randomInteger(
      this.demoVitals.systolic,
      5,
      105,
      145
    );

  this.demoVitals.diastolic =
    this.randomInteger(
      this.demoVitals.diastolic,
      4,
      65,
      95
    );

  this.demoVitals.oxygen =
    this.randomInteger(
      this.demoVitals.oxygen,
      1,
      94,
      99
    );

  this.demoVitals.glucose =
    this.randomInteger(
      this.demoVitals.glucose,
      10,
      80,
      180
    );

  this.demoVitals.temperature =
    Number(
      this.randomDrift(
        this.demoVitals.temperature,
        0.2,
        36.3,
        37.5
      ).toFixed(1)
    );

  const payload: any = {

    patientId:
      this.monitorPatientId,

    heartRate:
      this.demoVitals.heartRate,

    systolic:
      this.demoVitals.systolic,

    diastolic:
      this.demoVitals.diastolic,

    oxygen:
      this.demoVitals.oxygen,

    glucose:
      this.demoVitals.glucose,

    temperature:
      this.demoVitals.temperature,

    source:
      'WEARABLE-SIMULATOR'

  };

  // ---------------------------------------------------
  // IMPORTANT:
  // Background stream must NOT show global loader
  // ---------------------------------------------------

  this.api
    .post<any>(
      '/vitals',
      payload,
      false
    )
    .subscribe({

      next: () => {

        /*
         * Refresh the selected patient's monitoring
         * data silently.
         */

        this.loadMonitorPatient(
          this.monitorPatientId,
          true
        );

        this.loadMonitoring(
          true
        );

      },

      error: (err) => {

        /*
         * IMPORTANT:
         * Do NOT stop the whole live demo because
         * one background request failed.
         */

        console.error(
          'Live wearable event failed:',
          err
        );

        /*
         * Keep simulation running.
         * The next interval will try again.
         */

      }

    });

}

  // =====================================================
  // LOGOUT
  // =====================================================

  logout() {

    this.stopLiveSimulation();

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    localStorage.clear();

    this.router.navigateByUrl(
      '/login'
    );

  }

}
