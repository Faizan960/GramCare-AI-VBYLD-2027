import React from 'react';
import { X, Activity, User, Stethoscope, ShieldCheck, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function EncounterDetailModal({ encounter, onClose, onNavigateToPatient }) {
  const { t } = useLanguage();

  if (!encounter) return null;

  return (
    <div className="modal-backdrop" data-testid="encounter-detail-modal" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-top">
          <div className="modal-title-group">
            <span className="case-id ltr-protect">{encounter.id}</span>
            <h2>{t('visits.modalTitle')}</h2>
            <span className="modal-subtitle">
              {encounter.is_active_surveillance ? t('visits.scopeSurge') : t('common.routineBadge')}
            </span>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close encounter details">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* PATIENT & LOCATION */}
          <div className="modal-section">
            <h4 className="modal-section-title">{t('visits.patientInfoTitle')}</h4>
            <div className="info-grid-two">
              <div>
                <span className="field-label">{t('visits.colPatientId')}</span>
                <strong className="field-value ltr-protect">{encounter.patient_id}</strong>
                {onNavigateToPatient && (
                  <button
                    className="text-link-btn"
                    onClick={() => onNavigateToPatient(encounter.patient_id)}
                    style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}
                  >
                    {t('visits.viewInRegistry')} →
                  </button>
                )}
              </div>
              <div>
                <span className="field-label">{t('visits.colVillage')}</span>
                <strong className="field-value">{encounter.village}</strong>
              </div>
              <div>
                <span className="field-label">Age / Gender</span>
                <span className="field-value">{encounter.age}y · {encounter.gender}</span>
              </div>
              <div>
                <span className="field-label">{t('visits.visitDate')}</span>
                <span className="field-value ltr-protect">{encounter.visit_date} ({encounter.week})</span>
              </div>
            </div>
          </div>

          {/* REPORTING PERSONNEL */}
          <div className="modal-section">
            <h4 className="modal-section-title">{t('visits.reporterInfoTitle')}</h4>
            <div className="info-grid-two">
              <div>
                <span className="field-label">Reporter Name & ID</span>
                <strong className="field-value">{encounter.reporter_name}</strong>
                <small className="field-sub ltr-protect">{encounter.reported_by}</small>
              </div>
              <div>
                <span className="field-label">Role</span>
                <span className="role-badge role-chw">{encounter.reporter_role}</span>
              </div>
            </div>
          </div>

          {/* CLINICAL ASSESSMENT & SYMPTOMS */}
          <div className="modal-section">
            <h4 className="modal-section-title">{t('visits.assessmentTitle')}</h4>
            <div style={{ marginBottom: '10px' }}>
              <span className="field-label">{t('visits.colSymptoms')}</span>
              <div className="symptom-pills" style={{ marginTop: '6px' }}>
                {encounter.symptoms.map((s) => (
                  <span key={s} className="symptom-pill">{s}</span>
                ))}
              </div>
            </div>

            <div className="ai-assessment-card">
              <div className="assessment-top">
                <span className="condition-label">{encounter.possible_condition}</span>
                <span className="confidence-pill">
                  {Math.round(encounter.confidence * 100)}% Confidence
                </span>
              </div>
              <p className="ai-explanation-text">
                <strong>Model Reasoning:</strong> {encounter.explanation}
              </p>
            </div>
          </div>

          {/* SYNC STATUS */}
          <div className="modal-section">
            <h4 className="modal-section-title">{t('visits.syncDetailsTitle')}</h4>
            <div className="sync-detail-line">
              <span className={`sync-status ${encounter.sync_status.toLowerCase()}`}>
                {encounter.sync_status}
              </span>
              <small>Offline-first field cache synced to centralized PostgreSQL surveillance store.</small>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="button primary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
