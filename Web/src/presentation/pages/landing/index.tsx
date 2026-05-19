import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessService } from '../../../infrastructure/api/businessService';
import type { Business } from '../../../domain/types/business';
import './Landing.css';

const TMLanding: React.FC = () => {
  const navigate = useNavigate();
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ businesses: 0, products: 0, cities: 0 });

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
          products: businesses.length * 5, // approximate
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

  return (
    <div className="landing">
      {/* Navigation */}
      <header className="landing__header">
        <div className="landing__header-inner">
          <div className="landing__logo">TradeMaster</div>
          <nav className="landing__nav">
            <a href="#features" className="landing__nav-link">Features</a>
            <a href="#how-it-works" className="landing__nav-link">How It Works</a>
            <a href="#businesses" className="landing__nav-link">Businesses</a>
            <button
              className="landing__nav-btn landing__nav-btn--secondary"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </button>
            <button
              className="landing__nav-btn landing__nav-btn--primary"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing__hero">
        <div className="landing__hero-content">
          <h1 className="landing__hero-title">
            Discover Local Businesses.<br />
            <span className="landing__hero-highlight">Trade Smarter.</span>
          </h1>
          <p className="landing__hero-subtitle">
            TradeMaster connects buyers with local businesses on an interactive map.
            Find products nearby, place orders, and support your local community.
          </p>
          <div className="landing__hero-actions">
            <button
              className="landing__btn landing__btn--primary landing__btn--lg"
              onClick={() => navigate('/signup')}
            >
              Start Selling
            </button>
            <button
              className="landing__btn landing__btn--outline landing__btn--lg"
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </button>
          </div>
          <div className="landing__hero-stats">
            <div className="landing__stat">
              <span className="landing__stat-number">{stats.businesses}+</span>
              <span className="landing__stat-label">Active Businesses</span>
            </div>
            <div className="landing__stat">
              <span className="landing__stat-number">{stats.products}+</span>
              <span className="landing__stat-label">Products Listed</span>
            </div>
            <div className="landing__stat">
              <span className="landing__stat-number">{stats.cities}+</span>
              <span className="landing__stat-label">Cities</span>
            </div>
          </div>
        </div>
        <div className="landing__hero-visual">
          <div className="landing__hero-map-placeholder">
            <div className="landing__hero-map-icon">🗺️</div>
            <span>Interactive Map Experience</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing__features" id="features">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">Why TradeMaster?</h2>
          <p className="landing__section-subtitle">
            A location-based marketplace designed for local commerce
          </p>
          <div className="landing__features-grid">
            <div className="landing__feature-card">
              <div className="landing__feature-icon">📍</div>
              <h3 className="landing__feature-title">Map-Based Discovery</h3>
              <p className="landing__feature-desc">
                Explore businesses on an interactive map. Find shops, services,
                and products near your location with real-time distance information.
              </p>
            </div>
            <div className="landing__feature-card">
              <div className="landing__feature-icon">🏪</div>
              <h3 className="landing__feature-title">Seller Dashboard</h3>
              <p className="landing__feature-desc">
                Manage your business, products, orders, and customer messages
                all from one powerful dashboard. Track performance and grow.
              </p>
            </div>
            <div className="landing__feature-card">
              <div className="landing__feature-icon">📱</div>
              <h3 className="landing__feature-title">Mobile App</h3>
              <p className="landing__feature-desc">
                Browse and shop on the go with our Android app. Get
                notifications, track orders, and message sellers instantly.
              </p>
            </div>
            <div className="landing__feature-card">
              <div className="landing__feature-icon">💬</div>
              <h3 className="landing__feature-title">Direct Messaging</h3>
              <p className="landing__feature-desc">
                Chat directly with buyers or sellers. Ask questions about products,
                negotiate terms, and coordinate deliveries.
              </p>
            </div>
            <div className="landing__feature-card">
              <div className="landing__feature-icon">📦</div>
              <h3 className="landing__feature-title">Order Management</h3>
              <p className="landing__feature-desc">
                Full order lifecycle from placement to delivery. Track status
                updates in real-time and manage your supply chain.
              </p>
            </div>
            <div className="landing__feature-card">
              <div className="landing__feature-icon">⭐</div>
              <h3 className="landing__feature-title">Reviews & Ratings</h3>
              <p className="landing__feature-desc">
                Build trust with verified reviews. Buyers rate businesses after
                completed orders, helping others make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="landing__how-it-works" id="how-it-works">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">How It Works</h2>
          <p className="landing__section-subtitle">
            Get started in three simple steps
          </p>
          <div className="landing__steps">
            <div className="landing__step">
              <div className="landing__step-number">1</div>
              <h3 className="landing__step-title">Create Your Account</h3>
              <p className="landing__step-desc">
                Sign up for free and set up your profile. Whether you're a buyer
                looking for local products or a seller ready to grow, we've got you covered.
              </p>
            </div>
            <div className="landing__step-connector" />
            <div className="landing__step">
              <div className="landing__step-number">2</div>
              <h3 className="landing__step-title">Register Your Business</h3>
              <p className="landing__step-desc">
                Add your business with location, photos, and product catalog.
                Pin your shop on the map so local buyers can discover you.
              </p>
            </div>
            <div className="landing__step-connector" />
            <div className="landing__step">
              <div className="landing__step-number">3</div>
              <h3 className="landing__step-title">Start Trading</h3>
              <p className="landing__step-desc">
                Receive orders, message customers, manage deliveries, and
                grow your local business with TradeMaster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="landing__businesses" id="businesses">
        <div className="landing__section-inner">
          <h2 className="landing__section-title">Featured Businesses</h2>
          <p className="landing__section-subtitle">
            Discover what's available on the platform
          </p>
          {loading ? (
            <div className="landing__businesses-loading">Loading businesses...</div>
          ) : featuredBusinesses.length > 0 ? (
            <div className="landing__businesses-grid">
              {featuredBusinesses.map((business) => (
                <div key={business.id} className="landing__business-card">
                  <div className="landing__business-card-header">
                    <div className="landing__business-avatar">
                      {business.title[0]?.toUpperCase()}
                    </div>
                    <div className="landing__business-info">
                      <h3 className="landing__business-name">{business.title}</h3>
                      {business.category && (
                        <span className="landing__business-category">
                          {business.category.name}
                        </span>
                      )}
                    </div>
                    {business.is_active && (
                      <span className="landing__business-badge">Active</span>
                    )}
                  </div>
                  {business.description && (
                    <p className="landing__business-desc">
                      {business.description.length > 100
                        ? business.description.substring(0, 100) + '...'
                        : business.description}
                    </p>
                  )}
                  {business.address && (
                    <div className="landing__business-location">
                      📍 {business.address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="landing__businesses-empty">
              <p>No businesses registered yet. Be the first!</p>
              <button
                className="landing__btn landing__btn--primary"
                onClick={() => navigate('/signup')}
              >
                Register Your Business
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing__cta">
        <div className="landing__section-inner">
          <h2 className="landing__cta-title">Ready to Grow Your Business?</h2>
          <p className="landing__cta-subtitle">
            Join TradeMaster today and reach local customers in your area.
            Free to sign up, easy to manage.
          </p>
          <div className="landing__cta-actions">
            <button
              className="landing__btn landing__btn--white landing__btn--lg"
              onClick={() => navigate('/signup')}
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <div className="landing__logo">TradeMaster</div>
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
          <div className="landing__footer-bottom">
            <p>&copy; {new Date().getFullYear()} TradeMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TMLanding;
