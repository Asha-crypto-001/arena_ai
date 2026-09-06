# iSkillLink Uganda - Complete Setup & Deployment Guide

## 1. Project Overview
iSkillLink is a full-stack vocational and practical skills marketplace platform headquartered in **Mbarara City, Uganda**, founded by **Ashabahebwa Hassan**.

---

## 2. Security & Environment Configuration
To keep credentials secure:

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Configure your environment variables:
   ```env
   PORT=3001
   NODE_ENV=production
   ADMIN_EMAIL=ashabahebwahassan665@gmail.com
   ADMIN_PASSWORD=your_secure_password_here
   ```

---

## 3. How to Run & Host the Frontend in GitHub

### Method A: GitHub Pages (Direct from GitHub)
1. Navigate to your repository on GitHub: `https://github.com/Asha-crypto-001/arena_ai`
2. Go to **Settings** $\rightarrow$ **Pages**.
3. Set **Source** to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build the React Vite app and publish it to:
   `https://Asha-crypto-001.github.io/arena_ai/`

### Method B: Vercel / Netlify (Instant Live Frontend)
1. Sign in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Import Project** and select `Asha-crypto-001/arena_ai`.
3. Click **Deploy**. Vercel will build and assign a global CDN URL automatically.

---

## 4. Local Development

```bash
# Clone the repository
git clone https://github.com/Asha-crypto-001/arena_ai.git
cd arena_ai

# Install dependencies
npm install

# Run frontend (Port 3000) and backend (Port 3001) simultaneously
npm run dev
```
