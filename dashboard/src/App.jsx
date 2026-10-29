import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Download,
  Filter,
  HeartPulse,
  Info,
  LayoutDashboard,
  MapPin,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
  X,
  FileText,
  Map as MapIcon,
  AlertCircle,
  LogOut,
  UserCheck,
  UserPlus,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  History
} from 'lucide-react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import {
  WEEKLY_TREND,
  VILLAGES,
  SEED_ALERTS,
  PATIENTS,
  VISITS,
  REPORTERS,
  ALL_SYMPTOMS,
  getSummaryMetrics,
  getVillageSummaries,
  SURVEILLANCE_METADATA
} from './data/canonicalData';
import VillageMap from './components/VillageMap';
import LoginScreen from './components/LoginScreen';
import DoctorActivityView from './components/DoctorActivityView';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import EncounterDetailModal from './components/EncounterDetailModal';
import PatientHistoryModal from './components/PatientHistoryModal';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { getActiveSession, logoutDemoUser } from './auth/demoAuth';

function StatCard({ label, value, note, icon, tone, testId }) {
  return (
    <article className="stat-card" data-testid={testId}>
      <div className="stat-top">
        <span>{label}</span>
        <span className={'icon-box ' + (tone || 'green')}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{note}</div>
    </article>
  );
}

