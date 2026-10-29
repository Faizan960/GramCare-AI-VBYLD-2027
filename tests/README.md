# GramCare Tests — Cross-Component and Acceptance Suite

Verification test suites for GramCare AI, aligned to `TESTING_STRATEGY.md`.

## Test Levels

- **Dashboard Unit & Component Tests:** Vitest & React Testing Library tests in `dashboard/src/__tests__/`.
- **Synthetic Data Acceptance Tests:** Automated validation of canonical demo figures (Week 1..3: 5, 7, 15; Village A: 3, B: 4, C: 18, D: 2).
- **Integration / End-to-End Tests:** Verification of sync queueing, mock data layer, filter behavior, and human review transitions.
- **AI Evaluation Suite:** Multi-class classification benchmarks and threshold/clustering detection evaluations (deferred to dedicated AI milestone).
