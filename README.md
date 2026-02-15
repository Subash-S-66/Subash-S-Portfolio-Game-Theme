# Subash S — Developer Portfolio

A gaming-themed, boss-mode HUD portfolio website built as a full-stack monorepo with React, Three.js, and Express.

> **Live** → [https://subash.zeabur.app](https://subash.zeabur.app)

---

## Screenshots

| Hero | About | Projects |
|------|-------|----------|
| 3D scene with particle effects | Boss-profile stat card | Arcade-style project cards |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 5** | Build tooling & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Declarative animations |
| **GSAP + ScrollTrigger** | Scroll-driven animation sequences |
| **Three.js** (React Three Fiber + Drei) | 3D hero scene & effects |
| **Lenis** | Smooth scrolling |
| **Lucide React** | Icon system |

### Backend
| Technology | Purpose |
|---|---|
| **Express.js 4** | API server |
| **Resend API** | Primary email delivery |
| **Nodemailer** | SMTP fallback for contact form |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | Rate limiting |
| **express-validator** | Input validation |

### Infrastructure
| Tool | Purpose |
|---|---|
| **Docker** (multi-stage Alpine) | Containerised production build |
| **Zeabur** | Current hosting platform |
| **Render** | Alternative deployment target |

---

## Repository Structure

```
├── package.json            # Monorepo root — all dependencies & scripts
├── Dockerfile              # Multi-stage: build frontend → run backend
├── render.yaml             # Render deployment config
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/     # Hero, About, Projects, Skills, Contact, Navbar, Footer, etc.
│       ├── config/         # API base URL config
│       ├── data/           # personal.js, projects.js, skills.js
│       └── hooks/          # useMousePosition
│
├── backend/
│   ├── server.js           # Express server — serves built frontend + contact API
│   ├── email-template.html # HTML email template
│   └── env.example         # Environment variable reference
│
└── Android app/            # APK builds for mobile companion apps
```

---

## Getting Started

### Prerequisites

- **Node.js ≥ 18**
- **npm** (comes with Node)

### 1. Clone & Install

```bash
git clone https://github.com/Subash-S-66/Subash-Portfolio.git
cd Subash-Portfolio
npm install
```

All frontend and backend dependencies are managed from the **root** `package.json`.

### 2. Configure Environment

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env` with your values:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | Yes | Frontend origin for CORS |
| `RESEND_API_KEY` | Yes | API key from [resend.com](https://resend.com) |
| `NOTIFICATION_EMAIL` | Yes | Where contact submissions are sent |
| `EMAIL_HOST` | No | SMTP host (fallback) |
| `EMAIL_PORT` | No | SMTP port (fallback) |
| `EMAIL_USER` | No | SMTP user (fallback) |
| `EMAIL_PASSWORD` | No | SMTP password (fallback) |
| `EMAIL_FROM` | No | SMTP from address (fallback) |
| `EMAIL_TO` | No | SMTP to address (fallback) |

### 3. Run in Development

```bash
# Frontend only (Vite dev server)
npm run dev

# Backend only (nodemon)
npm run server

# Both concurrently
npm run dev:full
```

### 4. Production Build

```bash
npm run build    # Builds frontend → copies dist/ into backend/dist/
npm start        # Starts Express serving the built frontend + API
```

---

## Docker

The project uses a **multi-stage** Dockerfile (Node 18 Alpine):

1. **Build stage** — installs all deps (including devDependencies), builds the Vite frontend.
2. **Runtime stage** — installs production deps only, copies the backend + built frontend, runs Express.

```bash
# Build image
docker build -t subash-portfolio .

# Run container
docker run -p 5000:5000 --env-file backend/.env subash-portfolio
```

Pass the API base URL at build time if needed:

```bash
docker build --build-arg VITE_API_BASE=https://your-api.example.com -t subash-portfolio .
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run server` | Start Express with nodemon (backend) |
| `npm run dev:full` | Run frontend + backend concurrently |
| `npm run build` | Build frontend & copy to backend/dist |
| `npm start` | Start production Express server |
| `npm run preview` | Preview production build locally |

---

## Featured Projects

| # | Project | Stack | Link |
|---|---------|-------|------|
| 1 | **Bolt & Brook** — E-Commerce Platform | React, Node, Express, MySQL, Razorpay | [Live](https://stage.boltandbrook.com/) |
| 2 | **Servify** — Freelance Bidding Platform | MongoDB, Express, React, Node | [Live](https://servify.zeabur.app/) |
| 3 | **Expense Tracker** — Finance Management | React, Flask, Python, Recharts | [Live](https://subash-s-66.github.io/expense-tracking-system/) |
| 4 | **FairShare** — Debt Management | React, TypeScript, Node, MongoDB, Capacitor | [Live](https://subash-s-66.github.io/FairSplit/) |
| 5 | **ISL Translator** — Real-Time Sign Language AI | React, FastAPI, WebSocket, MediaPipe, PyTorch, ONNX | — |

---

## About Me

**Subash S** — Full-Stack Developer based in Chennai, India.

B.Tech Computer Science student with 1+ years of hands-on development experience, 5+ completed projects, and a strong focus on the MERN stack and AI/ML.

> *Building immersive digital products with precision engineering.*

---

## Contact

- **Email**: [subash.93450@gmail.com](mailto:subash.93450@gmail.com)
- **Phone**: +91-9345081127
- **LinkedIn**: [Subash S](https://www.linkedin.com/in/subash-s-514aa9373)
- **GitHub**: [@Subash-S-66](https://github.com/Subash-S-66)

---

## Repository Policy

This is a **view-only** repository shared for educational and portfolio purposes. Please do not submit pull requests or open issues unless specifically invited.

## License

MIT — see [package.json](package.json) for details.

---

*Built with ❤️ by Subash S*