function MainDashboard() {
  const { isDark } = useTheme();
  const { t, lang, isRtl } = useLanguage();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getActiveSession());

  // Navigation Tabs: 'Overview' | 'Cases' | 'Patients' | 'Doctor Activity' | 'Alerts' | 'Map'
  const [activeTab, setActiveTab] = useState('Overview');

  // Filter States for Cases / Visits
  const [scopeFilter, setScopeFilter] = useState('ActiveSurveillance'); // 'ActiveSurveillance' or 'AllEncounters'
  const [periodFilter, setPeriodFilter] = useState('All periods');
  const [villageFilter, setVillageFilter] = useState('All villages');
  const [symptomFilter, setSymptomFilter] = useState('All symptoms');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Sorting for Cases Table
  const [casesPage, setCasesPage] = useState(1);
  const [casesSortBy, setCasesSortBy] = useState('visit_date');
  const [casesSortOrder, setCasesSortOrder] = useState('desc');
  const casesPageSize = 12;

  // Pagination & Filter for Patients Registry
  const [patientsPage, setPatientsPage] = useState(1);
  const [patientsVillageFilter, setPatientsVillageFilter] = useState('All villages');
  const [patientsSearch, setPatientsSearch] = useState('');
  const patientsPageSize = 12;

  // Persistent Demo Data State (Preserved across user sessions)
  const [patients, setPatients] = useState(PATIENTS);
  const [visits, setVisits] = useState(VISITS);
  const [alerts, setAlerts] = useState(SEED_ALERTS);

  // Selected item modals
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState(null);

  // Simulation & UI States
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Authentication handlers
  function handleLoginSuccess(user) {
    setCurrentUser(user);
    notify(t('common.welcomeOfficer', { name: user.name, id: user.id }));
  }

  function handleLogout() {
    logoutDemoUser();
    setCurrentUser(null);
    notify(t('common.loggedOut'));
  }

  // Filtered visits calculation
  const filteredVisits = useMemo(() => {
    return visits
      .filter((v) => {
        // Scope filter: Active canonical surge (27 cases) vs All cohort encounters (153)
        if (scopeFilter === 'ActiveSurveillance' && !v.is_active_surveillance) {
          return false;
        }

        const matchVillage = villageFilter === 'All villages' || v.village === villageFilter;
        const matchPeriod = periodFilter === 'All periods' || v.week === periodFilter;
        const matchSymptom =
          symptomFilter === 'All symptoms' ||
          v.symptoms.some((s) => s.toLowerCase() === symptomFilter.toLowerCase());

        const queryTarget = [
          v.id,
          v.patient_id,
          v.village,
          v.reporter_name,
          v.reported_by,
          v.possible_condition,
          ...v.symptoms
        ].join(' ').toLowerCase();

        const matchQuery = !searchQuery || queryTarget.includes(searchQuery.toLowerCase());

        return matchVillage && matchPeriod && matchSymptom && matchQuery;
      })
      .sort((a, b) => {
        let valA = a[casesSortBy] || '';
        let valB = b[casesSortBy] || '';
        if (valA < valB) return casesSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return casesSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [visits, scopeFilter, villageFilter, periodFilter, symptomFilter, searchQuery, casesSortBy, casesSortOrder]);

  const totalCasesPages = Math.ceil(filteredVisits.length / casesPageSize) || 1;
  const paginatedVisits = useMemo(() => {
    const start = (casesPage - 1) * casesPageSize;
    return filteredVisits.slice(start, start + casesPageSize);
  }, [filteredVisits, casesPage, casesPageSize]);

  // Filtered patients for registry
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchV = patientsVillageFilter === 'All villages' || p.village === patientsVillageFilter;
      const matchQ =
        !patientsSearch ||
        [p.patient_id, p.village, p.gender].join(' ').toLowerCase().includes(patientsSearch.toLowerCase());
      return matchV && matchQ;
    });
  }, [patients, patientsVillageFilter, patientsSearch]);

  const totalPatientsPages = Math.ceil(filteredPatients.length / patientsPageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (patientsPage - 1) * patientsPageSize;
    return filteredPatients.slice(start, start + patientsPageSize);
  }, [filteredPatients, patientsPage, patientsPageSize]);

  // Recent 4 field encounters for the Overview tab preview
  const recentEncounters = useMemo(() => {
    return [...visits]
      .sort((a, b) => (a.visit_date < b.visit_date ? 1 : -1))
      .slice(0, 4);
  }, [visits]);

  // Dynamic summary metrics and village aggregates
  const summary = useMemo(() => getSummaryMetrics(visits, alerts, patients), [visits, alerts, patients]);
  const villageSummaries = useMemo(() => getVillageSummaries(patients, visits), [patients, visits]);

  function notify(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }

  function handleSync() {
    if (!isOnline) {
      setErrorMessage(t('common.syncOfflineNotice'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const pendingCount = summary.pendingSync;
      setVisits((prev) =>
        prev.map((c) => (c.sync_status === 'Pending' ? { ...c, sync_status: 'Synced' } : c))
      );
      setIsLoading(false);
      notify(t('common.syncComplete', { count: pendingCount }));
    }, 600);
  }

  function handleRefresh() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      notify('Surveillance stream updated to latest timestamp.');
    }, 450);
  }

  function toggleAlertStatus(alertId) {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === alertId) {
          const nextStatus = a.status === 'Reviewed' ? 'Needs review' : 'Reviewed';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  }

  function resetFilters() {
    setScopeFilter('ActiveSurveillance');
    setVillageFilter('All villages');
    setPeriodFilter('All periods');
    setSymptomFilter('All symptoms');
    setSearchQuery('');
    setCasesPage(1);
  }

  function exportCsv() {
    const headers = [
      'Encounter ID',
      'Patient ID',
      'Village',
      'Reported By',
      'Role',
      'Symptoms',
      'Condition',
      'Week',
      'Date',
      'Sync',
    ];
    const rows = filteredVisits.map((v) => [
      v.id,
      v.patient_id,
      v.village,
      v.reporter_name || v.reported_by,
      v.reporter_role || 'Field Staff',
      `"${v.symptoms.join(', ')}"`,
      `"${v.possible_condition}"`,
      v.week,
      v.visit_date,
      v.sync_status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `gramcare_surveillance_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(t('common.exportedNotice', { count: filteredVisits.length }));
  }

  // Adaptive theme colors for Recharts
  const chartTextColor = isDark ? '#9db1a2' : '#5a685c';
  const chartGridColor = isDark ? '#26362c' : '#e2e8e0';
  const chartTooltipStyle = {
    backgroundColor: isDark ? '#1a251e' : '#ffffff',
    borderColor: isDark ? '#33483b' : '#ced7cc',
    color: isDark ? '#e6ede7' : '#19241c',
    borderRadius: '8px',
    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.08)',
  };

  // If user is not authenticated, render Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell" data-testid="dashboard-portal">
      {/* PERSISTENT DEMO & REGULATORY BANNER */}
      <div className="demo-persistent-banner" data-testid="persistent-demo-banner">
        <span className="demo-badge">{t('common.demoBadge')}</span>
        <span className="demo-text">
          {t('common.demoBanner', {
            patients: summary.totalPatients,
            visits: summary.totalVisits,
            reporters: REPORTERS.length,
          })}
        </span>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${mobileNavOpen ? 'mobile-open' : ''}`} data-testid="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <HeartPulse size={22} />
          </div>
          <div>
            <strong>GramCare AI</strong>
            <small>SURVEILLANCE SUITE</small>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">{t('nav.modules')}</div>

        <nav>
          <button
            className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Overview'); setMobileNavOpen(false); }}
            data-testid="nav-overview"
          >
            <LayoutDashboard size={17} />
            <span>{t('nav.overview')}</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'Cases' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Cases'); setMobileNavOpen(false); }}
            data-testid="nav-cases"
          >
            <Users size={17} />
            <span>{t('nav.cases')}</span>
            <b className="ltr-protect">{visits.length}</b>
          </button>
          <button
            className={`nav-item ${activeTab === 'Patients' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Patients'); setMobileNavOpen(false); }}
            data-testid="nav-patients"
          >
            <UserCheck size={17} />
            <span>{t('nav.patients')}</span>
            <b className="ltr-protect">{patients.length}</b>
          </button>
          <button
            className={`nav-item ${activeTab === 'Doctor Activity' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Doctor Activity'); setMobileNavOpen(false); }}
            data-testid="nav-doctor-activity"
          >
            <Stethoscope size={17} />
            <span>{t('nav.doctors')}</span>
            <b className="doc-count-pill ltr-protect">{REPORTERS.length}</b>
          </button>
          <button
            className={`nav-item ${activeTab === 'Alerts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Alerts'); setMobileNavOpen(false); }}
            data-testid="nav-alerts"
          >
            <Bell size={17} />
            <span>{t('nav.alerts')}</span>
            {summary.activeAlerts > 0 && <b className="alert-count-pill ltr-protect">{summary.activeAlerts}</b>}
          </button>
          <button
            className={`nav-item ${activeTab === 'Map' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Map'); setMobileNavOpen(false); }}
            data-testid="nav-map"
          >
            <MapIcon size={17} />
            <span>{t('nav.map')}</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        {/* FIELD AGENT SYNC CARD */}
        <div className="field-card">
          <div className="field-card-top">
            <span className="pulse-dot" />
            {t('common.fieldSyncQueue')}
          </div>
          <strong>{t('common.pendingRecords', { count: summary.pendingSync })}</strong>
          <p>{t('common.offlineSyncDesc')}</p>
          <button
            className="network-toggle"
            onClick={() => {
              setIsOnline((prev) => !prev);
              notify(isOnline ? 'Simulating Field Offline Mode' : 'Simulating Connectivity Restored');
            }}
            data-testid="toggle-network"
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{t('common.networkStatus', { status: isOnline ? t('common.online') : t('common.offline') })}</span>
          </button>
        </div>

        {/* LOGGED IN USER & LOGOUT CONTROL */}
        <div className="sidebar-footer" data-testid="user-profile-section">
          <div className="avatar">MO</div>
          <div className="user-details">
            <strong data-testid="logged-in-user-id" className="ltr-protect">{currentUser.id}</strong>
            <small>{currentUser.name}</small>
          </div>
          <button
            className="logout-button"
            onClick={handleLogout}
            title={t('common.logout')}
            data-testid="logout-button"
            aria-label="Logout"
          >
            <LogOut size={16} className="icon-flip-rtl" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumbs">
              <span>Surveillance</span> / <strong>{activeTab}</strong>
            </div>
          </div>

          <div className="topbar-right">
            {/* MULTILINGUAL SELECTOR (Requirement 5) */}
            <LanguageSelector compact={true} />

            {/* THEME TOGGLE (Requirement 6) */}
            <ThemeToggle />

            <span className="auth-badge" data-testid="topbar-user-badge">
              <UserCheck size={13} />
              <span>{t('common.officer')}: <strong className="ltr-protect">{currentUser.id}</strong></span>
            </span>

            <span className={`network-pill ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isOnline ? t('common.online') : t('common.offline')}
            </span>

            <button
              className="button secondary icon-only-mobile"
              onClick={handleRefresh}
              disabled={isLoading}
              title={t('common.refresh')}
              data-testid="refresh-button"
            >
              <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
              <span className="btn-text">{t('common.refresh')}</span>
            </button>

            <button
              className="button primary"
              onClick={handleSync}
              disabled={isLoading}
              data-testid="sync-button"
            >
              <Activity size={14} />
              <span>{t('common.sync')}</span>
              {summary.pendingSync > 0 && <span className="button-count ltr-protect">{summary.pendingSync}</span>}
            </button>

            <button
              className="icon-button logout-top-btn"
              onClick={handleLogout}
              title={t('common.logout')}
              aria-label="Logout from topbar"
              data-testid="topbar-logout-button"
            >
              <LogOut size={16} className="icon-flip-rtl" />
            </button>
          </div>
        </header>

        {/* ERROR STATE BANNER */}
        {errorMessage && (
          <div className="error-banner" data-testid="error-banner">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} aria-label="Dismiss error">
              <X size={15} />
            </button>
          </div>
        )}

        {/* LOADING STATE BANNER */}
        {isLoading && (
          <div className="loading-state-banner" data-testid="loading-state">
            <RefreshCw size={16} className="spinning" />
            <span>{t('common.loading')}</span>
          </div>
        )}

        {/* MAIN BODY CONTENT ROUTED BY TAB */}
        <main className="content">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'Overview' && (
            <>
              {/* SECTION HEADER */}
              <div className="section-header">
                <div>
                  <h1>{t('overview.title')}</h1>
                  <p className="section-subtitle">{t('overview.pageSubtitle')}</p>
                </div>
                <div className="header-actions">
                  <button className="button secondary" onClick={exportCsv}>
                    <Download size={14} /> {t('common.exportCsv')}
                  </button>
                </div>
              </div>

              {/* OVERVIEW STATS GRID (Requirement 4 Overview) */}
              <section className="stats-grid">
                <StatCard
                  label={t('overview.kpiPatients')}
                  value={summary.totalPatients}
                  note={t('overview.kpiPatientsNote')}
                  icon={<UserPlus size={17} />}
                  tone="green"
                  testId="stat-total-patients"
                />
                <StatCard
                  label={t('overview.kpiVisits')}
                  value={summary.totalVisits}
                  note={t('overview.kpiVisitsNote')}
                  icon={<Users size={17} />}
                  tone="green"
                  testId="stat-total-cases"
                />
                <StatCard
                  label={t('overview.kpiTrajectory')}
                  value="5 → 7 → 15"
                  note={t('overview.kpiTrajectoryNote')}
                  icon={<ArrowUpRight size={17} className="icon-flip-rtl" />}
                  tone="amber"
                  testId="stat-weekly-trend"
                />
                <StatCard
                  label={t('overview.kpiAlerts')}
                  value={summary.activeAlerts}
                  note={t('overview.kpiAlertsNote', { active: summary.activeAlerts, reviewed: summary.reviewedAlerts })}
                  icon={<AlertTriangle size={17} />}
                  tone={summary.activeAlerts > 0 ? 'amber' : 'green'}
                  testId="stat-active-alerts"
                />
              </section>

              {/* MID GRID: WEEKLY TREND CHART & VILLAGE SUMMARY */}
              <div className="overview-grid">
                {/* WEEKLY TREND CHART */}
                <section className="panel" data-testid="weekly-trend-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t('overview.trendTitle')}</h2>
                      <p>{t('overview.trendSubtitle')}</p>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i className="legend-dot green-dot" /> {t('overview.observedCases')}
                    </span>
                    <span>
                      <i className="legend-dot gray-dot" /> {t('overview.baselineThreshold')}
                    </span>
                  </div>
                  <div className="trend-chart" style={{ height: 230, width: '100%', direction: 'ltr' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={WEEKLY_TREND} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: chartTextColor }} />
                        <YAxis tick={{ fontSize: 11, fill: chartTextColor }} domain={[0, 18]} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Area
                          type="monotone"
                          dataKey="cases"
                          name="Observed Cases"
                          stroke="#25845a"
                          fill="#25845a22"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="baseline"
                          name="Normal Baseline"
                          stroke={isDark ? '#708375' : '#9aa39a'}
                          strokeDasharray="4 4"
                          fill="transparent"
                          strokeWidth={1.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-caption">
                    <span className="trend up">
                      <ArrowUpRight size={14} className="icon-flip-rtl" /> +114% Week 2 to Week 3
                    </span>
                    <span>{t('overview.trendCaption')}</span>
                  </div>
                </section>

                {/* VILLAGE CASE SUMMARY */}
                <section className="panel" data-testid="village-summary-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t('overview.villageSummaryTitle')}</h2>
                      <p>{t('overview.villageSummarySubtitle')}</p>
                    </div>
                  </div>
                  <div className="village-list">
                    {villageSummaries.map((v) => {
                      const isHotspot = v.id === 'VIL-03';
                      const percentage = Math.round((v.activeCases / 18) * 100);
                      return (
                        <div key={v.id} className="village-row" data-testid={`village-summary-${v.id}`}>
                          <div className={`village-icon ${isHotspot ? 'hotspot' : ''}`}>
                            <MapPin size={16} />
                          </div>
                          <div className="village-meta">
                            <div className="village-name-line">
                              <strong>{v.name}</strong>
                              <span className={`status-pill ${isHotspot ? 'hotspot' : 'normal'}`}>
                                {v.status}
                              </span>
                            </div>
                            <small>{v.patientCount} patients · {v.visitCount} total visits ({v.activeCases} {t('overview.activeSurgeNote')})</small>
                            <span className="bar-track">
                              <i
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: isHotspot ? '#d9534f' : '#57a579'
                                }}
                              />
                            </span>
                          </div>
                          <div className="village-count">
                            <span className="ltr-protect">{v.activeCases}</span>
                            <small>{t('overview.activeSurgeNote')}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="panel-note">
                    <Info size={13} />
                    <span>{t('overview.oracleCheck')}</span>
                  </div>
                </section>
              </div>

              {/* OVERVIEW PREVIEWS: COMPACT REGIONAL MAP + RECENT VISITS */}
              <div className="overview-grid" style={{ marginTop: '16px' }}>
                {/* COMPACT MAP PREVIEW */}
                <VillageMap
                  compact={true}
                  onOpenFullMap={() => setActiveTab('Map')}
                  onSelectVillage={(v) => {
                    setVillageFilter(v);
                    setActiveTab('Cases');
                  }}
                />

                {/* RECENT FIELD VISITS PREVIEW (Requirement 4 Overview) */}
                <section className="panel" data-testid="recent-visits-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t('overview.recentVisitsTitle')}</h2>
                      <p>{t('overview.recentVisitsSubtitle')}</p>
                    </div>
                    <button className="text-button" onClick={() => setActiveTab('Cases')}>
                      {t('overview.viewAllVisits')}
                    </button>
                  </div>

                  <div className="recent-visits-list">
                    {recentEncounters.map((enc) => (
                      <div
                        key={enc.id}
                        className="recent-visit-row"
                        onClick={() => setSelectedEncounter(enc)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view encounter details"
                      >
                        <div className="recent-visit-main">
                          <strong className="case-id ltr-protect">{enc.id}</strong>
                          <span className="patient-tag ltr-protect">{enc.patient_id}</span>
                          <span className={`village-pill ${enc.village === 'Village C' ? 'hotspot' : ''}`}>
                            {enc.village}
                          </span>
                        </div>
                        <div className="recent-visit-symptoms">
                          {enc.symptoms.slice(0, 2).map((s) => (
                            <span key={s} className="symptom-micro-pill">{s}</span>
                          ))}
                        </div>
                        <div className="recent-visit-meta">
                          <span className="date-cell ltr-protect">{enc.visit_date}</span>
                          <span className={`sync-status ${enc.sync_status.toLowerCase()}`}>{enc.sync_status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* BOTTOM SECTION: POTENTIAL ALERTS & DOMINANT SYMPTOMS */}
              <div className="bottom-grid" style={{ marginTop: '16px' }}>
                {/* POTENTIAL CLUSTER ALERTS */}
                <section className="panel" data-testid="alerts-summary-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t('overview.alertsTitle')}</h2>
                      <p>{t('overview.alertsSubtitle')}</p>
                    </div>
                    <button className="text-button" onClick={() => setActiveTab('Alerts')}>
                      {t('overview.viewAllAlerts')}
                    </button>
                  </div>

                  {alerts.map((a) => (
                    <div className="alert-row" key={a.id} data-testid={`alert-row-${a.id}`}>
                      <span className={'alert-symbol ' + a.severity.toLowerCase()}>
                        <AlertTriangle size={18} />
                      </span>
                      <div className="alert-copy">
                        <strong>{a.title}</strong>
                        <p>
                          <MapPin size={12} /> {a.village} · {a.cases} contributing cases · {a.time}
                        </p>
                      </div>
                      <span className={'severity ' + a.severity.toLowerCase()}>{a.severity}</span>
                      <button
                        className="button secondary small-button"
                        onClick={() => setSelectedAlert(a)}
                        data-testid={`inspect-alert-${a.id}`}
                      >
                        {t('overview.inspectEvidence')}
                      </button>
                      <button
                        className={`button ${a.status === 'Reviewed' ? 'secondary' : 'primary'} small-button`}
                        onClick={() => toggleAlertStatus(a.id)}
                        data-testid={`toggle-status-${a.id}`}
                      >
                        {a.status === 'Reviewed' ? t('overview.reopenReview') : t('overview.markReviewed')}
                      </button>
                    </div>
                  ))}

                  {/* ABSENCE OF ALERTS CONFIRMATION */}
                  <div className="baseline-no-alert-note" data-testid="baseline-unflagged-note">
                    <ShieldCheck size={14} />
                    <span>{t('overview.baselineNote')}</span>
                  </div>
                </section>

                {/* SYMPTOM GROUP OVERVIEW */}
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>{t('overview.symptomBreakdownTitle')}</h2>
                      <p>{t('overview.symptomBreakdownSubtitle')}</p>
                    </div>
                  </div>
                  <div className="mix-chart" style={{ height: 180, width: '100%', direction: 'ltr' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Watery Diarrhoea', count: 20 },
                          { name: 'Abdominal Cramps', count: 14 },
                          { name: 'Dehydration', count: 8 },
                          { name: 'Fever', count: 5 },
                          { name: 'Cough', count: 3 },
                        ]}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: chartTextColor }}
                        />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Cell key={i} fill={['#d9534f', '#e67e22', '#f39c12', '#25845a', '#3498db'][i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="panel-note">
                    <span>Dominant cluster: Gastrointestinal symptoms concentrated in Villages C & D.</span>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* TAB 2: FIELD VISITS TABLE */}
          {activeTab === 'Cases' && (
            <section className="panel records-panel" data-testid="cases-panel">
              <div className="section-header-compact">
                <div>
                  <h2>{t('visits.title')}</h2>
                  <p className="section-subtitle">{t('visits.subtitle')}</p>
                </div>
                <button className="button secondary small-button" onClick={exportCsv}>
                  <Download size={13} /> {t('common.exportCsv')}
                </button>
              </div>

              <div className="records-toolbar">
                <div className="search-wrap">
                  <Search size={16} />
                  <input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCasesPage(1); }}
                    placeholder={t('visits.searchPlaceholder')}
                    aria-label="Search cases"
                    data-testid="cases-search-input"
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* FILTERS */}
                <div className="filters">
                  <Filter size={15} />

                  <select
                    value={scopeFilter}
                    onChange={(e) => { setScopeFilter(e.target.value); setCasesPage(1); }}
                    aria-label="Filter surveillance scope"
                    data-testid="filter-scope-select"
                  >
                    <option value="ActiveSurveillance">{t('visits.scopeSurge')}</option>
                    <option value="AllEncounters">{t('visits.scopeAll')}</option>
                  </select>

                  <select
                    value={villageFilter}
                    onChange={(e) => { setVillageFilter(e.target.value); setCasesPage(1); }}
                    aria-label="Filter by village"
                    data-testid="filter-village-select"
                  >
                    <option value="All villages">{t('common.allVillages')}</option>
                    <option value="Village A">Village A</option>
                    <option value="Village B">Village B</option>
                    <option value="Village C">Village C</option>
                    <option value="Village D">Village D</option>
                  </select>

                  <select
                    value={periodFilter}
                    onChange={(e) => { setPeriodFilter(e.target.value); setCasesPage(1); }}
                    aria-label="Filter by period"
                    data-testid="filter-period-select"
                  >
                    <option value="All periods">{t('common.allPeriods')}</option>
                    <option value="Week 1">Week 1 (5 cases)</option>
                    <option value="Week 2">Week 2 (7 cases)</option>
                    <option value="Week 3">Week 3 (15 cases)</option>
                    <option value="Historical">Historical Baseline</option>
                  </select>

                  <select
                    value={symptomFilter}
                    onChange={(e) => { setSymptomFilter(e.target.value); setCasesPage(1); }}
                    aria-label="Filter by symptom"
                    data-testid="filter-symptom-select"
                  >
                    <option value="All symptoms">{t('common.allSymptoms')}</option>
                    {ALL_SYMPTOMS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <button className="button secondary" onClick={resetFilters} title="Reset filters">
                    {t('common.reset')}
                  </button>
                </div>
              </div>

              {/* VISIBLE RESULT COUNTS */}
              <div className="results-count" style={{ padding: '0 0 12px 4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                {t('common.showingRecords', { shown: filteredVisits.length, total: visits.length })}
              </div>

              {/* TABLE */}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => setCasesSortOrder(casesSortOrder === 'asc' ? 'desc' : 'asc')} style={{ cursor: 'pointer' }}>
                        {t('visits.colEncounterId')} <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: 4 }} />
                      </th>
                      <th>{t('visits.colPatientId')}</th>
                      <th>{t('visits.colVillage')}</th>
                      <th>{t('visits.colReporter')}</th>
                      <th>{t('visits.colSymptoms')}</th>
                      <th>{t('visits.colCondition')}</th>
                      <th>{t('visits.colWeek')}</th>
                      <th>{t('visits.colDate')}</th>
                      <th>{t('visits.colSync')}</th>
                      <th>{t('visits.colActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVisits.map((v) => (
                      <tr key={v.id} data-testid={`case-row-${v.id}`}>
                        <td>
                          <strong className="case-id ltr-protect">{v.id}</strong>
                          <small>{v.is_active_surveillance ? t('common.activeSurgeBadge') : t('common.routineBadge')}</small>
                        </td>
                        <td>
                          <strong className="ltr-protect">{v.patient_id}</strong>
                          <small>{v.gender}, {v.age}y</small>
                        </td>
                        <td>
                          <span className={`village-tag ${v.village === 'Village C' && v.is_active_surveillance ? 'hotspot' : ''}`}>
                            {v.village}
                          </span>
                        </td>
                        <td>
                          <strong className="reporter-cell-name">{v.reporter_name}</strong>
                          <small className="ltr-protect">{v.reported_by} · {v.reporter_role}</small>
                        </td>
                        <td>
                          <div className="symptom-pills">
                            {v.symptoms.map((s) => (
                              <span key={s}>{s}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="condition-label">{v.possible_condition}</span>
                          <small className="ai-confidence">
                            {Math.round(v.confidence * 100)}% conf.
                          </small>
                        </td>
                        <td>{v.week}</td>
                        <td><span className="date-cell ltr-protect">{v.visit_date}</span></td>
                        <td>
                          <span className={`sync-status ${v.sync_status.toLowerCase()}`}>
                            {v.sync_status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="button secondary small-button"
                            onClick={() => setSelectedEncounter(v)}
                            title="Inspect encounter clinical details"
                            data-testid={`inspect-visit-${v.id}`}
                          >
                            <Eye size={12} />
                            <span>{t('common.details')}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* EMPTY STATE */}
                {filteredVisits.length === 0 && (
                  <div className="empty-state" data-testid="empty-cases-state">
                    <p>{t('visits.empty')}</p>
                    <button className="button secondary" onClick={resetFilters}>
                      {t('visits.clearFilters')}
                    </button>
                  </div>
                )}
              </div>

              {/* PAGINATION FOOTER */}
              <div className="table-footer">
                <span>
                  {t('common.showingRecords', { shown: paginatedVisits.length, total: filteredVisits.length })} ({t('common.pageOf', { page: casesPage, total: totalCasesPages })})
                </span>
                <div className="pagination-controls">
                  <button
                    className="button secondary small-button"
                    onClick={() => setCasesPage((p) => Math.max(1, p - 1))}
                    disabled={casesPage === 1}
                  >
                    <ChevronLeft size={14} className="icon-flip-rtl" /> {t('common.prev')}
                  </button>
                  <button
                    className="button secondary small-button"
                    onClick={() => setCasesPage((p) => Math.min(totalCasesPages, p + 1))}
                    disabled={casesPage === totalCasesPages}
                  >
                    {t('common.next')} <ChevronRight size={14} className="icon-flip-rtl" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: PATIENTS REGISTRY */}
          {activeTab === 'Patients' && (
            <section className="panel records-panel" data-testid="patients-panel">
              <div className="section-header-compact">
                <div>
                  <h2>{t('patients.title')}</h2>
                  <p className="section-subtitle">{t('patients.subtitle')}</p>
                </div>
              </div>

              <div className="results-count" style={{ padding: '0 0 12px 4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>Total Registered Fictional Patients: {patients.length} (≥120 required)</span>
                <span> · Distinct IDs GC-P0001 to GC-P0125</span>
              </div>

              <div className="records-toolbar">
                <div className="search-wrap">
                  <Search size={16} />
                  <input
                    value={patientsSearch}
                    onChange={(e) => { setPatientsSearch(e.target.value); setPatientsPage(1); }}
                    placeholder={t('patients.searchPlaceholder')}
                    aria-label="Search patients"
                    data-testid="patients-search-input"
                  />
                  {patientsSearch && (
                    <button className="clear-search" onClick={() => setPatientsSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="filters">
                  <Filter size={15} />
                  <select
                    value={patientsVillageFilter}
                    onChange={(e) => { setPatientsVillageFilter(e.target.value); setPatientsPage(1); }}
                    aria-label="Filter patients by village"
                    data-testid="filter-patients-village"
                  >
                    <option value="All villages">{t('common.allVillages')} ({patients.length})</option>
                    <option value="Village A">Village A (28)</option>
                    <option value="Village B">Village B (30)</option>
                    <option value="Village C">Village C (45)</option>
                    <option value="Village D">Village D (22)</option>
                  </select>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('patients.colPatientId')}</th>
                      <th>{t('patients.colVillage')}</th>
                      <th>{t('patients.colAge')}</th>
                      <th>{t('patients.colGender')}</th>
                      <th>{t('patients.colRegDate')}</th>
                      <th>{t('patients.colVisits')}</th>
                      <th>{t('patients.colActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPatients.map((p) => {
                      const pVisits = visits.filter((v) => v.patient_id === p.patient_id);
                      return (
                        <tr key={p.patient_id} data-testid={`patient-row-${p.patient_id}`}>
                          <td>
                            <strong className="case-id ltr-protect">{p.patient_id}</strong>
                            <small>Fictional Identifier</small>
                          </td>
                          <td>{p.village}</td>
                          <td>{t('patients.yearsOld', { age: p.age })}</td>
                          <td>{p.gender}</td>
                          <td><span className="date-cell ltr-protect">{p.registered_date}</span></td>
                          <td>
                            <span className="button-count ltr-protect">{t('patients.visitsCount', { count: pVisits.length })}</span>
                          </td>
                          <td>
                            <button
                              className="button secondary small-button"
                              onClick={() => setSelectedPatientForHistory(p)}
                              title="Inspect longitudinal encounter history"
                              data-testid={`view-history-${p.patient_id}`}
                            >
                              <History size={12} />
                              <span>{t('patients.viewHistory')}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  {t('common.showingPatients', { shown: paginatedPatients.length, total: filteredPatients.length })} ({t('common.pageOf', { page: patientsPage, total: totalPatientsPages })})
                </span>
                <div className="pagination-controls">
                  <button
                    className="button secondary small-button"
                    onClick={() => setPatientsPage((p) => Math.max(1, p - 1))}
                    disabled={patientsPage === 1}
                  >
                    <ChevronLeft size={14} className="icon-flip-rtl" /> {t('common.prev')}
                  </button>
                  <button
                    className="button secondary small-button"
                    onClick={() => setPatientsPage((p) => Math.min(totalPatientsPages, p + 1))}
                    disabled={patientsPage === totalPatientsPages}
                  >
                    {t('common.next')} <ChevronRight size={14} className="icon-flip-rtl" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: DOCTOR & HEALTH WORKER ACTIVITY */}
          {activeTab === 'Doctor Activity' && (
            <DoctorActivityView
              reporters={REPORTERS}
              visits={visits}
            />
          )}

          {/* TAB 5: ALERTS PAGE & DETAIL VIEW */}
          {activeTab === 'Alerts' && (
            <section className="alerts-page" data-testid="alerts-page">
              <div className="section-header-compact">
                <div>
                  <h2>{t('alerts.title')}</h2>
                  <p className="section-subtitle">{t('alerts.subtitle')}</p>
                </div>
              </div>

              <div className="alert-summary">
                <div>
                  <span className="summary-number ltr-protect">{summary.activeAlerts}</span>
                  <span>{t('alerts.awaitingReview')}</span>
                </div>
                <div>
                  <span className="summary-number ltr-protect">{summary.reviewedAlerts}</span>
                  <span>{t('alerts.reviewedAcknowledged')}</span>
                </div>
                <div>
                  <span className="summary-number ltr-protect">{alerts.length}</span>
                  <span>{t('alerts.totalSimulated')}</span>
                </div>
              </div>

              {alerts.map((a) => (
                <article className="panel alert-detail" key={a.id} data-testid={`alert-detail-${a.id}`}>
                  <div className="alert-detail-top">
                    <span className={'alert-symbol ' + a.severity.toLowerCase()}>
                      <AlertTriangle size={20} />
                    </span>
                    <div className="alert-detail-title">
                      <div>
                        <span className="case-id ltr-protect">{a.id}</span>
                        <span className={'severity ' + a.severity.toLowerCase()}>{a.severity} Priority</span>
                      </div>
                      <h2>{a.title}</h2>
                      <p>
                        <MapPin size={13} /> {a.village} · {a.time} · {a.cases} contributing cases
                      </p>
                    </div>
                    <span className={`review-state ${a.status === 'Reviewed' ? 'done' : ''}`} data-testid={`review-state-${a.id}`}>
                      {a.status === 'Reviewed' && <Check size={14} />} {a.status}
                    </span>
                  </div>

                  {/* SUPPORTING EVIDENCE */}
                  <div className="alert-evidence">
                    <strong>{t('alerts.supportingEvidence')}</strong>
                    <p>{a.supporting_evidence || a.evidence}</p>
                    <div className="evidence-points">
                      <div><strong>{t('alerts.dominantSymptoms')}</strong> {(a.dominant_symptoms || a.dominantSymptoms).join(', ')}</div>
                      <div><strong>{t('alerts.correlatedLocation')}</strong></div>
                      <div><strong>{t('alerts.trajectory')}</strong></div>
                    </div>
                  </div>

                  {/* HUMAN REVIEW ACTION */}
                  <div className="alert-detail-bottom">
                    <span>
                      <FileText size={14} /> {t('alerts.reviewNote')}
                    </span>
                    <button
                      className={`button ${a.status === 'Reviewed' ? 'secondary' : 'primary'}`}
                      onClick={() => toggleAlertStatus(a.id)}
                      data-testid={`action-toggle-review-${a.id}`}
                    >
                      {a.status === 'Reviewed' ? t('alerts.reopenBtn') : t('alerts.markReviewedBtn')}
                    </button>
                  </div>
                </article>
              ))}

              {alerts.length === 0 && (
                <div className="empty-state">No alerts found.</div>
              )}
            </section>
          )}

          {/* TAB 6: LEAFLET MAP VIEW */}
          {activeTab === 'Map' && (
            <section className="panel" data-testid="map-tab-panel">
              <VillageMap
                selectedVillage={villageFilter}
                onSelectVillage={(v) => {
                  setVillageFilter(v);
                  setActiveTab('Cases');
                }}
              />
            </section>
          )}
        </main>

        {/* PAGE FOOTER */}
        <footer className="page-footer">
          <span>GramCare AI Dashboard · Medical Authority Session ({currentUser.id})</span>
          <span>
            <ShieldCheck size={14} /> {t('common.fictionalFooter')}
          </span>
        </footer>
      </div>

      {/* ENCOUNTER CLINICAL DETAILS MODAL */}
      {selectedEncounter && (
        <EncounterDetailModal
          encounter={selectedEncounter}
          onClose={() => setSelectedEncounter(null)}
          onNavigateToPatient={(patientId) => {
            setSelectedEncounter(null);
            setPatientsSearch(patientId);
            setActiveTab('Patients');
          }}
        />
      )}

      {/* PATIENT LONGITUDINAL HISTORY MODAL */}
      {selectedPatientForHistory && (
        <PatientHistoryModal
          patient={selectedPatientForHistory}
          encounters={visits.filter((v) => v.patient_id === selectedPatientForHistory.patient_id)}
          onClose={() => setSelectedPatientForHistory(null)}
        />
      )}

      {/* ALERT EVIDENCE MODAL */}
      {selectedAlert && (
        <div className="modal-backdrop" data-testid="alert-modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-top">
              <div>
                <span className="case-id ltr-protect">{selectedAlert.id}</span>
                <h2>{selectedAlert.title}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedAlert(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p><strong>{t('alerts.location')}</strong> {selectedAlert.village}</p>
              <p><strong>Cases:</strong> {selectedAlert.cases} contributing cases</p>
              <p><strong>{t('alerts.supportingEvidence')}</strong> {selectedAlert.supporting_evidence || selectedAlert.evidence}</p>
              <div className="investigation-steps">
                <strong>{t('alerts.investigationSteps')}</strong>
                <ul>
                  {(selectedAlert.investigation_steps || selectedAlert.investigationSteps).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setSelectedAlert(null)}
              >
                {t('common.close')}
              </button>
              <button
                className={`button ${selectedAlert.status === 'Reviewed' ? 'secondary' : 'primary'}`}
                onClick={() => {
                  toggleAlertStatus(selectedAlert.id);
                  setSelectedAlert(null);
                }}
              >
                {selectedAlert.status === 'Reviewed' ? t('alerts.reopenBtn') : t('alerts.markReviewedBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="toast" role="status" data-testid="toast-notification">
          <Check size={16} />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} aria-label="Dismiss toast">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainDashboard />
      </LanguageProvider>
    </ThemeProvider>
  );
}
