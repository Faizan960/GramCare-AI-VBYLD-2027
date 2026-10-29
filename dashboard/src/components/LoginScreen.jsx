import { useState } from 'react';
import { HeartPulse, Lock, User, AlertCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { DEMO_CREDENTIALS, loginDemoUser } from '../auth/demoAuth';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

export default function LoginScreen({ onLoginSuccess }) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const result = await loginDemoUser(userId, password);
    setIsLoading(false);

    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setErrorMessage(result.error);
    }
  }

  function handleFillDemo() {
    setUserId(DEMO_CREDENTIALS.userId);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorMessage('');
  }

  return (
    <div className="login-container" data-testid="login-screen">
      {/* PERSISTENT DEMO BANNER */}
      <div className="demo-persistent-banner">
        <span className="demo-badge">{t('auth.banner')}</span>
        <span className="demo-text">{t('auth.bannerDesc')}</span>
      </div>

      {/* TOP CONTROLS BAR (LANG + THEME) */}
      <div className="login-top-controls">
        <LanguageSelector compact={true} />
        <ThemeToggle />
      </div>

      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-brand-mark">
              <HeartPulse size={28} />
            </div>
            <h1>{t('auth.appTitle')}</h1>
            <p className="login-subheading">{t('auth.systemSubtitle')}</p>
            <span className="login-role-tag">{t('auth.portalTag')}</span>
          </div>

          {errorMessage && (
            <div className="login-error" data-testid="login-error-message" role="alert">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="userId">{t('auth.userIdLabel')}</label>
              <div className="input-wrap">
                <User size={16} />
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={t('auth.userIdPlaceholder')}
                  data-testid="login-user-id"
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('auth.passwordLabel')}</label>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  data-testid="login-password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="button primary login-button"
              disabled={isLoading}
              data-testid="login-submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  <span>{t('auth.verifying')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.signInBtn')}</span>
                  <ArrowRight size={16} className="icon-flip-rtl" />
                </>
              )}
            </button>
          </form>

          {/* DEMO CREDENTIALS QUICK FILL CHIP */}
          <div className="demo-credentials-box">
            <div className="demo-creds-header">
              <ShieldCheck size={14} />
              <span>{t('auth.demoCredsTitle')}</span>
            </div>
            <div className="demo-creds-info">
              <div>
                <strong>{t('auth.userIdLabel')}:</strong> <code className="ltr-protect">{DEMO_CREDENTIALS.userId}</code>
              </div>
              <div>
                <strong>{t('auth.passwordLabel')}:</strong> <code className="ltr-protect">{DEMO_CREDENTIALS.password}</code>
              </div>
            </div>
            <button
              type="button"
              className="button secondary demo-fill-btn"
              onClick={handleFillDemo}
              disabled={isLoading}
              data-testid="auto-fill-demo-creds"
            >
              {t('auth.autoFillBtn')}
            </button>
          </div>

          <div className="login-footer">
            <p>{t('auth.securityNotice')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
