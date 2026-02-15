<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-ff0033?style=for-the-badge&logo=vercel&logoColor=white)](http://subash--portfolio.zeabur.app)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

<br/>

**Live Demo URL:** http://subash--portfolio.zeabur.app

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=FF0033&center=true&vCenter=true&multiline=true&repeat=true&width=700&height=80&lines=Full-Stack+Developer+%7C+MERN+%2B+AI;Building+immersive+digital+products" alt="Typing SVG" />

</div>

---

## Highlights

- **Tactical HUD Theme** - Dark metallic background, neon red/cyan accents, and combat UI styling
- **Cinematic Hero System** - Interactive hero with radar canvas, particle storm, and HUD overlays
- **Smooth Motion Stack** - Framer Motion + GSAP ScrollTrigger + Lenis smooth scrolling
- **Custom Cursor + Grain Layer** - Signature interaction and texture effects for immersion
- **Neural Pathways Background** - Animated network visuals rendered behind sections
- **Contact Form with Backend API** - Express endpoint with Resend primary and Nodemailer fallback
- **Portfolio Switcher** - Navbar menu to jump across your theme-specific portfolio deployments
- **Docker Ready** - Multi-stage Alpine image for production deployment

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion, GSAP, Lenis |
| **Visuals** | Three.js, @react-three/fiber, @react-three/drei, Canvas HUD effects |
| **Backend** | Node.js, Express.js, Resend, Nodemailer, Helmet, express-validator |
| **Database** | MongoDB, MySQL, PostgreSQL *(across projects)* |
| **Deployment** | Docker (Alpine), Zeabur, Render |
| **Version Control** | Git, GitHub |

---

## Project Structure

```text
frontend/                        # React + Vite frontend
  src/
    components/                  # Hero, About, Projects, Skills, Contact, Navbar, Footer
    data/                        # personal.js, projects.js, skills.js
    config/                      # API base URL config
    hooks/                       # useMousePosition.js
  tailwind.config.js
  vite.config.js
backend/
  server.js                      # Express API + static serving + email handlers
  email-template.html            # HTML email template
  env.example                    # Environment variable template
Android app/                     # APK downloads
  Expense Tracker.apk
  Fair Split.apk
Dockerfile                       # Root multi-stage Docker build
render.yaml                      # Render deployment config
package.json                     # Monorepo root scripts + dependencies
```

---

## Featured Projects

| # | Project | Description | Stack |
|---|---------|-------------|-------|
| 1 | **BOLT & BROOK** | Full-stack e-commerce platform with Razorpay payments | React, Node.js, Express, MySQL, Razorpay |
| 2 | **SERVIFY** | Real-time freelance bidding platform | MongoDB, Express, React, Node.js |
| 3 | **EXPENSE TRACKER** | SMS-based finance tracker with chart analytics | React, Flask, Python, Recharts |
| 4 | **FAIRSHARE** | Debt management with split-bill workflows (Web + Mobile) | React, TypeScript, Node.js, MongoDB, Capacitor |
| 5 | **ISL TRANSLATOR** | Real-time Indian Sign Language AI translator | React, FastAPI, WebSocket, PyTorch, ONNX |

---

## Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/Subash-S-66/Subash-S-Portfolio-Game-Theme.git
cd Subash-Portfolio

# Install dependencies
npm install

# Start frontend
npm run dev

# Start backend (new terminal)
npm run server

# Or run both
npm run dev:full
```

### Environment Variables

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional deployment origins
ZEABUR_URL=https://subash-portfolio.zeabur.app
GITHUB_PAGES_URL=https://subash-s-66.github.io
API_URL=https://subash-portfolio.zeabur.app

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_EMAIL=your-email@gmail.com

# Email (Nodemailer fallback)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=your-email@gmail.com
```

### Docker

```bash
# Build image
docker build -t subash-portfolio .

# Run container
docker run -p 5000:5000 --env-file backend/.env subash-portfolio
```

---

## Theme

The portfolio uses a custom **Tactical HUD** visual style:

| Element | Color | Hex |
|---------|-------|-----|
| Neon Red | Red | `#ff0033` |
| Neon Cyan | Cyan | `#00f0ff` |
| Neon Yellow | Yellow | `#ffaa00` |
| Void Background | Black | `#050508` |
| HUD Surface | Near Black | `#0a0a0f` |

---

## Contact

<div align="center">

| Channel | Details |
|---------|---------|
| **Email** | [subash.93450@gmail.com](mailto:subash.93450@gmail.com) |
| **Phone** | [+91-9345081127](tel:+919345081127) |
| **LinkedIn** | [Subash S](https://www.linkedin.com/in/subash-s-514aa9373) |
| **GitHub** | [@Subash-S-66](https://github.com/Subash-S-66) |
| **Location** | Chennai, India |

</div>

---

## License

MIT

---

<div align="center">

**Built by [Subash S](https://github.com/Subash-S-66)**

*B.Tech Computer Science - Dr. M.G.R. Educational and Research Institute*

</div>
