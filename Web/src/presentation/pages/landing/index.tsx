import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessService } from '../../../infrastructure/api/businessService';
import { TMBadge, TMButton, TMCard, TMSkeleton } from '../../components';
import type { Business } from '../../../domain/types/business';
import './Landing.css';

const TMLanding: React.FC = () => {
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
      title: 'Map-Based Discovery',
      desc: 'Explore businesses on an interactive map and find local gems near you.',
    },
    {
      icon: '🏪',
      title: 'Business Profiles',
      desc: 'Rich profiles with photos, contact info, hours, and customer reviews.',
    },
    {
      icon: '📱',
      title: 'Mobile App',
      desc: 'Browse and connect with businesses on the go with our Android app.',
    },
    {
      icon: '⭐',
      title: 'Reviews & Ratings',
      desc: 'Build trust with verified reviews from the community.',
    },
  ];

  return (
    <div className="landing fade-in">
      {/* Header */}
      <header className="landing__header">
        <div className="landing__header-inner">
          <div className="landing__logo">🏪 TradeMaster</div>
          <nav className="landing__nav">
            <a href="#features" className="landing__nav-link">Features</a>
            <a href="#how-it-works" className="landing__nav-link">How It Works</a>
            <a href="#businesses" className="landing__nav-link">Businesses</a>
            <TMButton
              variant="outline"
              onClick={() => navigate('/signin')}
              style={{ minHeight: '40px', padding: '8px 16px' }}
            >
              Sign In
            </TMButton>
            <TMButton
              onClick={() => navigate('/signup')}
              style={{ minHeight: '40px', padding: '8px 16px' }}
            >
              Get Started
            </TMButton>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-content">
          <h1 className="landing__hero-title">
            Discover Local<br />
            <span className="landing__hero-highlight">Businesses</span>
          </h1>
          <p className="landing__hero-subtitle">
            TradeMaster connects you with local businesses on an interactive map.
            Find shops, services, and trusted sellers near you.
          </p>
          <div className="landing__hero-actions">
            <TMButton onClick={() => navigate('/signup')}>
              Join Free
            </TMButton>
            <TMButton
              variant="outline"
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </TMButton>
          </div>
          <div className="landing__hero-stats">
            <div className="landing__stat">
              <span className="landing__stat-number">{stats.businesses}+</span>
              <span className="landing__stat-label">Businesses</span>
            </div>
            <div className="landing__stat">
              <span className="landing__stat-number">{stats.cities}+</span>
              <span className="landing__stat-label">Cities</span>
            </div>
          </div>
        </div>
        <div className="landing__hero-visual">
          <TMCard glassmorphic style={{ height: '100%', padding: '24px' }}>
            <div className="landing__hero-map">
              <div className="landing__hero-map-marker" style={{ top: '30%', left: '25%' }}>
                🍽️
              </div>
              <div className="landing__hero-map-marker" style={{ top: '55%', left: '60%' }}>
                💈
              </div>
              <div className="landing__hero-map-marker" style={{ top: '70%', left: '35%' }}>
                🏥
              </div>
              <div className="landing__hero-map-marker" style={{ top: '40%', left: '75%' }}>
                🛒
              </div>
            </div>
          </TMCard>
        </div>
      </section>

      {/* Features */}
      <section className="landing__features" id="features">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">Why TradeMaster?</h2>
          <p className="landing__section-subtitle">
            A modern business directory designed for local discovery
          </p>
          <div className="landing__features-grid stagger">
            {features.map((f) => (
              <TMCard key={f.title} style={{ padding: '24px' }}>
                <div className="landing__feature-icon">{f.icon}</div>
                <h3 className="landing__feature-title">{f.title}</h3>
                <p className="landing__feature-desc">{f.desc}</p>
              </TMCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing__how-it-works" id="how-it-works">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">How It Works</h2>
          <p className="landing__section-subtitle">Get started in three simple steps</p>
          <div className="landing__steps">
            {[
              { num: '1', title: 'Create Your Account', desc: 'Sign up for free and set up your profile in seconds.' },
              { num: '2', title: 'Register Your Business', desc: 'Add your business with location, photos, and contact info.' },
              { num: '3', title: 'Get Discovered', desc: 'Appear on the map and connect with local customers.' },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.num}>
                <div className="landing__step">
                  <div className="landing__step-number">{step.num}</div>
                  <h3 className="landing__step-title">{step.title}</h3>
                  <p className="landing__step-desc">{step.desc}</p>
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
          <h2 className="landing__section-title">Featured Businesses</h2>
          <p className="landing__section-subtitle">Discover what's available on the platform</p>
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
                    <div className="landing__business-location">📍 {business.address}</div>
                  )}
                </TMCard>
              ))}
            </div>
          ) : (
            <div className="landing__businesses-empty">
              <p>No businesses registered yet. Be the first!</p>
              <TMButton onClick={() => navigate('/signup')}>Register Your Business</TMButton>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="landing__cta">
        <div className="landing__section-inner">
          <h2 className="landing__cta-title">Ready to Grow Your Business?</h2>
          <p className="landing__cta-subtitle">
            Join TradeMaster today and reach local customers in your area.
          </p>
          <TMButton
            onClick={() => navigate('/signup')}
            style={{ background: '#fff', color: 'var(--color-primary)' }}
          >
            Create Free Account
          </TMButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <div className="landing__logo">🏪 TradeMaster</div>
            <p className="landing__footer-tagline">
              Connecting local businesses with their community.
            </p>
          </div>
          <div className="landing__footer-links">
            <div className="landing__footer-col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#businesses">Businesses</a>
            </div>
            <div className="landing__footer-col">
              <h4>Account</h4>
              <a href="/signin">Sign In</a>
              <a href="/signup">Sign Up</a>
            </div>
          </div>
        </div>
        <div className="landing__footer-bottom">
          <p>&copy; {new Date().getFullYear()} TradeMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TMLanding;
