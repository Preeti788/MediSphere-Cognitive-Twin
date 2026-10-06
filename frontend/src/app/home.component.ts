import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],

  template: `
    <div class="home-page">

      <!-- ================= NAVBAR ================= -->
      <header class="navbar">

        <div class="brand">
          <div class="brand-icon">✚</div>

          <div class="brand-text">
            <div class="brand-name">MediSphere</div>
            <div class="brand-tagline">Smart Healthcare Platform</div>
          </div>
        </div>

        <nav class="nav-links">
          <a href="#features">Features</a>
          <a href="#technology">Technology</a>
          <a href="#about">About</a>
        </nav>

        <div class="nav-actions">
          <a routerLink="/login" class="login-btn">Login</a>
          <a routerLink="/login" class="get-started-btn">
            Get Started
          </a>
        </div>

      </header>


      <!-- ================= HERO ================= -->
      <section class="hero">

        <div class="hero-content">

          <div class="eyebrow">
            <span class="pulse"></span>
            Intelligent Healthcare
            <span class="dot">•</span>
            Connected Care
          </div>

          <h1>
            Healthcare that
            <span>understands you.</span>
          </h1>

          <p class="hero-text">
            MediSphere brings patient records, real-time vitals,
            digital health twins and intelligent risk insights
            together in one secure healthcare ecosystem.
          </p>

          <div class="hero-buttons">

            <a routerLink="/login" class="primary-btn">
              Explore MediSphere
              <span>→</span>
            </a>

            <a href="#features" class="secondary-btn">
              Discover Features
            </a>

          </div>

          <div class="trust-row">

            <div class="trust-item">
              <strong>Patient 360°</strong>
              <span>Complete patient view</span>
            </div>

            <div class="trust-item">
              <strong>Real-time</strong>
              <span>Vital monitoring</span>
            </div>

            <div class="trust-item">
              <strong>FHIR Ready</strong>
              <span>Connected healthcare</span>
            </div>

          </div>

        </div>


        <!-- ================= HERO VISUAL ================= -->
        <div class="hero-visual">

          <div class="glow"></div>

          <div class="health-card main-card">

            <div class="card-header">

              <div>
                <span class="small-label">
                  DIGITAL HEALTH TWIN
                </span>

                <h3>Patient Health Overview</h3>
              </div>

              <div class="live">
                <span></span>
                LIVE
              </div>

            </div>


            <div class="heart-area">

              <div class="heart-circle">
                <div class="heart">♥</div>
              </div>

              <div class="heart-info">
                <span>Heart Rate</span>

                <strong>
                  78
                  <small>BPM</small>
                </strong>

                <em>Normal range</em>
              </div>

            </div>


            <div class="vitals">

              <div class="vital">
                <div class="vital-icon heart-icon">♥</div>

                <div>
                  <span>Heart Rate</span>
                  <strong>78 BPM</strong>
                </div>
              </div>


              <div class="vital">
                <div class="vital-icon oxygen-icon">◉</div>

                <div>
                  <span>Blood Oxygen</span>
                  <strong>98%</strong>
                </div>
              </div>


              <div class="vital">
                <div class="vital-icon temp-icon">⌁</div>

                <div>
                  <span>Temperature</span>
                  <strong>36.7°C</strong>
                </div>
              </div>


              <div class="vital">
                <div class="vital-icon pressure-icon">↗</div>

                <div>
                  <span>Blood Pressure</span>
                  <strong>120/80</strong>
                </div>
              </div>

            </div>

          </div>


          <!-- ALERT FLOATING CARD -->
          <div class="floating-card alert-card">

            <div class="alert-icon">✓</div>

            <div>
              <strong>Vitals Normal</strong>
              <span>Continuous monitoring active</span>
            </div>

          </div>


          <!-- AI FLOATING CARD -->
          <div class="floating-card ai-card">

            <div class="ai-icon">✦</div>

            <div>
              <strong>AI Health Insights</strong>
              <span>Risk analysis available</span>
            </div>

          </div>

        </div>

      </section>


      <!-- ================= FEATURES ================= -->
      <section id="features" class="features-section">

        <div class="section-heading">

          <span>POWERFUL HEALTHCARE ECOSYSTEM</span>

          <h2>
            Everything connected.
            <br />
            One patient story.
          </h2>

          <p>
            MediSphere connects clinical data, wearable devices,
            healthcare interoperability and intelligent analytics.
          </p>

        </div>


        <div class="feature-grid">

          <div class="feature-card">
            <div class="feature-icon">◉</div>

            <h3>Patient 360°</h3>

            <p>
              A consolidated view of patient history, vitals,
              laboratory reports, appointments and care plans.
            </p>
          </div>


          <div class="feature-card">
            <div class="feature-icon">◇</div>

            <h3>Digital Health Twin</h3>

            <p>
              Build a continuously updated digital representation
              of a patient's health data.
            </p>
          </div>


          <div class="feature-card">
            <div class="feature-icon">⌁</div>

            <h3>Real-time Monitoring</h3>

            <p>
              Connect wearable vital data and detect abnormal
              health patterns with real-time alerts.
            </p>
          </div>


          <div class="feature-card">
            <div class="feature-icon">⚕</div>

            <h3>FHIR Integration</h3>

            <p>
              Standardized healthcare data exchange using
              FHIR and SMART on FHIR foundations.
            </p>
          </div>


          <div class="feature-card">
            <div class="feature-icon">✦</div>

            <h3>AI Risk Insights</h3>

            <p>
              Intelligent risk assessment designed to support
              cardiovascular and diabetes risk prediction.
            </p>
          </div>


          <div class="feature-card">
            <div class="feature-icon">🔒</div>

            <h3>Consent & Security</h3>

            <p>
              Patient consent management and role-based access
              for secure healthcare data handling.
            </p>
          </div>

        </div>

      </section>


      <!-- ================= TECHNOLOGY ================= -->
      <section id="technology" class="technology-section">

        <div class="tech-content">

          <span class="section-label">
            BUILT FOR MODERN HEALTHCARE
          </span>

          <h2>
            From raw health data
            <br />
            to meaningful care.
          </h2>

          <p>
            MediSphere combines healthcare interoperability,
            real-time streaming, secure storage and intelligent
            analytics into a unified platform.
          </p>


          <div class="tech-list">

            <div>
              <span>01</span>
              <strong>FHIR + SMART on FHIR</strong>
            </div>

            <div>
              <span>02</span>
              <strong>Apache Kafka Real-time Streaming</strong>
            </div>

            <div>
              <span>03</span>
              <strong>MongoDB Digital Health Twin</strong>
            </div>

            <div>
              <span>04</span>
              <strong>AI-powered Risk Prediction</strong>
            </div>

          </div>

        </div>


        <div class="technology-visual">

          <div class="orbit orbit-one"></div>
          <div class="orbit orbit-two"></div>

          <div class="tech-core">

            <div class="core-icon">✚</div>

            <strong>MediSphere</strong>

            <span>Connected Healthcare</span>

          </div>


          <div class="tech-node node-one">FHIR</div>
          <div class="tech-node node-two">AI</div>
          <div class="tech-node node-three">IoT</div>
          <div class="tech-node node-four">DATA</div>

        </div>

      </section>


      <!-- ================= CTA ================= -->
      <section id="about" class="cta-section">

        <div>

          <span>THE FUTURE OF CONNECTED CARE</span>

          <h2>
            One platform.
            Smarter healthcare.
          </h2>

          <p>
            Bring patient data, monitoring, intelligence and
            care planning together with MediSphere.
          </p>

        </div>

        <a routerLink="/login" class="primary-btn">
          Enter MediSphere
          <span>→</span>
        </a>

      </section>


      <!-- ================= FOOTER ================= -->
      <footer>

        <div class="footer-brand">

          <div class="brand-icon">✚</div>

          <div>
            <strong>MediSphere</strong>
            <span>
              Smart Healthcare Management Platform
            </span>
          </div>

        </div>

        <div class="footer-text">
          © 2026 MediSphere. Intelligent healthcare, connected care.
        </div>

      </footer>

    </div>
  `,


  /* =========================================================
     COMPLETE HOME PAGE CSS
     ========================================================= */

  styles: [`

    * {
      box-sizing: border-box;
    }

    :host {
      display: block;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
      color: #10233f;
    }

    html {
      scroll-behavior: smooth;
    }

    .home-page {
      min-height: 100vh;
      background:
        radial-gradient(
          circle at 85% 15%,
          rgba(24, 182, 170, 0.10),
          transparent 28%
        ),
        radial-gradient(
          circle at 15% 30%,
          rgba(53, 108, 255, 0.08),
          transparent 30%
        ),
        #f7fbff;
      overflow: hidden;
    }


    /* ================= NAVBAR ================= */

    .navbar {
      height: 82px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 7%;
      background: rgba(255, 255, 255, 0.88);
      border-bottom: 1px solid rgba(24, 63, 101, 0.08);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 22px;
      font-weight: 700;
      background: linear-gradient(
        135deg,
        #18b6aa,
        #2678ff
      );
      box-shadow:
        0 8px 20px rgba(38, 120, 255, 0.22);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #122b49;
    }

    .brand-tagline {
      margin-top: 1px;
      font-size: 10px;
      color: #7890a9;
      letter-spacing: 0.4px;
    }

    .nav-links {
      display: flex;
      gap: 34px;
      margin-left: auto;
      margin-right: 40px;
    }

    .nav-links a {
      text-decoration: none;
      color: #526b84;
      font-size: 14px;
      font-weight: 600;
      transition: 0.25s;
    }

    .nav-links a:hover {
      color: #147fdb;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .login-btn,
    .get-started-btn {
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 11px 20px;
      border-radius: 10px;
      transition: all 0.25s ease;
    }

    .login-btn {
      color: #1c557d;
    }

    .login-btn:hover {
      background: #eef7ff;
    }

    .get-started-btn {
      color: white;
      background: linear-gradient(
        135deg,
        #168fcf,
        #216ef3
      );
      box-shadow:
        0 8px 20px rgba(33, 110, 243, 0.20);
    }

    .get-started-btn:hover {
      transform: translateY(-2px);
      box-shadow:
        0 12px 26px rgba(33, 110, 243, 0.28);
    }


    /* ================= HERO ================= */

    .hero {
      min-height: 700px;
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      align-items: center;
      gap: 50px;
      padding: 80px 8% 90px;
      position: relative;
    }

    .hero-content {
      max-width: 650px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: #197cbb;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 24px;
      padding: 9px 14px;
      border: 1px solid rgba(25, 124, 187, 0.12);
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.72);
    }

    .pulse {
      width: 8px;
      height: 8px;
      background: #17b59d;
      border-radius: 50%;
      box-shadow: 0 0 0 5px rgba(23, 181, 157, 0.12);
    }

    .dot {
      color: #b5c5d5;
    }

    .hero h1 {
      margin: 0;
      font-size: clamp(48px, 5vw, 72px);
      line-height: 1.04;
      letter-spacing: -3.5px;
      color: #102d4c;
      font-weight: 800;
    }

    .hero h1 span {
      display: block;
      background: linear-gradient(
        90deg,
        #147fc4,
        #1ab3a5
      );
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .hero-text {
      max-width: 590px;
      margin: 28px 0 32px;
      font-size: 17px;
      line-height: 1.8;
      color: #617a94;
    }

    .hero-buttons {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }

    .primary-btn,
    .secondary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 15px 23px;
      border-radius: 12px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 750;
      transition: all 0.25s ease;
    }

    .primary-btn {
      color: white;
      background: linear-gradient(
        135deg,
        #178ecb,
        #246ff2
      );
      box-shadow:
        0 12px 26px rgba(37, 111, 242, 0.22);
    }

    .primary-btn:hover {
      transform: translateY(-3px);
      box-shadow:
        0 18px 32px rgba(37, 111, 242, 0.28);
    }

    .primary-btn span {
      font-size: 18px;
    }

    .secondary-btn {
      color: #315b7e;
      background: white;
      border: 1px solid #dce8f2;
    }

    .secondary-btn:hover {
      border-color: #8fc7e9;
      transform: translateY(-2px);
    }


    /* TRUST */

    .trust-row {
      display: flex;
      gap: 42px;
      margin-top: 50px;
      padding-top: 25px;
      border-top: 1px solid #e2ebf3;
    }

    .trust-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .trust-item strong {
      font-size: 15px;
      color: #173a5c;
    }

    .trust-item span {
      font-size: 11px;
      color: #8095aa;
    }


    /* ================= HERO VISUAL ================= */

    .hero-visual {
      position: relative;
      min-height: 530px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .glow {
      position: absolute;
      width: 440px;
      height: 440px;
      border-radius: 50%;
      background:
        radial-gradient(
          circle,
          rgba(34, 157, 220, 0.16),
          rgba(25, 184, 166, 0.04) 55%,
          transparent 70%
        );
      filter: blur(10px);
    }

    .health-card {
      position: relative;
      z-index: 5;
      width: min(430px, 92%);
      padding: 25px;
      border-radius: 24px;
      background:
        linear-gradient(
          145deg,
          rgba(255,255,255,0.97),
          rgba(245,250,255,0.96)
        );
      border: 1px solid rgba(158, 190, 216, 0.32);
      box-shadow:
        0 30px 70px rgba(41, 88, 127, 0.18);
      backdrop-filter: blur(18px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .small-label {
      font-size: 9px;
      letter-spacing: 1.4px;
      color: #5d9bc3;
      font-weight: 800;
    }

    .card-header h3 {
      margin: 7px 0 0;
      font-size: 19px;
      color: #193d60;
    }

    .live {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #16a68f;
      font-size: 10px;
      font-weight: 800;
    }

    .live span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #19b79d;
      box-shadow:
        0 0 0 4px rgba(25,183,157,0.10);
    }


    /* HEART */

    .heart-area {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 28px;
      margin: 32px 0;
    }

    .heart-circle {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(
          circle,
          rgba(34, 128, 234, 0.08),
          rgba(27, 178, 166, 0.03)
        );
      border: 1px solid rgba(44, 137, 211, 0.13);
      box-shadow:
        inset 0 0 30px rgba(30, 139, 215, 0.07);
    }

    .heart {
      font-size: 57px;
      color: #ec6079;
      animation: heartbeat 1.5s infinite;
      text-shadow:
        0 8px 22px rgba(236, 96, 121, 0.28);
    }

    @keyframes heartbeat {
      0%, 100% {
        transform: scale(1);
      }

      15% {
        transform: scale(1.10);
      }

      30% {
        transform: scale(1);
      }

      45% {
        transform: scale(1.08);
      }
    }

    .heart-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .heart-info > span {
      color: #8297aa;
      font-size: 12px;
    }

    .heart-info strong {
      font-size: 36px;
      color: #193c5f;
      line-height: 1;
    }

    .heart-info small {
      font-size: 12px;
      color: #7590a7;
    }

    .heart-info em {
      color: #16a58d;
      font-size: 11px;
      font-style: normal;
      font-weight: 700;
    }


    /* VITALS */

    .vitals {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .vital {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 13px;
      border-radius: 13px;
      background: #f7fbff;
      border: 1px solid #e7eff6;
    }

    .vital-icon {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 800;
      background: #eaf5ff;
      color: #2388cf;
    }

    .vital > div:last-child {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .vital span {
      color: #8a9daf;
      font-size: 9px;
    }

    .vital strong {
      color: #254766;
      font-size: 12px;
    }


    /* FLOATING CARDS */

    .floating-card {
      position: absolute;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 13px 17px;
      border-radius: 14px;
      background: rgba(255,255,255,0.94);
      border: 1px solid rgba(171,199,220,0.35);
      box-shadow:
        0 18px 40px rgba(36, 77, 113, 0.15);
      backdrop-filter: blur(15px);
    }

    .floating-card > div:last-child {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .floating-card strong {
      color: #264d70;
      font-size: 11px;
    }

    .floating-card span {
      color: #879bae;
      font-size: 9px;
    }

    .alert-card {
      left: 1%;
      bottom: 58px;
    }

    .ai-card {
      right: 0;
      top: 65px;
    }

    .alert-icon,
    .ai-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }

    .alert-icon {
      color: #12a88e;
      background: #e8faf5;
    }

    .ai-icon {
      color: #7368e9;
      background: #efedff;
    }


    /* ================= FEATURES ================= */

    .features-section {
      padding: 105px 8%;
      background: white;
      border-top: 1px solid #eaf1f6;
    }

    .section-heading {
      max-width: 720px;
      margin: 0 auto 55px;
      text-align: center;
    }

    .section-heading > span,
    .section-label {
      color: #278fc4;
      font-size: 10px;
      letter-spacing: 1.8px;
      font-weight: 800;
    }

    .section-heading h2 {
      margin: 13px 0 15px;
      font-size: clamp(32px, 4vw, 47px);
      line-height: 1.1;
      letter-spacing: -1.8px;
      color: #163b5d;
    }

    .section-heading p {
      margin: 0;
      color: #7890a5;
      font-size: 15px;
      line-height: 1.7;
    }

    .feature-grid {
      max-width: 1200px;
      margin: auto;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    .feature-card {
      padding: 28px;
      border: 1px solid #e5edf4;
      border-radius: 18px;
      background: linear-gradient(
        145deg,
        #ffffff,
        #f9fcff
      );
      transition: all 0.28s ease;
    }

    .feature-card:hover {
      transform: translateY(-7px);
      border-color: #b9d9ee;
      box-shadow:
        0 18px 40px rgba(31, 90, 131, 0.10);
    }

    .feature-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      border-radius: 13px;
      background: #eef8ff;
      color: #168bc8;
      font-size: 19px;
      font-weight: 800;
    }

    .feature-card h3 {
      margin: 0 0 10px;
      color: #1d4568;
      font-size: 17px;
    }

    .feature-card p {
      margin: 0;
      color: #7a8fa3;
      font-size: 13px;
      line-height: 1.7;
    }


    /* ================= TECHNOLOGY ================= */

    .technology-section {
      min-height: 650px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 70px;
      padding: 100px 10%;
      background:
        linear-gradient(
          135deg,
          #f0f8fc,
          #f7fbff
        );
    }

    .tech-content {
      max-width: 580px;
    }

    .tech-content h2 {
      margin: 15px 0 20px;
      color: #163b5d;
      font-size: clamp(35px, 4vw, 51px);
      line-height: 1.08;
      letter-spacing: -2px;
    }

    .tech-content > p {
      color: #71879d;
      line-height: 1.8;
      font-size: 15px;
      margin-bottom: 30px;
    }

    .tech-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .tech-list > div {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 15px 17px;
      border-radius: 12px;
      background: white;
      border: 1px solid #e5edf3;
    }

    .tech-list span {
      color: #1ba8a0;
      font-size: 11px;
      font-weight: 800;
    }

    .tech-list strong {
      color: #365874;
      font-size: 13px;
    }


    /* TECHNOLOGY VISUAL */

    .technology-visual {
      min-height: 440px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .orbit {
      position: absolute;
      border: 1px dashed rgba(36, 139, 190, 0.25);
      border-radius: 50%;
    }

    .orbit-one {
      width: 330px;
      height: 330px;
      animation: rotate 20s linear infinite;
    }

    .orbit-two {
      width: 235px;
      height: 235px;
      animation: rotateReverse 14s linear infinite;
    }

    @keyframes rotate {
      from {
        transform: rotate(0);
      }

      to {
        transform: rotate(360deg);
      }
    }

    @keyframes rotateReverse {
      from {
        transform: rotate(360deg);
      }

      to {
        transform: rotate(0);
      }
    }

    .tech-core {
      width: 145px;
      height: 145px;
      border-radius: 50%;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: white;
      border: 1px solid #d8e8f2;
      box-shadow:
        0 20px 50px rgba(41, 103, 141, 0.14);
    }

    .core-icon {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      color: white;
      background: linear-gradient(
        135deg,
        #1aaca1,
        #257cf1
      );
      font-size: 19px;
      margin-bottom: 8px;
    }

    .tech-core strong {
      color: #234d70;
      font-size: 14px;
    }

    .tech-core span {
      margin-top: 3px;
      color: #91a3b2;
      font-size: 8px;
    }

    .tech-node {
      position: absolute;
      z-index: 8;
      min-width: 52px;
      height: 52px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: white;
      color: #2779a8;
      border: 1px solid #d9eaf3;
      box-shadow:
        0 12px 28px rgba(35, 94, 130, 0.13);
      font-size: 10px;
      font-weight: 800;
    }

    .node-one {
      top: 45px;
      left: 50%;
      transform: translateX(-50%);
    }

    .node-two {
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
    }

    .node-three {
      bottom: 45px;
      left: 50%;
      transform: translateX(-50%);
    }

    .node-four {
      left: 40px;
      top: 50%;
      transform: translateY(-50%);
    }


    /* ================= CTA ================= */

    .cta-section {
      margin: 80px 8%;
      padding: 55px 60px;
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
      background:
        linear-gradient(
          120deg,
          #103e63,
          #176d91
        );
      box-shadow:
        0 25px 60px rgba(22, 78, 110, 0.18);
    }

    .cta-section > div {
      max-width: 680px;
    }

    .cta-section span {
      color: #7de0d4;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.7px;
    }

    .cta-section h2 {
      margin: 12px 0 10px;
      color: white;
      font-size: 35px;
      letter-spacing: -1px;
    }

    .cta-section p {
      margin: 0;
      color: #b9d5e5;
      font-size: 14px;
      line-height: 1.7;
    }

    .cta-section .primary-btn {
      flex-shrink: 0;
      background: white;
      color: #176a94;
      box-shadow: none;
    }

    .cta-section .primary-btn:hover {
      background: #f0fbff;
    }


    /* ================= FOOTER ================= */

    footer {
      padding: 35px 8%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #e3edf4;
      background: white;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .footer-brand .brand-icon {
      width: 35px;
      height: 35px;
      border-radius: 10px;
      font-size: 17px;
    }

    .footer-brand > div:last-child {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .footer-brand strong {
      color: #234b6d;
      font-size: 14px;
    }

    .footer-brand span {
      color: #8b9dac;
      font-size: 9px;
    }

    .footer-text {
      color: #94a5b3;
      font-size: 10px;
    }


    /* ================= RESPONSIVE ================= */

    @media (max-width: 1000px) {

      .nav-links {
        display: none;
      }

      .hero {
        grid-template-columns: 1fr;
        padding-top: 60px;
      }

      .hero-content {
        max-width: 800px;
      }

      .hero-visual {
        min-height: 500px;
      }

      .technology-section {
        grid-template-columns: 1fr;
      }

      .feature-grid {
        grid-template-columns: 1fr 1fr;
      }

    }


    @media (max-width: 650px) {

      .navbar {
        padding: 0 5%;
      }

      .brand-tagline {
        display: none;
      }

      .get-started-btn {
        display: none;
      }

      .hero {
        padding: 55px 5%;
      }

      .hero h1 {
        font-size: 45px;
        letter-spacing: -2px;
      }

      .hero-text {
        font-size: 15px;
      }

      .trust-row {
        gap: 18px;
        flex-wrap: wrap;
      }

      .hero-visual {
        min-height: 440px;
      }

      .health-card {
        padding: 18px;
      }

      .heart-circle {
        width: 100px;
        height: 100px;
      }

      .heart {
        font-size: 45px;
      }

      .floating-card {
        transform: scale(0.85);
      }

      .alert-card {
        left: -10px;
      }

      .ai-card {
        right: -10px;
      }

      .features-section,
      .technology-section {
        padding-left: 5%;
        padding-right: 5%;
      }

      .feature-grid {
        grid-template-columns: 1fr;
      }

      .technology-visual {
        min-height: 380px;
      }

      .cta-section {
        margin: 50px 5%;
        padding: 35px 28px;
        flex-direction: column;
        align-items: flex-start;
      }

      footer {
        padding: 30px 5%;
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
      }

    }

  `]
})
export class HomeComponent {}