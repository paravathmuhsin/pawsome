import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Auth } from '../components/Auth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';

export const AuthPage: React.FC = () => {
  const { currentUser } = useAuth();
  const responsive = useResponsive();

  // If user is already signed in, redirect to home
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ 
      padding: getResponsiveValue('15px', '18px', '20px', responsive),
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Auth />
    </div>
  );
};
