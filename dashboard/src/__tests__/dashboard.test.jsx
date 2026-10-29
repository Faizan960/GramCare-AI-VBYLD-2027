import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import {
  WEEKLY_TREND,
  VILLAGES,
  SEED_ALERTS,
  PATIENTS,
  VISITS,
  REPORTERS,
  getSummaryMetrics,
  getVillageSummaries,
  getReporterMetrics,
  getReporterSummaries,
} from '../data/canonicalData';
import { DEMO_CREDENTIALS } from '../auth/demoAuth';

function renderAuthenticatedApp() {
  sessionStorage.setItem(
    'gramcare_demo_auth_session',
    JSON.stringify({
      id: DEMO_CREDENTIALS.userId,
      name: DEMO_CREDENTIALS.name,
      role: DEMO_CREDENTIALS.role,
    })
  );
  return render(<App />);
}

describe('GramCare AI Dashboard MVP — 100+ Synthetic Patients & Authentication Verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.classList.remove('rtl-mode');
  });

  // 1. AUTHENTICATION & PROTECTED ROUTE TESTS (Part 2)
  describe('Authentication & Protected Route Security', () => {
    it('blocks unauthenticated access and displays the login screen', () => {
      render(<App />);
      expect(screen.getByTestId('login-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-portal')).not.toBeInTheDocument();
      expect(screen.getByText('Rural Disease Outbreak Surveillance System')).toBeInTheDocument();
      expect(screen.getByTestId('login-user-id')).toBeInTheDocument();
      expect(screen.getByTestId('login-password')).toBeInTheDocument();
    });

    it('rejects invalid credentials with generic error message', async () => {
      render(<App />);
      fireEvent.change(screen.getByTestId('login-user-id'), { target: { value: 'wrong_user' } });
      fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'wrong_password' } });
      fireEvent.click(screen.getByTestId('login-submit-button'));

      const errorMsg = await screen.findByTestId('login-error-message');
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg).toHaveTextContent('Invalid User ID or Password. Please try again.');
      expect(screen.queryByTestId('dashboard-portal')).not.toBeInTheDocument();
    });

    it('authenticates with predefined demo credentials and navigates to dashboard', async () => {
      render(<App />);
      // Auto-fill demo credentials or type them in
      fireEvent.click(screen.getByTestId('auto-fill-demo-creds'));
      expect(screen.getByTestId('login-user-id')).toHaveValue('officer01');
      expect(screen.getByTestId('login-password')).toHaveValue('GramCare@2026!');

      fireEvent.click(screen.getByTestId('login-submit-button'));

      // Dashboard should render
      const dashboard = await screen.findByTestId('dashboard-portal');
      expect(dashboard).toBeInTheDocument();
      expect(screen.getByTestId('logged-in-user-id')).toHaveTextContent('officer01');
      expect(screen.getByTestId('topbar-user-badge')).toHaveTextContent('officer01');
    });

    it('logs out and redirects back to protected login screen', async () => {
      renderAuthenticatedApp();
      expect(screen.getByTestId('dashboard-portal')).toBeInTheDocument();

      // Click logout in sidebar
      const logoutBtn = screen.getByTestId('logout-button');
      fireEvent.click(logoutBtn);

      // Should return to login screen
      expect(screen.getByTestId('login-screen')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard-portal')).not.toBeInTheDocument();
    });

    it('preserves dataset modifications across logout and login session', async () => {
      renderAuthenticatedApp();

      // Transition alert status
      fireEvent.click(screen.getByTestId('nav-alerts'));
      const toggleBtn = screen.getByTestId('action-toggle-review-ALT-001');
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('review-state-ALT-001')).toHaveTextContent('Reviewed');

      // Logout
      fireEvent.click(screen.getByTestId('logout-button'));
      expect(screen.getByTestId('login-screen')).toBeInTheDocument();

      // Log back in
      fireEvent.click(screen.getByTestId('auto-fill-demo-creds'));
      fireEvent.click(screen.getByTestId('login-submit-button'));
      await screen.findByTestId('dashboard-portal');

      // Alert review status should remain preserved
      fireEvent.click(screen.getByTestId('nav-alerts'));
      expect(screen.getByTestId('review-state-ALT-001')).toHaveTextContent('Reviewed');
    });
  });

  // 2. 120+ SYNTHETIC PATIENT COHORT TESTS (Part 1)
  describe('Synthetic Patient Cohort & Multi-Visit Verification (Part 1)', () => {
    it('verifies cohort contains at least 120 fictional patients with unique pseudonymous IDs', () => {
      expect(PATIENTS.length).toBeGreaterThanOrEqual(120);
      expect(PATIENTS.length).toBe(125);

      const patientIds = PATIENTS.map((p) => p.patient_id);
      expect(new Set(patientIds).size).toBe(PATIENTS.length);

      // Verify pseudonymous format
      patientIds.forEach((id) => {
        expect(id).toMatch(/^GC-P\d{4}$/);
      });
    });

    it('verifies distribution across 4 villages and zero real PHI fields', () => {
      const vCounts = {};
      PATIENTS.forEach((p) => {
        vCounts[p.village] = (vCounts[p.village] || 0) + 1;
        expect(['Village A', 'Village B', 'Village C', 'Village D']).toContain(p.village);
        // PHI checks
        expect(p).not.toHaveProperty('name');
        expect(p).not.toHaveProperty('phone');
        expect(p).not.toHaveProperty('email');
        expect(p).not.toHaveProperty('address');
        expect(p).not.toHaveProperty('ssn');
      });

      expect(vCounts['Village A']).toBe(28);
      expect(vCounts['Village B']).toBe(30);
      expect(vCounts['Village C']).toBe(45);
      expect(vCounts['Village D']).toBe(22);
    });

    it('confirms multiple visits for trend demonstration (>=20 repeat patients)', () => {
      expect(VISITS.length).toBe(153);
      const visitCounts = {};
      VISITS.forEach((v) => {
        visitCounts[v.patient_id] = (visitCounts[v.patient_id] || 0) + 1;
      });

      const repeatPatients = Object.values(visitCounts).filter((cnt) => cnt > 1);
      expect(repeatPatients.length).toBeGreaterThanOrEqual(20);
    });
  });

  // 3. CANONICAL ORACLE PRESERVATION & METRICS (Part 1 & 3)
  describe('Preservation of Canonical Oracle & Metric Aggregation (Part 3)', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
    });

    it('displays total synthetic patients (125) and total health encounters (153)', () => {
      const patientStat = screen.getByTestId('stat-total-patients');
      expect(patientStat).toHaveTextContent('125');

      const visitsStat = screen.getByTestId('stat-total-cases');
      expect(visitsStat).toHaveTextContent('153');
    });

    it('preserves the canonical weekly trend of 5, 7, and 15 in the trajectory panel', () => {
      const trajectoryStat = screen.getByTestId('stat-weekly-trend');
      expect(trajectoryStat).toHaveTextContent('5 → 7 → 15');

      const trendPanel = screen.getByTestId('weekly-trend-panel');
      expect(trendPanel).toHaveTextContent('5 → 7 → 15 cases');

      expect(WEEKLY_TREND[0].cases).toBe(5);
      expect(WEEKLY_TREND[1].cases).toBe(7);
      expect(WEEKLY_TREND[2].cases).toBe(15);
    });

    it('renders village-wise summary reflecting patient counts and active surge', () => {
      const villageSummaries = getVillageSummaries(PATIENTS, VISITS);
      const vA = villageSummaries.find((v) => v.name === 'Village A');
      const vB = villageSummaries.find((v) => v.name === 'Village B');
      const vC = villageSummaries.find((v) => v.name === 'Village C');
      const vD = villageSummaries.find((v) => v.name === 'Village D');

      expect(vA.patientCount).toBe(28);
      expect(vA.activeCases).toBe(3);

      expect(vB.patientCount).toBe(30);
      expect(vB.activeCases).toBe(4);

      expect(vC.patientCount).toBe(45);
      expect(vC.activeCases).toBe(18);

      expect(vD.patientCount).toBe(22);
      expect(vD.activeCases).toBe(2);

      const villagePanel = screen.getByTestId('village-summary-panel');
      expect(within(villagePanel).getByTestId('village-summary-VIL-01')).toHaveTextContent('Village A');
      expect(within(villagePanel).getByTestId('village-summary-VIL-01')).toHaveTextContent('28 patients');
      expect(within(villagePanel).getByTestId('village-summary-VIL-01')).toHaveTextContent('3');

      expect(within(villagePanel).getByTestId('village-summary-VIL-03')).toHaveTextContent('Village C');
      expect(within(villagePanel).getByTestId('village-summary-VIL-03')).toHaveTextContent('45 patients');
      expect(within(villagePanel).getByTestId('village-summary-VIL-03')).toHaveTextContent('18');
    });

    it('flags Village C with supporting evidence and leaves baseline Villages A & B unflagged', () => {
      const alertRow = screen.getByTestId('alert-row-ALT-001');
      expect(alertRow).toBeInTheDocument();
      expect(alertRow).toHaveTextContent('Potential Cluster: Acute Diarrheal Pattern');
      expect(alertRow).toHaveTextContent('Village C');
      expect(alertRow).toHaveTextContent('18 contributing cases');

      const baselineNote = screen.getByTestId('baseline-unflagged-note');
      expect(baselineNote).toHaveTextContent('Village A (3 cases) and Village B (4 cases) have normal background activity and are NOT flagged');
    });
  });

  // 4. PATIENT REGISTRY & CASE FILTERING
  describe('Patient Registry & Multi-Scope Filtering', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
    });

    it('renders the dedicated Patient Registry tab displaying 125 fictional records', () => {
      fireEvent.click(screen.getByTestId('nav-patients'));
      expect(screen.getByTestId('patients-panel')).toBeInTheDocument();
      expect(screen.getByText('Total Registered Fictional Patients: 125 (≥120 required)')).toBeInTheDocument();
      expect(screen.getByTestId('patient-row-GC-P0001')).toBeInTheDocument();
    });

    it('filters cases table by active surveillance surge vs all cohort visits', () => {
      fireEvent.click(screen.getByTestId('nav-cases'));
      const scopeSelect = screen.getByTestId('filter-scope-select');

      // Default: Active surveillance surge (27 cases)
      expect(screen.getByText('Showing 27 of 153 synthetic records')).toBeInTheDocument();

      // Switch to All Encounters (153 visits)
      fireEvent.change(scopeSelect, { target: { value: 'AllEncounters' } });
      expect(screen.getByText('Showing 153 of 153 synthetic records')).toBeInTheDocument();

      // Switch back to Active Surge and filter by Village C
      fireEvent.change(scopeSelect, { target: { value: 'ActiveSurveillance' } });
      const villageSelect = screen.getByTestId('filter-village-select');
      fireEvent.change(villageSelect, { target: { value: 'Village C' } });
      expect(screen.getByText('Showing 18 of 153 synthetic records')).toBeInTheDocument();
    });

    it('filters active surveillance cases by weekly period (Week 1: 5, Week 2: 7, Week 3: 15)', () => {
      fireEvent.click(screen.getByTestId('nav-cases'));
      const periodSelect = screen.getByTestId('filter-period-select');

      fireEvent.change(periodSelect, { target: { value: 'Week 1' } });
      expect(screen.getByText('Showing 5 of 153 synthetic records')).toBeInTheDocument();

      fireEvent.change(periodSelect, { target: { value: 'Week 2' } });
      expect(screen.getByText('Showing 7 of 153 synthetic records')).toBeInTheDocument();

      fireEvent.change(periodSelect, { target: { value: 'Week 3' } });
      expect(screen.getByText('Showing 15 of 153 synthetic records')).toBeInTheDocument();
    });
  });

  // 5. FIELD SYNC & REVIEWS
  describe('Field Sync & Human Review Flow', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
    });

    it('toggles alert review status between "Needs review" and "Reviewed"', () => {
      fireEvent.click(screen.getByTestId('nav-alerts'));
      const toggleBtn = screen.getByTestId('action-toggle-review-ALT-001');

      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('review-state-ALT-001')).toHaveTextContent('Reviewed');

      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('review-state-ALT-001')).toHaveTextContent('Needs review');
    });

    it('simulates sync of pending field records when online', async () => {
      const syncBtn = screen.getByTestId('sync-button');
      fireEvent.click(syncBtn);

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      const toast = await screen.findByTestId('toast-notification', {}, { timeout: 3000 });
      expect(toast).toHaveTextContent('Sync complete');
    });
  });

  // 6. THEME MANAGEMENT & VISUAL SYSTEM (Prompt 6 Requirement 3)
  describe('Theme Management & Visual System Modes', () => {
    beforeEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
      renderAuthenticatedApp();
    });

    it('switches between light, dark, and system modes and updates DOM data-theme attribute', () => {
      const lightBtn = screen.getByTestId('theme-light-btn');
      const darkBtn = screen.getByTestId('theme-dark-btn');
      const systemBtn = screen.getByTestId('theme-system-btn');

      // Click dark theme
      fireEvent.click(darkBtn);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('gramcare_theme')).toBe('dark');

      // Click light theme
      fireEvent.click(lightBtn);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('gramcare_theme')).toBe('light');

      // Click system theme
      fireEvent.click(systemBtn);
      expect(localStorage.getItem('gramcare_theme')).toBe('system');
    });

    it('persists theme selection across browser storage', () => {
      const darkBtn = screen.getByTestId('theme-dark-btn');
      fireEvent.click(darkBtn);
      expect(localStorage.getItem('gramcare_theme')).toBe('dark');
    });
  });

  // 7. DOCTOR & HEALTH WORKER ACTIVITY SURVEILLANCE (Prompt 6 Requirement 4)
  describe('Doctor & Health Worker Activity Surveillance', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
      fireEvent.click(screen.getByTestId('nav-doctor-activity'));
    });

    it('navigates to Doctor Activity view and displays aggregate reporter metrics', () => {
      expect(screen.getByTestId('doctor-activity-view')).toBeInTheDocument();

      // Validate 4 KPI cards
      const reportersStat = screen.getByTestId('doc-stat-reporters');
      expect(reportersStat).toHaveTextContent('8');

      const encountersStat = screen.getByTestId('doc-stat-encounters');
      expect(encountersStat).toHaveTextContent('153');

      const patientsStat = screen.getByTestId('doc-stat-unique-patients');
      expect(patientsStat).toHaveTextContent('125');

      const avgStat = screen.getByTestId('doc-stat-avg-encounters');
      expect(avgStat).toHaveTextContent('19.1');
    });

    it('filters reporting personnel by clinical role (Doctors vs CHWs)', () => {
      const roleSelect = screen.getByTestId('filter-doc-role');

      // Filter Doctors / Medical Officers (4 total: DOC-001 to DOC-004)
      fireEvent.change(roleSelect, { target: { value: 'Doctor' } });
      expect(screen.getByTestId('reporter-row-DOC-001')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-DOC-002')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-DOC-003')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-DOC-004')).toBeInTheDocument();
      expect(screen.queryByTestId('reporter-row-HW-001')).not.toBeInTheDocument();

      // Filter Community Health Workers / ANMs (4 total: HW-001 to HW-004)
      fireEvent.change(roleSelect, { target: { value: 'CHW' } });
      expect(screen.getByTestId('reporter-row-HW-001')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-HW-002')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-HW-003')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-HW-004')).toBeInTheDocument();
      expect(screen.queryByTestId('reporter-row-DOC-001')).not.toBeInTheDocument();
    });

    it('filters reporting personnel by village location', () => {
      const villageSelect = screen.getByTestId('filter-doc-village');

      // Village C has 3 personnel: DOC-001, HW-001, HW-002
      fireEvent.change(villageSelect, { target: { value: 'Village C' } });
      expect(screen.getByTestId('reporter-row-DOC-001')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-HW-001')).toBeInTheDocument();
      expect(screen.getByTestId('reporter-row-HW-002')).toBeInTheDocument();
      expect(screen.queryByTestId('reporter-row-DOC-002')).not.toBeInTheDocument();
    });

    it('searches reporting personnel by name or worker ID', () => {
      const searchInput = screen.getByTestId('doctor-search-input');

      // Search for specific Doctor ID
      fireEvent.change(searchInput, { target: { value: 'DOC-001' } });
      expect(screen.getByTestId('reporter-row-DOC-001')).toBeInTheDocument();
      expect(screen.queryByTestId('reporter-row-DOC-002')).not.toBeInTheDocument();

      // Search for specific CHW name
      fireEvent.change(searchInput, { target: { value: 'Sunita' } });
      expect(screen.getByTestId('reporter-row-HW-001')).toBeInTheDocument();
      expect(screen.queryByTestId('reporter-row-DOC-001')).not.toBeInTheDocument();
    });

    it('opens reporter detail modal with attributed clinical encounters and closes cleanly', () => {
      const viewBtn = screen.getByTestId('view-reporter-DOC-001');
      fireEvent.click(viewBtn);

      const modal = screen.getByTestId('reporter-detail-modal');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText('Dr. Rajesh Sharma')).toBeInTheDocument();
      expect(within(modal).getByText('Village C Primary Health Centre')).toBeInTheDocument();
      expect(within(modal).getByText('41')).toBeInTheDocument(); // 41 encounters
      expect(within(modal).getByText('37')).toBeInTheDocument(); // 37 unique patients

      // Close modal
      const closeBtn = within(modal).getByLabelText('Close reporter details');
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId('reporter-detail-modal')).not.toBeInTheDocument();
    });
  });

  // 8. UI DE-DUPLICATION & INFORMATION ARCHITECTURE (Prompt 6 Requirement 1 & 2)
  describe('UI De-duplication & Clean Surveillance Layout', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
    });

    it('keeps Overview clean without redundant duplicate map section', () => {
      expect(screen.getByTestId('stat-total-patients')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-trend-panel')).toBeInTheDocument();
      expect(screen.getByTestId('village-summary-panel')).toBeInTheDocument();

      // The Leaflet map panel should NOT be in the overview tab
      expect(screen.queryByTestId('map-tab-panel')).not.toBeInTheDocument();
    });

    it('renders the dedicated Geographic Map tab when navigated', () => {
      fireEvent.click(screen.getByTestId('nav-map'));
      expect(screen.getByTestId('map-tab-panel')).toBeInTheDocument();
    });
  });

  // 9. MULTILINGUAL SUPPORT & TRANSLATION COVERAGE (Prompt Section 5)
  describe('Multilingual Support & Urdu RTL Localization', () => {
    beforeEach(() => {
      localStorage.clear();
      document.documentElement.setAttribute('lang', 'en');
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.classList.remove('rtl-mode');
      renderAuthenticatedApp();
    });

    it('switches between all 4 supported languages (English, Hindi, Marathi, Urdu)', () => {
      const btnHi = screen.getByTestId('lang-btn-hi');
      const btnMr = screen.getByTestId('lang-btn-mr');
      const btnUr = screen.getByTestId('lang-btn-ur');
      const btnEn = screen.getByTestId('lang-btn-en');

      // 1. Switch to Hindi
      fireEvent.click(btnHi);
      expect(document.documentElement.getAttribute('lang')).toBe('hi');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      expect(localStorage.getItem('gramcare_lang')).toBe('hi');
      // Navigation should be localized
      expect(screen.getByTestId('nav-overview')).toHaveTextContent('अवलोकन');

      // 2. Switch to Marathi
      fireEvent.click(btnMr);
      expect(document.documentElement.getAttribute('lang')).toBe('mr');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      expect(localStorage.getItem('gramcare_lang')).toBe('mr');
      expect(screen.getByTestId('nav-overview')).toHaveTextContent('अवलोकन');

      // 3. Switch to Urdu (RTL)
      fireEvent.click(btnUr);
      expect(document.documentElement.getAttribute('lang')).toBe('ur');
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');
      expect(document.documentElement.classList.contains('rtl-mode')).toBe(true);
      expect(localStorage.getItem('gramcare_lang')).toBe('ur');
      expect(screen.getByTestId('nav-overview')).toHaveTextContent('جائزہ');

      // 4. Restore English (LTR)
      fireEvent.click(btnEn);
      expect(document.documentElement.getAttribute('lang')).toBe('en');
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      expect(document.documentElement.classList.contains('rtl-mode')).toBe(false);
      expect(localStorage.getItem('gramcare_lang')).toBe('en');
      expect(screen.getByTestId('nav-overview')).toHaveTextContent('Overview');
    });

    it('preserves filter state and navigation across language changes', () => {
      // Navigate to Field Visits and apply a filter
      fireEvent.click(screen.getByTestId('nav-cases'));
      const villageSelect = screen.getByTestId('filter-village-select');
      fireEvent.change(villageSelect, { target: { value: 'Village C' } });

      // Change language to Hindi
      fireEvent.click(screen.getByTestId('lang-btn-hi'));

      // Check that we are still on the Field Visits view and Village C filter is preserved
      expect(screen.getByTestId('cases-panel')).toBeInTheDocument();
      expect(screen.getByTestId('filter-village-select')).toHaveValue('Village C');

      // Change to Urdu
      fireEvent.click(screen.getByTestId('lang-btn-ur'));
      expect(screen.getByTestId('cases-panel')).toBeInTheDocument();
      expect(screen.getByTestId('filter-village-select')).toHaveValue('Village C');
    });

    it('translates Login Screen elements and maintains login capabilities in all languages', () => {
      // Log out to inspect Login screen
      fireEvent.click(screen.getByTestId('logout-button'));
      expect(screen.getByTestId('login-screen')).toBeInTheDocument();

      // Switch language on login screen to Hindi
      fireEvent.click(screen.getByTestId('lang-btn-hi'));
      expect(screen.getByText('डैशबोर्ड में साइन इन करें')).toBeInTheDocument();

      // Switch to Urdu
      fireEvent.click(screen.getByTestId('lang-btn-ur'));
      expect(screen.getByText('ڈیش بورڈ میں داخل ہوں')).toBeInTheDocument();
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');

      // Auto-fill and submit works seamlessly in Urdu
      fireEvent.click(screen.getByTestId('auto-fill-demo-creds'));
      fireEvent.click(screen.getByTestId('login-submit-button'));

      waitFor(() => {
        expect(screen.getByTestId('dashboard-portal')).toBeInTheDocument();
      });
    });
  });

  // 10. DETAILED CLINICAL & LONGITUDINAL MODALS (Prompt Section 4)
  describe('Clinical & Longitudinal Detail Modals', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
    });

    it('opens and closes Encounter Clinical Details modal in Field Visits', () => {
      fireEvent.click(screen.getByTestId('nav-cases'));

      // Click Details on the first encounter in the paginated table
      const inspectButtons = screen.getAllByTestId(/^inspect-visit-/);
      fireEvent.click(inspectButtons[0]);

      const modal = screen.getByTestId('encounter-detail-modal');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(within(modal).getByText('Encounter Clinical Details')).toBeInTheDocument();

      // Close modal
      const closeBtn = within(modal).getByLabelText('Close encounter details');
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId('encounter-detail-modal')).not.toBeInTheDocument();
    });

    it('opens and closes Patient Longitudinal History modal in Patient Registry', () => {
      fireEvent.click(screen.getByTestId('nav-patients'));

      // Click View History on patient GC-P0001
      const historyBtn = screen.getByTestId('view-history-GC-P0001');
      fireEvent.click(historyBtn);

      const modal = screen.getByTestId('patient-history-modal');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(within(modal).getAllByText('GC-P0001').length).toBeGreaterThanOrEqual(1);
      expect(within(modal).getAllByText('Village A').length).toBeGreaterThanOrEqual(1);

      // Close modal
      const closeBtn = within(modal).getByLabelText('Close patient history');
      fireEvent.click(closeBtn);
      expect(screen.queryByTestId('patient-history-modal')).not.toBeInTheDocument();
    });
  });

  // 11. COMPACT SURVEILLANCE MAP PREVIEW & GIS WORKSPACE (Prompt Section 7)
  describe('Surveillance Map & Regional Overview Preview', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
    });

    it('renders compact regional surveillance map preview on Overview tab', () => {
      expect(screen.getByTestId('compact-map-preview')).toBeInTheDocument();
      expect(screen.getByText('Regional Surveillance Map Preview')).toBeInTheDocument();

      // Clicking "Open full GIS map" switches to the dedicated Map tab
      const openFullBtn = screen.getByTestId('open-full-map-btn');
      fireEvent.click(openFullBtn);
      expect(screen.getByTestId('map-tab-panel')).toBeInTheDocument();
    });

    it('renders full illustrated GIS workspace with village profile cards and selectors', () => {
      fireEvent.click(screen.getByTestId('nav-map'));
      expect(screen.getByTestId('village-map')).toBeInTheDocument();
      expect(screen.getByTestId('village-details-card')).toBeInTheDocument();

      // Select Village A button
      const btnVillageA = screen.getByTestId('select-map-village-VIL-01');
      fireEvent.click(btnVillageA);

      const detailsCard = screen.getByTestId('village-details-card');
      expect(within(detailsCard).getByText('Village A')).toBeInTheDocument();
      expect(within(detailsCard).getByText('3')).toBeInTheDocument(); // 3 active cases
    });
  });

  // 12. RECENT ENCOUNTERS & CSV EXPORT (Prompt Section 4 & 9)
  describe('Recent Encounters Preview & CSV Export', () => {
    beforeEach(() => {
      renderAuthenticatedApp();
    });

    it('renders recent field encounters preview on the Overview tab', () => {
      expect(screen.getByTestId('recent-visits-panel')).toBeInTheDocument();
      expect(screen.getByText('Recent Field Encounters')).toBeInTheDocument();
    });
  });
});
