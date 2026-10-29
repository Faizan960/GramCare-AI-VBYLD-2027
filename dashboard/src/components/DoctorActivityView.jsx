import { useState, useMemo } from 'react';
import {
  Users,
  Stethoscope,
  Activity,
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  ShieldCheck,
  FileText,
  X,
  UserCheck,
  Building2,
  Clock,
  ArrowUpDown,
  Mail,
  Award
} from 'lucide-react';
import { getReporterSummaries, getReporterMetrics } from '../data/canonicalData';
import { useLanguage } from '../i18n/LanguageContext';

export default function DoctorActivityView({ reporters, visits }) {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [villageFilter, setVillageFilter] = useState('All villages');
  const [sortBy, setSortBy] = useState('encounters');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReporter, setSelectedReporter] = useState(null);

  const pageSize = 6;

  // Re-calculate reporter stats dynamically based on visits
  const reporterSummaries = useMemo(() => {
    return getReporterSummaries(reporters, visits);
  }, [reporters, visits]);

  // Overall metrics
  const overviewMetrics = useMemo(() => {
    return getReporterMetrics(visits, reporters);
  }, [visits, reporters]);

  // Filtered reporters
  const filteredReporters = useMemo(() => {
    return reporterSummaries
      .filter((r) => {
        const matchesRole =
          roleFilter === 'All' ||
          (roleFilter === 'Doctor' && (r.role.includes('Doctor') || r.role.includes('Physician') || r.role.includes('Medical Officer'))) ||
          (roleFilter === 'CHW' && (r.role.includes('ASHA') || r.role.includes('ANM')));

        const matchesVillage = villageFilter === 'All villages' || r.primary_village === villageFilter;

        const targetText = [r.worker_id, r.name, r.role, r.assigned_location, r.primary_village].join(' ').toLowerCase();
        const matchesQuery = !searchQuery || targetText.includes(searchQuery.toLowerCase());

        return matchesRole && matchesVillage && matchesQuery;
      })
      .sort((a, b) => {
        let valA = a.totalEncounters;
        let valB = b.totalEncounters;

        if (sortBy === 'patients') {
          valA = a.uniquePatients;
          valB = b.uniquePatients;
        } else if (sortBy === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === 'latest') {
          valA = a.latestReport;
          valB = b.latestReport;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [reporterSummaries, roleFilter, villageFilter, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReporters.length / pageSize) || 1;
  const paginatedReporters = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReporters.slice(start, start + pageSize);
  }, [filteredReporters, currentPage, pageSize]);

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  }

  return (
    <div className="doctor-activity-container" data-testid="doctor-activity-view">
      {/* SECTION HEADER */}
      <div className="section-header-compact">
        <div>
          <h2>{t('doctors.title')}</h2>
          <p className="section-subtitle">{t('doctors.subtitle')}</p>
        </div>
        <div className="header-meta-pill">
          <Calendar size={13} />
          <span>{t('doctors.periodLabel')}</span>
        </div>
      </div>

      {/* OVERVIEW KPI METRICS */}
      <section className="stats-grid">
        <article className="stat-card" data-testid="doc-stat-reporters">
          <div className="stat-top">
            <span>{t('doctors.kpiReporters')}</span>
            <span className="icon-box green"><Stethoscope size={17} /></span>
          </div>
          <div className="stat-value">{overviewMetrics.totalReporters}</div>
          <div className="stat-foot">{t('doctors.kpiReportersFoot')}</div>
        </article>

        <article className="stat-card" data-testid="doc-stat-encounters">
          <div className="stat-top">
            <span>{t('doctors.kpiEncounters')}</span>
            <span className="icon-box blue"><Activity size={17} /></span>
          </div>
          <div className="stat-value">{overviewMetrics.totalEncounters}</div>
          <div className="stat-foot">{t('doctors.kpiEncountersFoot')}</div>
        </article>

        <article className="stat-card" data-testid="doc-stat-unique-patients">
          <div className="stat-top">
            <span>{t('doctors.kpiPatients')}</span>
            <span className="icon-box amber"><Users size={17} /></span>
          </div>
          <div className="stat-value">{overviewMetrics.distinctPatients}</div>
          <div className="stat-foot">{t('doctors.kpiPatientsFoot')}</div>
        </article>

        <article className="stat-card" data-testid="doc-stat-avg-encounters">
          <div className="stat-top">
            <span>{t('doctors.kpiAvg')}</span>
            <span className="icon-box violet"><Clock size={17} /></span>
          </div>
          <div className="stat-value">{overviewMetrics.avgEncounters}</div>
          <div className="stat-foot">{t('doctors.kpiAvgFoot', { active: overviewMetrics.activeReporters })}</div>
        </article>
      </section>

      {/* ACTIVITY TABLE & CONTROLS */}
      <section className="panel records-panel" style={{ marginTop: '16px' }} data-testid="doctor-activity-table-panel">
        <div className="records-toolbar">
          <div className="search-wrap">
            <Search size={16} />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('doctors.searchPlaceholder')}
              aria-label="Search reporters"
              data-testid="doctor-search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filters">
            <Filter size={15} />

            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by role"
              data-testid="filter-doc-role"
            >
              <option value="All">{t('doctors.roleAll')}</option>
              <option value="Doctor">{t('doctors.roleDoctor')}</option>
              <option value="CHW">{t('doctors.roleChw')}</option>
            </select>

            <select
              value={villageFilter}
              onChange={(e) => { setVillageFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by village"
              data-testid="filter-doc-village"
            >
              <option value="All villages">{t('common.allVillages')}</option>
              <option value="Village A">Village A</option>
              <option value="Village B">Village B</option>
              <option value="Village C">Village C</option>
              <option value="Village D">Village D</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  {t('doctors.colReporter')} <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: 4 }} />
                </th>
                <th>{t('doctors.colRole')}</th>
                <th>{t('doctors.colFacility')}</th>
                <th onClick={() => handleSort('encounters')} style={{ cursor: 'pointer' }}>
                  {t('doctors.colTotalEncounters')} <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: 4 }} />
                </th>
                <th onClick={() => handleSort('patients')} style={{ cursor: 'pointer' }}>
                  {t('doctors.colUniquePatients')} <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: 4 }} />
                </th>
                <th onClick={() => handleSort('latest')} style={{ cursor: 'pointer' }}>
                  {t('doctors.colLatestReport')} <ArrowUpDown size={11} style={{ display: 'inline', marginLeft: 4 }} />
                </th>
                <th>{t('doctors.colReviewRole')}</th>
                <th>{t('doctors.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReporters.map((r) => {
                const isDoctor = r.role.includes('Doctor') || r.role.includes('Physician') || r.role.includes('Medical Officer');
                return (
                  <tr key={r.worker_id} data-testid={`reporter-row-${r.worker_id}`}>
                    <td>
                      <strong className="case-id ltr-protect">{r.worker_id}</strong>
                      <span className="reporter-display-name">{r.name}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${isDoctor ? 'role-doctor' : 'role-chw'}`}>
                        {r.role}
                      </span>
                      <small className="qualification-text">{r.qualification}</small>
                    </td>
                    <td>
                      <div className="centre-location-cell">
                        <Building2 size={13} />
                        <span>{r.assigned_location}</span>
                      </div>
                      <small>{r.primary_village}</small>
                    </td>
                    <td>
                      <strong className="count-metric">{r.totalEncounters}</strong>
                      <small>{r.activeSurgeVisits > 0 ? t('doctors.surgeLabel', { count: r.activeSurgeVisits }) : t('doctors.routineLabel')}</small>
                    </td>
                    <td>
                      <strong className="count-metric">{r.uniquePatients}</strong>
                      <small>{t('doctors.distinctLabel')}</small>
                    </td>
                    <td>
                      <span className="date-cell ltr-protect">{r.latestReport}</span>
                    </td>
                    <td>
                      <span className="review-activity-text">{r.review_activity}</span>
                    </td>
                    <td>
                      <button
                        className="button secondary small-button"
                        onClick={() => setSelectedReporter(r)}
                        data-testid={`view-reporter-${r.worker_id}`}
                      >
                        {t('doctors.viewProfile')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredReporters.length === 0 && (
            <div className="empty-state" data-testid="empty-reporters-state">
              <p>{t('doctors.empty')}</p>
              <button
                className="button secondary"
                onClick={() => { setSearchQuery(''); setRoleFilter('All'); setVillageFilter('All villages'); }}
              >
                {t('common.reset')}
              </button>
            </div>
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="table-footer">
          <span>
            {t('common.showingPersonnel', { shown: paginatedReporters.length, total: filteredReporters.length })} ({t('common.pageOf', { page: currentPage, total: totalPages })})
          </span>
          <div className="pagination-controls">
            <button
              className="button secondary small-button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              data-testid="doc-prev-page"
            >
              {t('common.prev')}
            </button>
            <button
              className="button secondary small-button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              data-testid="doc-next-page"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      </section>

      {/* REPORTER DETAIL MODAL */}
      {selectedReporter && (
        <div className="modal-backdrop" data-testid="reporter-detail-modal" role="dialog" aria-modal="true">
          <div className="modal-card reporter-modal-card">
            <div className="modal-top">
              <div className="reporter-modal-header">
                <div className={`reporter-avatar ${selectedReporter.role.includes('Doctor') || selectedReporter.role.includes('Medical') ? 'doc' : 'chw'}`}>
                  {selectedReporter.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span className="case-id ltr-protect">{selectedReporter.worker_id}</span>
                  <h2>{selectedReporter.name}</h2>
                  <span className="reporter-role-sub">{selectedReporter.role} · {selectedReporter.qualification}</span>
                </div>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedReporter(null)}
                aria-label="Close reporter details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* SUMMARY STATS CHIPS */}
              <div className="reporter-stats-bar">
                <div>
                  <span className="chip-label">{t('doctors.totalEncounters')}</span>
                  <strong className="chip-val">{selectedReporter.totalEncounters}</strong>
                </div>
                <div>
                  <span className="chip-label">{t('doctors.uniquePatients')}</span>
                  <strong className="chip-val">{selectedReporter.uniquePatients}</strong>
                </div>
                <div>
                  <span className="chip-label">{t('doctors.ratioLabel')}</span>
                  <strong className="chip-val">
                    {((selectedReporter.uniquePatients / selectedReporter.totalEncounters) * 100).toFixed(0)}%
                  </strong>
                </div>
                <div>
                  <span className="chip-label">{t('doctors.assignedFacility')}</span>
                  <span className="chip-val-text">{selectedReporter.assigned_location}</span>
                </div>
              </div>

              {/* ATTRIBUTED ENCOUNTERS TABLE */}
              <div className="modal-section" style={{ marginTop: '16px' }}>
                <h4 className="modal-section-title">
                  {t('doctors.attributedEncountersTitle', { count: selectedReporter.totalEncounters })}
                </h4>
                <div className="table-wrap" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>ENCOUNTER ID</th>
                        <th>PATIENT ID</th>
                        <th>DATE</th>
                        <th>SYMPTOMS</th>
                        <th>AI ASSESSMENT</th>
                        <th>SYNC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReporter.attributedVisits.map((vis) => (
                        <tr key={vis.id}>
                          <td>
                            <strong className="case-id ltr-protect">{vis.id}</strong>
                            <small>{vis.is_active_surveillance ? t('common.activeSurgeBadge') : t('common.routineBadge')}</small>
                          </td>
                          <td>
                            <strong className="ltr-protect">{vis.patient_id}</strong>
                            <small>{vis.gender}, {vis.age}y</small>
                          </td>
                          <td>
                            <span className="date-cell ltr-protect">{vis.visit_date}</span>
                            <small>{vis.week}</small>
                          </td>
                          <td>
                            <div className="symptom-pills">
                              {vis.symptoms.map((s) => (
                                <span key={s} className="symptom-pill">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className="condition-label">{vis.possible_condition}</span>
                          </td>
                          <td>
                            <span className={`sync-status ${vis.sync_status.toLowerCase()}`}>
                              {vis.sync_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="button primary" onClick={() => setSelectedReporter(null)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
