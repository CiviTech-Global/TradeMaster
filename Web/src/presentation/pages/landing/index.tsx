import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CSSProperties } from 'react';
import { businessService } from '../../../infrastructure/api/businessService';
import { formatNumber } from '../../../infrastructure/i18n/format';
import { TMBadge, TMButton, TMCard, TMSkeleton } from '../../components';
import type { Business } from '../../../domain/types/business';
import './Landing.css';

const TMLanding: React.FC = () => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'landing' });
  const { t: commonT } = useTranslation('translation', { keyPrefix: 'common' });
  const navigate = useNavigate();
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ businesses: 0, cities: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const businesses = await businessService.getAllBusinesses();
        setFeaturedBusinesses(businesses.slice(0, 6));

        const uniqueCities = new Set(
          businesses
            .map(b => b.address?.split(',').pop()?.trim())
            .filter(Boolean)
        );

        setStats({
          businesses: businesses.length,
          cities: Math.max(uniqueCities.size, 1),
        });
      } catch (error) {
        console.error('Failed to load landing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const features = [
    {
      icon: '📍',
      titleKey: 'featureMapDiscoveryTitle',
      descKey: 'featureMapDiscoveryDesc',
    },
    {
      icon: '🏪',
      titleKey: 'featureBusinessProfilesTitle',
      descKey: 'featureBusinessProfilesDesc',
    },
    {
      icon: '📱',
      titleKey: 'featureMobileAppTitle',
      descKey: 'featureMobileAppDesc',
    },
    {
      icon: '⭐',
      titleKey: 'featureReviewsTitle',
      descKey: 'featureReviewsDesc',
    },
  ];

  return (
    <div className="landing fade-in">
      {/* Header */}
      <header className="landing__header">
        <div className="landing__header-inner">
          <div className="landing__logo">🏪 TradeMaster</div>
          <nav className="landing__nav">
            <a href="#features" className="landing__nav-link">{t('features')}</a>
            <a href="#how-it-works" className="landing__nav-link">{t('howItWorks')}</a>
            <a href="#businesses" className="landing__nav-link">{t('businessesNav')}</a>
            <div className="landing__language-switcher">
              <button
                type="button"
                className={`landing__language-btn${i18n.language === 'fa' ? ' landing__language-btn--active' : ''}`}
                onClick={() => i18n.changeLanguage('fa')}
              >
                فارسی
              </button>
              <button
                type="button"
                className={`landing__language-btn${i18n.language === 'en' ? ' landing__language-btn--active' : ''}`}
                onClick={() => i18n.changeLanguage('en')}
              >
                English
              </button>
            </div>
            <TMButton
              variant="outline"
              onClick={() => navigate('/signin')}
              style={{ minHeight: '40px', padding: '8px 16px' }}
            >
              {commonT('signIn')}
            </TMButton>
            <TMButton
              onClick={() => navigate('/signup')}
              style={{ minHeight: '40px', padding: '8px 16px' }}
            >
              {commonT('getStarted')}
            </TMButton>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-content">
          <h1 className="landing__hero-title">
            {t('heroTitle')}<br />
            <span className="landing__hero-highlight">{t('heroHighlight')}</span>
          </h1>
          <p className="landing__hero-subtitle">
            {t('heroSubtitle')}
          </p>
          <div className="landing__hero-actions">
            <TMButton onClick={() => navigate('/signup')}>
              {commonT('joinFree')}
            </TMButton>
            <TMButton
              variant="outline"
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {commonT('learnMore')}
            </TMButton>
          </div>
          <div className="landing__hero-stats">
            <div className="landing__stat">
              <span className="landing__stat-number">{formatNumber(stats.businesses)}+</span>
              <span className="landing__stat-label">{t('statBusinesses')}</span>
            </div>
            <div className="landing__stat">
              <span className="landing__stat-number">{formatNumber(stats.cities)}+</span>
              <span className="landing__stat-label">{t('statCities')}</span>
            </div>
          </div>
        </div>
        <div className="landing__hero-visual">
          <TMCard glassmorphic style={{ height: '100%', padding: '24px' }}>
            <div className="landing__hero-map">
              <div className="landing__hero-map-marker floating-pin" style={{ top: '30%', '--pin-inline': '25%' } as CSSProperties}>
                🍽️
              </div>
              <div className="landing__hero-map-marker floating-pin" style={{ top: '55%', '--pin-inline': '60%' } as CSSProperties}>
                💈
              </div>
              <div className="landing__hero-map-marker floating-pin" style={{ top: '70%', '--pin-inline': '35%' } as CSSProperties}>
                🏥
              </div>
              <div className="landing__hero-map-marker floating-pin" style={{ top: '40%', '--pin-inline': '75%' } as CSSProperties}>
                🛒
              </div>
            </div>
          </TMCard>
        </div>
      </section>

      {/* Features */}
      <section className="landing__features" id="features">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">{t('whyTitle')}</h2>
          <p className="landing__section-subtitle">
            {t('whySubtitle')}
          </p>
          <div className="landing__features-grid stagger">
            {features.map((f) => (
              <TMCard key={f.titleKey} style={{ padding: '24px' }}>
                <div className="landing__feature-icon">{f.icon}</div>
                <h3 className="landing__feature-title">{t(f.titleKey)}</h3>
                <p className="landing__feature-desc">{t(f.descKey)}</p>
              </TMCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing__how-it-works" id="how-it-works">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">{t('howItWorksTitle')}</h2>
          <p className="landing__section-subtitle">{t('howItWorksSubtitle')}</p>
          <div className="landing__steps">
            {[
              { num: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
              { num: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
              { num: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.num}>
                <div className="landing__step">
                  <div className="landing__step-number">{step.num}</div>
                  <h3 className="landing__step-title">{t(step.titleKey)}</h3>
                  <p className="landing__step-desc">{t(step.descKey)}</p>
                </div>
                {idx < arr.length - 1 && <div className="landing__step-connector" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="landing__businesses" id="businesses">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">{t('featuredBusinessesTitle')}</h2>
          <p className="landing__section-subtitle">{t('featuredBusinessesSubtitle')}</p>
          {loading ? (
            <div className="landing__businesses-grid stagger">
              {Array.from({ length: 3 }).map((_, i) => (
                <TMCard key={i} style={{ padding: '20px' }}>
                  <TMSkeleton width="100%" height={60} />
                  <div style={{ marginTop: '16px' }}>
                    <TMSkeleton width="70%" height={16} />
                  </div>
                </TMCard>
              ))}
            </div>
          ) : featuredBusinesses.length > 0 ? (
            <div className="landing__businesses-grid stagger">
              {featuredBusinesses.map((business) => (
                <TMCard key={business.id} style={{ padding: '20px' }}>
                  <div className="landing__business-card-header">
                    <div className="landing__business-avatar">
                      {business.title[0]?.toUpperCase()}
                    </div>
                    <div className="landing__business-info">
                      <h3 className="landing__business-name">{business.title}</h3>
                      {business.category && (
                        <TMBadge variant="secondary">{business.category.name}</TMBadge>
                      )}
                    </div>
                  </div>
                  {business.description && (
                    <p className="landing__business-desc">
                      {business.description.length > 100
                        ? `${business.description.substring(0, 100)}...`
                        : business.description}
                    </p>
                  )}
                  {business.address && (
                    <div className="landing__business-location">
                      <span>📍</span>
                      <span dir="auto">{business.address}</span>
                    </div>
                  )}
                </TMCard>
              ))}
            </div>
          ) : (
            <div className="landing__businesses-empty">
              <p>{t('noBusinessesYet')}</p>
              <TMButton onClick={() => navigate('/signup')}>{t('registerYourBusiness')}</TMButton>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="landing__cta">
        <div className="landing__section-inner">
          <h2 className="landing__cta-title">{t('ctaTitle')}</h2>
          <p className="landing__cta-subtitle">
            {t('ctaSubtitle')}
          </p>
          <TMButton
            onClick={() => navigate('/signup')}
            style={{ background: 'var(--color-surface)', color: 'var(--color-primary)' }}
          >
            {t('createFreeAccount')}
          </TMButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <div className="landing__logo">🏪 TradeMaster</div>
            <p className="landing__footer-tagline">
              {t('footerTagline')}
            </p>
          </div>
          <div className="landing__footer-links">
            <div className="landing__footer-col">
              <h4>{t('footerPlatform')}</h4>
              <a href="#features">{t('features')}</a>
              <a href="#how-it-works">{t('howItWorks')}</a>
              <a href="#businesses">{t('businessesNav')}</a>
            </div>
            <div className="landing__footer-col">
              <h4>{t('footerAccount')}</h4>
              <a href="/signin">{commonT('signIn')}</a>
              <a href="/signup">{commonT('signUp')}</a>
            </div>
          </div>
        </div>
        <div className="landing__footer-bottom">
          <p>{t('footerCopyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>
    </div>
  );
};

export default TMLanding;
