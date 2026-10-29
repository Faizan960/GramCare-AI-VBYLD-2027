# GramCare Monitoring Dashboard — Multilingual Surveillance & Healthcare Suite

> **Submission for: Hack for a Social Cause — MY Bharat**  
> **Official Portal:** [https://mybharat.gov.in/pages/hack-for-social-cause](https://mybharat.gov.in/pages/hack-for-social-cause)  
> **Initiative:** Vikasit Bharat Young Leaders Dialogue (VBYLD 2027)  
> **Focus Track:** Healthcare Technology, Low-Connectivity Surveillance, Rural Social Impact  
> **Repository:** [https://github.com/Faizan960/GramCare-AI-VBYLD-2027](https://github.com/Faizan960/GramCare-AI-VBYLD-2027)

### Core Project Team
- **M. Faizan Patel** — **Project Lead** (Product & Architecture, Flutter App, AI & Analytics, Backend & Dashboard)
- **Niranjan Mohite** — **Research & Data Analyst** (Data Management, AI Support, Research & Documentation, Validation)

---

A professional React + Vite + Recharts + Leaflet dashboard platform for GramCare offline-first rural disease surveillance (VBYLD 2027 Hack for a Social Cause). This release features a modern healthcare UI design system, complete Light/Dark/System themes, full 4-language localization (English, Hindi, Marathi, Urdu) with native Urdu Right-to-Left (RTL) support, an illustrated surveillance map with offline fallback, an extensive Doctor & Health Worker Activity Surveillance module, and 125 deterministic synthetic patients across 153 encounters.

---

## Local Setup & Quickstart

Requirements: Node.js 18+ and Python 3.10+.

```bash
# Navigate to dashboard
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open the local URL printed by Vite (typically http://localhost:5173).

### Demonstration Login Credentials

Use the predefined demo credentials on the login screen:

- **User ID:** `officer01`
- **Password:** `GramCare@2026!`
- **Role:** Medical Authority / Surveillance Lead

*(A convenient "Auto-fill Demo Credentials" button is provided on the login page for rapid evaluation).*

### Run Automated Tests

```bash
# Run Vitest test suite (34 comprehensive tests covering auth, routes, cohort, theme, i18n, RTL, modals, and doctor activity)
npm test

# Run Python validation tests for synthetic data (8 tests covering roles, cohort, and oracle)
python ../tests/test_synthetic_data.py
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Multilingual Support & Urdu RTL Localization

The application features complete localization across 4 official languages, using standard Indian public health nomenclature (IDSP / National Health Mission):

1. **English (`en`):** Default surveillance terminology.
2. **Hindi (`hi`):** Authentic Devanagari public health terminology (निगरानी, स्वास्थ्य परामर्श, मरीज़ पंजिका, सतर्कता अलर्ट).
3. **Marathi (`mr`):** Context-appropriate state health phrasing (निगराणी, क्षेत्र भेटी, रुग्ण नोंदवही, डॉक्टर कार्यकलाप).
4. **Urdu (`ur`):** Formal medical Urdu terminology (نگرانی, طبی معائنے, مریضوں کا رجسٹر, وبائی انتباہات) with native **Right-to-Left (RTL)** layout.

### Urdu RTL Architecture
- Dynamically sets `dir="rtl"` and `lang="ur"` on `document.documentElement` alongside `.rtl-mode`.
- Mirrored navigation hierarchy, sidebar, header controls, search inputs, and modal dialogs.
- Protected left-to-right rendering (`unicode-bidi: isolate`, `direction: ltr`) for Latin alphanumeric identifiers (`GC-P0001`, `GC-V0001`, `DOC-001`, dates like `2026-10-16`, and numeric coordinates).
- Recharts statistical charts and Leaflet GIS maps are isolated to prevent cartesian and geographic distortion.
- Seamlessly restores LTR orientation when switching back to English, Hindi, or Marathi.
- Language preferences persist across reloads in `localStorage` under `gramcare_lang`.
- Changing language updates UI instantly without resetting active filters, navigation, or alert review state.

---

## Visual Redesign & Complete Dark Mode

- **Healthcare UI Design System:** Clean typography, compact KPI cards, restrained elevation, consistent corner radii, and a high-contrast healthcare color palette.
- **Three-Way Theme Toggle:** Positioned prominently in the top navigation bar with Light, System, and Dark modes.
  - Persists theme preferences in `localStorage` under `gramcare_theme`.
  - Automatically respects OS-level dark mode settings via `prefers-color-scheme`.
  - Centralized CSS custom properties (`--bg-app`, `--bg-surface`, `--text-primary`, `--border-subtle`, etc.) for seamless runtime adaptation without jarring transitions.
  - Custom dark-mode filter and tile invert for Leaflet maps to maintain legibility.
  - Adaptive Recharts styling with dynamically inverted grids, axis labels, and tooltip popovers.

---

## Illustrated Surveillance Map & Fallback

- **Compact Overview Preview:** Illustrated SVG cartographic schematic on the Overview tab displaying 4 monitored villages, animated pulsing hotspot halo on Village C (18 active cases), dashed symptom similarity link to Village D (2 cases), and one-click transition to full GIS view.
- **Dedicated Village Map Workspace:**
  - Interactive Leaflet map with custom HTML marker pins displaying live case badges.
  - Pulsing hotspot boundary around Village C.
  - Directional correlation line connecting Village C and Village D.
  - Synchronized Village Details card with population estimates, dominant symptom clusters, assigned healthcare staff, and coordinate metadata.
  - **Tile Load Fallback:** Automatic cartographic fallback banner and SVG grid rendering if external tile servers are unreachable or offline.
  - Explicit disclaimer: *"Illustrative Geographic Coordinates for Demonstration Only — Not Real Patient Locations (D-008)"*.

---

## Clinical & Longitudinal Detail Modals

1. **Encounter Clinical Details Modal:** Opened from the Field Visits table ("Details" action). Displays full clinical information, patient ID (with direct navigation link to registry), assigned health worker, reported symptoms, AI model confidence score, and epidemiological reasoning.
2. **Patient Longitudinal History Modal:** Opened from the Patient Registry ("View History" action). Displays patient profile metadata (ID, age, gender, village, registered date) and a linked encounters table listing all longitudinal clinical visits for that individual.

---

## Doctor & Health Worker Activity Surveillance

Accessible via the primary navigation sidebar (**Doctor Activity** tab), this module tracks and attributes clinical encounters submitted by field staff and primary care physicians:

### Key Metrics & KPIs
1. **Registered Reporting Personnel:** 8 total personnel (4 Doctors/Medical Officers + 4 Community Health Workers / ANMs).
2. **Total Encounters Reported:** 153 field encounters and primary health consultations.
3. **Distinct Patients Reported:** 125 unique pseudonymous patients (demonstrating cross-reporter clinical care).
4. **Average Encounters / Person:** 19.1 encounters per reporting worker.

### Personnel Cohort
- **Dr. Rajesh Sharma (`DOC-001`):** Medical Officer, Village C PHC (41 encounters, 37 unique patients).
- **Dr. Anita Desai (`DOC-002`):** Medical Officer, Village A Health Post (22 encounters, 20 unique patients).
- **Dr. Suresh Patil (`DOC-003`):** Staff Physician, Village B Clinic (24 encounters, 22 unique patients).
- **Dr. Meera Kulkarni (`DOC-004`):** Consulting Physician, Village D Sub-centre (18 encounters, 17 unique patients).
- **Sunita Kamble (`HW-001`):** ASHA Worker, Village C (19 encounters, 18 unique patients).
- **Pooja Jadhav (`HW-002`):** ASHA Worker, Village C (11 encounters, 11 unique patients).
- **Ramesh Shinde (`HW-003`):** ANM, Village A (9 encounters, 9 unique patients).
- **Kavita Rathod (`HW-004`):** ASHA Worker, Village B (9 encounters, 9 unique patients).

### Features
- **Search & Filters:** Real-time search across ID, name, and facility; role filtering (Doctors vs CHWs); and village filtering.
- **Sorting & Pagination:** Sortable columns by encounters, unique patients, reporter name, and latest submission date.
- **Reporter Profile & Encounter Modal:** Inspect individual clinician credentials, assigned facility, encounter-to-patient ratio, and an attributed encounter sub-table showing symptom clusters and AI suggestions.

---

## Synthetic Patient Cohort & Canonical Oracle

The synthetic cohort is deterministically generated using `data/generate_demo_data.py` (Random Seed: `42`).

- **Total Registered Fictional Patients:** 125 (≥120 required)
- **Total Health Encounters (Visits):** 153
- **Patients with Multiple Visits:** 28 (enables longitudinal trend review)
- **Village Distribution:**
  - **Village A:** 28 patients, 31 visits (Normal baseline)
  - **Village B:** 30 patients, 36 visits (Normal baseline)
  - **Village C:** 45 patients, 60 visits (Surge / Hotspot)
  - **Village D:** 22 patients, 26 visits (Symptom-similarity cluster)

### Preservation of Canonical Oracle Figures
The active outbreak surveillance window strictly preserves the canonical trajectory and test oracle:
- **Weekly Trend:** Week 1 (5 cases) → Week 2 (7 cases) → Week 3 (15 cases)
- **Active Surge Distribution:** Village A (3 cases), Village B (4 cases), Village C (18 cases), Village D (2 cases)
- **Alert Oracle:** Flags Village C (`ALT-001`) with multi-week surge evidence (4.5x baseline) and spatial/symptom correlation with Village D. Confirms absence of alerts for normal baseline Villages A and B.

---

## Authentication & Security Boundaries

- **Demonstration Scope:** Client-side credential authentication is designed solely for local hackathon demonstrations and user-flow validation.
- **Security Limitations:** Client-side credential validation is **not production-grade security** and can be inspected or bypassed using browser developer tools. It must **never** be used to protect real clinical or patient data.
- **Privacy Policy:** All records use pseudonymous identifiers (`GC-P0001` to `GC-P0125`). Zero real patient names, addresses, phone numbers, or government IDs exist in the codebase (NFR-05, D-008).
- **Session Handling:** User sessions are maintained in browser `sessionStorage`. Passwords are never persisted or stored in browser storage.
- **Decision Support Disclaimer:** All AI alerts and condition suggestions support professional human review only (D-007) and do not provide autonomous medical diagnosis or outbreak confirmation.
