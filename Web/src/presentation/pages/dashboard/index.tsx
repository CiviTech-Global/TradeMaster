import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { DashboardLayout } from '../../components';

const TMDashboard: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <DashboardLayout>
      <Navigate to="/dashboard/home" replace />
    </DashboardLayout>
  );
};

export default TMDashboard;
