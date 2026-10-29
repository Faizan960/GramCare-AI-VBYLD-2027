import React from 'react';
import { X, User, Calendar, MapPin, Activity, Stethoscope, Clock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function PatientHistoryModal({ patient, encounters = [], onClose }) {
  const { t } = useLanguage();

  if (!patient) return null;

  return (
    <div className="modal-backdrop" data-testid="patient-history-modal" role="dialog" aria-modal="true">
      <div className="modal-card wide-modal-card">
        <div className="modal-top">
          <div className="modal-title-group">
            <span className="case-id ltr-protect">{patient.patient_id}</span>
            <h2>{t('patients.modalTitle')}</h2>
            <span className="modal-subtitle">
              {patient.village} · {t('patients.yearsOld', { age: patient.age })} · {patient.gender}
            </span>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close patient history">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* PROFILE SUMMARY BAR */}
          <div className="patient-profile-summary-bar">
            <div>
              <span className="meta-label">Patient ID</span>
              <strong className="ltr-protect">{patient.patient_id}</strong>
            </div>
            <div>
              <span className="meta-label">Village Location</span>
              <strong>{patient.village}</strong>
            </div>
            <div>
              <span className="meta-label">Registered Date</span>
              <span className="ltr-protect">{patient.registered_date}</span>
            </div>
            <div>
              <span className="meta-label">Total Recorded Encounters</span>
              <span className="count-badge">{encounters.length}</span>
            </div>
          </div>

          {/* LINKED ENCOUNTERS TABLE */}
          <div className="modal-section" style={{ marginTop: '16px' }}>
            <h4 className="modal-section-title">
              {t('patients.linkedEncountersTitle', { count: encounters.length })}
            </h4>

            {encounters.length === 0 ? (
              <div className="empty-state">
                <p>{t('patients.noLinkedVisits')}</p>
              </div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>ENCOUNTER ID</th>
                      <th>DATE & WEEK</th>
                      <th>REPORTED BY</th>
                      <th>SYMPTOMS</th>
                      <th>AI SUGGESTION</th>
                      <th>SYNC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {encounters.map((enc) => (
                      <tr key={enc.id}>
                        <td>
                          <strong className="case-id ltr-protect">{enc.id}</strong>
                        </td>
                        <td>
                          <span className="date-cell ltr-protect">{enc.visit_date}</span>
                          <small>{enc.week}</small>
                        </td>
                        <td>
                          <strong>{enc.reporter_name}</strong>
                          <small className="ltr-protect">{enc.reported_by} ({enc.reporter_role})</small>
                        </td>
                        <td>
                          <div className="symptom-pills">
                            {enc.symptoms.map((s) => (
                              <span key={s} className="symptom-pill">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="condition-label">{enc.possible_condition}</span>
                          <small>{Math.round(enc.confidence * 100)}% conf.</small>
                        </td>
                        <td>
                          <span className={`sync-status ${enc.sync_status.toLowerCase()}`}>
                            {enc.sync_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
