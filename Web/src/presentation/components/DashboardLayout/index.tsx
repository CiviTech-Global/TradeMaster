import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-layout__main">
        <div className="dashboard-layout__content">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;