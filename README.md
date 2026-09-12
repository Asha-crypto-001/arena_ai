# iSkillLink ("Where Skills Meet Opportunity")
**Headquarters: Mbarara City, Western Region, Uganda**  
**Founder & Platform Administrator: Ashabahebwa Hassan**  
**Official Contacts:** WhatsApp: `+256 744 024 529` | Phone: `+256 772 233 621` | Email: `ashabahebwahassan665@gmail.com`

---

## 🌟 Overview
**iSkillLink** is a production-grade practical skills marketplace built for Uganda. It connects experienced local artisans, master technicians, and vocational instructors with motivated learners for direct hands-on apprenticeships.

Unlike passive video courses, iSkillLink focuses on **direct 1-on-1 and small group practical mentorship**, workshop safety inspections, transparent rule-based matching, and **Mobile Money Escrow (MTN MoMo & Airtel Money)** that protects both learners and educators.

For the active architecture and engineering roadmap, consult the [Platform Improvement Tracker](IMPROVEMENTS.md).

---

## 🚀 Key Features

### 1. Separate Real User Roles & Portals
- **Founder / Platform Admin (Ashabahebwa Hassan)**:
  - Multi-step verification queue (NIN validation with Ugandan records, trade background checks, screening interviews, workshop bench inspections).
  - Rule-based matching engine oversight (35% skill fit, 20% format, 15% proximity, 15% budget, 15% rating).
  - Platform escrow ledger managing 10% platform facilitation fee and 90% net educator payouts.
  - Comprehensive immutable audit trail.
- **Learners / Students**:
  - Browse verified educators across 20+ practical trades or post custom skill requests.
  - Book hands-on sessions with explicit UGX pricing.
  - Deposit funds into Mobile Money Escrow (MTN / Airtel).
  - Track milestone progression (0% to 100%) and release verified multi-criteria reviews.
- **Educators / Artisans**:
  - 5-step comprehensive onboarding application (trade credentials, workshop tools, portfolio samples).
  - Set hourly and course package rates in UGX.
  - Accept or decline learner bookings.
  - Update practical milestones and reply publicly to student reviews.
  - View real-time gross volume and net 90% Mobile Money payouts.

### 2. Transparent Rule-Based Matchmaking
- Explicit weighted scoring criteria:
  - **Skill Relevance**: 35%
  - **Format Match (In-person workshop / Hybrid / Online)**: 20%
  - **Location Proximity (Mbarara City divisions & Ugandan regions)**: 15%
  - **Budget Alignment**: 15%
  - **Educator Experience & Rating**: 15%

### 3. Ugandan Mobile Money Escrow Protection
- Fully localized for MTN MoMo and Airtel Money networks.
- 10% transparent platform fee retained; 90% disbursed directly upon completion.
- Zero storage of private PINs or bank credentials.

---

## 🔒 Security & User Accounts

For security, credentials are managed securely via environment variables:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your custom administrative credentials in `.env`:
   ```env
   ADMIN_EMAIL=ashabahebwahassan665@gmail.com
   ADMIN_PASSWORD=your_secure_password_here
   ```
3. New students, educators, and mentors can register directly in the application using the **Create New Account** form on the Sign In page.

---

## 🌐 How to Run the Frontend in GitHub

### Option 1: Automatic GitHub Pages Deployment (Included in this repo)
This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and hosts your frontend directly on GitHub:

1. In your GitHub repository (`Asha-crypto-001/arena_ai`), go to **Settings** $\rightarrow$ **Pages** (in the left sidebar).
2. Under **Build and deployment** $\rightarrow$ **Source**, select **GitHub Actions**.
3. Whenever you push to `main`, GitHub will automatically build and publish your frontend at:
   ```
   https://Asha-crypto-001.github.io/arena_ai/
   ```

---

### Option 2: 1-Click Free Deployment on Vercel / Netlify / Render (Recommended for Full-Stack)
To run both the React frontend and the Express backend live with a public URL:

#### Deploying on Vercel:
1. Go to **[vercel.com](https://vercel.com)** and sign in with your GitHub account (`Asha-crypto-001`).
2. Click **Add New Project** $\rightarrow$ Import **`arena_ai`**.
3. Click **Deploy**. Vercel will automatically build and give you a live production URL (e.g. `https://iskilllink.vercel.app`).

#### Deploying on Render (Frontend + Backend):
1. Go to **[render.com](https://render.com)** and sign in with GitHub.
2. Create a **Web Service**, select `Asha-crypto-001/arena_ai`.
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm run server`
5. Click **Deploy**.

---

## 💻 Running Locally on Your Computer

```bash
# 1. Clone your repository from GitHub
git clone https://github.com/Asha-crypto-001/arena_ai.git
cd arena_ai

# 2. Install dependencies
npm install

# 3. Start development server (Port 3000 for Web, Port 3001 for API)
npm run dev

# 4. Open in your browser:
# http://localhost:3000
```

---

## 📍 Company & Operational Office
- **Location**: Mbarara City, Western Region, Uganda
- **Founder & Administrator**: Ashabahebwa Hassan
- **Support**: `ashabahebwahassan665@gmail.com` | WhatsApp: `+256 744 024 529` | Phone: `+256 772 233 621`
