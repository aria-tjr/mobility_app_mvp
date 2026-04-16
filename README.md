# Mobility App MVP — Smart Urban Vehicle Sharing Platform

A full-stack smart vehicle sharing platform developed as part of an **EIC Accelerator €2.5M grant project**. Designed to optimize last-mile urban mobility through real-time fleet management, ML-powered demand prediction, and seamless mobile UX.

## Project Context

This MVP was built for an EIC (European Innovation Council) Accelerator application — Europe's flagship innovation program supporting high-potential startups. The platform demonstrates a viable product for the grant evaluation process.

## Features

- **Mobile App** (React Native / Expo) — Cross-platform iOS/Android user interface for vehicle discovery, booking, and payments
- **Backend API** (Node.js + Express) — RESTful microservices for fleet management, user auth, and booking logic
- **ML Demand Prediction** (Python/FastAPI) — Time-series forecasting for vehicle redistribution optimization
- **Real-time Fleet Tracking** — GPS-based vehicle location and availability updates
- **Payment Integration** — Stripe payment processing for rides and subscriptions
- **Admin Dashboard** — Operator dashboard for fleet management and analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native, Expo |
| Backend API | Node.js, Express.js |
| ML Service | Python, FastAPI, scikit-learn |
| Database | PostgreSQL, Redis |
| Payments | Stripe API |
| Maps | Google Maps API |
| Auth | JWT, bcrypt |
| Deployment | Docker, Docker Compose |

## Architecture

```
React Native App
      ↓
Node.js API Gateway
  ├── Auth Service
  ├── Fleet Management
  ├── Booking Engine
  └── Payment Service
      ↓
Python ML Service (Demand Prediction)
      ↓
PostgreSQL + Redis
```

## Getting Started

1. **Clone** the repository
2. **Environment** — Copy `.env.example` to `.env` and configure:
   - Database connection strings
   - JWT secret
   - Stripe API keys (use test keys for development)
   - Google Maps API key
3. **Install** dependencies:
   ```bash
   cd backend && npm install
   cd mobile && npm install
   cd ml-service && pip install -r requirements.txt
   ```
4. **Run** with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Grant Context

This platform was developed as part of an EIC Accelerator Phase 1 application, demonstrating technical feasibility for a next-generation urban mobility solution targeting European smart city markets.

## License

MIT License
