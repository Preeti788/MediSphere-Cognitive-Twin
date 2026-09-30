import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

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
        <small>Healthcare Management</small>
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
        <span class="doctor-avatar">{{initials(user?.name || 'MediSphere User')}}</span>
        <div><b>{{user?.name || 'MediSphere User'}}</b><small>{{user?.role || 'Clinical User'}}</small></div>
      </div>
      <div class="milestone-nav">
        <button [class.active]="tab==='dashboard'" (click)="tab='dashboard'">M1 Patient 360</button>
        <button [class.active]="tab==='aiRisk'" (click)="tab='aiRisk'">M2 Risk Review</button>
        <button [class.active]="tab==='monitoring'" (click)="tab='monitoring'">M3 Monitoring</button>
        <button [class.active]="tab==='carePlans'" (click)="openCarePlans()">M4 Care Plan</button>
      </div>
      <span class="hipaa-badge">● System ready</span>
    </div>

    <header>

      <div>

        <h1>
          {{title()}}
        </h1>

        <p>
          Patient records, appointments and care tracking
        </p>

      </div>

      <div class="header-actions">

        <span class="live">
          ● System online
        </span>

        <button
          (click)="refresh()">

          {{refreshing ? '⟳ Updating…' : '↻ Refresh'}}

        </button>

      </div>

    </header>


    <!-- ================================================= -->
    <!-- DASHBOARD -->
    <!-- ================================================= -->

    <section *ngIf="tab==='dashboard'" class="content dashboard-page">

      <div class="ref-dashboard-topbar">
        <div class="ref-search">
          <span>⌕</span>
          <input [(ngModel)]="search" placeholder="Search patient by name, MRN, or ID..." />
        </div>
        <div class="ref-top-actions">
          <button class="ref-top-icon" (click)="tab='alerts'" title="Clinical alerts">♧<i *ngIf="dash.activeAlerts">{{dash.activeAlerts}}</i></button>
          <button class="ref-top-icon" title="Notifications">♟</button>
          <div class="ref-mini-profile">
            <span class="ref-profile-avatar">{{initials(user?.name || 'Clinical User')}}</span>
            <div><b>{{user?.name || 'Clinical User'}}</b><small>{{user?.role || 'Clinical User'}}</small></div>
          </div>
        </div>
      </div>

      <div class="ref-dashboard-heading">
        <div>
          <h2>Good day, {{user?.name || 'Clinical User'}} 👋</h2>
          <p>Here's your clinical overview for today</p>
        </div>
        <div class="ref-heading-meta">
          <span>{{today | date:'EEE, dd MMM yyyy'}}</span>
          <button (click)="refresh()">Today⌄</button>
          <em><b></b> Live System</em>
        </div>
      </div>

      <div class="ref-kpi-grid">
        <button class="ref-kpi ref-kpi-blue" (click)="tab='patients'">
          <span class="ref-kpi-icon">♟</span>
          <span><small>Total Patients</small><strong>{{dash.patients || patients.length || 0}}</strong><em>↑ 12% this week</em></span>
        </button>
        <button class="ref-kpi ref-kpi-green" (click)="tab='monitoring'">
          <span class="ref-kpi-icon">♥</span>
          <span><small>Active Monitoring</small><strong>{{monitoringRunning ? 1 : 42}}</strong><em>{{monitoringRunning ? 'Live patient' : 'Live patients'}}</em></span>
        </button>
        <button class="ref-kpi ref-kpi-red" (click)="tab='alerts'">
          <span class="ref-kpi-icon">⚠</span>
          <span><small>Critical Alerts</small><strong>{{dash.activeAlerts || 3}}</strong><em>Requires attention</em></span>
        </button>
        <button class="ref-kpi ref-kpi-purple" (click)="openCarePlans()">
          <span class="ref-kpi-icon">▣</span>
          <span><small>Care Plans</small><strong>{{dash.carePlans ?? 86}}</strong><em>+4 this week</em></span>
        </button>
      </div>

      <div class="ref-main-grid">
        <div class="ref-card ref-monitor-card">
          <div class="ref-card-title">
            <div><h3>Live Patient Monitoring</h3><p>Continuous vital-sign stream</p></div>
            <span class="ref-live-chip"><b></b> Live</span>
          </div>
          <div class="ref-ecg">
            <div class="ref-ecg-grid"></div>
            <svg viewBox="0 0 900 180" preserveAspectRatio="none">
              <polyline [attr.points]="dashboardTrendPolyline()" class="ref-ecg-line"></polyline>
            </svg>
          </div>
          <div class="ref-monitor-values">
            <div><small>Heart Rate</small><strong>{{dashboardLatestVital?.heartRate || 78}}</strong><span>bpm</span></div>
            <div><small>SpO₂</small><strong>{{dashboardLatestVital?.oxygen || 98}}</strong><span>%</span></div>
            <div><small>Blood Pressure</small><strong>{{dashboardLatestVital?.systolic || 122}}/{{dashboardLatestVital?.diastolic || 80}}</strong><span>mmHg</span></div>
            <div><small>Glucose</small><strong>{{dashboardLatestVital?.glucose || 108}}</strong><span>mg/dL</span></div>
          </div>
          <button class="ref-card-link" (click)="tab='monitoring'">Open Live Monitoring →</button>
        </div>

        <div class="ref-card ref-risk-card">
          <div class="ref-card-title">
            <div><h3>AI Risk Overview</h3><p>Latest clinical risk assessment</p></div>
            <button class="ref-more-btn" (click)="tab='aiRisk'">⋯</button>
          </div>
          <div class="ref-risk-layout">
            <div class="ref-risk-donut" [style.--risk-angle]="((dashboardRiskSnapshot?.cardiovascularScore || 24) * 3.6) + 'deg'">
              <strong>{{dashboardRiskSnapshot?.cardiovascularScore || 24}}%</strong>
              <span>{{dashboardRiskSnapshot?.cardiovascularLevel || 'Low Risk'}}</span>
            </div>
            <div class="ref-factor-list">
              <h4>Contributing factors</h4>
              <div *ngFor="let f of (dashboardRiskSnapshot?.cardiovascularFactors || []).slice(0,4); let idx=index">
                <div class="ref-factor-label"><span>{{f.feature || ['Age','Blood Pressure','Cholesterol','Smoking History'][idx]}}</span><b>{{factorPercent(f.contribution, [35,28,20,17][idx])}}%</b></div>
                <i><em [style.width.%]="factorPercent(f.contribution, [35,28,20,17][idx])"></em></i>
              </div>
              <ng-container *ngIf="!dashboardRiskSnapshot?.cardiovascularFactors?.length">
                <div class="ref-factor-label"><span>Age</span><b>35%</b></div><i><em style="width:35%"></em></i>
                <div class="ref-factor-label"><span>Blood pressure</span><b>28%</b></div><i><em style="width:28%"></em></i>
                <div class="ref-factor-label"><span>Cholesterol</span><b>20%</b></div><i><em style="width:20%"></em></i>
                <div class="ref-factor-label"><span>Smoking history</span><b>17%</b></div><i><em style="width:17%"></em></i>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <div class="ref-second-grid">
        <div class="ref-card ref-table-card">
          <div class="ref-card-title"><div><h3>Recent Alerts</h3><p>Latest clinical events needing review</p></div><button class="ref-outline-btn" (click)="tab='alerts'">View all</button></div>
          <div class="ref-table">
            <div class="ref-table-head"><span>Time</span><span>Patient</span><span>Vital</span><span>Message</span><span>Status</span></div>
            <div class="ref-table-row" *ngFor="let a of alerts.slice(0,4)" (click)="tab='alerts'">
              <span>{{a.createdAt | date:'HH:mm'}}</span>
              <span><b>{{dashboardPatientName(a.patientId)}}</b><small>{{a.patientId || 'MS-00000'}}</small></span>
              <span>{{a.vital || 'Vital'}}</span>
              <span>{{a.message}}</span>
              <span><em [class.warn]="a.severity!=='CRITICAL'">{{a.acknowledged ? 'Acknowledged' : (a.severity || 'Review')}}</em></span>
            </div>
            <div class="ref-empty" *ngIf="!alerts.length">No active alerts.</div>
          </div>
        </div>

        <div class="ref-card ref-table-card">
          <div class="ref-card-title"><div><h3>Today's Appointments</h3><p>Scheduled clinical visits</p></div><button class="ref-outline-btn" (click)="tab='appointments'">View all</button></div>
          <div class="ref-table ref-appointments-table">
            <div class="ref-table-head"><span>Time</span><span>Patient</span><span>Type</span><span>Status</span></div>
            <div class="ref-table-row ref-appt-row" *ngFor="let a of appointments.slice(0,4)">
              <span>{{a.time || '10:30 AM'}}</span>
              <span><b>{{a.patientName || 'Rahul Kumar'}}</b></span>
              <span>{{a.specialty || a.reason || 'General Checkup'}}</span>
              <span><em class="appt-status">{{a.status || 'Scheduled'}}</em></span>
            </div>
            <div class="ref-empty" *ngIf="!appointments.length">No appointments scheduled.</div>
          </div>
        </div>
      </div>

      <div class="ref-card ref-care-card">
        <div class="ref-card-title"><div><h3>Care Plan Progress: {{dashboardCarePlan?.title || 'Diabetes Management'}}</h3><p>{{dashboardCarePlan?.summary || 'Personalized follow-up and treatment plan'}}</p></div><button class="ref-outline-btn" (click)="openCarePlans()">View plan</button></div>
        <div class="ref-care-row">
          <div class="ref-progress"><i [style.width.%]="dashboardCarePlan?.progress || 70"></i></div>
          <strong>{{dashboardCarePlan?.progress || 70}}%</strong>
        </div>
        <div class="ref-care-meta"><span>{{dashboardCarePlan?.tasks?.length || 2}} of {{dashboardCarePlan?.tasks?.length || 5}} goals completed</span><span>Next review: {{dashboardCarePlan?.followUpDate || '25 Sep 2026'}}</span></div>
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
    <!-- MILESTONE 4: CARE PLAN & TREATMENT -->
    <!-- ================================================= -->
    <section *ngIf="tab==='carePlans'" class="content m4-page">
      <div class="m4-hero">
        <div>
          <span class="eyebrow">MILESTONE 4 · CARE PLAN & TREATMENT</span>
          <h2>Create and track a patient care plan.</h2>
          <p>Use the patient record, recent readings and available risk information to prepare a simple follow-up plan.</p>
        </div>
        <div class="m4-hero-badge">
          <span>Care plan</span>
          <b>ONE PATIENT · ONE PLAN</b>
        </div>
      </div>

      <div class="panel m4-selector">
        <div>
          <span class="section-kicker">PATIENT</span>
          <h3>Choose a patient</h3>
          <p class="muted">The plan uses the patient's existing information and latest readings when available.</p>
        </div>
        <div class="m4-selector-actions">
          <select [(ngModel)]="carePatientId" (change)="loadCarePlans()">
            <option value="">Select patient</option>
            <option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option>
          </select>
          <button class="primary" (click)="generateCarePlan()" [disabled]="!carePatientId || careBusy">
            {{careBusy ? 'Creating…' : 'Generate care plan'}}
          </button>
          <button (click)="loadCarePlans()" [disabled]="!carePatientId">↻ Refresh</button>
        </div>
      </div>

      <div *ngIf="careMessage" class="m4-message">{{careMessage}}</div>

      <div class="m4-overview-grid" *ngIf="carePatientId">
        <div class="panel m4-patient-card">
          <div class="m4-card-head"><div><span class="section-kicker">PATIENT CONTEXT</span><h3>{{carePatient?.name || 'Selected patient'}}</h3></div><span class="m4-chip">{{carePatient?.mrn || '—'}}</span></div>
          <div class="m4-profile-grid">
            <div><small>Conditions</small><b>{{carePatient?.conditions?.join(', ') || 'No conditions recorded'}}</b></div>
            <div><small>Blood group</small><b>{{carePatient?.bloodGroup || '—'}}</b></div>
            <div><small>Latest heart rate</small><b>{{careMonitoring?.latestVital?.heartRate ?? '—'}} bpm</b></div>
            <div><small>Latest glucose</small><b>{{careMonitoring?.latestVital?.glucose ?? '—'}} mg/dL</b></div>
          </div>
        </div>

        <div class="panel m4-progress-card">
          <div class="m4-card-head"><div><span class="section-kicker">TREATMENT TRACKING</span><h3>{{selectedCarePlan?.title || 'No plan selected'}}</h3></div><span class="m4-risk" [class.m4-risk-high]="selectedCarePlan?.riskLevel==='HIGH'">{{selectedCarePlan?.riskLevel || '—'}}</span></div>
          <div class="m4-progress-number"><strong>{{selectedCarePlan?.progress ?? 0}}%</strong><span>tasks completed</span></div>
          <div class="m4-progress-track"><span [style.width.%]="selectedCarePlan?.progress || 0"></span></div>
          <small class="muted">Follow-up: {{selectedCarePlan?.followUpDate || '—'}}</small>
        </div>
      </div>

      <div class="m4-content-grid" *ngIf="carePatientId">
        <div class="panel m4-plan-panel">
          <div class="m4-card-head"><div><span class="section-kicker">PERSONALIZED PLAN</span><h3>{{selectedCarePlan?.title || 'Generate a plan to begin'}}</h3></div></div>
          <div *ngIf="selectedCarePlan" class="care-summary">
            <p><b>Goal:</b> {{selectedCarePlan.goal}}</p>
            <p><b>Summary:</b> {{selectedCarePlan.summary}}</p>
            <p><b>Owner:</b> {{selectedCarePlan.owner}}</p>
          </div>
          <div *ngIf="selectedCarePlan?.tasks?.length; else noCareTasks" class="care-task-list">
            <div *ngFor="let task of selectedCarePlan.tasks; let i=index" class="care-task" [class.completed]="task.completed">
              <label><input type="checkbox" [checked]="task.completed" (change)="toggleCareTask(i, $any($event.target).checked)"><span><b>{{task.title}}</b><small>{{task.category}}</small></span></label>
              <span class="care-task-status">{{task.completed ? 'Completed' : 'Pending'}}</span>
            </div>
          </div>
          <ng-template #noCareTasks><div class="empty-small">Generate a care plan for this patient to create treatment and follow-up tasks.</div></ng-template>
        </div>

        <div class="panel m4-health-panel">
          <div class="m4-card-head"><div><span class="section-kicker">HEALTH CHECK</span><h3>Latest readings</h3></div><span class="m4-chip">Monitoring</span></div>
          <div class="health-reading-grid">
            <div><small>Blood pressure</small><b>{{careMonitoring?.latestVital?.systolic ?? '—'}} / {{careMonitoring?.latestVital?.diastolic ?? '—'}}</b><span>mmHg</span></div>
            <div><small>SpO₂</small><b>{{careMonitoring?.latestVital?.oxygen ?? '—'}}%</b><span>saturation</span></div>
            <div><small>Heart rate</small><b>{{careMonitoring?.latestVital?.heartRate ?? '—'}}</b><span>bpm</span></div>
            <div><small>Glucose</small><b>{{careMonitoring?.latestVital?.glucose ?? '—'}}</b><span>mg/dL</span></div>
          </div>
          <div class="m4-comparison" *ngIf="careMonitoring?.recentVitals?.length > 1">
            <b>Progress check</b>
            <span>HR {{deltaValue('heartRate')}} · Glucose {{deltaValue('glucose')}}</span>
          </div>
          <p class="muted">This section gives the care team a current reading snapshot to review at follow-up.</p>
        </div>
      </div>

      <div class="panel m4-history-panel" *ngIf="carePlans.length">
        <div class="m4-card-head"><div><span class="section-kicker">PLAN HISTORY</span><h3>Previous care plans</h3></div><span class="m4-chip">{{carePlans.length}} plan(s)</span></div>
        <div class="care-history-row" *ngFor="let c of carePlans; let i=index" (click)="selectCarePlan(c)">
          <div><b>{{c.title}}</b><small>{{c.goal}}</small></div>
          <span>{{c.riskLevel || 'ROUTINE'}}</span>
          <span>{{c.progress || 0}}%</span>
          <span>{{c.followUpDate || '—'}}</span>
        </div>
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
        <div class="ai-kpi"><span>Risk Predictions</span><strong>{{riskHistory.length || 342}}</strong><small>Today</small></div>
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
          <button class="primary" (click)="startMonitoring()" [disabled]="!monitoringPatientId || monitoringRunning">{{monitoringRunning ? '● Monitoring live' : '▶ Start live monitoring'}}</button>
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

      <div *ngIf="monitoring" class="panel live-graph-panel">
        <div class="panel-head">
          <div><h3>Live vital trend</h3><small class="muted">Backend-sourced readings · updates while monitoring is running</small></div>
          <span class="monitor-live" [class.paused]="!monitoringRunning">● {{monitoringRunning ? 'LIVE STREAM' : 'STREAM PAUSED'}}</span>
        </div>
        <div class="trend-controls">
          <button *ngFor="let k of monitorTrendKeys" [class.active-trend]="monitorTrendKey===k" (click)="monitorTrendKey=k">{{trendLabel(k)}}</button>
        </div>
        <div class="trend-chart" *ngIf="trendPoints().length; else noTrend">
          <svg viewBox="0 0 900 260" preserveAspectRatio="none">
            <line x1="45" y1="20" x2="45" y2="225" class="chart-axis"></line>
            <line x1="45" y1="225" x2="875" y2="225" class="chart-axis"></line>
            <polyline [attr.points]="trendPolyline()" class="trend-line"></polyline>
          </svg>
          <div class="trend-range"><span>Min {{trendMin()}}</span><b>{{trendLabel(monitorTrendKey)}} · {{monitoring?.latestVital?.[monitorTrendKey] ?? '—'}}</b><span>Max {{trendMax()}}</span></div>
        </div>
        <ng-template #noTrend><div class="empty-small">Start live monitoring to stream vital readings into the graph.</div></ng-template>
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


      <div class="toolbar appointment-toolbar">
        <div>
          <h2 class="section-title">Doctor appointments</h2>
          <small class="muted">Choose a department, doctor, date and an actually available time slot.</small>
        </div>
        <button class="primary" (click)="addAppointment()">+ New appointment</button>
      </div>

      <div class="doctor-department-grid">
        <div class="doctor-department-card" *ngFor="let d of appointmentDepartments">
          <div class="dept-icon">{{d.icon}}</div>
          <div><b>{{d.name}}</b><small>{{d.description}}</small></div>
          <span>{{doctorsForDepartment(d.name).length}} doctors</span>
        </div>
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

    <!-- PATIENT CREATE MODAL -->
    <div *ngIf="patientFormOpen" class="modal-backdrop">
      <div class="form-modal">
        <button class="modal-close" (click)="cancelNewPatient()">×</button>
        <h3>Add new patient</h3>
        <p class="muted">Create a complete patient record. The form is saved through the existing /api/patients endpoint.</p>
        <div class="modal-form-grid">
          <label>MRN<input [(ngModel)]="patientForm.mrn" placeholder="MS-10001"></label>
          <label>Full name<input [(ngModel)]="patientForm.name" placeholder="Patient name"></label>
          <label>Gender<select [(ngModel)]="patientForm.gender"><option>Male</option><option>Female</option><option>Other</option></select></label>
          <label>Date of birth<input type="date" [(ngModel)]="patientForm.dateOfBirth"></label>
          <label>Phone<input [(ngModel)]="patientForm.phone" placeholder="+91..."></label>
          <label>Email<input [(ngModel)]="patientForm.email" type="email" placeholder="patient@email.com"></label>
          <label>Blood group<select [(ngModel)]="patientForm.bloodGroup"><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></label>
          <label>Emergency contact<input [(ngModel)]="patientForm.emergencyContact" placeholder="Emergency contact"></label>
          <label class="wide-field">Address<input [(ngModel)]="patientForm.address" placeholder="Address"></label>
          <label class="wide-field">Allergies<input [(ngModel)]="patientForm.allergiesText" placeholder="e.g. Penicillin, Dust"></label>
          <label class="wide-field">Conditions<input [(ngModel)]="patientForm.conditionsText" placeholder="e.g. Hypertension, Diabetes"></label>
        </div>
        <div class="modal-actions"><button (click)="cancelNewPatient()">Cancel</button><button class="primary" [disabled]="savingPatient" (click)="saveNewPatient()">{{savingPatient ? 'Saving…' : 'Create patient'}}</button></div>
      </div>
    </div>

    <!-- APPOINTMENT BOOKING MODAL -->
    <div *ngIf="appointmentFormOpen" class="modal-backdrop">
      <div class="form-modal appointment-modal">
        <button class="modal-close" (click)="closeAppointmentForm()">×</button>
        <h3>Schedule appointment</h3>
        <p class="muted">Doctors and slots are separated by department. Already-booked slots are removed automatically.</p>
        <div class="modal-form-grid">
          <label>Department<select [(ngModel)]="appointmentForm.specialty" (change)="onAppointmentDepartmentChange()"><option value="">Select department</option><option *ngFor="let d of appointmentDepartments" [value]="d.name">{{d.name}}</option></select></label>
          <label>Doctor<select [(ngModel)]="appointmentForm.doctorName" (change)="onAppointmentDoctorChange()" [disabled]="!appointmentForm.specialty"><option value="">Select doctor</option><option *ngFor="let d of availableDoctors()" [value]="d.name">{{d.name}} · {{d.experience}}y</option></select></label>
          <label>Patient<select [(ngModel)]="appointmentForm.patientId"><option value="">Select patient</option><option *ngFor="let p of patients" [value]="p.id">{{p.name}} · {{p.mrn}}</option></select></label>
          <label>Date<input type="date" [(ngModel)]="appointmentForm.date" (change)="onAppointmentDateChange()"></label>
        </div>
        <div class="slot-section" *ngIf="appointmentForm.doctorName">
          <div class="slot-head"><b>Available consultation times</b><span>{{availableSlots().length}} available</span></div>
          <div class="slot-grid"><button type="button" *ngFor="let slot of availableSlots()" [class.selected-slot]="appointmentForm.time===slot" (click)="appointmentForm.time=slot">{{slot}}</button></div>
          <div *ngIf="!availableSlots().length" class="empty-small">No slots remain for this doctor on the selected date.</div>
        </div>
        <label class="reason-field">Reason<textarea [(ngModel)]="appointmentForm.reason" rows="3" placeholder="Reason for visit / consultation"></textarea></label>
        <div class="modal-actions"><button (click)="closeAppointmentForm()">Cancel</button><button class="primary" [disabled]="savingAppointment || !appointmentForm.patientId || !appointmentForm.doctorName || !appointmentForm.time" (click)="saveAppointment()">{{savingAppointment ? 'Booking…' : 'Confirm appointment'}}</button></div>
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


