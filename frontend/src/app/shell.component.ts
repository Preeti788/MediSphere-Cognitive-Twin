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

    <section
      *ngIf="tab==='dashboard'"
      class="content">

      <div class="hero">

        <div>

          <span class="eyebrow">
            DIGITAL HEALTH PLATFORM
          </span>

          <h2>
            Patient care, connected.
          </h2>

          <p>
            FHIR-ready data exchange, Digital Health Twin,
            real-time vitals and clinical workflows in one place.
          </p>

        </div>

        <div class="hero-icon">
          ♥
        </div>

      </div>


      <div class="cards">

        <div class="metric">

          <span>
            Patients
          </span>

          <b>
            {{dash.patients}}
          </b>

          <small>
            Registered records
          </small>

        </div>


        <div class="metric">

          <span>
            Appointments
          </span>

          <b>
            {{dash.appointments}}
          </b>

          <small>
            Across care teams
          </small>

        </div>


        <div class="metric warn">

          <span>
            Active alerts
          </span>

          <b>
            {{dash.activeAlerts}}
          </b>

          <small>
            Needs attention
          </small>

        </div>


        <div class="metric">

          <span>
            Medicines
          </span>

          <b>
            {{dash.medicines}}
          </b>

          <small>
            Pharmacy inventory
          </small>

        </div>

      </div>


      <div class="grid2">

        <div class="panel">

          <h3>
            Platform workflow
          </h3>

          <div class="flow">

            <span>
              Patient Data
            </span>

            <i>→</i>

            <span>
              FHIR
            </span>

            <i>→</i>

            <span>
              MongoDB
            </span>

            <i>→</i>

            <span>
              Digital Twin
            </span>

            <i>→</i>

            <span>
              Patient 360
            </span>

          </div>

        </div>


        <div class="panel">

          <h3>
            AI risk engine
          </h3>

          <p>
            Explainable demo risk scoring is available
            from a patient profile. It is not a medical diagnosis.
          </p>

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
    <!-- ================================================= -->

    <section *ngIf="tab==='aiRisk'" class="content">
      <div class="hero ai-hero">
        <div>
          <span class="eyebrow">MILESTONE 2 · AI RISK PREDICTION</span>
          <h2>Explainable patient risk intelligence.</h2>
          <p>Cardiovascular and diabetes complication risk with transparent feature contributions and a privacy-first federated-learning demonstration.</p>
        </div>
        <div class="hero-icon">✦</div>
      </div>

      <div class="panel" style="margin-bottom:16px">
        <div class="panel-head">
          <h3>Run AI assessment</h3>
          <span class="pill">Model M2.0</span>
        </div>
        <div class="ai-controls">
          <select [(ngModel)]="aiPatientId">
            <option value="">Select patient</option>
            <option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option>
          </select>
          <button class="primary" (click)="runRisk(aiPatientId)" [disabled]="!aiPatientId">Run prediction</button>
          <button (click)="loadFederated()">Run federated demo</button>
        </div>
        <small class="muted">Decision-support demonstration only — not a medical diagnosis.</small>
      </div>

      <div *ngIf="risk" class="ai-risk-grid">
        <div class="risk-score-card">
          <span>Cardiovascular risk</span>
          <strong>{{risk.cardiovascularScore}}<small>/100</small></strong>
          <b [class.high]="risk.cardiovascularLevel==='HIGH'" [class.moderate]="risk.cardiovascularLevel==='MODERATE'">{{risk.cardiovascularLevel}}</b>
        </div>
        <div class="risk-score-card">
          <span>Diabetes complications</span>
          <strong>{{risk.diabetesScore}}<small>/100</small></strong>
          <b [class.high]="risk.diabetesLevel==='HIGH'" [class.moderate]="risk.diabetesLevel==='MODERATE'">{{risk.diabetesLevel}}</b>
        </div>
      </div>

      <div *ngIf="risk" class="grid2">
        <div class="panel">
          <h3>SHAP-style explanation · cardiovascular</h3>
          <div *ngFor="let f of risk.cardiovascularFactors" class="factor-row">
            <div><b>{{f.feature}}</b><small>{{f.value}} {{f.unit}}</small></div>
            <span [class.down]="f.direction==='LOWERS_RISK'">{{f.contribution > 0 ? '+' : ''}}{{f.contribution}}</span>
          </div>
          <div *ngIf="!risk.cardiovascularFactors?.length" class="empty-small">No current features available.</div>
        </div>
        <div class="panel">
          <h3>SHAP-style explanation · diabetes</h3>
          <div *ngFor="let f of risk.diabetesFactors" class="factor-row">
            <div><b>{{f.feature}}</b><small>{{f.value}} {{f.unit}}</small></div>
            <span [class.down]="f.direction==='LOWERS_RISK'">{{f.contribution > 0 ? '+' : ''}}{{f.contribution}}</span>
          </div>
          <div *ngIf="!risk.diabetesFactors?.length" class="empty-small">No current features available.</div>
        </div>
      </div>

      <div *ngIf="risk" class="panel privacy-panel">
        <h3>Federated learning & privacy</h3>
        <p>{{risk.privacy}}</p>
        <span class="pill">{{risk.method}}</span>
      </div>

      <div *ngIf="federated" class="panel federated-panel">
        <div class="panel-head"><h3>Federated training simulation</h3><span class="pill">{{federated.status}}</span></div>
        <div class="federated-grid">
          <div *ngFor="let h of federated.hospitals" class="hospital-card">
            <b>{{h.hospital}}</b><span>{{h.samples}} samples</span><strong>{{h.localModelWeight}}</strong><small>Data shared: {{h.dataShared ? 'Yes' : 'No'}}</small>
          </div>
        </div>
        <div class="aggregate">Aggregated model weight: <b>{{federated.aggregatedModelWeight}}</b></div>
        <p>{{federated.privacy}}</p>
      </div>

      <div *ngIf="riskHistory?.length" class="panel">
        <h3>Recent risk assessments</h3>
        <div *ngFor="let r of riskHistory" class="history-row"><span>{{r.assessedAt | date:'medium'}}</span><b>CV {{r.cardiovascularScore}} · Diabetes {{r.diabetesScore}}</b><span>{{r.cardiovascularLevel}} / {{r.diabetesLevel}}</span></div>
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

`]
})
export class ShellComponent {

  private api = inject(ApiService);
  private router = inject(Router);


  // =====================================================
  // BASIC STATE
  // =====================================================

  tab = 'dashboard';

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
        'Demo Patient',

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


  // =====================================================
  // LOGOUT
  // =====================================================

  logout() {

    localStorage.clear();

    this.router.navigateByUrl(
      '/login'
    );

  }

}