# 🏙️ Fracto — Real World Asset (RWA) Fractionalization Ecosystem

> **Democratizing institutional commercial real estate through blockchain-verified fractional ownership.**

---

## 🌟 What is Fracto?
**Fracto** is a next-generation Real World Asset (RWA) tokenization and investment platform. It empowers retail and institutional investors to co-own high-yield, prime commercial real estate starting from small fraction amounts (e.g., ₹10,000), while earning automated rental yields with full legal custodian compliance.

---

## 🏗️ Architecture Overview

The Fracto ecosystem consists of 5 tightly integrated components:

```
┌─────────────────────────────────────────────────────────────┐
│                       FRACTO ECOSYSTEM                      │
├─────────────────┬───────────────────┬───────────────────────┤
│ Portal          │ React 19 / Vite   │ Investor Marketplace  │
│ Admin           │ React 18 / Vite   │ SuperAdmin Operations │
│ Trustee         │ React 18 / Vite   │ Custodian Legal Audit │
│ Server          │ NestJS / Prisma   │ Core Financial Engine │
│ Mobile App      │ React Native 0.83 │ Cross-Platform App    │
└─────────────────┴───────────────────┴───────────────────────┘
```

---

## 🛠️ Tech Stack & DevOps
- **Backend:** NestJS, TypeScript, Prisma ORM, PostgreSQL 18, Redis Stack
- **Frontends:** React (18/19), Vite, TailwindCSS, Redux Toolkit, Nginx Alpine
- **Containerization:** Docker & Docker Compose (Multi-stage builds)
- **CI/CD:** GitHub Actions (Automated Quality Gate & 24/7 Keep-Alive Cron)
- **Ledger Security:** Enterprise cryptographic transaction verification

---

## 🚀 Quick Start (Local Development)

### 1. 1-Click Launch:
Run the automated launcher batch script:
```bash
./start-all.bat
```

### 2. Manual Start:
- **Server:** `cd server && npm run start:dev` (Port 9001)
- **Portal:** `cd portal && npm run dev` (Port 3000)
- **Admin:** `cd admin && npm run dev` (Port 3001)
- **Trustee:** `cd trustee && npm run dev` (Port 3002)

---

## 🐳 Production Deployment (Docker Compose)
```bash
docker compose -f docker-compose.prod.yaml up -d --build
```

---

## 📄 License
Proprietary & Confidential — **Fracto Inc.**

