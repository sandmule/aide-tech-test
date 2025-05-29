# Aide Health Tech Test

## Getting Started

### Prerequisites

* Node.js v18+ and npm

### Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/sandmule/aide-tech-test.git
   cd aide-tech-test
   ```

2. **Configure environment**
   Copy `.env.example` to `.env` and update:

3. **Install dependencies & generate Prisma client**

   ```bash
   yarn install
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the development server**

   ```bash
   yarn dev
   ```

   * App:  [http://localhost:3000](http://localhost:3000) (redirects to `/live`)
   * Live view: [http://localhost:3000/live](http://localhost:3000/live)
   * History view: [http://localhost:3000/history](http://localhost:3000/history)

## Tech Stack

* **Next.js 15** (App Router)

  * Monorepo style: API routes and frontend in one unified framework, chosen for fast iteration and deployment on Vercel.
* **React** (Client components)

  * Declarative UI with client/server component model, using a feature organisation folder structure, ideal for real-time interactivity.
* **Prisma** + **TimescaleDB**

  * Structured ORM with built-in migrations, combined with a powerful time-series extension for efficient historical queries.
  * Selected for rapid setup locally and in hosted environments, with excellent support for SQL and extensions when using neom.
* **WebSockets (ws)**

  * Low-level WebSocket library used by our custom hook to ingest live heart-rate streams directly from the source.
* **Chart.js** + **react-chartjs-2**

  * Widely adopted charting library offering responsive, performant line charts, wrapped in React-friendly components.
* **Tailwind CSS** & **shadcn/ui**

  * Utility-first styling plus a component library for consistent, rapid UI development.
* **Jest** + **React Testing Library** + **jest-websocket-mock**

  * Robust test runner (Jest) with DOM testing utilities to verify React components, and a WebSocket mock to simulate real-time data in hook integration tests. Chosen for mature ecosystem and developer familiarity.

## Future Improvements

* **In‑process WS proxy**

  * Own a single WS connection server‑side to persist and broadcast all live data (avoids client POST hack).
* **Authentication & Multi‑Patient**

  * Secure endpoints and patient‑scoped streams
* **Alerts & Anomaly Detection**

  * Threshold‑based notifications, rolling‑window analytics
* **Enhanced UI/UX**

  * URL‑synced date ranges, mobile‑optimized layouts, accessible components
* **Production Hardening**

  * CI/CD pipelines, monitoring, performance tuning, horizontal scaling






