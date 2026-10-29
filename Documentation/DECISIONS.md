# GramCare — Decisions Log

> **Project:** GramCare — AI-Powered Offline Disease Outbreak Monitoring System
> **Document:** Engineering & Scope Decisions
> **Version:** 0.1 (Review 1 — Research & System Design)
> **Status:** Living log
> **Last updated:** 2026-08-22
> **Team:** M. Faizan Patel · Yasa Ghanchi · Niranjan Mohite · Yash S. Waghela
> **Guide / College:** *To be finalized*

---

## 1. How to use this log

This is the record of decisions that shape GramCare. It exists so that choices — and the reasons behind them — are not lost or silently reversed. The core project idea should not change without adding a decision here. When revisiting a decision, add a new dated entry rather than deleting the old one, so the history stays intact. Each decision records what was decided, why, and its current status.

## 2. Status snapshot

**Finalized (agreed baseline):** project name; core problem; core vision; the offline-first concept; the health-worker mobile-application concept; patient and symptom recording; local/offline storage; the synchronization concept; AI-assisted symptom analysis; community-level disease monitoring; temporal analysis; geographic analysis; the case-cluster concept; the dashboard concept; potential outbreak alerts; the medical-authority decision-support role; the conceptual architecture; the MVP direction; and the research-gap direction.

**Deliberately not finalized (open):** the exact programming language and framework; the database; the cloud provider; the AI model; the dataset; the GIS technology; the synchronization technology and conflict-resolution strategy; the graph database and graph algorithm; the exact outbreak-detection algorithm; the final UI; and the deployment architecture.

Keeping the second list open is itself a decision (see D-001).

## 3. Decision records

### D-001 — Keep the architecture technology-neutral during the idea/review stage
**Decision:** Describe the system in terms of responsibilities and data flow, and defer commitment to specific frameworks, databases, and cloud providers.
**Rationale:** Choosing tools before requirements, dataset availability, device limits, model complexity, timeline, and team skills are understood would constrain the project prematurely and risk selecting the wrong stack.
**Status:** Active.

### D-002 — Reject the auto-generated "buzzword" architecture
**Decision:** Do not adopt the previously-generated architecture built around a generic web application, API gateway, RAG orchestrator, LLM server, and vector database.
**Rationale:** It does not represent the GramCare concept. The primary interface is a health-worker mobile application, not a web app, and the project does not currently require an LLM/RAG/vector-database stack.
**Status:** Active.

### D-003 — The health-worker mobile application is the primary user-facing component
**Decision:** Treat the mobile field application as the centre of the design; all other components support the flow of data from it.
**Rationale:** The project's value comes from enabling field data collection in low-connectivity settings.
**Status:** Active.

### D-004 — Offline-first is a core concept, not an optional feature
**Decision:** The application must remain fully usable for data collection without connectivity.
**Rationale:** Health workers operate where internet access is unreliable; if connectivity were required, the system would fail at its main purpose.
**Status:** Active.

### D-005 — Graph technology is not mandatory for the MVP
**Decision:** Do not adopt a graph database (for example, Neo4j) for the MVP; first evaluate whether graph-based analysis adds meaningful value.
**Rationale:** Health data contains relationships, but graph approaches add data and implementation complexity. Sophistication alone does not justify adoption within the project timeline.
**Status:** Active — pending evaluation.

### D-006 — Prefer simple detection over complex epidemiological models for the MVP
**Decision:** For potential-outbreak detection, favour a simple threshold or anomaly-based approach for the MVP.
**Rationale:** A simple method is more achievable, testable, and explainable in the available time than a complex deep-learning epidemiological model; the exact algorithm remains open.
**Status:** Active — algorithm not finalized.

### D-007 — Firm medical boundary: assisted decision support, not diagnosis
**Decision:** GramCare provides AI-assisted analysis, possible-condition predictions, disease-pattern insights, and *potential* outbreak alerts. It does not diagnose, does not confirm outbreaks automatically, and does not make autonomous medical decisions. The final decision rests with medical authorities.
**Rationale:** Accuracy, safety, and defensibility. Overclaiming would be both unsafe and indefensible in review.
**Status:** Active — governs all documents and demonstrations. See `AI_REQUIREMENTS.md`.

### D-008 — Use synthetic / demo data for the prototype
**Decision:** Drive development and demonstrations with synthetic data; do not use real patient information without an appropriate process.
**Rationale:** Enables realistic scenario demonstrations while avoiding privacy and ethical issues in a college prototype.
**Status:** Active.

### D-009 — Do not fabricate literature to pad the count
**Decision:** Base the survey on 8 verified IEEE papers rather than inventing sources to reach 15–20, and document access honestly (Tier 1 fully reviewed; Tier 2 verified but access-gated).
**Rationale:** Integrity and defensibility in review. A smaller, honest, verifiable foundation is stronger than an inflated one. See `LITERATURE_REVIEW.md`.
**Status:** Active.

