import React from 'react';

const TMHome: React.FC = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Home</h1>
        <p className="dashboard-page__subtitle">Welcome to TradeMaster Dashboard</p>
      </div>
      <div className="dashboard-page__content">
        <div className="dashboard-empty-state">
          <div className="dashboard-empty-state__icon">🏠</div>
          <h2 className="dashboard-empty-state__title">Welcome to Home</h2>
          <p className="dashboard-empty-state__description">
            This is your dashboard home page. More features will be added here soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TMHome;