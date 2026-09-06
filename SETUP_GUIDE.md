# iSkillLink — Setup & Execution Guide

Thank you for downloading **iSkillLink** (“Where Skills Meet Opportunity”).

This package contains the complete full-stack source code and pre-compiled production build.

---

## 📁 Package Contents

```
iskilllink/
├── dist/                      # Pre-compiled production build (ready to serve)
├── server/                    # Node.js + Express REST API & Database
│   ├── index.ts               # Express API endpoints & middleware
│   ├── db.ts                  # Relational database engine
│   ├── types.ts               # Database & API TypeScript interfaces
│   ├── seedData.ts            # Authentic Ugandan seed dataset
│   ├── matching.ts            # Rule-based matchmaking algorithm
│   └── data/                  # Persistent JSON database storage
│       └── iskilllink_db.json
├── src/                       # React 18 + TypeScript + Tailwind Frontend
│   ├── components/            # UI Modals, Cards, Navbars, Footers
│   ├── context/               # AuthContext & Demo Persona Switcher
│   ├── pages/                 # Home, FindSkill, Educator, Dashboards, etc.
│   ├── services/              # Strongly-typed API client
│   ├── types/                 # Frontend TypeScript definitions
│   └── utils/                 # Currency formatters (UGX), date helpers
├── index.html                 # HTML entry with typography fonts
├── package.json               # Dependencies & execution scripts
├── tailwind.config.js         # Tailwind styling & brand palette
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite build & development proxy setup
```

---

## 🚀 How to Run Locally

### Step 1: Install Dependencies
Open your terminal inside the project directory:
```bash
npm install
```

### Step 2: Start Full Stack (Client + Server)
```bash
npm run dev
```

The application will start at:
- 🌐 **Web Interface**: `http://localhost:3000`
- 🔌 **API Endpoints**: `http://localhost:3000/api` (proxied to port 3001)

---

## 🛠️ Individual Commands

- **Run Backend Only**: `npm run server` (port 3001)
- **Run Frontend Only**: `npm run client` (port 3000)
- **Build Production Bundle**: `npm run build`
- **Preview Production Build**: `npm run preview`

---

## 👤 Quick Test Personas

You can switch between predefined test personas using the **Active Role** dropdown in the top bar:
- **Platform Admin**: Catherine Achieng (Verification queue, matchmaker, escrow release)
- **Master Educator**: Joseph Mukasa (Tailoring & Pattern Drafting, Kiyembe Lane)
- **Tech Educator**: Dr. Irene Kembabazi (Full-Stack Mentorship, Nakawa)
- **Learner**: Sarah Namubiru (Makindye)
- **Learner**: Ronald Kasule (Entebbe)
