import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Info, ArrowRight, ShieldCheck, RefreshCw, ZoomIn, ZoomOut, AlertTriangle, Layers } from 'lucide-react';
import { VILLAGES, REPORTERS, PATIENTS, VISITS, getVillageSummaries } from '../data/canonicalData';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

export default function VillageMap({
  selectedVillage = 'All villages',
  onSelectVillage,
  compact = false,
  onOpenFullMap,
}) {
  const { t, lang } = useLanguage();
  const { isDark } = useTheme();

  const villagesList = useMemo(() => {
    return getVillageSummaries(PATIENTS, VISITS).map((v) => ({
      ...v,
      population: v.patientCount ? v.patientCount * 38 : 1200,
      primarySymptomGroup:
        v.id === 'VIL-03'
          ? 'Acute Diarrheal & Dehydration (Surge)'
          : v.id === 'VIL-04'
          ? 'Watery Diarrhoea & Cramps (Symptom Match)'
          : 'Mild Febrile / Routine Symptoms',
    }));
  }, []);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [activeVillage, setActiveVillage] = useState(
    selectedVillage && selectedVillage !== 'All villages' ? selectedVillage : 'Village C'
  );
  const [tileError, setTileError] = useState(false);

  // Sync active village with prop
  useEffect(() => {
    if (selectedVillage && selectedVillage !== 'All villages') {
      setActiveVillage(selectedVillage);
    }
  }, [selectedVillage]);

  // Selected village object
  const currentVillageData = useMemo(() => {
    return villagesList.find((v) => v.name === activeVillage) || villagesList[2]; // Default Village C
  }, [activeVillage, villagesList]);

  // Personnel assigned to active village
  const assignedStaff = useMemo(() => {
    return REPORTERS.filter((r) => r.primary_village === currentVillageData.name);
  }, [currentVillageData]);

  // Initialize interactive Leaflet map for full mode
  useEffect(() => {
    if (compact) return; // Compact mode uses the illustrated SVG renderer
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [19.168, 72.895],
        zoom: 12,
        minZoom: 11,
        maxZoom: 15,
        scrollWheelZoom: false,
        zoomControl: false, // Custom controls
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tile Layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | GramCare AI Demo',
        maxZoom: 18,
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);

      // Add visible hotspot boundary/halo around Village C (VIL-03)
      const villageC = villagesList.find((v) => v.id === 'VIL-03');
      if (villageC) {
        L.circle([villageC.lat, villageC.lng], {
          radius: 950,
          color: '#d9534f',
          fillColor: '#d9534f',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '6, 6',
          className: 'pulsing-hotspot-halo',
        }).addTo(map);
      }

      // Add spatial proximity / symptom correlation link between Village C and Village D
      const villageD = villagesList.find((v) => v.id === 'VIL-04');
      if (villageC && villageD) {
        L.polyline(
          [
            [villageC.lat, villageC.lng],
            [villageD.lat, villageD.lng],
          ],
          {
            color: '#d9534f',
            weight: 3,
            dashArray: '6, 8',
            opacity: 0.8,
            className: 'cluster-link-line',
          }
        ).addTo(map);
      }

      // Create rich DOM Pin Markers for each village
      villagesList.forEach((v) => {
        const isHotspot = v.id === 'VIL-03';
        const isCluster = v.id === 'VIL-04';
        const markerClass = isHotspot ? 'marker-hotspot' : isCluster ? 'marker-cluster' : 'marker-normal';

        const customIcon = L.divIcon({
          className: `village-custom-marker ${markerClass}`,
          html: `
            <div class="marker-pin-inner" data-village="${v.name}">
              <span class="marker-badge">${v.cases}</span>
              <span class="marker-label">${v.name}</span>
            </div>
          `,
          iconSize: [80, 46],
          iconAnchor: [40, 23],
        });

        const marker = L.marker([v.lat, v.lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setActiveVillage(v.name);
          if (onSelectVillage) onSelectVillage(v.name);
        });

        // Popup with village info
        marker.bindPopup(`
          <div class="map-interactive-popup">
            <strong style="color: ${isHotspot ? '#d9534f' : isCluster ? '#d97706' : '#25845a'}; font-size: 14px;">${v.name}</strong>
            <div style="margin: 4px 0; font-size: 12px;"><strong>Active Cases:</strong> ${v.cases} (${v.status})</div>
            <div style="font-size: 11px; color: #666;"><strong>Cluster:</strong> ${v.primarySymptomGroup}</div>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    } catch {
      setTileError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [compact, onSelectVillage]);

  // Recenter map helper
  function handleResetView() {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([19.168, 72.895], 12);
    }
  }

  // --------------------------------------------------------------------------
  // COMPACT PREVIEW MODE (FOR OVERVIEW TAB)
  // --------------------------------------------------------------------------
  if (compact) {
    return (
      <section className="panel map-preview-card" data-testid="compact-map-preview">
        <div className="panel-heading">
          <div>
            <h2>{t('overview.mapPreviewTitle')}</h2>
            <p>{t('overview.mapPreviewSubtitle')}</p>
          </div>
          {onOpenFullMap && (
            <button className="button secondary small-button" onClick={onOpenFullMap} data-testid="open-full-map-btn">
              <span>{t('overview.openFullMap')}</span>
              <ArrowRight size={14} className="icon-flip-rtl" />
            </button>
          )}
        </div>

        {/* ILLUSTRATED SVG SURVEILLANCE SCHEMATIC */}
        <div className="illustrated-schematic-wrap" style={{ position: 'relative', height: '220px', width: '100%' }}>
          <svg
            viewBox="0 0 540 220"
            className="schematic-svg"
            style={{ width: '100%', height: '100%', background: isDark ? '#141d17' : '#f0f5f1', borderRadius: '8px' }}
            role="img"
            aria-label="Illustrated Village Surveillance Schematic"
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke={isDark ? '#1c2921' : '#e2eae3'} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />

            {/* Spatial correlation dashed link between Village C and Village D */}
            <line
              x1="330"
              y1="90"
              x2="450"
              y2="150"
              stroke="#d9534f"
              strokeWidth="2.5"
              strokeDasharray="6, 6"
              opacity="0.85"
            />
            <text x="390" y="110" fill={isDark ? '#f87171' : '#b93733'} fontSize="10" fontWeight="600" textAnchor="middle">
              Cluster Link (Symptom Match)
            </text>

            {/* Hotspot Pulsing Halo around Village C */}
            <circle cx="330" cy="90" r="42" fill="#d9534f" fillOpacity="0.18" stroke="#d9534f" strokeWidth="1.5" strokeDasharray="4, 4" />

            {/* Village A (Normal - 3 cases) */}
            <g className="schematic-node" transform="translate(100, 70)" cursor="pointer" onClick={() => onSelectVillage && onSelectVillage('Village A')}>
              <circle r="16" fill="#25845a" stroke="#ffffff" strokeWidth="2" />
              <text y="5" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">3</text>
              <text y="30" fill={isDark ? '#e6ede7' : '#19241c'} fontSize="12" fontWeight="600" textAnchor="middle">Village A</text>
              <text y="42" fill={isDark ? '#9db1a2' : '#5a685c'} fontSize="10" textAnchor="middle">Normal (Baseline)</text>
            </g>

            {/* Village B (Normal - 4 cases) */}
            <g className="schematic-node" transform="translate(190, 150)" cursor="pointer" onClick={() => onSelectVillage && onSelectVillage('Village B')}>
              <circle r="16" fill="#25845a" stroke="#ffffff" strokeWidth="2" />
              <text y="5" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">4</text>
              <text y="30" fill={isDark ? '#e6ede7' : '#19241c'} fontSize="12" fontWeight="600" textAnchor="middle">Village B</text>
              <text y="42" fill={isDark ? '#9db1a2' : '#5a685c'} fontSize="10" textAnchor="middle">Normal (Baseline)</text>
            </g>

            {/* Village C (Hotspot - 18 cases) */}
            <g className="schematic-node" transform="translate(330, 90)" cursor="pointer" onClick={() => onSelectVillage && onSelectVillage('Village C')}>
              <circle r="22" fill="#d9534f" stroke="#ffffff" strokeWidth="2.5" />
              <text y="6" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">18</text>
              <text y="36" fill={isDark ? '#f87171' : '#b93733'} fontSize="13" fontWeight="bold" textAnchor="middle">Village C (Hotspot)</text>
              <text y="48" fill={isDark ? '#9db1a2' : '#5a685c'} fontSize="10" textAnchor="middle">Surge: Acute Diarrheal</text>
            </g>

            {/* Village D (Cluster - 2 cases) */}
            <g className="schematic-node" transform="translate(450, 150)" cursor="pointer" onClick={() => onSelectVillage && onSelectVillage('Village D')}>
              <circle r="16" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
              <text y="5" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">2</text>
              <text y="30" fill={isDark ? '#e6ede7' : '#19241c'} fontSize="12" fontWeight="600" textAnchor="middle">Village D</text>
              <text y="42" fill={isDark ? '#9db1a2' : '#5a685c'} fontSize="10" textAnchor="middle">Cluster: Gastrointestinal</text>
            </g>
          </svg>
        </div>

        {/* MINI LEGEND */}
        <div className="map-legend compact-legend" style={{ marginTop: '10px' }}>
          <span className="legend-item"><span className="dot normal"></span> {t('map.legendNormal')}</span>
          <span className="legend-item"><span className="dot hotspot"></span> {t('map.legendHotspot')}</span>
          <span className="legend-item"><span className="dot cluster"></span> {t('map.legendCluster')}</span>
        </div>
      </section>
    );
  }

  // --------------------------------------------------------------------------
  // FULL DEDICATED GIS MAP VIEW (FOR MAP TAB)
  // --------------------------------------------------------------------------
  return (
    <div className="village-map-full-container" data-testid="village-map">
      {/* HEADER WITH CONTROLS */}
      <div className="map-view-header">
        <div>
          <h2>{t('map.title')}</h2>
          <p className="section-subtitle">{t('map.subtitle')}</p>
        </div>

        <div className="map-actions-group">
          <div className="map-legend">
            <span className="legend-item"><span className="dot normal"></span> {t('map.legendNormal')}</span>
            <span className="legend-item"><span className="dot hotspot"></span> {t('map.legendHotspot')}</span>
            <span className="legend-item"><span className="dot cluster"></span> {t('map.legendCluster')}</span>
          </div>

          <button className="button secondary small-button" onClick={handleResetView} title="Reset Map View">
            <RefreshCw size={13} />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* MAP GRID LAYOUT (MAP + VILLAGE PROFILE CARD) */}
      <div className="map-workspace-grid">
        {/* LEAFLET MAP CONTAINER */}
        <div className="map-canvas-wrapper" style={{ position: 'relative' }}>
          <div
            ref={mapContainerRef}
            className="leaflet-map-container"
            style={{ height: '420px', width: '100%', borderRadius: '12px', zIndex: 1 }}
          />

          {/* FALLBACK ILLUSTATION IF TILES FAIL OR RUNNING OFFLINE */}
          {tileError && (
            <div className="map-fallback-overlay" data-testid="map-offline-fallback">
              <div className="fallback-banner">
                <Info size={14} />
                <span>{t('map.fallbackNotice')}</span>
              </div>
            </div>
          )}

          {/* ACCESSIBLE HIDDEN DATA FOR TESTS / SCREEN READERS */}
          <div className="sr-only" data-testid="map-accessible-summary">
            {villagesList.map((v) => (
              <div key={v.id} data-testid={`map-village-${v.id}`}>
                {v.name}: {v.cases} active cases, status {v.status}
              </div>
            ))}
          </div>
        </div>

        {/* VILLAGE DETAILS PROFILE CARD */}
        <div className="village-details-card" data-testid="village-details-card">
          <div className="village-card-header">
            <div>
              <span className={`status-pill ${currentVillageData.id === 'VIL-03' ? 'hotspot' : currentVillageData.id === 'VIL-04' ? 'cluster' : 'normal'}`}>
                {currentVillageData.status}
              </span>
              <h3>{currentVillageData.name}</h3>
            </div>
            <div className="village-metric-badge">
              <strong>{currentVillageData.cases}</strong>
              <small>{t('map.activeCases', { count: currentVillageData.cases })}</small>
            </div>
          </div>

          <div className="village-meta-list">
            <div className="meta-item">
              <span className="meta-label">Total Population</span>
              <span className="meta-value">~{currentVillageData.population} residents</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Primary Symptom Group</span>
              <span className="meta-value">{currentVillageData.primarySymptomGroup}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Illustrative Coordinates</span>
              <span className="meta-value ltr-protect">{currentVillageData.lat.toFixed(4)}°N, {currentVillageData.lng.toFixed(4)}°E</span>
            </div>
          </div>

          {/* ASSIGNED HEALTHCARE PERSONNEL */}
          <div className="assigned-personnel-section">
            <span className="section-label">Assigned Healthcare Staff ({assignedStaff.length}):</span>
            <div className="personnel-chips">
              {assignedStaff.map((staff) => (
                <div key={staff.worker_id} className="staff-chip">
                  <strong>{staff.name}</strong>
                  <small>{staff.worker_id} · {staff.role}</small>
                </div>
              ))}
            </div>
          </div>

          {/* SELECTION BUTTONS */}
          <div className="village-switch-bar">
            {villagesList.map((v) => (
              <button
                key={v.id}
                className={`button ${activeVillage === v.name ? 'primary' : 'secondary'} small-button`}
                onClick={() => {
                  setActiveVillage(v.name);
                }}
                data-testid={`select-map-village-${v.id}`}
              >
                {v.name} ({v.cases})
              </button>
            ))}
          </div>

          {onSelectVillage && (
            <button
              className="text-link-btn"
              onClick={() => onSelectVillage(currentVillageData.name)}
              style={{ marginTop: '8px', textAlign: 'start' }}
            >
              View {currentVillageData.name} field encounters →
            </button>
          )}
        </div>
      </div>

      {/* REGULATORY DISCLAIMER */}
      <div className="map-disclaimer-footer">
        <ShieldCheck size={14} />
        <span>{t('map.disclaimer')}</span>
      </div>
    </div>
  );
}
