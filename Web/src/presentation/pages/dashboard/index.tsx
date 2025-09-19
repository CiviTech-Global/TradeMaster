import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../application/redux/hooks';
import { selectIsAuthenticated } from '../../../application/redux';
import { DashboardLayout } from '../../components';

const TMDashboard: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

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
