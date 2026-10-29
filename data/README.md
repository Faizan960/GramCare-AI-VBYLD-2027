# GramCare Data — Synthetic Demonstration Fixtures and Generators

Fictional synthetic health surveillance datasets for testing and live demonstration of GramCare AI.

## Integrity and Ethical Boundary (D-008, NFR-05)

- **Exclusively Synthetic:** All records, patient identifiers (`GC-P0001`..`GC-P0125`), visit dates, and locations are simulated for demonstration purposes.
- **No Real PHI:** Zero real patient names or personal health information are present.
- **Decision Support Only:** Flags and conditions are synthetic outputs for demonstration and testing, not medical diagnoses (D-007).

## Synthetic Cohort Specifications (Seed: 42)

- **Total Fictional Patients:** 125 (≥120 required)
- **Total Health Visits / Encounters:** 153
- **Patients with Multiple Encounters:** 28
- **Village Patient Distribution:**
  - Village A: 28 patients
  - Village B: 30 patients
  - Village C: 45 patients
  - Village D: 22 patients
- **Active Surveillance Surge Window (Weeks 1 to 3):**
  - Weekly counts: Week 1 (5) → Week 2 (7) → Week 3 (15) = 27 total cases
  - Village A: 3 cases (Normal background)
  - Village B: 4 cases (Normal background)
  - Village C: 18 cases (Sudden increase — Potential Hotspot)
  - Village D: 2 cases (Symptom-similarity cluster near Village C)
- **Alert Oracle:** Flags Village C (`ALT-001`) with supporting evidence; Villages A and B remain unflagged.

## Generator & Validation Commands

```bash
# Generate deterministic cohort
python data/generate_demo_data.py

# Run automated validation test suite
python tests/test_synthetic_data.py
```