### D-010 — Frame the research gap as an integration gap
**Decision:** Claim that the novelty lies in integrating existing capabilities into a single offline-first rural workflow, not in inventing the individual algorithms.
**Rationale:** The components exist in the literature; the defensible contribution is their end-to-end integration. This is more credible than claiming "nobody has done this before."
**Status:** Active.

### D-011 — Development philosophy: Simple → Working → Testable → Explainable → Extendable
**Decision:** Build in this order and justify every feature by the project objective.
**Rationale:** A complete, explainable system is worth more for this project than an unfinished complex one. See `MVP_SCOPE.md`.
**Status:** Active.

### D-012 — Local Database Recommendation: sqflite over Hive
**Recommendation (Phase 0 / Review 2):** Use `sqflite` (SQLite on Flutter) as the local on-device database for the mobile field app.
**Rationale:** SQLite provides relational schema integrity, ACID compliance, and direct alignment with central PostgreSQL tables (`patients`, `visits`, `symptoms`), avoiding custom indexing or NoSQL relational emulation.
**Status:** Recommended baseline for mobile milestone (O-02 partial).

### D-013 — Synchronization Protocol: Client UUIDs and Idempotent Ingestion
**Recommendation (Phase 0 / Review 2):** Adopt client-generated UUIDs (`client_record_id`) for encounters, transitioning sync states as `PENDING` → `SYNCING` → `SYNCED` (with `FAILED` for retry). Central sync endpoint ingests with `ON CONFLICT (client_record_id) DO NOTHING`.
**Rationale:** Guarantees zero duplicate records on retries or connection drops, fulfilling NFR-02, NFR-03, and NFR-11 with minimal protocol overhead.
**Status:** Recommended baseline for sync milestone (O-07 partial).

### D-014 — Central Schema and Migrations: Minimal Versioned SQL
**Recommendation (Phase 0 / Review 2):** Realise the 8-table physical schema mapped in `REVIEW2_RECONCILIATION.md` §7 via sequential versioned SQL migration scripts (`001_initial_schema.sql`).
**Rationale:** Keeps database definition explicit, lightweight, and auditable without heavy ORM lock-in.
**Status:** Recommended baseline for backend milestone.

### D-015 — Security and Secrets: Environment-Driven Secrets & JWT Role Auth
**Recommendation (Phase 0 / Review 2):** Manage all credentials via environment variables (`.env`, gitignored, with `.env.example` templates). Authenticate API and dashboard access via HTTP-bearer JWT tokens carrying role claims (`health_worker` vs `medical_officer`).
**Rationale:** Fulfills NFR-04 (no cleartext credentials) while maintaining simple token-based boundary between mobile and oversight actors.
**Status:** Recommended baseline for backend/dashboard milestones.

### D-016 — Alert Evidence and Explanation Persistence
**Recommendation (Phase 0 / Review 2):** Explicitly persist `influencing_symptoms` on `visits` and `reasoning`, `contributing_cases`, and `dominant_symptoms` on `alerts`.
**Rationale:** Guarantees explainability (FR-AI-03, FR-CA-06, NFR-07) survives synchronization, allowing the dashboard officer to inspect exact decision-support evidence without model re-execution.
**Status:** Recommended baseline for data model and dashboard milestones.

## 4. Open decisions to resolve

The following remain to be decided, informed by the literature, dataset availability, device limitations, model complexity, development time, team skills, and MVP requirements. Owners and target dates are to be assigned by the team.

| ID | Open decision | Depends on |
|----|---------------|-----------|
| O-01 | Programming language and app framework | Team skills, device limits, offline support |
| O-02 | Local and central database | Data model, sync strategy |
| O-03 | Cloud provider (if any) | Deployment needs, cost, timeline |
| O-04 | AI model for symptom classification | Dataset, explainability, on-device constraints |
| O-05 | Dataset | Availability, licensing, synthetic-data plan |
| O-06 | GIS / mapping technology | Geographic-analysis needs |
| O-07 | Synchronization technology and conflict-resolution strategy | Data model, offline behaviour |
| O-08 | Graph database and algorithm (only if D-005 evaluation is positive) | Value evaluation |
| O-09 | Outbreak-detection algorithm | Data characteristics, explainability |
| O-10 | Final UI design | User needs, demonstration plan |
| O-11 | Deployment architecture | O-01 through O-03 |

---

### Related documents

- [Project Overview](./PROJECT_OVERVIEW.md)
- [MVP Scope](./MVP_SCOPE.md)
- [Architecture](./ARCHITECTURE.md)
- [AI Requirements](./AI_REQUIREMENTS.md)
- [Requirements Specification](./REQUIREMENTS.md)
- [Data Model](./DATA_MODEL.md)
- [AI Methodology](./AI_METHODOLOGY.md)
- [Dataset Strategy](./DATASET_STRATEGY.md)
- [Demo Scenario](./DEMO_SCENARIO.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Decisions Log](./DECISIONS.md) *(this document)*
- [Literature Review](./LITERATURE_REVIEW.md)
