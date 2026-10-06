import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from './api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  template: `
    <div class="login-page">
      <div class="login-shell">
        <section class="login-brand-panel">
          <div class="brand-row"><span class="brand-mark">✚</span><div><strong>MediSphere</strong><span>Smart Healthcare Platform</span></div></div>
          <div class="brand-copy"><span class="eyebrow">CLINICAL WORKSPACE</span><h1>Connected care, from data to action.</h1><p>Patient records, risk insights, live monitoring and care plans in one secure workspace.</p></div>
          <div class="brand-features"><div><b>M1</b><span>Patient 360 & Digital Twin</span></div><div><b>M2</b><span>Risk Review & Explainability</span></div><div><b>M3</b><span>Live Monitoring & Alerts</span></div><div><b>M4</b><span>Care Plan & Treatment</span></div></div>
        </section>
        <section class="login-card">
          <div class="login-card-head"><span class="eyebrow">STAFF SIGN IN</span><h2>Welcome back</h2><p>Sign in to continue to your MediSphere workspace.</p></div>
          <div class="error-message" *ngIf="error">{{error}}</div>
          <form (ngSubmit)="login()">
            <label>Username or email<input type="text" name="identifier" [(ngModel)]="identifier" placeholder="e.g. clinic.admin" autocomplete="username" required></label>
            <label>Password<div class="password-field"><input [type]="showPassword ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="Enter password" autocomplete="current-password" required><button type="button" (click)="showPassword=!showPassword">{{showPassword?'Hide':'Show'}}</button></div></label>
            <button type="submit" class="login-button" [disabled]="loading">{{loading ? 'Signing in…' : 'Sign in to MediSphere'}}</button>
          </form>
          <div class="demo-box"><div class="demo-head"><strong>Demo access</strong><span>Presentation ready</span></div><button type="button" class="demo-row" (click)="useDemo('siya','Siya@2026')"><span><b>siya</b><small>Receptionist</small></span><em>Use account</em></button><button type="button" class="demo-row" (click)="useDemo('aarav.mehta','Aarav@2026')"><span><b>aarav.mehta</b><small>Doctor</small></span><em>Use account</em></button></div>
          <a routerLink="/" class="back-home">← Back to MediSphere</a>
        </section>
      </div>
    </div>
  `,

  styles: [`
    :host{display:block;font-family:Inter,"Segoe UI",Arial,sans-serif}
    .login-page{min-height:100vh;display:grid;place-items:center;padding:32px;background:#070d18;position:relative;overflow:hidden}
    .login-page:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 15% 15%,rgba(39,102,246,.18),transparent 32%),radial-gradient(circle at 88% 82%,rgba(24,182,166,.1),transparent 30%);pointer-events:none}
    .login-shell{position:relative;z-index:1;width:min(1000px,100%);display:grid;grid-template-columns:1.05fr .95fr;background:#0c1525;border:1px solid #22324b;border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.48)}
    .login-brand-panel{padding:46px;background:linear-gradient(145deg,#0d1930,#101e34);border-right:1px solid #22324b;display:flex;flex-direction:column;justify-content:space-between;min-height:600px}.brand-row{display:flex;align-items:center;gap:12px}.brand-mark{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:#2d6df5;color:#fff;font-weight:900;font-size:20px}.brand-row strong{display:block;color:#fff;font-size:18px}.brand-row span{display:block;color:#7f91a9;font-size:10px;margin-top:2px}.eyebrow{color:#4ed0c4;font-size:9px;letter-spacing:1.7px;font-weight:900}.brand-copy h1{font-size:43px;line-height:1.05;color:#f7fbff;margin:12px 0}.brand-copy p{max-width:480px;color:#9aacbf;line-height:1.65;font-size:14px}.brand-features{display:grid;grid-template-columns:1fr 1fr;gap:12px}.brand-features div{padding:14px;border:1px solid #283955;background:#0b1424;border-radius:12px}.brand-features b{display:inline-grid;place-items:center;width:28px;height:22px;margin-right:8px;border-radius:6px;background:#162848;color:#83a9ff;font-size:9px}.brand-features span{font-size:10px;color:#b4c2d2}
    .login-card{padding:46px;background:#0a1220}.login-card-head h2{margin:10px 0 6px;color:#f6fbff;font-size:30px}.login-card-head p{margin:0 0 26px;color:#8e9fb6;font-size:13px}.error-message{margin-bottom:16px;padding:11px 12px;background:#301a22;border:1px solid #6b2d39;color:#ffb3be;border-radius:10px;font-size:12px}.login-card form label{display:block;margin-bottom:16px;color:#bdc9d7;font-size:11px;font-weight:700}.login-card input{box-sizing:border-box;width:100%;height:44px;margin-top:7px;padding:0 12px;border-radius:10px;border:1px solid #293a55;background:#0c1729;color:#f0f6ff;outline:0}.login-card input::placeholder{color:#64748a}.login-card input:focus{border-color:#3d79f7;box-shadow:0 0 0 3px rgba(61,121,247,.15)}.password-field{position:relative}.password-field input{padding-right:64px}.password-field button{position:absolute;right:7px;top:7px;height:30px;padding:0 9px;border:0;border-radius:7px;background:#18263b;color:#a8b7ca;font-size:10px}.login-button{width:100%;height:44px;margin-top:6px;border:0;border-radius:10px;background:#2d6df5;color:#fff;font-weight:800}.demo-box{margin-top:24px;padding:15px;background:#0d1829;border:1px solid #263853;border-radius:12px}.demo-head{display:flex;justify-content:space-between;margin-bottom:7px}.demo-head strong{color:#edf4ff;font-size:11px}.demo-head span{color:#72849b;font-size:9px}.demo-row{width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 0;background:transparent;border:0;border-top:1px solid #22324a;color:#fff;text-align:left}.demo-row:first-of-type{border-top:0}.demo-row b{display:block;font-size:11px}.demo-row small{display:block;color:#7f90a7;font-size:9px;margin-top:2px}.demo-row em{font-style:normal;color:#5bb9ff;font-size:9px}.back-home{display:block;margin-top:20px;color:#7a8ea7;font-size:11px;text-decoration:none}
    @media(max-width:820px){.login-shell{grid-template-columns:1fr}.login-brand-panel{display:none}.login-card{padding:32px}.login-page{padding:14px}}
  `]
})
export class LoginComponent {
  identifier = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  useDemo(identifier: string, password: string): void {
    this.identifier = identifier;
    this.password = password;
    this.error = '';
  }

  login(): void {
    this.error = '';
    if (!this.identifier.trim() || !this.password) {
      this.error = 'Please enter your username/email and password.';
      return;
    }
    this.loading = true;
    this.api.login({ identifier: this.identifier.trim(), password: this.password }).subscribe({
      next: (response: any) => {
        localStorage.setItem('medisphere_token', response.token);
        localStorage.setItem('medisphere_user', JSON.stringify(response.user));
        this.loading = false;
        this.router.navigate(['/app']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || (err?.status === 0
          ? 'Backend server is not reachable. Start Spring Boot on port 8080.'
          : 'Invalid username/email or password.');
      }
    });
  }
}
