import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from './api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-layout">
        <section class="auth-intro">
          <div class="intro-brand">
            <div class="intro-logo">+</div>
            <div><strong>MediSphere</strong><span>CareDesk</span></div>
          </div>

          <div class="intro-copy">
            <span class="intro-kicker">CLINICAL WORKSPACE</span>
            <h1>Patient care, organised in one place.</h1>
            <p>Manage patient records, appointments, live vitals, alerts and care plans from one secure workspace.</p>
          </div>

          <div class="intro-list">
            <div><span>01</span><div><b>Patient 360</b><small>Profile, vitals and clinical history</small></div></div>
            <div><span>02</span><div><b>Risk Review</b><small>Cardiovascular and diabetes assessment</small></div></div>
            <div><span>03</span><div><b>Live Monitoring</b><small>Threshold alerts from vital readings</small></div></div>
            <div><span>04</span><div><b>Care Plan</b><small>Follow-up tasks and progress tracking</small></div></div>
          </div>

          <div class="intro-footer">MediSphere Smart Healthcare Management Platform</div>
        </section>

        <section class="auth-card-wrap">
          <div class="auth-card">
            <div class="card-topline"><span>STAFF ACCESS</span><i>● Server ready</i></div>

            <ng-container *ngIf="!registerMode; else registerTemplate">
              <h2>Sign in</h2>
              <p class="auth-subtitle">Enter your account details to open the clinical dashboard.</p>

              <div *ngIf="error" class="form-error">{{ error }}</div>

              <form (ngSubmit)="login()" novalidate>
                <label class="field">
                  <span>Username or email</span>
                  <div class="input-wrap"><span class="field-icon">@</span><input name="username" [(ngModel)]="username" autocomplete="username" placeholder="Enter username or email" required></div>
                </label>

                <label class="field">
                  <span>Password</span>
                  <div class="input-wrap"><span class="field-icon">●</span><input [type]="showPassword ? 'text' : 'password'" name="password" [(ngModel)]="password" autocomplete="current-password" placeholder="Enter password" required><button type="button" class="peek" (click)="showPassword=!showPassword">{{showPassword ? 'Hide' : 'Show'}}</button></div>
                </label>

                <button class="submit-btn" type="submit" [disabled]="loading">
                  {{ loading ? 'Signing in…' : 'Sign in to CareDesk' }}
                  <span>→</span>
                </button>
              </form>

              <div class="account-note">
                <div><b>Need your own account?</b><small>Create a staff account with your own username and password.</small></div>
                <button type="button" (click)="openRegister()">Create account</button>
              </div>

              <div class="demo-note">
                <span class="demo-dot"></span>
                <div><b>Project demo access</b><small>Use the staff credentials provided in the project README, or create a local staff account.</small></div>
              </div>
            </ng-container>

            <ng-template #registerTemplate>
              <h2>Create staff account</h2>
              <p class="auth-subtitle">Choose the username and password you want to use for this project.</p>

              <div *ngIf="registerError" class="form-error">{{ registerError }}</div>
              <div *ngIf="registerSuccess" class="form-success">{{ registerSuccess }}</div>

              <form (ngSubmit)="register()" novalidate>
                <label class="field"><span>Full name</span><input name="registerName" [(ngModel)]="registerForm.name" placeholder="Your full name" required></label>
                <label class="field"><span>Username</span><input name="registerUsername" [(ngModel)]="registerForm.username" placeholder="Choose a username" required></label>
                <label class="field"><span>Email</span><input type="email" name="registerEmail" [(ngModel)]="registerForm.email" placeholder="you@example.com" required></label>
                <label class="field"><span>Password</span><div class="input-wrap"><input [type]="showRegisterPassword ? 'text' : 'password'" name="registerPassword" [(ngModel)]="registerForm.password" placeholder="Minimum 8 characters" required><button type="button" class="peek" (click)="showRegisterPassword=!showRegisterPassword">{{showRegisterPassword ? 'Hide' : 'Show'}}</button></div></label>
                <button class="submit-btn" type="submit" [disabled]="registerLoading">{{ registerLoading ? 'Creating account…' : 'Create staff account' }}<span>→</span></button>
              </form>

              <button class="back-login" type="button" (click)="closeRegister()">← Back to sign in</button>
            </ng-template>

            <a class="back-home" routerLink="/">Back to home</a>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block}
    .auth-page{min-height:100vh;background:#eef3f7;color:#152b3b;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:grid;place-items:center;padding:32px}
    .auth-layout{width:min(1120px,100%);min-height:700px;background:#fff;border:1px solid #d7e0e7;border-radius:18px;overflow:hidden;display:grid;grid-template-columns:1.03fr .97fr;box-shadow:0 18px 44px rgba(20,45,65,.10)}
    .auth-intro{background:#123b53;color:#fff;padding:46px 48px;display:flex;flex-direction:column;position:relative}
    .intro-brand{display:flex;align-items:center;gap:12px}.intro-logo{width:38px;height:38px;border-radius:9px;background:#20a68f;color:#fff;display:grid;place-items:center;font-size:26px;font-weight:800}.intro-brand strong{display:block;font-size:18px;line-height:1}.intro-brand span{display:block;margin-top:4px;color:#b7cad5;font-size:10px;letter-spacing:.12em;text-transform:uppercase}
    .intro-copy{margin-top:92px;max-width:460px}.intro-kicker{font-size:10px;letter-spacing:.18em;color:#7ed7c9;font-weight:800}.intro-copy h1{font-size:38px;line-height:1.08;margin:12px 0 14px;letter-spacing:-.03em}.intro-copy p{font-size:14px;line-height:1.7;color:#c2d4de;margin:0}
    .intro-list{margin-top:40px;display:grid;gap:14px}.intro-list>div{display:flex;gap:12px;align-items:flex-start}.intro-list>div>span{font-size:10px;font-weight:800;color:#6ecabf;min-width:22px;margin-top:2px}.intro-list b{display:block;font-size:12px}.intro-list small{display:block;color:#a9bdc8;font-size:10px;margin-top:3px}.intro-footer{margin-top:auto;padding-top:24px;border-top:1px solid rgba(255,255,255,.12);color:#9fb7c3;font-size:10px}
    .auth-card-wrap{display:flex;align-items:center;justify-content:center;padding:42px;background:#fbfcfd}.auth-card{width:min(430px,100%)}.card-topline{display:flex;justify-content:space-between;gap:12px;margin-bottom:28px;font-size:9px;font-weight:800;letter-spacing:.1em;color:#5f7584}.card-topline i{font-style:normal;color:#16836f;letter-spacing:0;font-weight:700}
    .auth-card h2{margin:0;color:#173246;font-size:30px}.auth-subtitle{margin:8px 0 28px;color:#667b89;font-size:13px;line-height:1.6}.field{display:block;margin-bottom:18px}.field>span{display:block;margin-bottom:7px;color:#274254;font-size:12px;font-weight:800}.field input{width:100%;height:48px;border:1px solid #cfdbe2;border-radius:8px;padding:0 13px;background:#fff;color:#173246;font-size:14px;outline:0}.field input:focus{border-color:#219a87;box-shadow:0 0 0 3px rgba(33,154,135,.11)}.input-wrap{position:relative}.input-wrap input{padding-left:38px}.field-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#718592;font-size:11px;z-index:1}.peek{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#0d7d70;font-size:10px;font-weight:800;cursor:pointer}.submit-btn{width:100%;height:50px;margin-top:4px;border:0;border-radius:8px;background:#157f72;color:#fff;font-size:13px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}.submit-btn:hover:not(:disabled){background:#0f6f63}.submit-btn:disabled{opacity:.6;cursor:not-allowed}
    .account-note{margin-top:18px;padding:12px 13px;border:1px solid #d9e4ea;border-radius:9px;background:#f6f9fb;display:flex;justify-content:space-between;align-items:center;gap:12px}.account-note b{display:block;color:#274254;font-size:11px}.account-note small{display:block;color:#788b97;font-size:9px;line-height:1.5;margin-top:3px}.account-note button{border:1px solid #bdd8d3;background:#fff;color:#0f796d;border-radius:7px;padding:7px 9px;font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap}
    .demo-note{display:flex;gap:9px;align-items:flex-start;margin-top:16px;padding-top:15px;border-top:1px solid #e1e8ed}.demo-dot{width:7px;height:7px;border-radius:50%;background:#25a187;margin-top:4px}.demo-note b{display:block;font-size:10px;color:#455e6d}.demo-note small{display:block;margin-top:2px;font-size:9px;color:#81929c;line-height:1.5}.form-error,.form-success{padding:10px 12px;border-radius:8px;font-size:10px;margin-bottom:14px}.form-error{background:#fff1ef;border:1px solid #efc9c3;color:#b33b2f}.form-success{background:#ecf8f3;border:1px solid #c9e8dc;color:#176f60}.back-login,.back-home{display:block;margin:20px auto 0;background:transparent;border:0;color:#327066;font-size:10px;font-weight:800;cursor:pointer;text-decoration:none}.back-home{margin-top:24px;text-align:center;color:#6d818d;font-weight:700}
    @media(max-width:820px){.auth-page{padding:16px}.auth-layout{grid-template-columns:1fr;min-height:auto}.auth-intro{padding:30px}.intro-copy{margin-top:52px}.intro-list{margin-top:28px}.auth-card-wrap{padding:30px 22px}.intro-footer{margin-top:36px}}
  

/* DARK LOGIN / STAFF ACCESS */
.auth-page{background:#050c16!important;color:#edf4ff!important}.auth-layout{background:#0b1525!important;border-color:#1c304c!important;box-shadow:0 28px 70px rgba(0,0,0,.42)!important}.auth-intro{background:#07111f!important;border-right:1px solid #1b2d47!important}.intro-copy h1{color:#f3f7ff!important}.intro-copy p{color:#a9bdd4!important}.intro-list small{color:#7d93ae!important}.intro-footer{border-color:#1a2c45!important;color:#6f86a3!important}.intro-brand span{color:#7f96b0!important}.auth-card-wrap{background:#0b1525!important}.card-topline{color:#7590ad!important}.card-topline i{color:#42d9a9!important}.auth-card h2{color:#f1f6ff!important}.auth-subtitle{color:#8398b3!important}.field>span{color:#c6d4e5!important}.field input{background:#0a1627!important;color:#edf4ff!important;border-color:#243a5b!important}.field input:focus{border-color:#2e8cff!important;box-shadow:0 0 0 3px rgba(46,140,255,.14)!important}.field-icon{color:#7087a3!important}.peek{color:#69acff!important}.submit-btn{background:#246fe8!important}.submit-btn:hover:not(:disabled){background:#2e7df2!important}.account-note{background:#0e1b2e!important;border-color:#243956!important}.account-note b{color:#dce8f6!important}.account-note small{color:#7890ac!important}.account-note button{background:#10233d!important;border-color:#2b4c76!important;color:#72b2ff!important}.demo-note{border-color:#1d314c!important}.demo-note b{color:#c7d6e7!important}.demo-note small{color:#7288a4!important}.form-error{background:#391a21!important;border-color:#71313d!important;color:#ff858d!important}.form-success{background:#0d302a!important;border-color:#1c6756!important;color:#55dfb4!important}.back-login,.back-home{color:#78aef7!important}

  `]
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  registerMode = false;
  registerLoading = false;
  registerError = '';
  registerSuccess = '';
  showRegisterPassword = false;
  registerForm = {name:'', username:'', email:'', password:''};

  constructor(private api: ApiService, private router: Router) {}

  login(): void {
    this.error = '';
    if (!this.username.trim() || !this.password) {
      this.error = 'Please enter your username and password.';
      return;
    }
    this.loading = true;
    this.api.login(this.username.trim(), this.password).subscribe({
      next: (response: any) => {
        localStorage.setItem('medisphere_token', response.token);
        localStorage.setItem('medisphere_user', JSON.stringify(response.user));
        this.loading = false;
        this.router.navigate(['/app']);
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401) this.error = 'Invalid username/email or password.';
        else if (err.status === 0) this.error = 'Backend is not reachable. Start Spring Boot on port 8080.';
        else this.error = 'Login failed. Please try again.';
      }
    });
  }

  openRegister(): void { this.registerMode = true; this.registerError=''; this.registerSuccess=''; }
  closeRegister(): void { this.registerMode = false; this.registerError=''; this.registerSuccess=''; }

  register(): void {
    this.registerError=''; this.registerSuccess='';
    const f=this.registerForm;
    if(!f.name.trim() || !f.username.trim() || !f.email.trim() || !f.password){this.registerError='Please fill all fields.';return;}
    if(f.password.length < 8){this.registerError='Password must contain at least 8 characters.';return;}
    this.registerLoading=true;
    this.api.register({name:f.name.trim(), username:f.username.trim(), email:f.email.trim(), password:f.password}).subscribe({
      next:(r:any)=>{
        this.registerLoading=false;
        this.registerSuccess='Account created. You can now sign in with your new username and password.';
        this.username=f.username.trim(); this.password='';
        setTimeout(()=>this.closeRegister(),700);
      },
      error:(err:any)=>{
        this.registerLoading=false;
        this.registerError=err.status===409 ? 'Username or email already exists.' : 'Unable to create account. Check the backend.';
      }
    });
  }
}
