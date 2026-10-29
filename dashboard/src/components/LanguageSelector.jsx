import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function LanguageSelector({ compact = false }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={`lang-selector-group ${compact ? 'compact' : ''}`}
      data-testid="language-select"
      role="group"
      aria-label={t('language.selectLanguage')}
    >
      <span className="lang-icon-wrapper" aria-hidden="true">
        <Globe size={14} />
      </span>

      <div className="lang-buttons">
        {SUPPORTED_LANGUAGES.map((item) => {
          const isActive = lang === item.code;
          return (
            <button
              key={item.code}
              type="button"
              className={`lang-btn ${isActive ? 'active' : ''}`}
              onClick={() => setLang(item.code)}
              title={`${item.label} (${item.nativeLabel})`}
              aria-label={`Switch language to ${item.label}`}
              aria-pressed={isActive}
              data-testid={`lang-btn-${item.code}`}
            >
              <span className="lang-code">{item.code.toUpperCase()}</span>
              {!compact && <span className="lang-native-sub">{item.nativeLabel}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
