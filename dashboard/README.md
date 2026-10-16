# GramCare Monitoring Dashboard — Prototype

A React + Vite dashboard-first prototype for GramCare rural disease surveillance. This is the first dashboard slice of the planned Flutter field app + backend + React dashboard architecture.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
cd dashboard
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

Create a production build:

```bash
npm run build
npm run preview
```

## Implemented in this prototype

- Overview with illustrative case-trend and symptom-group charts.
- Village activity list with location selection.
- Case table with search, village filter, and CSV export.
- Alert centre with explanatory evidence text and review/acknowledge action.
- Simulated alert action for rehearsing the demo.
- Simulated online/offline toggle and session-only pending-to-synced status changes.
- Responsive layout for desktop and mobile widths.

## Data and limitations

- All patient labels, cases, trends, villages, and alerts are **synthetic demonstration data** embedded in `src/App.jsx`.
- No real patient information is included.
- No API/backend, database, authentication, persistent storage, real synchronization, trained ML inference, or validated epidemiological outbreak detector is connected yet.
- The network toggle and sync button simulate interface states in browser memory only; they do not change the actual browser network connection or transfer data.
- The “Simulate alert” button adds a clearly labelled synthetic alert; it is not a model-generated detection.
- Symptom group labels are illustrative and are not clinical diagnoses.
- Trend values and baseline are invented for UI demonstration and must not be reported as real-world findings.

## Next integration steps

1. Connect the dashboard to a documented backend API.
2. Add database-backed synthetic cases and alert endpoints.
3. Implement Flutter local persistence and an idempotent synchronization queue.
4. Integrate and evaluate an on-device symptom classification model using an appropriate, documented dataset.
5. Replace hard-coded alert examples with a testable, explainable detection service and validation tests.

## Stack

- React 18
- Vite 6
- Recharts
- Lucide React
- Responsive CSS

## License

A repository-wide open-source license still needs to be selected and added by the project team before representing the project as licensed open-source software.
