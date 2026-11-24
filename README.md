# Mobility App MVP — Smart Urban Vehicle Sharing Platform

A full-stack smart vehicle sharing platform. Designed to optimize last-mile urban mobility through real-time fleet management, a vehicle simulator, and a mobile web prototype.

## Features

- **Mobile Web Prototype** (HTML/JS PWA in `smart-pause-mobile-app/`) — vehicle discovery and booking UI prototype
- **Backend API** (Node.js + Express) — RESTful microservices for fleet management, user auth, and booking logic
- **Motion-detection service stub** (Python/FastAPI in `backend/motion-detection/`) — health/root endpoints only; ML demand prediction is **planned, not implemented**
- **Real-time Fleet Tracking** — GPS-based vehicle location and availability updates
- **Payment Integration** — Stripe payment processing for rides and subscriptions
- **Admin Dashboard** — Operator dashboard for fleet management and analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | HTML/CSS/JS PWA prototype |
| Operator Dashboard | React, Leaflet, Recharts |
| Backend API | Node.js, Express.js |
| Python Service | FastAPI (motion-detection stub) |
| Database | PostgreSQL, Redis |
| Payments | Stripe API |
| Maps | Google Maps API |
| Auth | JWT, bcrypt |
| Deployment | Docker, Docker Compose |

## Architecture

```
Mobile web prototype / Operator dashboard (React)
      ↓
Node.js API Gateway
  ├── Auth Service
  ├── Fleet Management
  ├── Booking Engine
  └── Payment Service
      ↓
Python motion-detection service (stub; ML demand prediction planned)
      ↓
PostgreSQL + Redis
```

## Getting Started

1. **Clone** the repository
2. **Environment** — Copy `.env.example` to `backend/.env` and `vehicle-simulator/.env` and configure:
   - Database connection strings
   - JWT secret
   - Stripe API keys (use test keys for development)
3. **Install** dependencies:
   ```bash
   cd backend && npm install
   cd ../vehicle-simulator && npm install
   cd ../frontend/operator-dashboard && npm install
   pip install -r ../../backend/motion-detection/requirements.txt
   ```
4. **Run** with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## License

MIT — see [LICENSE.md](LICENSE.md).
