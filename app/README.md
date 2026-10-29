# GramCare App — Mobile Field Application

The primary user-facing component of GramCare AI: an offline-first mobile application designed for rural community health workers (ASHAs / ANMs).

## Architectural Role (Preserved Baseline)

- **Primary Actor:** Health worker capturing patient details and health encounters at the point of care (D-003).
- **Core Requirement:** Offline-first operation — full functionality with zero network connectivity (D-004, NFR-01).
- **Technology Stack:** Flutter & Dart (O-01 resolved in Review 2).
- **Local Storage:** `sqflite` (SQLite on Flutter) for relational schema integrity with central PostgreSQL (D-012).
- **AI Decision Support:** Lightweight decision tree inference on-device for ranked possible conditions with explainability (FR-AI-01..05, D-007).
- **Synchronization:** Queueing of pending encounters with client UUID idempotency (`client_record_id`) (D-013).

## Milestone Status

- **Phase 0 Status:** Foundation scoped. Implementation deferred to the dedicated Mobile Field Application milestone.
- **Dependencies:** Premature dependency installation avoided per Phase 0 operating rules.
