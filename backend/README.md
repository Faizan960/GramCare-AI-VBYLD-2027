# GramCare Backend — Synchronization and Surveillance API

The central synchronization, ingestion, and surveillance analysis API for GramCare AI.

## Architectural Role (Preserved Baseline)

- **Runtime:** Node.js and Express REST API (O-07 / Review 2).
- **Central Store:** AWS RDS PostgreSQL implementing the 8 physical tables mapped in `REVIEW2_RECONCILIATION.md` §7 (D-014).
- **Security:** HTTP-bearer JWT authentication with role-based claims (`health_worker` vs `medical_officer`) and zero cleartext credentials (D-015, NFR-04).
- **Sync Protocol:** Idempotent encounter ingestion using client UUIDs (`ON CONFLICT (client_record_id) DO NOTHING`) and `sync_status` state machine (D-013).
- **Community Analysis:** Aggregation by time and location, moving average trends, spatial/temporal anomaly flagging, and potential cluster generation with supporting evidence (FR-CA-01..06).

## Milestone Status

- **Phase 0 Status:** Architecture defined. Implementation deferred to central backend milestone. Mock data layer used in dashboard for Phase 0.
- **Dependencies:** Premature dependency installation avoided per Phase 0 operating rules.
