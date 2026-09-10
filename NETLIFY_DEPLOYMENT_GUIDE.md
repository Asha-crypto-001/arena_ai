# iSkillLink — Netlify & Secure Isolated Database Deployment Architecture

This guide outlines the optimal, production-grade architecture to host **iSkillLink Uganda** on **Netlify** while completely isolating the backend and database for maximum security, scalability, and performance.

---

## 1. High-Level Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               USER BROWSER / CLIENT                   │
│          (Mbarara, Kampala, Across Uganda)             │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS (TLS 1.3)
                           ▼
┌────────────────────────────────────────────────────────┐
│                   NETLIFY EDGE CDN                     │
│  • Fast Global Static Distribution (Vite + React)       │
│  • Strict HTTP Security Headers (HSTS, CSP, XSS)       │
│  • Automatic CI/CD pushes from GitHub `main` branch     │
│  • Custom Domain: https://iskilllink.netlify.app       │
└──────────────────────────┬─────────────────────────────┘
                           │ Encrypted JSON REST / JWT
                           ▼
┌────────────────────────────────────────────────────────┐
│             ISOLATED BACKEND API SERVICE               │
│        (Render.com / Railway.app / Fly.io)             │
│  • Node.js / Express TypeScript Microservice           │
│  • Strict CORS Whitelist (Only allows Netlify origin)  │
│  • Rate Limiting & Input Validation                    │
│  • Telecom Mobile Money Webhook Signature Verification │
└──────────────────────────┬─────────────────────────────┘
                           │ Private Encrypted Connection (SSL)
                           ▼
┌────────────────────────────────────────────────────────┐
│          MANAGED SECURE DATABASE CLUSTER               │
│            (Supabase / Neon PostgreSQL)                │
│  • Encrypted at Rest & in Transit (SSL Mode: Require)  │
│  • Automated Daily Backups & Point-in-time Recovery    │
│  • Row-Level Security (RLS) & Connection Pooling       │
│  • Accessible ONLY by Backend Service (No Public IP)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Part 1: Deploying the Frontend to Netlify

### Step 1: Connect GitHub Repository
1. Log in to [Netlify.com](https://www.netlify.com/).
2. Click **Add new site** &rarr; **Import an existing project**.
3. Select **GitHub** and authorize access to `Asha-crypto-001/arena_ai`.
4. Choose branch: **`main`**.

### Step 2: Configure Build Settings
Netlify will automatically detect `netlify.toml`, but verify:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: (Optional if using Netlify Functions)

### Step 3: Set Frontend Environment Variables in Netlify
Go to **Site configuration** &rarr; **Environment variables** &rarr; Add:
```ini
VITE_API_URL=https://your-backend-api-domain.com/api
```

### Step 4: Click Deploy
Netlify will pull the code, build the Vite app, and assign a live URL (e.g., `https://iskilllink.netlify.app`).

---

## 3. Part 2: Setting Up the Isolated Database

### Recommended Solution: **Supabase** or **Neon.tech** (PostgreSQL)

1. Create a free account on [Supabase.com](https://supabase.com) or [Neon.tech](https://neon.tech).
2. Create a new project: `iskilllink-production-db`.
3. Set your database region (e.g., `eu-central-1` / `af-south-1` for lowest latency to East Africa).
4. Save your **Database Connection String**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```

---

## 4. Part 3: Deploying the Isolated Backend API

### Recommended Platform: **Render.com** or **Railway.app**

1. Create an account on [Render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository: `Asha-crypto-001/arena_ai`.
4. Configure service settings:
   - **Root Directory**: `.`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run server`
5. Configure Backend **Environment Variables** (Secret):
   ```ini
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   JWT_SECRET=your_super_secret_64_character_key_here
   ADMIN_PASSWORD=your_lead_admin_secure_password
   ALLOWED_ORIGIN=https://iskilllink.netlify.app
   ```

---

## 5. Security Isolation Rules

1. **Strict CORS Whitelisting**:
   The backend will reject any request that does not originate from your Netlify domain.
2. **Database Firewall**:
   The database never accepts direct browser connections; only the backend service IP / connection pooler can query it.
3. **SSL Mode Required**:
   All database traffic is encrypted in transit using TLS 1.3 (`sslmode=require`).
4. **Automated Security Headers**:
   `netlify.toml` automatically injects `HSTS`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` to defend against clickjacking and MIME-type sniffing.
