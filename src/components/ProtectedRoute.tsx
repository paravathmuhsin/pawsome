import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  // If user is not authenticated, redirect to auth page
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated, render the children
  return <>{children}</>;
};
