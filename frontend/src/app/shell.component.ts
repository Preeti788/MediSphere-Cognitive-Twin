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
<div class="app">

  <aside>

    <div class="logo">
      <span>✚</span>

      <div>
        <b>MediSphere</b>
        <small>Clinical Intelligence</small>
      </div>
    </div>

    <button
      *ngFor="let x of nav"
      [class.active]="tab===x.id"
      (click)="tab=x.id">

      {{x.icon}}
      <span>{{x.label}}</span>

    </button>

    <div class="side-bottom">

      <div class="user-mini">

        {{user?.name}}

        <small>
          {{user?.role}}
        </small>

      </div>

      <button
        (click)="logout()">

        ↪ Logout

      </button>

    </div>

  </aside>


  <main>

    <div class="clinical-topnav">
      <div class="doctor-strip">
        <span class="doctor-avatar">RS</span>
        <div><b>Dr. Robert Smith, MD</b><small>Lead Cardiologist · MediSphere Clinical Twin</small></div>
      </div>
      <div class="milestone-nav">
        <button [class.active]="tab==='dashboard'" (click)="tab='dashboard'">M1 Twin 360</button>
        <button [class.active]="tab==='aiRisk'" (click)="tab='aiRisk'">M2 AI Prediction</button>
        <button [class.active]="tab==='monitoring'" (click)="tab='monitoring'">M3 Real-Time Stream</button>
        <button [class.active]="tab==='patient360'" (click)="tab='patient360'">M4 Careplans</button>
      </div>
      <span class="hipaa-badge">● HIPAA LIVE · TLS 1.3 ENCRYPTED</span>
    </div>

    <header>

      <div>

        <h1>
          {{title()}}
        </h1>

        <p>
          Unified digital health workspace
        </p>

      </div>

      <div class="header-actions">

        <span class="live">
          ● System online
        </span>

        <button
          (click)="refresh()">

          ↻ Refresh

        </button>

      </div>

    </header>


    <!-- ================================================= -->
    <!-- DASHBOARD -->
    <!-- ================================================= -->

    <section *ngIf="tab==='dashboard'" class="content dashboard-page">

      <div class="dash-hero">
        <div class="dash-hero-copy">
          <div class="eyebrow">CLINICAL OPERATIONS · TODAY</div>
          <h2>Good afternoon, {{user?.name || 'Care Team'}}.</h2>
          <p>Monitor your patient population, review risk signals and respond to clinical alerts from one workspace.</p>
          <div class="hero-actions">
            <button class="hero-primary" (click)="tab='monitoring'">♥ Open live monitoring</button>
            <button class="hero-secondary" (click)="tab='patients'">View patient list →</button>
          </div>
        </div>
        <div class="dash-date-card">
          <span>{{today | date:'EEEE'}}</span>
          <strong>{{today | date:'dd'}}</strong>
          <b>{{today | date:'MMMM yyyy'}}</b>
          <small>System status · <em>Operational</em></small>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card stat-patients" (click)="tab='patients'">
          <div class="stat-top"><span class="stat-icon">◉</span><span class="stat-link">View →</span></div>
          <small>Patient population</small><strong>{{dash.patients}}</strong><span>Active patient records</span>
        </div>
        <div class="stat-card stat-appointments" (click)="tab='appointments'">
          <div class="stat-top"><span class="stat-icon">▣</span><span class="stat-link">Schedule →</span></div>
          <small>Appointments today</small><strong>{{dash.appointments}}</strong><span>Scheduled clinical visits</span>
        </div>
        <div class="stat-card stat-alerts" (click)="tab='alerts'">
          <div class="stat-top"><span class="stat-icon">!</span><span class="stat-link">Review →</span></div>
          <small>Clinical attention</small><strong>{{dash.activeAlerts}}</strong><span>Open alerts</span>
        </div>
        <div class="stat-card stat-medicines" (click)="tab='pharmacy'">
          <div class="stat-top"><span class="stat-icon">+</span><span class="stat-link">Inventory →</span></div>
          <small>Medicine catalogue</small><strong>{{dash.medicines}}</strong><span>Inventory records</span>
        </div>
      </div>

      <div class="dashboard-main-grid">
        <div class="panel patient-overview-panel">
          <div class="section-heading">
            <div><span class="section-kicker">PATIENT OVERVIEW</span><h3>Recent patient records</h3><p>Quick access to the people currently in the system.</p></div>
            <button (click)="tab='patients'">All patients</button>
          </div>
          <div class="patient-roster">
            <div *ngFor="let p of patients.slice(0,4)" class="patient-roster-row" (click)="selectPatient(p)">
              <div class="patient-avatar">{{initials(p.name)}}</div>
              <div class="patient-roster-info"><b>{{p.name}}</b><span>{{p.mrn}} · {{p.gender || 'Patient'}}</span></div>
              <span class="record-chip">Record active</span>
              <span class="roster-arrow">→</span>
            </div>
            <div *ngIf="!patients.length" class="empty-small">No patient records available.</div>
          </div>
        </div>

        <div class="panel attention-panel">
          <div class="section-heading">
            <div><span class="section-kicker">CARE SIGNALS</span><h3>Clinical attention</h3><p>Use alerts and monitoring to respond quickly.</p></div>
          </div>
          <div class="signal-card signal-red" (click)="tab='alerts'">
            <span class="signal-icon">⚠</span><div><b>{{dash.activeAlerts}} open alert(s)</b><small>Review the clinical alerts workspace</small></div><i>→</i>
          </div>
          <div class="signal-card signal-teal" (click)="tab='monitoring'">
            <span class="signal-icon">♥</span><div><b>Live monitoring</b><small>Check the latest vital readings</small></div><i>→</i>
          </div>
          <div class="signal-card signal-blue" (click)="tab='aiRisk'">
            <span class="signal-icon">✦</span><div><b>AI risk review</b><small>Explore cardiovascular & diabetes factors</small></div><i>→</i>
          </div>
        </div>
      </div>

      <div class="dashboard-bottom-grid">
        <div class="panel appointments-panel">
          <div class="section-heading"><div><span class="section-kicker">SCHEDULE</span><h3>Upcoming appointments</h3></div><button (click)="tab='appointments'">View all</button></div>
          <div *ngFor="let a of appointments.slice(0,4)" class="appointment-modern">
            <div class="appointment-time"><b>{{a.time || '—'}}</b><span>{{a.date || 'Today'}}</span></div>
            <div class="appointment-person"><b>{{a.patientName || 'Patient'}}</b><span>{{a.doctorName || 'Care team'}} · {{a.specialty || 'Consultation'}}</span></div>
            <span class="appointment-status">{{a.status || 'SCHEDULED'}}</span>
          </div>
          <div *ngIf="!appointments.length" class="empty-small">No upcoming appointments.</div>
        </div>

        <div class="panel quick-panel">
          <div class="section-heading"><div><span class="section-kicker">SHORTCUTS</span><h3>Quick actions</h3></div></div>
          <div class="quick-action-grid">
            <button (click)="newPatient()"><span>+</span><b>Add patient</b><small>New record</small></button>
            <button (click)="tab='patient360'"><span>◎</span><b>Patient 360</b><small>Full profile</small></button>
            <button (click)="tab='aiRisk'"><span>✦</span><b>AI risk</b><small>Run assessment</small></button>
            <button (click)="tab='monitoring'"><span>♥</span><b>Monitoring</b><small>Live vitals</small></button>
          </div>
        </div>
      </div>

      <div class="dashboard-note"><span>●</span><div><b>MediSphere clinical workspace</b><small>Digital Health Twin · AI-assisted risk review · Real-time monitoring · Clinical alerts</small></div><em>Decision-support demonstration</em></div>
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


              <td>

                <button
                  (click)="selectPatient(p)">

                  Patient 360

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

            <h3>
              Care Plans
            </h3>


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

        <div *ngIf="risk" class="panel risk">
          <h3>AI Risk Summary</h3>
          <div class="risk-summary-line"><b>Cardiovascular: {{risk.cardiovascularLevel}} · {{risk.cardiovascularScore}}/100</b><b>Diabetes: {{risk.diabetesLevel}} · {{risk.diabetesScore}}/100</b></div>
          <p>Top factors: {{risk.cardiovascularFactors?.[0]?.feature || 'No major factors detected'}}</p>
          <small>Open <b>AI Risk Lab</b> for feature-level explanations and federated-learning simulation.</small>
        </div>


      </div>

    </section>


    <!-- ================================================= -->
    <!-- MILESTONE 2: AI RISK LAB -->
    <section *ngIf="tab==='aiRisk'" class="content screenshot-ai-page">
      <div class="ai-page-head">
        <div>
          <div class="ai-brandline"><span class="brand-mark">◇</span><span>MEDISPHERE</span><small>COGNITIVE TWIN</small></div>
          <h2>AI Risk Prediction Engine</h2>
          <p>TensorFlow Federated (TFF) privacy-preserving risk prediction with SHAP-style explainability across multi-hospital nodes.</p>
        </div>
        <div class="ai-head-actions"><button (click)="loadFederated()">⚡ Advanced FL Training Round</button><button class="blue-action" (click)="runRisk(aiPatientId)" [disabled]="!aiPatientId">⟳ Recalculate Models</button></div>
      </div>

      <div class="ai-kpi-grid">
        <div class="ai-kpi"><span>Risk Predictions</span><strong>{{riskHistory?.length || 342}}</strong><small>Today</small></div>
        <div class="ai-kpi"><span>Model Accuracy</span><strong>91.4%</strong><small>↑ 2.1% FL round 47</small></div>
        <div class="ai-kpi"><span>High Risk Patients</span><strong>{{highRiskCount()}}</strong><small>Require intervention</small></div>
      </div>

      <div class="ai-control-strip">
        <div><span>Patient</span><select [(ngModel)]="aiPatientId"><option value="">Select patient</option><option *ngFor="let p of patients" [value]="p.id">{{p.name}}</option></select></div>
        <div><span>Model</span><b>CVD-Risk-v3.2</b></div>
        <div><span>Federated Round</span><b>47</b></div>
        <button class="run-ai" (click)="runRisk(aiPatientId)" [disabled]="!aiPatientId">Run Prediction</button>
      </div>

      <div *ngIf="risk" class="cvd-card">
        <div class="cvd-title-row"><div><span class="cyan-tag">TENSORFLOW FEDERATED</span><h3>Cardiovascular Risk Prediction</h3></div><div class="patient-tags"><span>Patient: <b>{{selectedRiskPatientName()}}</b></span><span>Model: <b>CVD-Risk-v3.2</b></span><span>Federated Round: <b>47</b></span></div></div>
        <div class="input-pills">
          <span>Age: <b>58</b></span><span>BP: <b>130/85 mmHg</b></span><span>HbA1c: <b>7.2%</b></span><span>LDL: <b>120 mg/dL</b></span><span>eGFR: <b>65 mL/min</b></span><span>Smoking: <b>Yes (Former)</b></span><span>FH: <b>Positive</b></span>
        </div>
        <div class="risk-banner"><span>⚠</span><div><b>Prediction: {{risk.cardiovascularScore}}% 10-year CVD Risk | Category: <em>{{risk.cardiovascularLevel}} RISK</em></b><small>Clinical decision-support threshold shown for demonstration.</small></div></div>
        <div class="shap-head"><b>SHAP Explanation</b><span>Σ SHAP · Base (12.1) → {{risk.cardiovascularScore}} Output</span></div>
        <div class="factor-bars">
          <div *ngFor="let f of risk.cardiovascularFactors?.slice(0,5)" class="factor-bar"><div><span>{{f.feature}}</span><b>{{f.contribution > 0 ? '+' : ''}}{{f.contribution}}%</b></div><small>{{f.value}} {{f.unit}}</small><i><span [style.width.%]="barWidth(f.contribution)"></span></i></div>
        </div>
      </div>

      <div *ngIf="risk" class="dual-risk">
        <div class="risk-mini-card"><span>Diabetes Complication Risk</span><strong>{{risk.diabetesScore}}%</strong><em>{{risk.diabetesLevel}}</em><p>Feature contribution view</p></div>
        <div class="risk-mini-card"><span>Privacy / Method</span><strong>DATA LOCAL</strong><em>FEDERATED DEMO</em><p>{{risk.privacy}}</p></div>
      </div>

      <div *ngIf="federated" class="fl-strip">
        <div><b>Federated Learning · Round 47</b><small>Raw patient data remains at each hospital; only model updates are aggregated.</small></div>
        <div *ngFor="let h of federated.hospitals"><b>{{h.hospital}}</b><span>{{h.samples}} samples · weight {{h.localModelWeight}}</span></div>
        <strong>Aggregate {{federated.aggregatedModelWeight}}</strong>
      </div>

      <div *ngIf="riskHistory?.length" class="dark-history">
        <div class="section-dark-head"><b>Recent Risk Assessments</b><span>Patient history</span></div>
        <div *ngFor="let r of riskHistory.slice(0,4)" class="dark-history-row"><span>{{r.assessedAt | date:'short'}}</span><b>CV {{r.cardiovascularScore}}</b><em>{{r.cardiovascularLevel}}</em><b>DM {{r.diabetesScore}}</b><em>{{r.diabetesLevel}}</em></div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- MILESTONE 3 · REAL-TIME MONITORING & ALERTS -->
    <!-- ================================================= -->
    <section *ngIf="tab==='monitoring'" class="content">
      <div class="hero monitoring-hero">
        <div>
          <span class="eyebrow">MILESTONE 3 · REAL-TIME MONITORING</span>
          <h2>Watch patient vitals as they change.</h2>
          <p>Continuous demo monitoring checks incoming vital readings and creates a clinical alert when a configured threshold is crossed.</p>
        </div>
        <div class="hero-icon">♥</div>
      </div>

      <div class="panel monitoring-controls">
        <div class="panel-head">
          <div>
            <h3>Live monitoring console</h3>
            <small class="muted">Simulation mode · no physical wearable is required for the demonstration.</small>
          </div>
          <span class="monitor-status" [class.running]="monitoringRunning">{{monitoringRunning ? '● Monitoring active' : '○ Monitoring paused'}}</span>
        </div>
        <div class="ai-controls">
          <select [(ngModel)]="monitoringPatientId" (change)="loadMonitoring()">
            <option value="">Select patient</option>
            <option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option>
          </select>
          <button class="primary" (click)="startMonitoring()" [disabled]="!monitoringPatientId || monitoringRunning">Start live monitoring</button>
          <button (click)="stopMonitoring()" [disabled]="!monitoringRunning">Stop</button>
          <button class="danger-btn" (click)="simulateCritical()" [disabled]="!monitoringPatientId">Simulate HR 145 bpm</button>
          <button (click)="clearMonitoringView()" [disabled]="!monitoring">Clear view</button>
        </div>
      </div>

      <div *ngIf="monitoring" class="cards monitoring-vitals">
        <div class="metric"><span>Heart Rate</span><b>{{monitoring.latestVital?.heartRate || '—'}}</b><small>bpm</small></div>
        <div class="metric"><span>Blood Pressure</span><b>{{monitoring.latestVital?.systolic || '—'}} / {{monitoring.latestVital?.diastolic || '—'}}</b><small>mmHg</small></div>
        <div class="metric"><span>SpO₂</span><b>{{monitoring.latestVital?.oxygen || '—'}}</b><small>% saturation</small></div>
        <div class="metric"><span>Glucose</span><b>{{monitoring.latestVital?.glucose || '—'}}</b><small>mg/dL</small></div>
      </div>

      <div *ngIf="monitoring" class="grid2">
        <div class="panel">
          <div class="panel-head"><h3>Current monitoring status</h3><span class="status-badge" [class.attention]="monitoringStatus()!=='STABLE'">{{monitoringStatus()}}</span></div>
          <div class="monitor-detail"><span>Source</span><b>{{monitoring.latestVital?.source || '—'}}</b></div>
          <div class="monitor-detail"><span>Last reading</span><b>{{monitoring.latestVital?.recordedAt | date:'medium'}}</b></div>
          <div class="monitor-detail"><span>Temperature</span><b>{{monitoring.latestVital?.temperature || '—'}} °C</b></div>
          <p class="muted">The alert engine evaluates heart rate, oxygen, blood pressure, temperature and glucose for each incoming reading.</p>
        </div>

        <div class="panel">
          <div class="panel-head"><h3>Recent alerts</h3><span class="pill">{{monitoringAlerts.length}} shown</span></div>
          <div *ngIf="!monitoringAlerts.length" class="empty-small">No recent alert for this patient.</div>
          <div *ngFor="let a of monitoringAlerts" class="alert-card">
            <div><span class="severity" [class.critical]="a.severity==='CRITICAL'">{{a.severity}}</span><b>{{prettyAlertType(a.type)}}</b></div>
            <p>{{a.message}}</p>
            <div class="alert-meta"><span>{{a.observedValue ?? '—'}} {{a.unit || ''}}</span><span>Limit: {{a.threshold || 'configured threshold'}}</span></div>
            <small>{{a.createdAt | date:'medium'}} · {{a.recipient || 'Care team'}} · {{a.acknowledged ? 'Acknowledged' : 'Awaiting acknowledgement'}}</small>
            <button *ngIf="!a.acknowledged" class="small-action" (click)="ack(a.id); loadMonitoring()">Acknowledge</button>
          </div>
        </div>
      </div>

      <div *ngIf="monitoring?.recentVitals?.length" class="panel recent-readings-panel">
        <div class="panel-head"><h3>Recent vital readings</h3><span class="pill">Latest 8</span></div>
        <div class="readings-list">
          <div class="reading-row reading-head"><span>Time</span><span>HR</span><span>BP</span><span>SpO₂</span><span>Glucose</span></div>
          <div *ngFor="let v of monitoring.recentVitals" class="reading-row">
            <span>{{v.recordedAt | date:'shortTime'}}</span><b>{{v.heartRate ?? '—'}}</b><span>{{v.systolic ?? '—'}}/{{v.diastolic ?? '—'}}</span><span>{{v.oxygen ?? '—'}}%</span><span>{{v.glucose ?? '—'}}</span>
          </div>
        </div>
      </div>

      <div class="panel threshold-panel">
        <div class="panel-head"><h3>Monitoring thresholds</h3><span class="pill">Demo configuration</span></div>
        <div class="threshold-grid">
          <div><b>Heart rate</b><span>High &gt; 120 · Critical &gt; 140 bpm</span></div>
          <div><b>SpO₂</b><span>High &lt; 92% · Critical &lt; 90%</span></div>
          <div><b>Systolic BP</b><span>High &gt; 160 · Critical ≥ 180 mmHg</span></div>
          <div><b>Glucose</b><span>High &gt; 250 · Critical ≥ 300 mg/dL</span></div>
        </div>
      </div>
    </section>

    <!-- ================================================= -->
    <!-- APPOINTMENTS -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='appointments'"
      class="content">


      <div class="toolbar">

        <button
          class="primary"
          (click)="addAppointment()">

          + New appointment

        </button>

      </div>


      <div class="panel table">

        <table>

          <thead>

            <tr>

              <th>
                Date
              </th>

              <th>
                Patient
              </th>

              <th>
                Doctor
              </th>

              <th>
                Specialty
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              *ngFor="let a of appointments">

              <td>

                {{a.date}}
                {{a.time}}

              </td>

              <td>
                {{a.patientName}}
              </td>

              <td>
                {{a.doctorName}}
              </td>

              <td>
                {{a.specialty}}
              </td>

              <td>

                <span class="pill">
                  {{a.status}}
                </span>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>


    <!-- ================================================= -->
    <!-- VITALS -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='vitals'"
      class="content">


      <div class="panel">

        <h3>
          Wearable / Vital Ingestion
        </h3>


        <p>

          Record a vital and the backend persists it,
          publishes a Kafka event and creates an alert
          when thresholds are crossed.

        </p>


        <div class="form-grid">


          <input
            [(ngModel)]="vital.patientId"
            placeholder="Patient ID">


          <input
            type="number"
            [(ngModel)]="vital.heartRate"
            placeholder="Heart rate">


          <input
            type="number"
            [(ngModel)]="vital.systolic"
            placeholder="Systolic">


          <input
            type="number"
            [(ngModel)]="vital.diastolic"
            placeholder="Diastolic">


          <input
            type="number"
            [(ngModel)]="vital.oxygen"
            placeholder="SpO₂">


          <input
            type="number"
            [(ngModel)]="vital.glucose"
            placeholder="Glucose">

        </div>


        <button
          class="primary"
          (click)="sendVital()">

          Send wearable event

        </button>

      </div>

    </section>


    <!-- ================================================= -->
    <!-- ALERTS -->
    <section *ngIf="tab==='alerts'" class="content screenshot-alerts-page">
      <div class="alert-page-head"><div><span class="eyebrow">MILESTONE 3 · STREAM & ANOMALY</span><h2>Alerts & Telemetry</h2><p>Review abnormal vital-sign events and escalate cardiac alerts to the clinical response team.</p></div><span class="monitor-live">● LIVE STREAM</span></div>
      <div class="alert-summary-grid"><div><span>Open Alerts</span><strong>{{alerts.length}}</strong></div><div><span>Critical</span><strong>{{criticalAlertCount()}}</strong></div><div><span>Patients Monitored</span><strong>{{patients.length}}</strong></div></div>
      <div class="dark-alert-table">
        <div class="alert-table-head"><span>Severity</span><span>Patient</span><span>Signal</span><span>Value</span><span>Created</span><span>Action</span></div>
        <div *ngFor="let a of alerts" class="alert-table-row"><span><b class="severity-dot" [class.critical-dot]="a.severity==='CRITICAL'"></b>{{a.severity}}</span><b>{{a.patientName || 'Patient'}}</b><span>{{a.type || 'CARDIAC'}}</span><span>{{a.observedValue ?? '—'}} {{a.unit || ''}}</span><span>{{a.createdAt | date:'short'}}</span><span><button (click)="ack(a.id)">Acknowledge</button><button class="escalate-btn" (click)="openEscalation(a)">Escalate</button></span></div>
        <div *ngIf="!alerts.length" class="empty-dark">No active alerts. Use Live Monitoring to simulate HR 145 bpm.</div>
      </div>
    </section>

    <div *ngIf="escalationOpen" class="modal-backdrop">
      <div class="escalation-modal">
        <button class="modal-close" (click)="closeEscalation()">×</button>
        <h3>⚠ Escalate Cardiac Alert</h3>
        <p>Escalating will dispatch a priority clinical notification to the selected emergency response team and record the event in the demonstration audit trail.</p>
        <label>Escalation Target Team:</label>
        <select [(ngModel)]="escalationTeam"><option>Rapid Response Team (Cardiac/Code Blue)</option><option>Chief On-Call Cardiologist (Dr. Vance)</option><option>Cath Lab Emergency Interventional Team</option><option>ICU Critical Care Attending</option></select>
        <div class="modal-actions"><button (click)="closeEscalation()">Cancel</button><button class="dispatch-btn" (click)="dispatchEscalation()">Dispatch Priority Escalation</button></div>
      </div>
    </div>

    <!-- PHARMACY -->
    <!-- ================================================= -->

    <section
      *ngIf="tab==='pharmacy'"
      class="content">


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
.risk-summary-line{display:flex;gap:18px;flex-wrap:wrap}.risk-summary-line b{color:#0b8f7b}

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



.ai-hero{margin-bottom:16px}.ai-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.ai-controls select{min-width:260px;padding:11px;border:1px solid #d9e5eb;border-radius:8px;background:white}.primary{background:#0b8f7b!important;color:white!important;border-color:#0b8f7b!important}.muted{display:block;margin-top:10px;color:#72828b}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.ai-risk-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.risk-score-card{background:white;border:1px solid #dce8ed;border-radius:14px;padding:20px;box-shadow:0 5px 18px rgba(24,55,72,.05)}.risk-score-card span{display:block;color:#71808a;font-size:12px;text-transform:uppercase;letter-spacing:.08em}.risk-score-card strong{display:block;font-size:42px;margin:8px 0;color:#163b49}.risk-score-card strong small{font-size:15px;color:#87939a}.risk-score-card b{display:inline-block;background:#e7f7f3;color:#087b6d;border-radius:20px;padding:6px 10px;font-size:11px}.risk-score-card b.moderate{background:#fff2d8;color:#9b6200}.risk-score-card b.high{background:#ffe3e0;color:#a62318}.factor-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #edf2f4}.factor-row:last-child{border-bottom:0}.factor-row b{display:block}.factor-row small{display:block;color:#80909a;margin-top:3px}.factor-row>span{font-weight:800;color:#a62318}.factor-row>span.down{color:#0b8f7b}.privacy-panel{margin-top:16px}.federated-panel{margin-top:16px}.federated-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:14px 0}.hospital-card{border:1px solid #dce8ed;border-radius:12px;padding:14px;background:#fbfdfd}.hospital-card span,.hospital-card small{display:block;color:#75858e;margin-top:5px}.hospital-card strong{display:block;font-size:24px;margin-top:8px}.aggregate{padding:12px;background:#edf7f5;border-radius:10px}.history-row{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:10px;padding:11px 0;border-bottom:1px solid #edf2f4;font-size:12px}.history-row:last-child{border-bottom:0}

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

.monitoring-hero{margin-bottom:16px}.monitoring-controls{margin-bottom:16px}.monitor-status{font-size:12px;color:#71808a;font-weight:800}.monitor-status.running{color:#0b8f7b}.danger-btn{border-color:#d9aaa5!important;color:#a62318!important;background:#fff7f6!important}.monitoring-vitals{margin-bottom:16px}.status-badge{font-size:11px;font-weight:800;padding:6px 10px;border-radius:20px;background:#e7f7f3;color:#087b6d}.status-badge.attention{background:#ffe3e0;color:#a62318}.monitor-detail{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #edf2f4;font-size:13px}.monitor-detail span{color:#7b8b94}.alert-card{padding:12px 0;border-bottom:1px solid #edf2f4}.alert-card:last-child{border-bottom:0}.alert-card b{margin-left:8px;font-size:12px}.alert-card p{margin:7px 0 4px;font-size:12px}.alert-card small{color:#7c8b93}.alert-meta{display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:#697b84;margin:6px 0}.small-action{font-size:10px;padding:6px 9px;margin-top:7px}.recent-readings-panel{margin-top:16px}.readings-list{margin-top:10px}.reading-row{display:grid;grid-template-columns:1.4fr .7fr 1fr .8fr 1fr;gap:10px;padding:10px 0;border-bottom:1px solid #edf2f4;font-size:12px}.reading-row:last-child{border-bottom:0}.reading-head{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#7a8a93;font-weight:800}.threshold-panel{margin-top:16px}.threshold-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.threshold-grid div{background:#f8fbfc;border:1px solid #e0eaee;border-radius:10px;padding:13px}.threshold-grid b,.threshold-grid span{display:block}.threshold-grid span{font-size:11px;color:#72828b;margin-top:6px;line-height:1.5}.risk-history-card{border:1px solid #e1eaee;border-radius:12px;padding:14px;margin-top:12px}.history-top{display:flex;justify-content:space-between;font-size:12px}.history-top span{color:#7d8c95}.history-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}.history-metrics>div{background:#f8fbfc;border-radius:10px;padding:12px}.history-metrics small{display:block;color:#75858e;font-size:10px;text-transform:uppercase;letter-spacing:.04em}.history-metrics strong{display:block;font-size:19px;margin:5px 0}.level-badge{display:inline-block;padding:4px 8px;border-radius:20px;font-size:10px;font-weight:800;background:#e7f7f3;color:#087b6d}.level-badge.moderate{background:#fff2d8;color:#9b6200}.level-badge.high{background:#ffe3e0;color:#a62318}.history-note{font-size:10px;color:#82919a}.severity{display:inline-block;padding:5px 8px;border-radius:20px;background:#fff2d8;color:#9b6200;font-size:10px;font-weight:800}.severity.critical{background:#ffe3e0;color:#a62318}
@media(max-width:900px){.threshold-grid{grid-template-columns:1fr 1fr}.history-metrics{grid-template-columns:1fr}}

/* =====================================================
   DASHBOARD REDESIGN
   ===================================================== */
.dashboard-page{max-width:1500px;margin:0 auto}
.dash-hero{display:grid;grid-template-columns:1fr 220px;gap:18px;margin-bottom:18px;background:linear-gradient(135deg,#09283a 0%,#0b5360 55%,#0b8e7d 100%);border-radius:22px;padding:30px;color:#fff;box-shadow:0 14px 32px rgba(11,55,70,.12)}
.dash-hero .eyebrow{color:#a9e5dc;font-weight:800;letter-spacing:2px}
.dash-hero h2{font-size:31px;margin:9px 0 7px;letter-spacing:-.6px}
.dash-hero p{max-width:680px;color:#d7ecef;line-height:1.6;margin:0}
.hero-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}
.hero-actions button{font-size:12px;padding:11px 15px;border-radius:10px}
.hero-primary{background:#fff!important;color:#0a6f68!important;border:0!important}
.hero-secondary{background:rgba(255,255,255,.08)!important;color:#fff!important;border:1px solid rgba(255,255,255,.22)!important}
.dash-date-card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:18px;display:flex;flex-direction:column;justify-content:center;text-align:center}
.dash-date-card span{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#b8d9de}.dash-date-card strong{font-size:48px;line-height:1;margin:5px 0}.dash-date-card b{font-size:12px}.dash-date-card small{margin-top:15px;color:#b8d9de}.dash-date-card em{font-style:normal;color:#b8f0df}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
.stat-card{background:#fff;border:1px solid #e2ebef;border-radius:16px;padding:17px;cursor:pointer;transition:.18s;box-shadow:0 5px 18px rgba(20,50,65,.03)}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 9px 22px rgba(20,50,65,.08)}
.stat-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.stat-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-weight:900}.stat-link{font-size:10px;color:#82949d}.stat-card small{display:block;color:#748691;font-size:11px}.stat-card strong{display:block;font-size:30px;margin:3px 0}.stat-card>span:last-child{font-size:10px;color:#9aa8ae}.stat-patients .stat-icon{background:#e8f6f4;color:#087b6d}.stat-appointments .stat-icon{background:#eef3ff;color:#496db3}.stat-alerts .stat-icon{background:#fff0ed;color:#b94b3d}.stat-medicines .stat-icon{background:#f2eefb;color:#7254a1}
.dashboard-main-grid{display:grid;grid-template-columns:1.35fr .85fr;gap:18px}.dashboard-bottom-grid{display:grid;grid-template-columns:1.35fr .85fr;gap:18px;margin-top:18px}
.section-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:13px}.section-heading h3{margin:3px 0 3px}.section-heading p{margin:0;color:#87969f;font-size:11px}.section-kicker{font-size:9px;letter-spacing:1.5px;color:#0b907f;font-weight:900}
.patient-roster-row{display:flex;align-items:center;gap:12px;padding:13px 5px;border-bottom:1px solid #edf2f4;cursor:pointer}.patient-roster-row:last-child{border-bottom:0}.patient-avatar{width:40px;height:40px;border-radius:12px;background:#e5f5f2;color:#08796d;display:grid;place-items:center;font-size:11px;font-weight:900}.patient-roster-info{flex:1}.patient-roster-info b{display:block;font-size:13px}.patient-roster-info span{display:block;color:#82929b;font-size:10px;margin-top:3px}.record-chip{font-size:9px;padding:5px 8px;border-radius:20px;background:#f1f8f6;color:#398277}.roster-arrow{color:#9aabb3;font-size:15px}
.attention-panel{background:#fbfdfd}.signal-card{display:flex;align-items:center;gap:10px;border:1px solid #e4ecef;border-radius:12px;padding:12px;margin-top:9px;cursor:pointer}.signal-card>div{flex:1}.signal-icon{width:31px;height:31px;border-radius:9px;display:grid;place-items:center;font-weight:900}.signal-card b{display:block;font-size:11px}.signal-card small{display:block;color:#85949c;font-size:10px;margin-top:3px}.signal-card i{font-style:normal;color:#9aabb3}.signal-red .signal-icon{background:#fff0ed;color:#b94b3d}.signal-teal .signal-icon{background:#e7f7f3;color:#087b6d}.signal-blue .signal-icon{background:#eef3ff;color:#496db3}
.appointment-modern{display:flex;align-items:center;gap:15px;padding:12px 5px;border-bottom:1px solid #edf2f4}.appointment-modern:last-child{border-bottom:0}.appointment-time{width:65px}.appointment-time b{display:block;font-size:12px}.appointment-time span{display:block;font-size:9px;color:#8999a1;margin-top:3px}.appointment-person{flex:1}.appointment-person b{display:block;font-size:12px}.appointment-person span{display:block;font-size:10px;color:#82929b;margin-top:3px}.appointment-status{font-size:9px;font-weight:900;padding:5px 8px;border-radius:15px;background:#edf7f5;color:#087b6d}
.quick-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.quick-action-grid button{display:grid;grid-template-columns:28px 1fr;text-align:left;align-items:center;padding:11px;border-radius:11px;background:#f9fbfc}.quick-action-grid button span{grid-row:span 2;width:26px;height:26px;border-radius:8px;background:#e8f5f3;color:#087b6d;display:grid;place-items:center}.quick-action-grid button b{font-size:11px}.quick-action-grid button small{font-size:9px;color:#87979f}.dashboard-note{margin-top:18px;border:1px solid #dcebe8;background:#f5fbfa;border-radius:13px;padding:12px 15px;display:flex;align-items:center;gap:10px}.dashboard-note>span{color:#0b9b86}.dashboard-note div{flex:1}.dashboard-note b{display:block;font-size:11px;color:#235467}.dashboard-note small{display:block;color:#82949d;font-size:9px;margin-top:3px}.dashboard-note em{font-size:9px;color:#75878f;font-style:normal}
@media(max-width:1000px){.stat-grid{grid-template-columns:1fr 1fr}.dashboard-main-grid,.dashboard-bottom-grid{grid-template-columns:1fr}.dash-hero{grid-template-columns:1fr}.dash-date-card{display:none}}
@media(max-width:600px){.stat-grid{grid-template-columns:1fr}.quick-action-grid{grid-template-columns:1fr}.dashboard-note{align-items:flex-start;flex-wrap:wrap}.dashboard-note em{width:100%;margin-left:19px}}

/* =====================================================
   SCREENSHOT-STYLE CLINICAL TWIN UI
   ===================================================== */
.app{background:#07111d;color:#dce8f5}
main{background:#07111d;min-height:100vh}
header{background:#0a1523!important;border-bottom:1px solid #1d2c3d!important;color:#dce8f5!important}
header h1,header p{color:#dce8f5!important}
header p{opacity:.65}
.content{color:#dce8f5}
.panel,.table{background:#0d1927!important;border-color:#203247!important;color:#dce8f5}
.panel h3,.panel h4,.section-heading h3{color:#edf5ff}
.clinical-topnav{height:66px;display:flex;align-items:center;gap:20px;padding:0 22px;background:#07121f;border-bottom:1px solid #203044;position:sticky;top:0;z-index:5}
.doctor-strip{display:flex;align-items:center;gap:9px;min-width:255px}.doctor-strip b{font-size:12px}.doctor-strip small{display:block;color:#7890a7;font-size:9px;margin-top:2px}.doctor-avatar{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#233a53;color:#65d6ff;font-size:9px;font-weight:800}
.milestone-nav{display:flex;gap:5px;flex:1}.milestone-nav button{background:transparent!important;border:1px solid transparent!important;color:#8196aa!important;padding:8px 12px!important;border-radius:18px!important;font-size:10px!important}.milestone-nav button.active{border-color:#21b8ff!important;color:#53ccff!important;background:#0e2638!important;box-shadow:0 0 16px rgba(33,184,255,.1)}
.hipaa-badge{font-size:8px;color:#65e2c5;white-space:nowrap}
.screenshot-ai-page,.screenshot-alerts-page{max-width:1500px;margin:0 auto;background:radial-gradient(circle at 70% 0%,rgba(24,79,110,.12),transparent 40%)}
.ai-page-head,.alert-page-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:18px}.ai-brandline{font-size:10px;letter-spacing:1.5px;color:#d8e9f6;font-weight:800;display:flex;align-items:center;gap:7px}.ai-brandline small{font-size:7px;color:#68839a}.brand-mark{color:#36c7ff;font-size:20px}.ai-page-head h2,.alert-page-head h2{font-size:25px;margin:9px 0 4px;color:#f0f7ff}.ai-page-head p,.alert-page-head p{margin:0;color:#7991a7;font-size:11px}.ai-head-actions{display:flex;gap:8px}.ai-head-actions button{background:#102234!important;border:1px solid #2b4056!important;color:#b9d4e9!important;font-size:10px;padding:10px 13px;border-radius:7px}.ai-head-actions .blue-action{background:#0d8de0!important;color:white!important;border-color:#0d8de0!important}
.ai-kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.ai-kpi{background:linear-gradient(145deg,#0e1d2d,#0a1623);border:1px solid #21364c;border-radius:8px;padding:14px 16px}.ai-kpi span{display:block;color:#7d96aa;font-size:10px}.ai-kpi strong{display:block;font-size:27px;color:#f3f8fc;margin:3px 0}.ai-kpi small{color:#37c4ff;font-size:9px}
.ai-control-strip{display:flex;gap:14px;align-items:end;background:#0c1826;border:1px solid #203349;border-radius:8px;padding:11px 13px;margin-bottom:14px}.ai-control-strip>div{display:flex;flex-direction:column;gap:4px;min-width:150px}.ai-control-strip span{font-size:8px;color:#6e879e;text-transform:uppercase;letter-spacing:.8px}.ai-control-strip b{font-size:11px;color:#dcebf8}.ai-control-strip select{background:#111f2e;border:1px solid #2a4056;color:#dcebf8;border-radius:5px;padding:7px;font-size:10px}.run-ai{margin-left:auto;background:#0da0ed!important;color:#fff!important;border:0!important;border-radius:5px;padding:8px 15px!important}
.cvd-card{background:#0b1725;border:1px solid #22374e;border-radius:8px;padding:16px;box-shadow:0 14px 40px rgba(0,0,0,.2)}.cvd-title-row{display:flex;justify-content:space-between;gap:15px;align-items:center}.cyan-tag{background:#0c91c9;color:#fff;padding:4px 7px;border-radius:4px;font-size:8px;font-weight:800}.cvd-title-row h3{display:inline-block;margin:0 0 0 8px;color:#f1f7fc;font-size:16px}.patient-tags{display:flex;gap:6px;flex-wrap:wrap}.patient-tags span{background:#112235;border:1px solid #243c54;border-radius:12px;padding:5px 8px;font-size:8px;color:#7690a7}.patient-tags b{color:#cde3f4}.input-pills{display:flex;gap:5px;flex-wrap:wrap;margin:13px 0}.input-pills span{background:#0f2131;border:1px solid #20384e;border-radius:4px;padding:6px 8px;color:#8299ad;font-size:8px}.input-pills b{color:#d6e7f4}.risk-banner{display:flex;gap:10px;align-items:center;background:#1a2430;border:1px solid #384151;border-radius:5px;padding:11px}.risk-banner>span{color:#ffc44d;font-size:19px}.risk-banner b{font-size:11px;color:#f0f4f8}.risk-banner em{font-style:normal;background:#c9525c;color:white;border-radius:4px;padding:3px 5px;font-size:8px}.risk-banner small{display:block;color:#8193a5;font-size:8px;margin-top:4px}.shap-head{display:flex;justify-content:space-between;margin:14px 0 8px;color:#4acaff;font-size:9px}.shap-head span{color:#71879a}.factor-bars{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.factor-bar{background:#0e1c2a;border:1px solid #1f3449;border-radius:5px;padding:8px}.factor-bar>div{display:flex;justify-content:space-between;gap:4px}.factor-bar span{font-size:8px;color:#b4c7d6}.factor-bar b{font-size:8px;color:#ff7e89}.factor-bar small{display:block;color:#72889a;font-size:7px;margin:5px 0}.factor-bar i{display:block;height:4px;background:#1b2d3e;border-radius:4px;overflow:hidden}.factor-bar i span{display:block;height:100%;background:#ef6e7b}
.dual-risk{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.risk-mini-card,.fl-strip,.dark-history{background:#0c1826;border:1px solid #20354a;border-radius:8px;padding:13px}.risk-mini-card span{display:block;color:#7890a5;font-size:9px}.risk-mini-card strong{display:block;color:#edf6fd;font-size:22px;margin:3px 0}.risk-mini-card em{font-style:normal;color:#46caff;font-size:8px}.risk-mini-card p{font-size:8px;color:#71889c;line-height:1.5}.fl-strip{display:flex;align-items:center;gap:12px;margin-top:10px}.fl-strip>div{flex:1}.fl-strip b{display:block;color:#d9eaf6;font-size:9px}.fl-strip small,.fl-strip span{display:block;color:#71879a;font-size:8px;margin-top:3px}.fl-strip>strong{color:#43d2ba;font-size:10px}.dark-history{margin-top:10px}.section-dark-head{display:flex;justify-content:space-between;margin-bottom:8px}.section-dark-head b{font-size:10px}.section-dark-head span{font-size:8px;color:#6f869b}.dark-history-row{display:grid;grid-template-columns:1.3fr 1fr .8fr 1fr .8fr;padding:8px 0;border-top:1px solid #182b3d;font-size:8px;align-items:center}.dark-history-row span{color:#71879a}.dark-history-row em{font-style:normal;color:#4ed3bc}
.alert-page-head{align-items:center}.monitor-live{color:#55d7bc;background:#0c2c2a;border:1px solid #1c6259;border-radius:12px;padding:7px 10px;font-size:8px}.alert-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}.alert-summary-grid>div{background:#0c1826;border:1px solid #20354a;border-radius:8px;padding:14px}.alert-summary-grid span{font-size:9px;color:#7890a4}.alert-summary-grid strong{display:block;font-size:25px;color:#f0f6fb;margin-top:4px}.dark-alert-table{background:#0c1826;border:1px solid #20354a;border-radius:8px;overflow:hidden}.alert-table-head,.alert-table-row{display:grid;grid-template-columns:.8fr 1.2fr 1fr .7fr 1fr 1.4fr;gap:8px;padding:11px 13px;align-items:center}.alert-table-head{background:#101f2f;color:#70889c;text-transform:uppercase;font-size:7px;letter-spacing:.8px}.alert-table-row{border-top:1px solid #182b3c;color:#a9bfd0;font-size:8px}.alert-table-row b{color:#e2edf5}.severity-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#f3b34c;margin-right:5px}.critical-dot{background:#ef5c68;box-shadow:0 0 8px rgba(239,92,104,.6)}.alert-table-row button{background:#132437!important;color:#9db5c8!important;border:1px solid #294159!important;border-radius:4px!important;padding:5px 7px!important;font-size:7px!important;margin-right:4px}.alert-table-row .escalate-btn{color:#ffb4bb!important;border-color:#6b3540!important}.empty-dark{padding:35px;text-align:center;color:#70879a;font-size:10px}
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);display:grid;place-items:center;z-index:50}.escalation-modal{width:min(500px,90vw);background:#101c2d;border:1px solid #35506d;border-radius:8px;box-shadow:0 25px 80px rgba(0,0,0,.55);padding:22px;color:#dbe8f4;position:relative}.modal-close{position:absolute;right:13px;top:10px;background:transparent!important;border:0!important;color:#8da2b5!important;font-size:18px}.escalation-modal h3{margin:0 0 10px;font-size:16px;color:#fff}.escalation-modal p{font-size:9px;line-height:1.6;color:#8197aa}.escalation-modal label{display:block;color:#91a8bb;font-size:9px;margin:16px 0 5px}.escalation-modal select{width:100%;background:#0a1522;border:1px solid #324a62;color:#d9e7f2;border-radius:4px;padding:9px;font-size:9px}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.modal-actions button{padding:8px 12px!important;border-radius:5px!important;font-size:9px!important}.dispatch-btn{background:#edf3f8!important;color:#122335!important;border:0!important}
@media(max-width:900px){.clinical-topnav{height:auto;flex-wrap:wrap;padding:10px}.milestone-nav{order:3;width:100%;overflow:auto}.ai-kpi-grid,.alert-summary-grid{grid-template-columns:1fr}.factor-bars{grid-template-columns:1fr 1fr}.ai-control-strip{flex-wrap:wrap}.run-ai{margin-left:0}.patient-tags{display:none}.alert-table-head{display:none}.alert-table-row{grid-template-columns:1fr 1fr;padding:12px}.fl-strip{flex-wrap:wrap}}
`]
})
export class ShellComponent {

  private api = inject(ApiService);
  private router = inject(Router);


  // =====================================================
  // BASIC STATE
  // =====================================================

  tab = 'dashboard';
  today = new Date();

  search = '';


  user: any =
    JSON.parse(
      localStorage.getItem('medisphere_user') || 'null'
    );


  dash: any = {
    patients: 0,
    appointments: 0,
    activeAlerts: 0,
    medicines: 0
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
  riskHistory: any[] = [];
  federated: any = null;
  aiPatientId = '';

  // =====================================================
  // MILESTONE 3 · REAL-TIME MONITORING
  // =====================================================
  monitoringPatientId = '';
  monitoring: any = null;
  monitoringAlerts: any[] = [];
  monitoringRunning = false;
  monitoringCycle = 0;
  monitoringAttention = false;
  private monitoringTimer: any = null;

  escalationOpen = false;
  escalationAlert: any = null;
  escalationTeam = 'Rapid Response Team (Cardiac/Code Blue)';


  // =====================================================
  // FHIR / SMART
  // =====================================================

  fhir: any = null;

  smart: any = null;


  // =====================================================
  // VITAL
  // =====================================================

  vital: any = {
    source: 'WEARABLE'
  };


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
      id: 'aiRisk',
      label: 'AI Risk Lab',
      icon: '✦'
    },

    {
      id: 'monitoring',
      label: 'Live Monitoring',
      icon: '◌'
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
    if (!id) return;
    this.aiPatientId = id;
    this.api.post<any>('/ai/risk/' + id, {}).subscribe(x => {
      this.risk = x;
      this.api.get<any[]>('/ai/risk/' + id + '/history').subscribe(h => this.riskHistory = h);
      this.tab = 'aiRisk';
    });
  }

  loadFederated() {
    this.api.get<any>('/ai/federated-demo').subscribe(x => { this.federated = x; this.tab = 'aiRisk'; });
  }


  // =====================================================
  // MILESTONE 3 · MONITORING
  // =====================================================

  loadMonitoring() {
    if (!this.monitoringPatientId) { this.monitoring = null; this.monitoringAttention = false; return; }
    this.api.get<any>('/monitoring/' + this.monitoringPatientId + '/latest')
      .subscribe(x => { this.monitoring = x; this.monitoringAlerts = (x.recentAlerts || []).slice(0, 6); });
  }

  private simulateMonitoring(critical: boolean) {
    if (!this.monitoringPatientId) return;
    this.api.post<any>('/monitoring/' + this.monitoringPatientId + '/simulate?critical=' + critical, {})
      .subscribe(x => {
        this.monitoringAttention = (x.alerts || []).length > 0;
        this.monitoring = { ...this.monitoring, latestVital: x.vital, recentAlerts: x.alerts };
        this.loadMonitoring();
        this.refresh();
      });
  }

  simulateCritical() {
    this.simulateMonitoring(true);
  }

  startMonitoring() {
    if (!this.monitoringPatientId || this.monitoringRunning) return;
    this.monitoringRunning = true;
    this.monitoringCycle = 0;
    this.simulateMonitoring(false);
    this.monitoringTimer = setInterval(() => {
      this.monitoringCycle++;
      this.simulateMonitoring(this.monitoringCycle % 3 === 0);
    }, 6000);
  }

  stopMonitoring() {
    this.monitoringRunning = false;
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
  }

  monitoringStatus() {
    return this.monitoringAttention ? 'ATTENTION REQUIRED' : 'STABLE';
  }

  prettyAlertType(type: string) {
    return (type || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  clearMonitoringView() {
    this.stopMonitoring();
    this.monitoring = null;
    this.monitoringAlerts = [];
    this.monitoringAttention = false;
  }

  overallLevel(r: any) {
    const levels = [r?.cardiovascularLevel, r?.diabetesLevel];
    if (levels.includes('HIGH')) return 'HIGH';
    if (levels.includes('MODERATE')) return 'MODERATE';
    return 'LOW';
  }


  // =====================================================
  // ADD VITAL
  // =====================================================

  addVital() {

    if (!this.selected) {

      return;

    }


    this.vital = {

      patientId:
        this.selected.patient.id,

      heartRate:
        85,

      systolic:
        120,

      diastolic:
        80,

      oxygen:
        98,

      source:
        'WEARABLE'

    };


    this.sendVital();

  }


  // =====================================================
  // SEND VITAL
  // =====================================================

  sendVital() {

    this.api
      .post<any>(
        '/vitals',
        this.vital
      )
      .subscribe(

        () => {

          if (this.selected) {

            this.selectPatient(
              this.selected.patient
            );

          }

          this.refresh();

        }

      );

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
  // APPOINTMENT
  // =====================================================

  addAppointment() {

    const a: any = {

      patientId:
        this.patients[0]?.id,

      patientName:
        this.patients[0]?.name ||
        'Rahul Kumar',

      doctorName:
        'Dr. Arjun Sharma',

      specialty:
        'General Medicine',

      date:
        new Date()
          .toISOString()
          .slice(0, 10),

      time:
        '10:00',

      reason:
        'Follow-up'

    };


    this.api
      .post(
        '/appointments',
        a
      )
      .subscribe(

        () => {

          this.refresh();

          alert(
            'Appointment created.'
          );

        }

      );

  }


  barWidth(v: any) { return Math.min(100, Math.abs(Number(v || 0)) * 10); }

  highRiskCount() {
    return this.riskHistory.filter((r:any) => r.cardiovascularLevel === 'HIGH' || r.diabetesLevel === 'HIGH').length || 23;
  }

  criticalAlertCount() {
    return this.alerts.filter((a:any) => a.severity === 'CRITICAL').length;
  }

  selectedRiskPatientName() {
    return this.patients.find((p:any) => p.id === this.aiPatientId)?.name || 'Select patient';
  }

  openEscalation(a:any) { this.escalationAlert = a; this.escalationOpen = true; }
  closeEscalation() { this.escalationOpen = false; this.escalationAlert = null; }
  dispatchEscalation() {
    if (this.escalationAlert) {
      this.escalationAlert.recipient = this.escalationTeam;
      this.escalationAlert.escalated = true;
    }
    this.closeEscalation();
  }

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

  newPatient() {

    const p: any = {

      mrn:
        'MS-' +
        Math.floor(
          10000 +
          Math.random() *
          89999
        ),

      name:
        'New Patient',

      gender:
        'Male',

      dateOfBirth:
        '1995-01-01',

      phone:
        '+91 90000 00000',

      email:
        'patient@example.com',

      bloodGroup:
        'O+'

    };


    this.api
      .post(
        '/patients',
        p
      )
      .subscribe(

        () => {

          this.refresh();

          alert(
            'Patient created successfully.'
          );

        }

      );

  }


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


  initials(name: string) {
    return (name || 'Patient').split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase();
  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout() {

    this.stopMonitoring();
    localStorage.clear();

    this.router.navigateByUrl(
      '/login'
    );

  }




}