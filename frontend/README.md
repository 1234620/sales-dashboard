# Sales Dashboard — Next.js Frontend

This directory is the **official dashboard UI** for the Parasnath Sales Performance & Forecasting project.

The legacy **Streamlit** app (`app.py` at repo root) has been removed. All visualization work — including Phase 2 chart readability fixes — lives here in TypeScript with [Recharts](https://recharts.org/).

## Prerequisites

Start the FastAPI backend from the repo root first:

```bash
python3 backend/main.py   # http://localhost:8000
```

## Run the dashboard

```bash
cd frontend
npm install    # first time only
npm run dev    # http://localhost:3000
```

Open **http://localhost:3000** in your browser. Do not use `streamlit run` or port 8501.

## Project layout

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard shell — filters, tab routing, data fetching |
| `src/components/dashboard/tabs/` | One file per tab (Overview, Regional, Products, Trends, Forecasting, Anomalies, Margins) |
| `src/lib/api.ts` | HTTP client → FastAPI (`NEXT_PUBLIC_API_URL`, default `http://localhost:8000`) |
| `src/lib/chart-utils.ts` | Shared axis formatting, tick intervals, MAPE helper |
| `src/lib/types.ts` | TypeScript types matching API responses |

## Environment

Copy the example env file and adjust if the backend runs on a different host or port:

```bash
cp .env.local.example .env.local
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI base URL for all dashboard API calls |

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check
```

See the [root README](../README.md) for data generation, backend setup, and architecture.