.section-title{margin:0 0 4px;font-size:18px}.muted{color:#7b8d99;font-size:11px}.appointment-toolbar{align-items:center}.doctor-department-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.doctor-department-card{background:#fff;border:1px solid #e3ecef;border-radius:14px;padding:14px;display:flex;align-items:center;gap:10px}.doctor-department-card .dept-icon{width:34px;height:34px;border-radius:10px;background:#e8f7f4;color:#078575;display:grid;place-items:center;font-weight:800}.doctor-department-card b{display:block;font-size:12px}.doctor-department-card small{display:block;color:#84949e;font-size:9px;margin-top:3px}.doctor-department-card>span{margin-left:auto;color:#078575;font-size:9px;font-weight:800}.live-graph-panel{margin-top:18px}.trend-controls{display:flex;gap:7px;margin:10px 0}.trend-controls button{font-size:11px;padding:7px 10px}.trend-controls .active-trend{background:#0c9f8a;color:#fff;border-color:#0c9f8a}.trend-chart{height:260px;border:1px solid #e5edf1;border-radius:12px;background:linear-gradient(#fbfefe,#f6fbfa);padding:8px}.trend-chart polyline{transition:points .65s ease-in-out}.trend-chart svg{width:100%;height:220px}.chart-axis{stroke:#cad9de;stroke-width:1}.trend-line{fill:none;stroke:#0b9f8b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 3px 3px rgba(0,150,130,.18))}.trend-range{display:flex;justify-content:space-between;align-items:center;color:#80929c;font-size:10px}.trend-range b{color:#0b806f}.monitor-live{font-size:10px;color:#078575;font-weight:800;letter-spacing:.7px}.monitor-live.paused{color:#8b9aa4}.form-modal{width:min(760px,92vw);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:24px;position:relative;box-shadow:0 25px 80px rgba(0,0,0,.25)}.form-modal h3{margin:0 0 6px;font-size:21px}.modal-form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:18px}.modal-form-grid label,.reason-field{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:700;color:#536a78}.modal-form-grid input,.modal-form-grid select,.reason-field textarea{padding:11px;border:1px solid #d6e3e8;border-radius:9px;font:inherit;color:#284354;background:#fff}.wide-field{grid-column:1/-1}.reason-field{margin-top:14px}.slot-section{margin-top:18px;padding:14px;background:#f7fbfb;border:1px solid #e0ecec;border-radius:12px}.slot-head{display:flex;justify-content:space-between;margin-bottom:10px;font-size:11px}.slot-head span{color:#078575}.slot-grid{display:flex;gap:7px;flex-wrap:wrap}.slot-grid button{font-size:11px}.slot-grid .selected-slot{background:#0c9f8a;color:#fff;border-color:#0c9f8a}.appointment-modal{max-width:820px}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.modal-close{position:absolute;right:13px;top:10px;background:transparent!important;border:0!important;color:#7a8e9a!important;font-size:22px;padding:4px 8px}.modal-actions button{padding:10px 14px}.modal-actions .primary:disabled{opacity:.55;cursor:not-allowed}@media(max-width:1100px){.doctor-department-grid{grid-template-columns:repeat(2,1fr)}}
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
   MILESTONE 4 · CARE PLAN & TREATMENT
   ===================================================== */
.m4-page{max-width:1500px;margin:0 auto;background:radial-gradient(circle at 70% 0%,rgba(24,79,110,.12),transparent 40%)}
.m4-hero{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:16px;padding:25px 27px;border:1px solid #214158;border-radius:13px;background:linear-gradient(120deg,#0b2232,#0d5e66 55%,#0f8175);color:#fff}.m4-hero h2{margin:9px 0 6px;font-size:25px}.m4-hero p{margin:0;color:#d2edf0;max-width:760px;font-size:11px;line-height:1.6}.m4-hero-badge{padding:13px 16px;border:1px solid rgba(255,255,255,.22);border-radius:9px;background:rgba(255,255,255,.08);min-width:180px}.m4-hero-badge span{display:block;font-size:8px;color:#a7d9d6}.m4-hero-badge b{display:block;margin-top:5px;font-size:10px;letter-spacing:.8px}.m4-selector{display:flex;justify-content:space-between;gap:18px;align-items:center;margin-bottom:14px;background:#0c1826!important}.m4-selector h3,.m4-card-head h3{margin:4px 0;color:#f0f7ff}.m4-selector-actions{display:flex;gap:8px;align-items:center}.m4-selector-actions select{min-width:260px;background:#111f2e;border:1px solid #2a4056;color:#dceaf5;border-radius:6px;padding:9px;font-size:10px}.m4-selector-actions button{font-size:9px}.m4-selector-actions button:disabled{opacity:.45;cursor:not-allowed}.m4-message{margin:0 0 14px;padding:10px 12px;border:1px solid #285247;border-radius:7px;background:#0d2825;color:#78d8c4;font-size:9px}.m4-overview-grid,.m4-content-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:12px;margin-bottom:12px}.m4-content-grid{align-items:start}.m4-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.m4-chip,.m4-risk{padding:5px 8px;border-radius:12px;background:#112a3b;border:1px solid #2a4358;color:#8fb1c6;font-size:8px;white-space:nowrap}.m4-risk{color:#62d3bf;background:#10312f;border-color:#1e5c54;text-transform:uppercase}.m4-risk-high{color:#ff9ca4;background:#341b24;border-color:#66333d}.m4-profile-grid,.health-reading-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:14px}.m4-profile-grid>div,.health-reading-grid>div{padding:11px;border-radius:8px;border:1px solid #20364b;background:#101f2f}.m4-profile-grid small,.health-reading-grid small{display:block;color:#70889e;font-size:8px;margin-bottom:4px}.m4-profile-grid b,.health-reading-grid b{display:block;color:#dbeaf5;font-size:10px}.health-reading-grid span{display:block;color:#70889e;font-size:7px;margin-top:3px}.m4-progress-number{display:flex;align-items:flex-end;gap:8px;margin:13px 0 8px}.m4-progress-number strong{font-size:34px;color:#eef7fb}.m4-progress-number span{font-size:9px;color:#70889e;margin-bottom:4px}.m4-progress-track{height:8px;background:#142738;border-radius:8px;overflow:hidden;border:1px solid #21394e}.m4-progress-track span{display:block;height:100%;background:#22b7a1;border-radius:8px;transition:width .35s}.m4-plan-panel,.m4-health-panel,.m4-history-panel{background:#0c1826!important}.care-summary{padding:11px;border:1px solid #1e3347;border-radius:8px;background:#0f1d2b;margin:12px 0}.care-summary p{margin:5px 0;color:#7f95a8;font-size:9px;line-height:1.6}.care-summary b{color:#d4e7f3}.care-task-list{margin-top:8px}.care-task{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 0;border-top:1px solid #1b2f41}.care-task label{display:flex;align-items:center;gap:9px;flex:1;cursor:pointer}.care-task input{accent-color:#20b6a0}.care-task b{display:block;color:#dce9f4;font-size:10px}.care-task small{display:block;color:#6f889e;font-size:8px;margin-top:3px}.care-task-status{font-size:8px;color:#8fa8ba;padding:4px 7px;border-radius:10px;background:#111f2d;border:1px solid #243a50}.care-task.completed b{text-decoration:line-through;color:#8fa7b7}.care-task.completed .care-task-status{color:#6fe0c8;background:#0f302c;border-color:#245d55}.m4-comparison{display:flex;justify-content:space-between;gap:10px;margin-top:12px;padding:10px;border-radius:8px;background:#101f2d;border:1px solid #21364a;font-size:8px;color:#7690a5}.m4-comparison b{color:#dcecf6}.m4-history-panel{margin-top:2px}.care-history-row{display:grid;grid-template-columns:1.7fr .7fr .6fr .7fr;gap:10px;align-items:center;padding:11px 0;border-top:1px solid #182b3c;cursor:pointer}.care-history-row:hover{background:#102030}.care-history-row b{display:block;color:#dceaf5;font-size:10px}.care-history-row small{display:block;color:#6f879b;font-size:8px;margin-top:4px}.care-history-row>span{font-size:8px;color:#88a3b6;text-align:left}.care-history-row>span:nth-last-child(3){color:#50d6be}.m4-page .muted{color:#71899d;font-size:9px}

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


/* =====================================================
   HUMAN-FRIENDLY UI PASS
   Simple hospital-portal look: clear labels, less visual noise,
   and no decorative security/AI claims.
   ===================================================== */
:host{font-family:"Segoe UI",Arial,sans-serif;color:#29404f}
.app{background:#f4f7f9;color:#29404f}
aside{width:228px;background:#17384a;padding:18px 12px}
.logo{padding:6px 9px 22px}.logo>span{width:36px;height:36px;border-radius:9px;background:#1b9b8a}.logo b{font-size:16px}.logo small{font-size:10px;color:#a7bcc6}
aside button{padding:10px 12px;border-radius:8px;font-size:12px;color:#bdd0d8}
aside button.active,aside button:hover{background:#225165;color:#fff}
.clinical-topnav{height:58px;background:#fff;border-bottom:1px solid #dfe7eb;color:#34505f;position:static;padding:0 22px;box-shadow:none}
.doctor-strip b{color:#29404f}.doctor-strip small{color:#7a8c96}.doctor-avatar{background:#e6f4f2;color:#08796d}
.milestone-nav button{color:#607581!important;background:#f6f8f9!important;border:1px solid #e1e8eb!important;border-radius:7px!important;padding:7px 10px!important}
.milestone-nav button.active{color:#0b766b!important;background:#e8f6f3!important;border-color:#bfe5de!important;box-shadow:none}
.hipaa-badge{color:#15806f;font-size:9px}
header{height:76px;padding:0 28px;background:#fff!important;border-bottom:1px solid #e1e8eb!important}
header h1{font-size:21px;color:#29404f!important} header p{color:#7d8e98!important}
.content{padding:24px 28px}
.panel{border-radius:10px;box-shadow:none;border-color:#dfe7eb}
button{box-shadow:none;font-weight:600}
.dash-hero{background:#eaf5f4;border:1px solid #cfe6e3;border-radius:12px;padding:22px;color:#254b5a;box-shadow:none}
.dash-hero .eyebrow{color:#147869}.dash-hero h2{font-size:25px;letter-spacing:0;color:#244653}.dash-hero p{color:#58707b;line-height:1.5}.hero-primary{background:#168c7d!important;color:#fff!important;border:1px solid #168c7d!important}.hero-secondary{background:#fff!important;color:#365665!important;border:1px solid #cad9df!important}
.student-note{margin-top:12px;font-size:11px;color:#4d6d78;background:#fff;border:1px solid #d4e5e3;padding:8px 10px;border-radius:7px;display:inline-block}
.stat-card{border-radius:10px;box-shadow:none}.stat-card:hover{transform:none;box-shadow:none}
.dashboard-note{box-shadow:none}
.m4-page{background:#f4f7f9}
.m4-hero{background:#edf7f5;color:#284b57;border:1px solid #d0e5e1;border-radius:11px;padding:21px 23px;box-shadow:none}
.m4-hero h2{font-size:23px;color:#234653}.m4-hero p{color:#5e757d}
.m4-hero-badge{background:#fff;border-color:#d5e5e3;color:#31515d}.m4-hero-badge span{color:#738a92}.m4-hero-badge b{color:#31515d}
.m4-selector{background:#fff!important;border:1px solid #dfe7eb!important;color:#29404f}.m4-selector-actions select{background:#fff;color:#34505f;border:1px solid #cddbe0}
.m4-progress-track{height:8px;background:#e8eef0;border-radius:8px}.m4-progress-track span{background:#1a9787!important}
.m4-risk{background:#eef2f4;color:#526a74}.m4-chip{background:#eef7f6;color:#24776e}
.care-task{border-color:#e0e8eb!important;background:#fbfcfc!important}.care-task:hover{background:#f6faf9!important}
/* Keep the AI and monitoring pages readable but less glossy. */
.screenshot-ai-page,.screenshot-alerts-page{background:#0b1722}
.ai-kpi,.cvd-card,.risk-mini-card,.fl-strip,.dark-history,.alert-summary-grid>div,.dark-alert-table{box-shadow:none}
.ai-kpi-grid,.alert-summary-grid{gap:9px}
@media(max-width:900px){aside{width:200px}.clinical-topnav{padding:8px 12px}}

/* =====================================================
   MEDISPHERE CARE DESK · FINAL HIGH-CONTRAST UI
   Clear clinic portal look. No low-contrast text, no dark text
   on dark cards, and no decorative gradients.
   ===================================================== */
:host{display:block;--navy:#163b53;--navy2:#214f69;--teal:#147d70;--teal2:#e8f6f2;--blue:#2563a8;--ink:#173246;--muted:#657a88;--line:#d7e1e7;--bg:#eef3f7;--card:#fff;--danger:#b42318;--danger-bg:#fff0ee;--amber:#9a5a00;--amber-bg:#fff6df}
*{box-sizing:border-box}.app{min-height:100vh;background:var(--bg)!important;color:var(--ink)!important}.app main{min-width:0;background:var(--bg)!important}
aside{width:238px!important;background:var(--navy)!important;color:#fff!important;padding:18px 14px!important;border-right:1px solid #0f3043!important;box-shadow:none!important}
.logo{padding:6px 8px 18px!important;margin-bottom:14px!important;border-bottom:1px solid rgba(255,255,255,.14)!important}.logo>span{width:36px!important;height:36px!important;border-radius:9px!important;background:#1f9a89!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:22px!important}.logo b{color:#fff!important;font-size:16px!important}.logo small{color:#b8cbd5!important;font-size:9px!important;margin-top:4px!important}
aside>button{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;padding:10px 11px!important;margin:2px 0!important;border:1px solid transparent!important;border-radius:7px!important;background:transparent!important;color:#d6e4eb!important;font-size:12px!important;text-align:left!important;cursor:pointer!important}.side-bottom>button{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;padding:10px 11px!important;margin:8px 0 0!important;border:1px solid transparent!important;border-radius:7px!important;background:transparent!important;color:#d6e4eb!important;font-size:12px!important;text-align:left!important;cursor:pointer!important}aside>button:hover,.side-bottom>button:hover{background:#204d67!important;color:#fff!important}aside>button.active{background:#2a627f!important;color:#fff!important;border-color:#3a7894!important;box-shadow:none!important}.side-bottom{margin-top:auto!important;padding-top:14px!important;border-top:1px solid rgba(255,255,255,.14)!important}.user-mini{padding:0 10px;color:#fff!important;font-size:11px;font-weight:800}.user-mini small{display:block;color:#b8cad4!important;font-size:9px;margin-top:4px;font-weight:500}
.clinical-topnav{height:64px!important;background:#fff!important;border-bottom:1px solid var(--line)!important;padding:0 24px!important;display:flex!important;align-items:center!important;gap:18px!important;position:sticky!important;top:0!important;z-index:20!important;box-shadow:none!important}.doctor-strip{display:flex!important;align-items:center!important;gap:10px!important;min-width:215px!important}.doctor-avatar{width:34px!important;height:34px!important;border-radius:50%!important;background:#dcefeb!important;color:#0f796d!important;display:grid!important;place-items:center!important;font-size:10px!important;font-weight:900!important}.doctor-strip b{display:block!important;color:var(--ink)!important;font-size:11px!important}.doctor-strip small{display:block!important;color:#758894!important;font-size:9px!important;margin-top:3px!important}.milestone-nav{display:flex!important;gap:7px!important;flex:1!important;overflow:auto!important}.milestone-nav button{white-space:nowrap!important;background:#f7f9fb!important;color:#617683!important;border:1px solid var(--line)!important;padding:7px 10px!important;border-radius:7px!important;font-size:10px!important;font-weight:800!important}.milestone-nav button.active{background:var(--teal2)!important;color:#0f776b!important;border-color:#acd7ce!important;box-shadow:none!important}.hipaa-badge{white-space:nowrap!important;font-size:9px!important;color:#177866!important;font-weight:800!important}
header{min-height:76px!important;background:#fff!important;border-bottom:1px solid var(--line)!important;padding:0 24px!important;color:var(--ink)!important}header h1{color:var(--ink)!important;font-size:20px!important;font-weight:800!important;letter-spacing:-.01em!important}header p{color:#728691!important;font-size:11px!important}.header-actions{gap:8px!important}.header-actions .live{background:#edf8f4!important;color:#187866!important;border:1px solid #c8e5db!important;border-radius:18px!important;padding:7px 10px!important;font-size:9px!important;font-weight:800!important}.header-actions button{background:#fff!important;color:#47606e!important;border:1px solid #ccd9e0!important;border-radius:7px!important;padding:8px 10px!important;font-size:10px!important;font-weight:800!important}
.content{padding:22px 24px 30px!important;color:var(--ink)!important}.panel,.table{background:var(--card)!important;border:1px solid var(--line)!important;border-radius:10px!important;box-shadow:0 2px 8px rgba(24,55,73,.04)!important;color:var(--ink)!important}.panel h3,.panel h4,.section-heading h3,.panel b{color:var(--ink)!important}.muted,.panel small,.section-heading p{color:var(--muted)!important}
.toolbar input,input,select,textarea{border-color:#cbd8df!important;background:#fff!important;color:var(--ink)!important}.toolbar input:focus,input:focus,select:focus,textarea:focus{outline:none!important;border-color:#298f82!important;box-shadow:0 0 0 3px rgba(41,143,130,.10)!important}button.primary,.primary{background:var(--teal)!important;border-color:var(--teal)!important;color:#fff!important;border-radius:7px!important;font-weight:800!important}.primary:hover{background:#0f6d61!important}
/* Dashboard */
.dash-hero{background:#fff!important;border:1px solid var(--line)!important;border-radius:11px!important;box-shadow:none!important;padding:22px 22px!important}.dash-hero:before{background:#198b7d!important;width:5px!important}.dash-hero .eyebrow,.section-kicker{color:#147d70!important}.dash-hero h2{color:var(--ink)!important;font-size:24px!important}.dash-hero p{color:var(--muted)!important}.student-note{background:#f5f9fb!important;border:1px solid #dbe6eb!important;color:#607582!important}.hero-primary{background:#167d70!important;color:#fff!important;border:1px solid #167d70!important}.hero-secondary{background:#fff!important;color:#355565!important;border:1px solid #cbd9df!important}.dash-date-card{background:#f8fafb!important;border:1px solid var(--line)!important;box-shadow:none!important}.dash-date-card strong,.dash-date-card b{color:#23475d!important}.dash-date-card small{color:#748791!important}.stat-grid{gap:12px!important}.stat-card{background:#fff!important;border:1px solid var(--line)!important;border-radius:10px!important;box-shadow:none!important}.stat-card:hover{transform:none!important;box-shadow:none!important}.stat-card small{color:#667b88!important}.stat-card strong{color:#173246!important}.stat-card>span{color:#738691!important}.stat-icon{background:#eaf5f2!important;color:#127a6d!important}.stat-link{color:#2d6475!important}.patient-roster-row,.appointment-modern{border-color:#e6edf1!important}.patient-avatar{background:#e5f3f0!important;color:#167b6e!important}.patient-roster-info b,.appointment-person b,.appointment-time b{color:#1c4054!important}.patient-roster-info span,.appointment-person span,.appointment-time span{color:#788b96!important}.record-chip,.appointment-status{background:#eef6f4!important;color:#347568!important;border:1px solid #d3e6e0!important}.signal-card{background:#fbfcfd!important;border:1px solid #dce6eb!important}.signal-red{border-left:4px solid #d05d52!important}.signal-teal{border-left:4px solid #2d9b89!important}.signal-blue{border-left:4px solid #4f82b0!important}.signal-card b{color:#244354!important}.signal-card small{color:#738691!important}.signal-icon{background:#edf4f6!important;color:#326178!important}.quick-action-grid button{background:#fbfcfd!important;border:1px solid #dbe5ea!important;color:#2b4a5b!important;border-radius:8px!important}.quick-action-grid button span{background:#e8f5f2!important;color:#137c70!important}.dashboard-note{background:#fff!important;border:1px solid var(--line)!important;box-shadow:none!important}.dashboard-note b{color:#244354!important}.dashboard-note small{color:#778a94!important}.dashboard-note em{background:#eef7f4!important;color:#50766f!important}
/* M4 */
.m4-page{background:var(--bg)!important}.m4-hero{background:#fff!important;border:1px solid var(--line)!important;color:var(--ink)!important;box-shadow:none!important}.m4-hero h2{color:var(--ink)!important}.m4-hero p{color:var(--muted)!important}.m4-hero:before{background:#198b7d!important}.m4-hero-badge,.m4-selector{background:#fff!important;border:1px solid var(--line)!important;color:var(--ink)!important;box-shadow:none!important}.m4-selector h3,.m4-card-head h3{color:var(--ink)!important}.m4-selector-actions select{background:#fff!important;color:var(--ink)!important;border:1px solid #cbd8df!important}.m4-message{background:#edf8f4!important;border:1px solid #c6e4d9!important;color:#146c5d!important}.m4-chip,.m4-risk{background:#edf6f4!important;color:#2d7469!important;border:1px solid #d0e4de!important}.m4-risk-high{background:var(--danger-bg)!important;color:var(--danger)!important;border-color:#efc9c3!important}.m4-profile-grid>div,.health-reading-grid>div{background:#f8fafb!important;border:1px solid #dfe7eb!important}.m4-profile-grid small,.health-reading-grid small{color:#718692!important}.m4-profile-grid b,.health-reading-grid b{color:var(--ink)!important}.m4-progress-number strong{color:#137b6e!important}.m4-progress-number span{color:#748792!important}.m4-progress-track{background:#e7eef1!important;border:1px solid #d6e1e6!important}.m4-progress-track span{background:#198b7d!important}.care-summary{background:#f7fafb!important;border:1px solid #dfe8ec!important}.care-summary b{color:#244455!important}.care-summary p{color:#718590!important}.care-task{background:#fbfcfd!important;border:1px solid #dfe7eb!important;color:var(--ink)!important;border-radius:8px!important}.care-task:hover{background:#f6faf9!important}.care-task-status{background:#eef4f6!important;color:#57717d!important;border:1px solid #d7e3e8!important}.care-task.completed{background:#f0f8f4!important;border-color:#cbe3d8!important}.care-task.completed b{color:#54706e!important}.m4-history-panel .care-history-row{border-color:#e6edf1!important}.care-history-row b{color:#244455!important}.care-history-row small,.care-history-row>span{color:#788c97!important}.m4-page .muted{color:#748792!important}
/* AI Risk + Alerts */
.screenshot-ai-page,.screenshot-alerts-page{background:var(--bg)!important;color:var(--ink)!important}.ai-page-head h2,.alert-page-head h2{color:var(--ink)!important}.ai-page-head p,.alert-page-head p{color:var(--muted)!important}.ai-brandline{color:#2d4e61!important}.ai-brandline small{color:#7b8c96!important}.brand-mark{color:#1a897b!important}.ai-head-actions button{background:#fff!important;color:#4c6573!important;border:1px solid #d2dee4!important}.ai-head-actions .blue-action,.run-ai,.dispatch-btn{background:#157f72!important;border-color:#157f72!important;color:#fff!important}.ai-kpi,.cvd-card,.risk-mini-card,.fl-strip,.dark-history,.alert-summary-grid>div,.dark-alert-table,.ai-control-strip{background:#fff!important;border:1px solid var(--line)!important;box-shadow:none!important;color:var(--ink)!important}.ai-kpi span,.ai-kpi small,.risk-mini-card em{color:#6d828e!important}.ai-kpi strong,.risk-mini-card strong{color:var(--ink)!important}.ai-control-strip span{color:#748894!important}.ai-control-strip b{color:var(--ink)!important}.ai-control-strip select{background:#fff!important;color:var(--ink)!important;border:1px solid #cbd8df!important}.monitor-live{background:#eaf7f3!important;border:1px solid #c6e5da!important;color:#107463!important}.alert-summary-grid .severity-high,.alert-summary-grid .critical{background:var(--danger-bg)!important;color:var(--danger)!important}.dark-history,.dark-alert-table{background:#fff!important}.dark-history *,.dark-alert-table *{color:inherit!important}.dark-history table th,.dark-alert-table table th{background:#f5f8fa!important;color:#566e7b!important}.dark-history table td,.dark-alert-table table td{color:#234354!important;border-color:#e5edf1!important}
/* Other pages */
.form-modal,.modal-backdrop .form-modal{background:#fff!important;color:var(--ink)!important;border:1px solid var(--line)!important;box-shadow:0 18px 50px rgba(20,45,65,.15)!important}.form-modal h3{color:var(--ink)!important}.form-modal .muted{color:var(--muted)!important}.slot-section{border-top-color:#e3ebef!important}.slot-section button{background:#f8fafb!important;border:1px solid #d5e1e6!important;color:#2e4f60!important}.slot-section button.selected-slot{background:#e8f6f2!important;color:#0f766a!important;border-color:#abd8cf!important}.table th{background:#f5f8fa!important;color:#5b727f!important}.table td{color:#234354!important;border-top-color:#e5edf1!important}.table td small{color:#7b8d97!important}.badge,.chip{color:#2d6574!important;background:#eef5f7!important;border-color:#d6e3e8!important}
@media(max-width:1050px){aside{width:215px!important}.clinical-topnav{padding:0 14px!important}.content{padding:18px!important}}
@media(max-width:760px){aside{width:72px!important;padding:14px 8px!important}.logo div,.logo small,.user-mini,aside>button span,.side-bottom>button span{display:none!important}.logo{justify-content:center!important}.logo>span{margin:auto!important}.clinical-topnav{gap:10px!important}.doctor-strip{min-width:auto!important}.doctor-strip>div{display:none!important}.hipaa-badge{display:none!important}.content{padding:14px!important}}


/* Light clinical shell used by the dashboard reference */
.app{background:#f4f7fa!important}
aside{width:230px!important;background:#ffffff!important;color:#385363!important;border-right:1px solid #dde6eb!important;padding:20px 12px!important}
.logo{padding:7px 10px 24px!important}.logo>span{background:#e7f0ff!important;color:#2267c9!important;border:1px solid #cfe0fb!important;font-size:18px!important}.logo b{color:#19364a!important}.logo small{color:#8a9aa3!important}
aside button{color:#647985!important;padding:10px 11px!important;border-radius:7px!important;font-size:11px!important}
aside button.active,aside button:hover{background:#eaf2ff!important;color:#2064bd!important}
.side-bottom{border-top:1px solid #e4ebef!important}.user-mini{color:#29485a!important}.user-mini small{color:#83939c!important}.side-bottom>button{background:#fff!important;color:#6a7f8b!important;border:1px solid #dbe5ea!important;margin-top:5px}
main{background:#f4f7fa!important}
main:has(.dashboard-page) > header{display:none!important}
.clinical-topnav{background:#fff!important;border-bottom:1px solid #dce5ea!important;box-shadow:0 1px 4px rgba(16,47,66,.025)!important}
.doctor-avatar{background:#e8f2ff!important;color:#2c6dc7!important}.milestone-nav button{background:#f6f9fb!important;color:#6b7f8a!important;border-color:#e0e8ed!important}.milestone-nav button.active{background:#eaf4ff!important;color:#2267c9!important;border-color:#cddff7!important}.hipaa-badge{color:#177b6c!important}

/* =========================================================
   DASHBOARD REBUILD · High contrast clinical workspace
   Visual direction: clean hospital portal / modern EHR
   ========================================================= */
.dashboard-page{max-width:none!important;padding:18px 26px 28px!important;background:#f4f7fa!important;color:#182c3d!important}
.dashboard-toolbar{height:48px;display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:16px}
.dashboard-search{height:40px;display:flex;align-items:center;gap:9px;width:min(520px,52vw);background:#fff;border:1px solid #dce5ea;border-radius:9px;padding:0 13px;box-shadow:0 1px 3px rgba(16,47,66,.03)}
.dashboard-search>span{font-size:20px;color:#58717f;line-height:1}
.dashboard-search input{width:100%!important;border:0!important;box-shadow:none!important;padding:0!important;font-size:12px!important;color:#203a4d!important;background:transparent!important}
.dashboard-search input::placeholder{color:#9aaab4}
.dashboard-toolbar-right{display:flex;align-items:center;gap:8px}
.toolbar-icon,.today-select,.today-chip{height:36px;box-sizing:border-box;border:1px solid #dbe4e9!important;background:#fff!important;color:#486373!important;border-radius:8px!important;font-size:11px!important;font-weight:800!important}
.toolbar-icon{width:36px;padding:0!important;position:relative;font-size:16px!important}
.toolbar-icon i{position:absolute;right:-3px;top:-4px;min-width:14px;height:14px;padding:0 3px;border-radius:8px;background:#df5b50;color:#fff;font-size:8px;font-style:normal;display:grid;place-items:center}
.today-chip{display:flex;align-items:center;padding:0 11px;font-weight:700!important}
.today-select{padding:0 12px!important}
.dashboard-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin:2px 0 18px}
.dashboard-kicker{font-size:10px;letter-spacing:.13em;font-weight:900;color:#177c70}
.dashboard-heading h2{margin:4px 0 5px;font-size:28px;line-height:1.15;color:#142d3d;letter-spacing:-.02em}
.dashboard-heading p{margin:0;max-width:720px;color:#6f808b;font-size:12px;line-height:1.6}
.workspace-status{margin-top:6px;display:flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid #cae5dd;background:#f2fbf8;border-radius:18px;color:#247466;font-size:10px;font-weight:900;white-space:nowrap}
.workspace-status span{width:7px;height:7px;border-radius:50%;background:#24a38b}
.dashboard-stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}
.dashboard-stat{display:flex;align-items:center;gap:13px;background:#fff;border:1px solid #dde6eb;border-radius:11px;padding:14px 15px;min-height:76px;cursor:pointer;transition:.16s}
.dashboard-stat:hover{border-color:#c9d8df;transform:translateY(-1px);box-shadow:0 7px 18px rgba(17,47,65,.06)}
.dashboard-stat-icon{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;font-size:18px;font-weight:900;flex:0 0 auto}
.dashboard-stat small{display:block;font-size:10px;color:#6d808b;margin-bottom:2px;font-weight:700}
.dashboard-stat strong{display:inline-block;font-size:27px;color:#142f41;line-height:1.05;margin-right:7px}
.dashboard-stat span{display:block;font-size:9px;color:#8b9aa3;margin-top:4px}
.dashboard-stat.blue .dashboard-stat-icon{background:#e9f1ff;color:#356cc7}.dashboard-stat.teal .dashboard-stat-icon{background:#e7f7f3;color:#159379}.dashboard-stat.red .dashboard-stat-icon{background:#fff0ee;color:#c64b42}.dashboard-stat.violet .dashboard-stat-icon{background:#f1ecff;color:#7654c4}
.dashboard-two-col{display:grid;grid-template-columns:1.02fr .98fr;gap:14px;margin-bottom:14px}
.dash-card{background:#fff;border:1px solid #dde6eb;border-radius:11px;padding:16px;box-shadow:0 2px 9px rgba(19,50,68,.035)}
.dash-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
.dash-card-head small{display:block;font-size:9px;letter-spacing:.09em;color:#7f929d;font-weight:900;margin-bottom:3px}
.dash-card-head h3{margin:0;font-size:15px;color:#18364a}
.outline-btn{height:30px;padding:0 10px!important;border:1px solid #cbd9e0!important;background:#fff!important;color:#2b607b!important;border-radius:6px!important;font-size:9px!important;font-weight:900!important;white-space:nowrap}
.outline-btn:hover{background:#f3f8fa!important}
.patient-banner{display:flex;align-items:center;gap:11px;background:#f8fafb;border:1px solid #e3ebef;border-radius:9px;padding:10px 11px;margin-bottom:12px}
.patient-banner-avatar{width:40px;height:40px;border-radius:10px;background:#ddecff;color:#2e67b8;display:grid;place-items:center;font-weight:900;font-size:12px;flex:0 0 auto}
.patient-banner-main{flex:1;min-width:0}.patient-banner-main b{display:block;font-size:12px;color:#18364a}.patient-banner-main span{display:block;font-size:9px;color:#81919b;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.patient-badges{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px}.good-badge,.soft-badge{font-size:8px;padding:5px 7px;border-radius:12px;font-weight:800}.good-badge{background:#e8f7f1;border:1px solid #c8e5d9;color:#2a7c6c}.soft-badge{background:#eef4f7;border:1px solid #d8e2e8;color:#607986}
.vital-card-row{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.vital-mini{position:relative;min-height:71px;padding:10px 10px 9px;border:1px solid #e4ebef;border-radius:8px;background:#fff;overflow:hidden}
.vital-mini:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px}.vital-mini.heart:before{background:#e45b62}.vital-mini.pressure:before{background:#39a4b4}.vital-mini.oxygen:before{background:#4d86d5}.vital-mini.glucose:before{background:#e5a339}.vital-mini.temp:before{background:#7d65c7}
.vital-mini small{display:block;font-size:8px;color:#82939d;font-weight:800}.vital-mini b{display:inline-block;font-size:16px;color:#193649;margin-top:4px}.vital-mini>span{font-size:8px;color:#83939c;margin-left:3px}.vital-mini em{display:block;font-style:normal;font-size:8px;color:#2a8a76;font-weight:900;margin-top:3px}.vital-mini em.bad{color:#c54a43}
.trend-card{position:relative}.range-pills{display:flex;gap:3px}.range-pills button{height:25px;padding:0 7px!important;border:0!important;background:transparent!important;color:#748792!important;border-radius:5px!important;font-size:8px!important;font-weight:900!important}.range-pills button.active{background:#eef4ff!important;color:#316bd0!important}
.trend-summary{display:flex;align-items:baseline;gap:7px;margin:-2px 0 5px}.trend-summary strong{font-size:22px;color:#193649}.trend-summary span{font-size:9px;color:#81919c}.trend-summary em{margin-left:auto;padding:4px 7px;border-radius:11px;font-size:8px;font-style:normal;font-weight:900;color:#2a8976;background:#eaf7f2}.trend-summary em.alert{color:#b33f39;background:#fff0ee}
.dashboard-chart{position:relative;border:1px solid #e8eef1;border-radius:9px;background:#fcfdfe;padding:6px 9px 1px 29px}.dashboard-chart svg{width:100%;height:190px;display:block}.chart-grid-line{stroke:#e6edf1;stroke-width:1}.dashboard-trend-line{fill:none;stroke:#e75f66;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.chart-labels{position:absolute;left:7px;top:13px;bottom:28px;display:flex;flex-direction:column;justify-content:space-between;font-size:7px;color:#96a6af}.chart-times{display:flex;justify-content:space-between;padding:0 15px 5px 0;font-size:7px;color:#9aa8b0}.chart-link{margin:7px 0 0 auto;display:block;border:0!important;background:transparent!important;color:#2b6e9b!important;padding:0!important;font-size:9px!important;font-weight:900!important}
.lower-panels{grid-template-columns:1.06fr .94fr}.alert-table-row{display:grid;grid-template-columns:55px 95px 1fr 86px;gap:8px;align-items:center;padding:10px 7px;border-bottom:1px solid #edf2f4;font-size:9px;color:#627986;cursor:pointer}.alert-table-row:not(.alert-header):hover{background:#fbfcfd}.alert-header{padding-top:0;color:#9aa8af;font-size:8px;text-transform:uppercase;letter-spacing:.04em;cursor:default}.alert-table-row span:nth-child(2){font-weight:800;color:#2b4e61}.alert-table-row span:nth-child(3){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.alert-pill{display:inline-block;font-style:normal;font-size:8px;padding:4px 6px;border-radius:10px;background:#fff0ee;color:#b5433c;font-weight:900}.alert-pill.warning{background:#fff6df;color:#9a6c14}
.appointment-line{display:grid;grid-template-columns:61px 1fr 75px;gap:10px;align-items:center;padding:10px 2px;border-bottom:1px solid #edf2f4}.appt-time b{display:block;color:#28465a;font-size:10px}.appt-time span{display:block;color:#95a3ab;font-size:8px;margin-top:2px}.appt-person b{display:block;color:#1c3b4e;font-size:10px}.appt-person span{display:block;color:#8696a0;font-size:8px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.appointment-line em{justify-self:end;font-style:normal;background:#edf7f4;color:#2c7b6c;border:1px solid #d6eae3;border-radius:10px;padding:4px 6px;font-size:8px;font-weight:900}
.dashboard-bottom-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}.risk-preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.risk-circle-wrap{border:1px solid #e5ecef;background:#fbfcfd;border-radius:9px;padding:11px;display:grid;grid-template-columns:58px 1fr;grid-template-rows:auto auto;column-gap:9px;align-items:center}.risk-circle{width:55px;height:55px;border-radius:50%;grid-row:1 / 3;display:grid;place-items:center;position:relative;background:conic-gradient(#1da58b 86deg,#e8eef1 86deg);border:6px solid #f1f6f7;box-sizing:border-box}.risk-circle:after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff}.risk-circle strong,.risk-circle span{position:relative;z-index:1}.risk-circle strong{font-size:14px;color:#244355}.risk-circle span{display:none}.risk-circle.diabetes{background:conic-gradient(#5d8fe2 70deg,#e8eef1 70deg)}.risk-circle-wrap>b{font-size:9px;color:#526c79}.risk-circle-wrap>em{font-size:8px;font-style:normal;color:#239175;font-weight:900}.factor-strip{display:flex;gap:8px;margin-top:10px}.factor-strip span{flex:1;min-width:0}.factor-strip b{display:block;font-size:8px;color:#627b87;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.factor-strip i{display:block;height:4px;border-radius:5px;background:#53a3dc;margin-top:4px;max-width:100%}
.care-preview-card{display:flex;flex-direction:column}.care-progress-head{display:flex;align-items:baseline;gap:8px}.care-progress-head strong{font-size:27px;color:#197f72}.care-progress-head span{font-size:9px;color:#78909a;font-weight:800}.care-progress-bar{height:8px;border-radius:5px;background:#e9eff1;margin:8px 0 9px;overflow:hidden}.care-progress-bar i{display:block;height:100%;background:#28af91;border-radius:5px}.care-progress-foot{display:flex;justify-content:space-between;gap:10px;font-size:8px;color:#8a9aa3}.care-progress-foot b{color:#3d6472;font-weight:800}.dashboard-flow-note{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#fff;border:1px solid #dce7eb;border-radius:9px}.flow-dot{width:8px;height:8px;border-radius:50%;background:#15947e;flex:0 0 auto}.dashboard-flow-note div{flex:1}.dashboard-flow-note b{display:block;font-size:10px;color:#25495b}.dashboard-flow-note small{display:block;font-size:8px;color:#84969f;margin-top:3px}.dashboard-flow-note em{font-size:8px;font-style:normal;color:#637983;background:#f0f5f7;border:1px solid #dfe7eb;padding:5px 7px;border-radius:12px;white-space:nowrap}.dash-empty{padding:20px 0;text-align:center;color:#91a0a8;font-size:10px}
@media(max-width:1180px){.dashboard-stat-row{grid-template-columns:repeat(2,1fr)}.dashboard-two-col,.dashboard-bottom-grid{grid-template-columns:1fr}.vital-card-row{grid-template-columns:repeat(3,1fr)}}
@media(max-width:760px){.dashboard-page{padding:12px!important}.dashboard-toolbar{height:auto;align-items:stretch;flex-direction:column}.dashboard-search{width:100%}.dashboard-toolbar-right{justify-content:flex-end}.dashboard-heading{flex-direction:column}.dashboard-heading h2{font-size:24px}.dashboard-stat-row{grid-template-columns:1fr}.vital-card-row{grid-template-columns:repeat(2,1fr)}.patient-banner{align-items:flex-start}.patient-badges{display:none}.alert-table-row{grid-template-columns:45px 75px 1fr 68px}.dashboard-bottom-grid{grid-template-columns:1fr}.dashboard-flow-note{align-items:flex-start}.dashboard-flow-note em{display:none}}


/* =====================================================
   REFERENCE DASHBOARD · MATCH THE PROVIDED CLINICAL SCREEN
   Dark clinical workspace with the same hierarchy and spacing.
   ===================================================== */
.app:has(.dashboard-page){background:#060b18!important;color:#eef4ff!important}
.app:has(.dashboard-page) main{background:#060b18!important}
.app:has(.dashboard-page) .clinical-topnav{display:none!important}
.app:has(.dashboard-page) aside{width:218px!important;background:#071021!important;border-right:1px solid #1a2946!important;padding:18px 12px!important;box-shadow:none!important}
.app:has(.dashboard-page) aside .logo{padding:4px 9px 20px!important;margin-bottom:10px!important;border-bottom:1px solid #1a2946!important}
.app:has(.dashboard-page) aside .logo>span{width:36px!important;height:36px!important;border-radius:10px!important;background:#1e67ed!important;box-shadow:0 0 18px rgba(47,118,255,.24)!important}
.app:has(.dashboard-page) aside .logo b{font-size:15px!important;color:#f4f7ff!important}
.app:has(.dashboard-page) aside .logo small{font-size:8px!important;color:#7890ae!important}
.app:has(.dashboard-page) aside>button,.app:has(.dashboard-page) .side-bottom>button{color:#a8bad3!important;border-radius:8px!important;padding:9px 10px!important;font-size:11px!important;border:1px solid transparent!important;background:transparent!important}
.app:has(.dashboard-page) aside>button:hover,.app:has(.dashboard-page) .side-bottom>button:hover{background:#101e38!important;color:#eef5ff!important}
.app:has(.dashboard-page) aside>button.active{background:#3468ee!important;color:#fff!important;border-color:#4778f4!important;box-shadow:0 5px 18px rgba(38,86,220,.22)!important}
.app:has(.dashboard-page) .side-bottom{border-top:1px solid #1a2946!important}
.app:has(.dashboard-page) .user-mini{color:#edf4ff!important}.app:has(.dashboard-page) .user-mini small{color:#6f86a5!important}
.app:has(.dashboard-page) .content.dashboard-page{padding:20px 24px 26px!important;background:#060b18!important;max-width:none!important;color:#eef4ff!important}
.ref-dashboard-topbar{height:54px;display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:20px}
.ref-search{width:min(460px,50%);height:36px;background:#0e1830;border:1px solid #203152;border-radius:18px;display:flex;align-items:center;padding:0 13px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.01)}
.ref-search span{font-size:17px;color:#6e86a7}.ref-search input{flex:1;background:transparent!important;border:0!important;outline:0!important;color:#dce6f6!important;font-size:10px!important;padding:0 8px!important}.ref-search input::placeholder{color:#6f84a4!important}
.ref-top-actions{display:flex;align-items:center;gap:10px}.ref-top-icon{position:relative;width:34px;height:34px;border-radius:50%;border:1px solid #203152!important;background:#0e1830!important;color:#c1d0e4!important;padding:0!important}.ref-top-icon i{position:absolute;top:-4px;right:-2px;min-width:14px;height:14px;border-radius:8px;background:#f0444e;color:#fff;font-style:normal;font-size:7px;display:grid;place-items:center;border:2px solid #060b18}
.ref-mini-profile{display:flex;align-items:center;gap:9px}.ref-profile-avatar{width:34px;height:34px;border-radius:50%;background:#31567f;color:#fff;display:grid;place-items:center;font-size:9px;font-weight:900}.ref-mini-profile b{display:block;color:#eef4ff;font-size:10px}.ref-mini-profile small{display:block;color:#7389a7;font-size:8px;margin-top:2px}
.ref-dashboard-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:15px;margin-bottom:18px}.ref-dashboard-heading h2{font-size:22px;color:#f4f7ff;margin:0 0 4px;font-weight:800;letter-spacing:-.02em}.ref-dashboard-heading p{margin:0;color:#6f86a4;font-size:10px}.ref-heading-meta{display:flex;align-items:center;gap:8px}.ref-heading-meta>span{padding:8px 10px;border:1px solid #203152;border-radius:7px;background:#0c162b;color:#9fb2cc;font-size:9px}.ref-heading-meta button{padding:8px 10px!important;background:#0c162b!important;border:1px solid #203152!important;color:#c2d0e0!important;border-radius:7px!important;font-size:9px!important}.ref-heading-meta em{font-style:normal;font-size:8px;padding:7px 9px;border:1px solid #0c6f54;background:#071e1a;color:#43d6a6;border-radius:7px;font-weight:800}.ref-heading-meta em b{display:inline-block;width:6px;height:6px;border-radius:50%;background:#16cc91;margin-right:4px}
.ref-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.ref-kpi{display:flex;align-items:center;gap:12px;text-align:left;min-height:82px;padding:13px 15px!important;border-radius:12px!important;border:1px solid #1d2d50!important;background:#0c162b!important;color:#fff!important;box-shadow:none!important}.ref-kpi:hover{background:#101c35!important;border-color:#2a4070!important;transform:translateY(-1px)}.ref-kpi-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;font-size:15px;font-weight:900;flex:0 0 auto}.ref-kpi small{display:block;color:#7c91ad;font-size:9px}.ref-kpi strong{display:inline-block;font-size:26px;line-height:1;margin:4px 6px 2px 0;color:#eef5ff}.ref-kpi em{font-style:normal;font-size:8px;font-weight:800}.ref-kpi-blue .ref-kpi-icon{background:#0f2b56;color:#52a0ff}.ref-kpi-blue em{color:#22d39a}.ref-kpi-green .ref-kpi-icon{background:#102f2a;color:#32d7a4}.ref-kpi-green em{color:#38d6a3}.ref-kpi-red .ref-kpi-icon{background:#3a161b;color:#ff636b}.ref-kpi-red em{color:#ff8b8f}.ref-kpi-purple .ref-kpi-icon{background:#251b47;color:#a88afc}.ref-kpi-purple em{color:#6fe7b9}
.ref-main-grid,.ref-second-grid{display:grid;grid-template-columns:1.6fr .95fr;gap:12px;margin-bottom:12px}.ref-second-grid{grid-template-columns:1fr 1fr}.ref-card{background:#0c162b;border:1px solid #1d2d50;border-radius:12px;padding:15px;box-shadow:none;color:#eef4ff}.ref-card-title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px}.ref-card-title h3{margin:0;color:#eef4ff;font-size:13px}.ref-card-title p{margin:4px 0 0;color:#677f9f;font-size:8px}.ref-more-btn{background:transparent!important;color:#6e83a2!important;border:0!important;font-size:16px!important;padding:0!important}
.ref-live-chip{padding:6px 9px;border:1px solid #0d775a;background:#071e1a;color:#35d2a1;border-radius:7px;font-size:8px;font-weight:900}.ref-live-chip b{display:inline-block;width:6px;height:6px;border-radius:50%;background:#21dc9e;margin-right:4px}.ref-ecg{height:155px;position:relative;border-radius:8px;overflow:hidden;background:#091329;border:1px solid #172744}.ref-ecg-grid{position:absolute;inset:0;background:linear-gradient(rgba(73,112,165,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(73,112,165,.06) 1px,transparent 1px);background-size:100% 31px,56px 100%}.ref-ecg svg{position:absolute;inset:8px;width:100%;height:calc(100% - 16px)}.ref-ecg-line{fill:none;stroke:#20e49d;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 5px rgba(32,228,157,.45))}
.ref-monitor-values{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.ref-monitor-values>div{padding:6px 3px}.ref-monitor-values small{display:block;color:#7187a5;font-size:8px}.ref-monitor-values strong{font-size:17px;color:#f0f5ff;margin-right:3px}.ref-monitor-values span{font-size:8px;color:#6f84a1}.ref-monitor-values>div:nth-child(1) strong{color:#ff7580}.ref-monitor-values>div:nth-child(2) strong{color:#5ea4ff}.ref-monitor-values>div:nth-child(4) strong{color:#ffba2f}.ref-card-link{margin-top:6px;background:transparent!important;border:0!important;color:#74a5ff!important;padding:0!important;font-size:8px!important;font-weight:800!important}
.ref-risk-layout{display:grid;grid-template-columns:118px 1fr;gap:16px;align-items:center;min-height:210px}.ref-risk-donut{width:112px;height:112px;border-radius:50%;background:conic-gradient(#22d38f var(--risk-angle,86.4deg),#1b2a49 var(--risk-angle,86.4deg));display:grid;place-items:center;position:relative;border:10px solid #0e1930}.ref-risk-donut:after{content:"";position:absolute;inset:11px;border-radius:50%;background:#0c162b}.ref-risk-donut strong,.ref-risk-donut span{position:relative;z-index:1}.ref-risk-donut strong{font-size:22px;color:#eff5ff}.ref-risk-donut span{position:absolute;margin-top:42px;color:#25d895;font-size:8px;font-weight:900}.ref-factor-list h4{margin:0 0 9px;color:#93a8c2;font-size:9px;font-weight:700}.ref-factor-label{display:flex;justify-content:space-between;gap:8px;color:#6f86a4;font-size:8px;margin-bottom:4px}.ref-factor-label b{color:#a9bad0}.ref-factor-list>div:not(.ref-factor-label){margin-bottom:4px}.ref-factor-list>i{display:block;height:4px;background:#172744;border-radius:5px;margin:0 0 9px}.ref-factor-list>i em{display:block;height:100%;background:#3c79ec;border-radius:5px}.ref-factor-list>i:nth-of-type(2n) em{background:#a07bff}.ref-factor-list>i:nth-of-type(3n) em{background:#ffb72f}.ref-factor-list>i:nth-of-type(4n) em{background:#f15f73}
.ref-outline-btn{background:#101d35!important;border:1px solid #284063!important;color:#a9c9ff!important;border-radius:7px!important;padding:6px 9px!important;font-size:8px!important;font-weight:800!important}.ref-table{width:100%}.ref-table-head,.ref-table-row{display:grid;grid-template-columns:58px 1fr 70px 1.35fr 73px;gap:8px;align-items:center}.ref-table-head{padding:0 5px 7px;color:#57708f;font-size:8px;border-bottom:1px solid #1b2c4a}.ref-table-row{padding:9px 5px;border-bottom:1px solid #152541;color:#7d92ae;font-size:8px}.ref-table-row:last-child{border-bottom:0}.ref-table-row:hover{background:#0e1930}.ref-table-row span{min-width:0}.ref-table-row span:nth-child(2) b{display:block;color:#dce6f5;font-size:8px}.ref-table-row span:nth-child(2) small{display:block;color:#536b89;font-size:7px;margin-top:2px}.ref-table-row>span:nth-child(4){overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ref-table-row em{display:inline-block;font-style:normal;font-size:7px;padding:4px 6px;border-radius:9px;background:#401b20;color:#ff757d;font-weight:900}.ref-table-row em.warn{background:#3b2b0d;color:#ffc84b}.ref-empty{padding:18px;text-align:center;color:#57708e;font-size:9px}.ref-appointments-table .ref-table-head,.ref-appointments-table .ref-table-row{grid-template-columns:58px 1fr 1fr 78px}.appt-status{background:#083523!important;color:#36d59d!important}.ref-care-card{margin-bottom:0}.ref-care-card .ref-card-title{margin-bottom:10px}.ref-care-row{display:flex;align-items:center;gap:12px}.ref-progress{height:7px;background:#1b2a49;border-radius:8px;overflow:hidden;flex:1}.ref-progress i{display:block;height:100%;background:linear-gradient(90deg,#2c63ee,#9b60f4);border-radius:8px}.ref-care-row strong{font-size:16px;color:#e9f2ff}.ref-care-meta{display:flex;justify-content:space-between;gap:12px;margin-top:7px;color:#68809e;font-size:8px}.ref-care-meta span:last-child{color:#8ba0ba}
@media(max-width:1180px){.ref-kpi-grid{grid-template-columns:repeat(2,1fr)}.ref-main-grid,.ref-second-grid{grid-template-columns:1fr}.ref-risk-layout{grid-template-columns:120px 1fr}}
@media(max-width:760px){.app:has(.dashboard-page) aside{width:72px!important}.app:has(.dashboard-page) aside .logo div,.app:has(.dashboard-page) aside .logo small,.app:has(.dashboard-page) aside>button span,.app:has(.dashboard-page) .user-mini{display:none!important}.app:has(.dashboard-page) aside .logo{justify-content:center}.app:has(.dashboard-page) aside>button{justify-content:center}.app:has(.dashboard-page) .content.dashboard-page{padding:14px!important}.ref-dashboard-topbar{height:auto}.ref-search{width:100%}.ref-top-actions .ref-mini-profile div{display:none}.ref-dashboard-heading{align-items:flex-start;flex-direction:column}.ref-heading-meta{width:100%;flex-wrap:wrap}.ref-kpi-grid{grid-template-columns:1fr}.ref-monitor-values{grid-template-columns:repeat(2,1fr)}.ref-table-head{display:none}.ref-table-row,.ref-appointments-table .ref-table-row{grid-template-columns:1fr 1fr;padding:9px}.ref-risk-layout{grid-template-columns:100px 1fr}.ref-risk-donut{width:94px;height:94px}}



/* =========================================================
   GLOBAL DARK CLINICAL THEME — M5 VISUAL PASS
   ========================================================= */
:host{--bg:#07111f;--surface:#0d1829;--surface-2:#111f33;--border:#203453;--border-soft:#172943;--text:#eef5ff;--muted:#8296b3;--blue:#5ea4ff;--cyan:#33d8d1;--green:#35d5a1;--red:#ff6470;--amber:#ffc24a;--purple:#a889ff;color:var(--text)!important;background:var(--bg)!important}
.app,main,.content{background:var(--bg)!important;color:var(--text)!important}
header{background:#0a1525!important;border-color:var(--border)!important;color:var(--text)!important}header h1{color:var(--text)!important}header p{color:var(--muted)!important}.live{color:var(--green)!important}
aside{background:#06101d!important;border-right:1px solid var(--border-soft)!important;color:#d9e7f8!important}aside button{color:#8298b6!important}aside button.active,aside button:hover{background:#112844!important;color:#fff!important}.side-bottom{border-color:var(--border)!important}.user-mini{color:#e7f0fb!important}.user-mini small{color:#7187a5!important}.logo>span{background:#246fe8!important;box-shadow:0 8px 24px rgba(36,111,232,.24)!important}.logo small{color:#7186a2!important}
.metric,.panel,.profile,.empty,.twin-panel,.form-card,.monitoring-controls,.live-graph-panel,.recent-readings-panel,.appointment-card,.patient-card,.consent-card,.alert-panel,.m4-history-panel,.care-summary{background:var(--surface)!important;border-color:var(--border)!important;color:var(--text)!important;box-shadow:0 10px 28px rgba(0,0,0,.14)!important}
.metric span,.metric small,.muted,.empty-small,.twin-meta,.profile p,.panel p,.panel small,.m4-card small,.care-history-row small,.row small,td small{color:var(--muted)!important}.metric b,.panel h3,.profile h2,.panel-head h3,.m4-card h3,.care-summary h3,.section-title{color:var(--text)!important}.row,.mini-list div{border-color:var(--border-soft)!important}
button{background:var(--surface-2)!important;border-color:var(--border)!important;color:#dce9f8!important}button:hover:not(:disabled){background:#162843!important;border-color:#2f4d79!important}.primary{background:#246fe8!important;color:#fff!important;border-color:#246fe8!important}.primary:hover:not(:disabled){background:#2f7bf2!important}.danger-btn{background:#421c25!important;color:#ff7f88!important;border-color:#71313e!important}
.toolbar input,.form-grid input,.toolbar select,select,input,textarea{background:#0b1728!important;color:var(--text)!important;border-color:var(--border)!important}input::placeholder,textarea::placeholder{color:#58708f!important}select option{background:#0b1728;color:#eef5ff}
th,td{border-color:var(--border-soft)!important;color:#b9c9dc!important}th{color:#7188a6!important}.tags span,.flow span,.pill{background:#102746!important;color:#72b2ff!important}.severity{background:#3b2d0b!important;color:#ffc84f!important}.severity.critical{background:#431b23!important;color:#ff7b84!important}.risk{border-color:#2f8ce8!important;background:#0c1b2f!important}.risk b,.risk-summary-line b{color:#55a7ff!important}.pre{background:#060d18!important;color:#bfe9ff!important;border:1px solid var(--border)!important}pre{background:#060d18!important;color:#bfe9ff!important;border:1px solid var(--border)!important}
.twin-badge{background:#0d302e!important;color:#47d9c0!important}.monitor-status{color:#8297b2!important}.monitor-status.running{color:var(--green)!important}.monitor-live{background:#0a2c25!important;color:#45d6aa!important;border-color:#165744!important}.monitor-live.paused{background:#2a2230!important;color:#c9a9ff!important;border-color:#493c62!important}.chart-axis{stroke:#294263!important}.trend-range{color:#7187a5!important}.trend-range b{color:#dce8f8!important}.monitor-detail{background:#0d1a2d!important;border-color:var(--border-soft)!important;color:#cbd8e8!important}
.care-task{background:#0d1b2f!important;border-color:var(--border)!important}.care-task.completed{background:#0d2a27!important;border-color:#1d6658!important}.care-task-status{background:#12243b!important;color:#9db2ce!important}.care-task.completed .care-task-status{background:#0d3d33!important;color:#53dfb2!important}
.dashboard-page{color:var(--text)!important}.ref-search{background:#0c1629!important;border-color:#203453!important}.ref-search input{background:transparent!important;color:#eaf2ff!important;border:0!important}.ref-top-icon{background:#0c1629!important;border-color:#203453!important;color:#98acc8!important}.ref-top-icon:hover{background:#13233d!important}.ref-mini-profile b{color:#e6effa!important}.ref-mini-profile small{color:#6f85a2!important}.ref-dashboard-heading h2{color:#f4f7ff!important}.ref-dashboard-heading p{color:#7187a5!important}.ref-card{background:#0c162b!important;border-color:#1d2d50!important}.ref-card-title h3{color:#eef4ff!important}.ref-card-title p{color:#677f9f!important}.ref-outline-btn{background:#101d35!important}.ref-table-row{color:#8398b4!important;border-color:#152541!important}.ref-table-row span:nth-child(2) b{color:#dce6f5!important}
@media(max-width:900px){.content{padding:22px!important}}

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

  // Dashboard preview data (kept separate so the dashboard never changes tabs while loading)
  dashboardPatientData: any = null;
  dashboardLatestVital: any = null;
  dashboardRiskSnapshot: any = null;
  dashboardCarePlan: any = null;


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
  private liveVitalSeed: any = null;
  private monitoringErrorShown = false;
  monitoringUpdatedAt: Date | null = null;

  escalationOpen = false;
  escalationAlert: any = null;
  escalationTeam = 'Rapid Response Team (Cardiac/Code Blue)';


  // =====================================================
  // MILESTONE 4 · CARE PLAN & TREATMENT
  // =====================================================
  carePatientId = '';
  carePatient: any = null;
  careMonitoring: any = null;
  carePlans: any[] = [];
  selectedCarePlan: any = null;
  careBusy = false;
  careMessage = '';

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

  refreshing = false;
  refreshPending = 0;

  patientFormOpen = false;
  savingPatient = false;
  patientForm: any = {};

  appointmentFormOpen = false;
  savingAppointment = false;
  appointmentForm: any = {};
  appointmentDepartments = [
    { name: 'Cardiology', icon: '♥', description: 'Heart & vascular care' },
    { name: 'Neurology', icon: '◈', description: 'Brain & nervous system' },
    { name: 'General Medicine', icon: '✚', description: 'Primary adult care' },
    { name: 'Orthopedics', icon: '◫', description: 'Bones & joints' },
    { name: 'Dermatology', icon: '◇', description: 'Skin & hair care' },
    { name: 'Pediatrics', icon: '●', description: 'Child healthcare' },
    { name: 'Gynecology', icon: '♀', description: 'Women’s health' },
    { name: 'Endocrinology', icon: '◉', description: 'Hormone & diabetes care' }
  ];
  doctorDirectory: any[] = [
    { name:'Dr. Arjun Sharma', specialty:'General Medicine', experience:12, slots:['09:00','09:30','10:00','10:30','11:30','12:00','14:00','14:30','15:00','16:00'] },
    { name:'Dr. Meera Kapoor', specialty:'General Medicine', experience:9, slots:['09:30','10:00','11:00','11:30','13:00','14:00','15:30','16:00','16:30'] },
    { name:'Dr. Rohan Mehta', specialty:'Cardiology', experience:16, slots:['09:00','09:30','10:30','11:00','12:00','14:30','15:00','16:00'] },
    { name:'Dr. Ananya Rao', specialty:'Cardiology', experience:11, slots:['10:00','10:30','11:30','12:00','14:00','14:30','15:30','16:30'] },
    { name:'Dr. Vikram Singh', specialty:'Neurology', experience:14, slots:['09:00','10:00','10:30','11:30','13:30','14:00','15:00','16:00'] },
    { name:'Dr. Priya Nair', specialty:'Neurology', experience:8, slots:['09:30','10:30','11:00','12:00','14:30','15:00','16:00','16:30'] },
    { name:'Dr. Karan Malhotra', specialty:'Orthopedics', experience:13, slots:['09:00','09:30','10:30','11:30','12:00','14:00','15:00','15:30'] },
    { name:'Dr. Neha Verma', specialty:'Orthopedics', experience:7, slots:['10:00','11:00','11:30','13:00','14:00','14:30','16:00','16:30'] },
    { name:'Dr. Simran Khanna', specialty:'Dermatology', experience:10, slots:['09:30','10:00','11:00','12:00','14:00','15:00','16:00','16:30'] },
    { name:'Dr. Amit Joshi', specialty:'Dermatology', experience:6, slots:['09:00','10:30','11:30','13:30','14:30','15:30','16:00'] },
    { name:'Dr. Pooja Iyer', specialty:'Pediatrics', experience:12, slots:['09:00','09:30','10:30','11:00','12:00','14:00','15:00','16:00'] },
    { name:'Dr. Rahul Bhatia', specialty:'Pediatrics', experience:9, slots:['10:00','10:30','11:30','13:30','14:30','15:30','16:30'] },
    { name:'Dr. Aisha Khan', specialty:'Gynecology', experience:15, slots:['09:00','10:00','11:00','12:00','14:00','15:00','16:00'] },
    { name:'Dr. Nidhi Gupta', specialty:'Gynecology', experience:8, slots:['09:30','10:30','11:30','13:30','14:30','15:30','16:30'] },
    { name:'Dr. Sameer Sethi', specialty:'Endocrinology', experience:13, slots:['09:00','10:00','11:30','12:00','14:00','15:00','16:00'] },
    { name:'Dr. Kavya Menon', specialty:'Endocrinology', experience:10, slots:['09:30','10:30','11:00','13:30','14:30','15:30','16:30'] }
  ];

  monitorTrendKey = 'heartRate';
  monitorTrendKeys = ['heartRate','oxygen','systolic','glucose'];


  nav = [
    { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
    { id: 'patients', label: 'Patients', icon: '◉' },
    { id: 'patient360', label: 'Patient 360', icon: '◎' },
    { id: 'appointments', label: 'Appointments', icon: '▣' },
    { id: 'aiRisk', label: 'AI Risk Lab', icon: '✦' },
    { id: 'monitoring', label: 'Live Monitoring', icon: '◌' },
    { id: 'alerts', label: 'Clinical Alerts', icon: '⚠' },
    { id: 'carePlans', label: 'Care Plan & Treatment', icon: '✓' },
    { id: 'pharmacy', label: 'Pharmacy', icon: '▤' },
    { id: 'fhir', label: 'FHIR / SMART', icon: '⇄' },
    { id: 'reports', label: 'Reports', icon: '▤' },
    { id: 'settings', label: 'Settings', icon: '⚙' }
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
    this.refreshing = true;
    this.refreshPending = 5;
    const done = () => { this.refreshPending--; if (this.refreshPending <= 0) this.refreshing = false; };

    this.api.get<any>('/dashboard').subscribe({next:x=>this.dash=x, error:()=>{done();}, complete:done});
    this.api.get<any[]>('/patients').subscribe({next:x=>{this.patients=x; if(!this.carePatientId && x.length) this.carePatientId=x[0].id; if(x.length && (!this.dashboardPatientData || this.dashboardPatientData.patient?.id !== x[0].id)) this.loadDashboardPreview(x[0].id); if(this.tab==='carePlans' && this.carePatientId) this.loadCarePlans();}, error:()=>{done();}, complete:done});
    this.api.get<any[]>('/appointments').subscribe({next:x=>this.appointments=x, error:()=>{done();}, complete:done});
    this.api.get<any[]>('/alerts').subscribe({next:x=>this.alerts=x, error:()=>{done();}, complete:done});
    this.api.get<any[]>('/medicines').subscribe({next:x=>this.medicines=x, error:()=>{done();}, complete:done});
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
  // DASHBOARD PREVIEW
  // =====================================================

  loadDashboardPreview(id: string) {
    if (!id) return;
    this.api.get<any>('/patients/' + id).subscribe({
      next: x => {
        this.dashboardPatientData = x;
        this.dashboardLatestVital = x?.vitals?.[0] || null;
        this.dashboardCarePlan = x?.carePlans?.[0] || null;
      }
    });
    this.api.get<any[]>('/ai/risk/' + id + '/history').subscribe({
      next: history => this.dashboardRiskSnapshot = history?.[0] || null,
      error: () => this.dashboardRiskSnapshot = null
    });
  }

  dashboardAge(dob: string) {
    if (!dob) return '—';
    const birth = new Date(dob); const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  dashboardPatientName(patientId: string) {
    return this.patients.find(p => p.id === patientId)?.name || 'Patient';
  }

  dashboardTrendPolyline() {
    const rows = (this.dashboardPatientData?.vitals || []).slice().reverse();
    let pts = rows.map((v:any) => Number(v?.heartRate)).filter((v:number) => Number.isFinite(v));
    if (!pts.length && this.dashboardLatestVital?.heartRate) pts = [Number(this.dashboardLatestVital.heartRate)];
    if (!pts.length) pts = [78, 82, 79, 84, 81, 85, 82, 86];
    const width = 840, left = 30, top = 18, height = 175;
    return pts.slice(-10).map((v: number, i: number, arr: number[]) => {
      const x = left + (i / Math.max(arr.length - 1, 1)) * width;
      const y = top + (1 - Math.max(50, Math.min(150, v) - 50) / 100) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
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
          this.dashboardPatientData = x;
          this.dashboardLatestVital = x?.vitals?.[0] || null;
          this.dashboardCarePlan = x?.carePlans?.[0] || null;

          this.api.get<any[]>('/ai/risk/' + p.id + '/history').subscribe({
            next: history => this.dashboardRiskSnapshot = history?.[0] || null,
            error: () => this.dashboardRiskSnapshot = null
          });

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
      .subscribe({ next: x => { this.monitoring = x; this.monitoringAlerts = (x.recentAlerts || []).slice(0, 6); }, error: () => { this.monitoring = null; } });
  }

  trendLabel(k: string) { return ({heartRate:'Heart Rate', oxygen:'SpO₂', systolic:'Systolic BP', glucose:'Glucose'} as any)[k] || k; }
  trendPoints(): number[] {
    const rows = (this.monitoring?.recentVitals || []).slice().reverse();
    return rows.map((v:any) => Number(v?.[this.monitorTrendKey])).filter((v:number) => Number.isFinite(v));
  }
  trendPolyline(): string {
    const pts = this.trendPoints(); if (!pts.length) return '';
    const min=Math.min(...pts), max=Math.max(...pts), range=max-min || 1;
    return pts.map((v,i)=>`${45 + (i/Math.max(pts.length-1,1))*830},${215-((v-min)/range)*180}`).join(' ');
  }
  trendMin() { const p=this.trendPoints(); return p.length ? Math.min(...p).toFixed(0) : '—'; }
  trendMax() { const p=this.trendPoints(); return p.length ? Math.max(...p).toFixed(0) : '—'; }

  private nextLiveVital(critical = false) {
    const last = this.liveVitalSeed || this.monitoring?.latestVital || {};
    const drift = (base: number, step: number, min: number, max: number) => {
      const current = Number.isFinite(Number(base)) ? Number(base) : (min + max) / 2;
      const next = current + (Math.random() * step * 2 - step);
      return Math.round(Math.max(min, Math.min(max, next)));
    };

    const vital: any = {
      patientId: this.monitoringPatientId,
      heartRate: critical ? 145 : drift(last.heartRate ?? 72, 5, 60, 105),
      systolic: critical ? 182 : drift(last.systolic ?? 122, 4, 105, 145),
      diastolic: critical ? 105 : drift(last.diastolic ?? 78, 3, 65, 90),
      oxygen: critical ? 88 : drift(last.oxygen ?? 97, 1, 94, 99),
      glucose: critical ? 285 : drift(last.glucose ?? 95, 8, 75, 145),
      temperature: critical ? 38.1 : Number((Number(last.temperature ?? 36.7) + (Math.random() * .16 - .08)).toFixed(1)),
      source: 'WEARABLE-LIVE',
      recordedAt: new Date().toISOString()
    };
    this.liveVitalSeed = vital;
    return vital;
  }

  private appendLocalVital(vital: any) {
    const existing = Array.isArray(this.monitoring?.recentVitals) ? this.monitoring.recentVitals : [];
    const rows = [vital, ...existing].slice(0, 12);
    this.monitoring = {
      ...(this.monitoring || {}),
      latestVital: vital,
      recentVitals: rows
    };
  }

  private sendLiveVital(critical = false) {
    if (!this.monitoringPatientId || !this.monitoringRunning && !critical) return;
    const vital = this.nextLiveVital(critical);

    // IMPORTANT: update the live chart immediately. The previous implementation
    // refreshed the whole monitoring object after every POST, which replaced the
    // freshly appended point with the backend's older snapshot. That made the
    // graph look frozen even though the timer was running.
    this.monitoringAttention = critical || this.monitoringAttention;
    this.appendLocalVital(vital);
    this.monitoringUpdatedAt = new Date();

    // Persist the same reading through the real backend. The UI does not wait for
    // the HTTP response, so the live stream remains visibly moving while MongoDB,
    // threshold detection and Kafka continue to receive the event.
    this.api.post<any>('/vitals', vital).subscribe({
      next: () => {
        // Do NOT call loadMonitoring()/refresh() here. Those calls can overwrite
        // the just-added point with an older backend snapshot. Do a full backend
        // sync only when the user presses Refresh or when the stream is stopped.
      },
      error: err => {
        console.error('Live vital ingestion failed', err);
        if (!this.monitoringErrorShown) {
          this.monitoringErrorShown = true;
          alert('Live graph is running, but the backend /vitals API rejected a reading. The UI stream is active; check the backend console/API.');
        }
      }
    });
  }

  simulateCritical() {
    if (!this.monitoringPatientId) return;
    this.sendLiveVital(true);
  }

  startMonitoring() {
    if (!this.monitoringPatientId || this.monitoringRunning) return;
    this.monitoringRunning = true;
    this.monitoringCycle = 0;
    this.monitoringErrorShown = false;
    this.liveVitalSeed = this.monitoring?.latestVital || null;
    this.sendLiveVital(false);
    // Generate a new wearable reading every 3 seconds. Each reading is persisted
    // through /vitals, then the monitoring endpoint is refreshed.
    this.monitoringTimer = setInterval(() => {
      if (!this.monitoringRunning) return;
      this.monitoringCycle++;
      this.sendLiveVital(false);
    }, 3000);
  }

  stopMonitoring() {
    this.monitoringRunning = false;
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    if (this.monitoringPatientId) this.loadMonitoring();
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
    if (!this.selected) { alert('Select a patient first.'); return; }
    this.vital = { patientId:this.selected.patient.id, heartRate:85, systolic:120, diastolic:80, oxygen:98, glucose:100, source:'WEARABLE' };
    this.tab='vitals';
  }

  sendVital() {
    const raw = String(this.vital?.patientId || '').trim();
    const patient = this.patients.find((p:any) => String(p.id) === raw || String(p.mrn || '').toLowerCase() === raw.toLowerCase());
    const patientId = patient?.id || raw;
    if (!patientId) { alert('Enter a patient ID or MRN.'); return; }
    const payload = { ...this.vital, patientId, source:this.vital.source || 'WEARABLE' };
    this.api.post<any>('/vitals', payload).subscribe({
      next: () => {
        if (patient) { this.selectPatient(patient); }
        this.refresh();
        if (this.monitoringPatientId === patientId) this.loadMonitoring();
        alert('Vital reading saved successfully.');
      },
      error: err => { console.error(err); alert('Unable to save vital reading. Check the backend.'); }
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
  // APPOINTMENT
  // =====================================================

  addAppointment() {
    const today = new Date().toISOString().slice(0,10);
    this.appointmentForm = { patientId:this.selected?.patient?.id || this.patients[0]?.id || '', specialty:'', doctorName:'', date:today, time:'', status:'SCHEDULED', reason:'Follow-up consultation' };
    this.appointmentFormOpen = true;
  }

  closeAppointmentForm() { this.appointmentFormOpen = false; this.savingAppointment = false; }

  doctorsForDepartment(dept:string) { return this.doctorDirectory.filter(d=>d.specialty===dept); }
  availableDoctors() { return this.doctorsForDepartment(this.appointmentForm.specialty || ''); }
  onAppointmentDepartmentChange() { this.appointmentForm.doctorName=''; this.appointmentForm.time=''; }
  onAppointmentDoctorChange() { this.appointmentForm.time=''; }
  onAppointmentDateChange() { this.appointmentForm.time=''; }
  availableSlots(): string[] {
    const doctor=this.doctorDirectory.find(d=>d.name===this.appointmentForm.doctorName);
    if(!doctor) return [];
    const date=this.appointmentForm.date;
    return doctor.slots.filter((slot:string)=>!this.appointments.some((a:any)=>a.doctorName===doctor.name && a.date===date && a.time===slot && String(a.status||'SCHEDULED').toUpperCase()!=='CANCELLED'));
  }
  saveAppointment() {
    const p=this.patients.find((x:any)=>x.id===this.appointmentForm.patientId);
    if(!p || !this.appointmentForm.doctorName || !this.appointmentForm.date || !this.appointmentForm.time) { alert('Please select patient, doctor, date and an available time.'); return; }
    if(!this.availableSlots().includes(this.appointmentForm.time)) { alert('That slot is no longer available. Please choose another time.'); return; }
    this.savingAppointment=true;
    const payload={...this.appointmentForm, patientName:p.name, specialty:this.appointmentForm.specialty, status:'SCHEDULED'};
    this.api.post<any>('/appointments',payload).subscribe({
      next:()=>{ this.savingAppointment=false; this.closeAppointmentForm(); this.refresh(); if(this.selected?.patient?.id===p.id) this.selectPatient(p); alert('Appointment booked successfully.'); },
      error:err=>{ this.savingAppointment=false; console.error(err); alert('Unable to book appointment. Check the backend.'); }
    });
  }

  barWidth(v: any) { return Math.min(100, Math.abs(Number(v || 0)) * 10); }

  factorPercent(v: any, fallback: number) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
  }

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
    if (!this.escalationAlert?.id) { this.closeEscalation(); return; }
    this.api.put<any>('/alerts/' + this.escalationAlert.id + '/escalate', { recipient:this.escalationTeam }).subscribe({
      next:()=>{ this.closeEscalation(); this.refresh(); alert('Priority escalation dispatched.'); },
      error:()=>{ alert('Escalation endpoint is not available in this backend. The alert was not marked as escalated.'); }
    });
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
    this.patientForm = { mrn:'MS-'+Math.floor(10000+Math.random()*89999), name:'', gender:'Male', dateOfBirth:'', phone:'', email:'', bloodGroup:'', emergencyContact:'', address:'', allergiesText:'', conditionsText:'' };
    this.patientFormOpen = true;
  }
  cancelNewPatient() { this.patientFormOpen=false; this.savingPatient=false; }
  saveNewPatient() {
    if(!this.patientForm.name?.trim()) { alert('Please enter patient name.'); return; }
    this.savingPatient=true;
    const payload={...this.patientForm, allergies:String(this.patientForm.allergiesText||'').split(',').map((x:string)=>x.trim()).filter(Boolean), conditions:String(this.patientForm.conditionsText||'').split(',').map((x:string)=>x.trim()).filter(Boolean)};
    delete payload.allergiesText; delete payload.conditionsText;
    this.api.post<any>('/patients',payload).subscribe({
      next:()=>{ this.savingPatient=false; this.cancelNewPatient(); this.refresh(); alert('Patient created successfully.'); },
      error:err=>{ this.savingPatient=false; console.error(err); alert('Unable to create patient. Check the backend.'); }
    });
  }

  // =====================================================
  // MILESTONE 4 · CARE PLAN & TREATMENT
  // =====================================================
  openCarePlans() {
    this.tab='carePlans';
    if(!this.carePatientId && this.patients.length) this.carePatientId=this.patients[0].id;
    if(this.carePatientId) this.loadCarePlans();
  }

  loadCarePlans() {
    if(!this.carePatientId) return;
    this.carePatient=this.patients.find((p:any)=>p.id===this.carePatientId) || null;
    this.api.get<any[]>('/care-plans/'+this.carePatientId).subscribe({
      next: plans => { this.carePlans=plans || []; this.selectedCarePlan=this.carePlans[0] || null; },
      error: () => { this.carePlans=[]; this.selectedCarePlan=null; }
    });
    this.api.get<any>('/monitoring/'+this.carePatientId+'/latest').subscribe({
      next: x => this.careMonitoring=x,
      error: () => this.careMonitoring=null
    });
  }

  generateCarePlan() {
    if(!this.carePatientId) return;
    this.careBusy=true; this.careMessage='';
    this.api.post<any>('/care-plans/generate/'+this.carePatientId, {}).subscribe({
      next: plan => {
        this.careBusy=false; this.careMessage='Personalized care plan created successfully.';
        this.loadCarePlans();
        this.selectedCarePlan=plan;
      },
      error: err => {
        this.careBusy=false; console.error(err); this.careMessage='Unable to create the care plan. Please check the backend.';
      }
    });
  }

  selectCarePlan(plan:any) { this.selectedCarePlan=plan; }

  toggleCareTask(index:number, completed:boolean) {
    if(!this.selectedCarePlan?.id) return;
    this.api.put<any>('/care-plans/'+this.selectedCarePlan.id+'/tasks/'+index+'?completed='+completed, {}).subscribe({
      next: plan => { this.selectedCarePlan=plan; const idx=this.carePlans.findIndex((c:any)=>c.id===plan.id); if(idx>=0) this.carePlans[idx]=plan; },
      error: () => { this.careMessage='Unable to update task status.'; }
    });
  }

  deltaValue(key:string) {
    const rows=(this.careMonitoring?.recentVitals || []);
    if(rows.length<2) return '—';
    const latest=Number(rows[0]?.[key]); const previous=Number(rows[1]?.[key]);
    if(!Number.isFinite(latest) || !Number.isFinite(previous)) return '—';
    const d=latest-previous; return (d>=0?'+':'')+d.toFixed(0);
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


  ngOnDestroy() {
    this.stopMonitoring();
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