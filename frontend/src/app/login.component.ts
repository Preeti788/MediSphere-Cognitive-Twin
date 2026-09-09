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

      <div class="login-glow"></div>

      <div class="login-card">

        <!-- BRAND -->
        <div class="brand">
          <div class="brand-icon">✚</div>

          <div>
            <div class="brand-name">MediSphere</div>
            <div class="brand-tagline">
              Smart Healthcare Platform
            </div>
          </div>
        </div>

        <!-- TITLE -->
        <div class="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to your clinical workspace.</p>
        </div>

        <!-- ERROR -->
        <div
          class="error-message"
          *ngIf="error"
        >
          {{ error }}
        </div>

        <!-- LOGIN FORM -->
        <form (ngSubmit)="login()">

          <div class="form-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              placeholder="Enter your email"
              autocomplete="email"
              required
            />

          </div>

          <div class="form-group">

            <label>Password</label>

            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />

          </div>

          <button
            type="submit"
            class="login-button"
            [disabled]="loading"
          >

            <span *ngIf="!loading">
              Sign in securely
            </span>

            <span *ngIf="loading">
              Signing in...
            </span>

          </button>

        </form>

        <!-- DEMO -->
        <div class="demo-box">
          <strong>Demo Account</strong>

          <div>
            admin@medisphere.local
          </div>

          <div>
            Admin@123
          </div>
        </div>

        <!-- BACK -->
        <a
          routerLink="/"
          class="back-home"
        >
          ← Back to MediSphere
        </a>

      </div>

    </div>
  `,

  styles: [`

    * {
      box-sizing: border-box;
    }

    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 40px 20px;

      background:
        radial-gradient(
          circle at 50% 35%,
          rgba(13, 148, 136, 0.18),
          transparent 38%
        ),
        linear-gradient(
          135deg,
          #062b3a,
          #063344,
          #082c3b
        );

      position: relative;
      overflow: hidden;
    }

    .login-glow {
      position: absolute;

      width: 500px;
      height: 500px;

      background: rgba(20, 184, 166, 0.10);

      border-radius: 50%;

      filter: blur(90px);

      top: 50%;
      left: 50%;

      transform: translate(-50%, -50%);
    }

    .login-card {

      width: 100%;
      max-width: 430px;

      background: rgba(255, 255, 255, 0.98);

      border-radius: 28px;

      padding: 40px;

      box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.28);

      position: relative;

      z-index: 2;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;

      margin-bottom: 36px;
    }

    .brand-icon {
      width: 46px;
      height: 46px;

      border-radius: 13px;

      display: flex;
      align-items: center;
      justify-content: center;

      background: #10a995;

      color: white;

      font-size: 26px;
      font-weight: 800;
    }

    .brand-name {
      font-size: 19px;
      font-weight: 800;

      color: #071d2c;
    }

    .brand-tagline {
      margin-top: 3px;

      font-size: 13px;

      color: #7b8b99;
    }

    .login-heading h1 {
      margin: 0;

      color: #092943;

      font-size: 36px;

      line-height: 1.15;
    }

    .login-heading p {
      margin: 8px 0 28px;

      color: #718091;

      font-size: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;

      margin-bottom: 8px;

      color: #15334a;

      font-size: 14px;

      font-weight: 700;
    }

    input {
      width: 100%;

      height: 50px;

      border: 1px solid #d8e2e8;

      border-radius: 11px;

      padding: 0 15px;

      font-size: 15px;

      outline: none;

      color: #183247;

      background: white;

      transition: 0.2s;
    }

    input:focus {
      border-color: #10a995;

      box-shadow:
        0 0 0 3px rgba(16, 169, 149, 0.12);
    }

    .login-button {
      width: 100%;

      height: 54px;

      border: none;

      border-radius: 11px;

      background: #10a995;

      color: white;

      font-size: 16px;

      font-weight: 800;

      cursor: pointer;

      margin-top: 5px;

      transition: 0.2s;
    }

    .login-button:hover:not(:disabled) {
      background: #0d9684;

      transform: translateY(-1px);
    }

    .login-button:disabled {
      opacity: 0.65;

      cursor: not-allowed;
    }

    .demo-box {

      margin-top: 20px;

      padding: 13px 15px;

      border-radius: 12px;

      background: #f0f7f7;

      color: #567080;

      font-size: 12px;

      line-height: 1.7;
    }

    .demo-box strong {
      display: block;

      color: #315567;

      margin-bottom: 2px;
    }

    .error-message {

      background: #fff0f0;

      border: 1px solid #ffd1d1;

      color: #c53030;

      padding: 11px 13px;

      border-radius: 10px;

      font-size: 13px;

      margin-bottom: 18px;
    }

    .back-home {

      display: block;

      text-align: center;

      margin-top: 24px;

      color: #0d8f80;

      font-size: 14px;

      font-weight: 700;

      text-decoration: none;
    }

    .back-home:hover {
      text-decoration: underline;
    }

    @media (max-width: 520px) {

      .login-card {
        padding: 30px 24px;
      }

      .login-heading h1 {
        font-size: 30px;
      }

    }

  `]
})
export class LoginComponent {

  email = 'admin@medisphere.local';

  password = 'Admin@123';

  loading = false;

  error = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  login(): void {

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }

    this.loading = true;

    this.api.login(
      this.email,
      this.password
    ).subscribe({

      next: (response: any) => {

        console.log('Login successful:', response);

        localStorage.setItem(
          'medisphere_token',
          response.token
        );

        localStorage.setItem(
          'medisphere_user',
          JSON.stringify(response.user)
        );

        this.loading = false;

        this.router.navigate(['/app']);

      },

      error: (err: any) => {

        console.error('Login error:', err);

        this.loading = false;

        if (err.status === 401) {

          this.error =
            'Invalid email or password.';

        } else if (err.status === 0) {

          this.error =
            'Backend server is not reachable. Make sure Spring Boot is running on port 8080.';

        } else {

          this.error =
            'Login failed. Please try again.';

        }

      }

    });

  }

}