import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';

export const Auth: React.FC = () => {
  const { currentUser, signInWithGoogle, logout } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const responsive = useResponsive();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      setError('Failed to sign in with Google: ' + (error as Error).message);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError('Failed to log out: ' + (error as Error).message);
    }
  };

  if (currentUser) {
    return (
      <div style={{ 
        padding: getResponsiveValue('15px', '18px', '20px', responsive), 
        maxWidth: '400px', 
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{ 
          fontSize: getResponsiveValue('1.3rem', '1.4rem', '1.5rem', responsive),
          textAlign: 'center'
        }}>Welcome!</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {currentUser.photoURL && (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              style={{ 
                width: getResponsiveValue('60px', '70px', '80px', responsive),
                height: getResponsiveValue('60px', '70px', '80px', responsive),
                borderRadius: '50%', 
                marginBottom: '10px' 
              }} 
            />
          )}
          <p style={{ fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive) }}>
            <strong>Name:</strong> {currentUser.displayName}
          </p>
          <p style={{ 
            fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive),
            wordBreak: 'break-word'
          }}>
            <strong>Email:</strong> {currentUser.email}
          </p>
          <p style={{ 
            fontSize: getResponsiveValue('0.8rem', '0.85rem', '0.9rem', responsive),
            color: '#666'
          }}>
            <strong>UID:</strong> {currentUser.uid}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: getResponsiveValue('12px 20px', '11px 20px', '10px 20px', responsive),
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: getResponsiveValue('16px', '15px', '14px', responsive),
            fontWeight: 'bold'
          }}
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: getResponsiveValue('15px', '18px', '20px', responsive), 
      maxWidth: '400px', 
      margin: '0 auto',
      width: '100%'
    }}>
      <h2 style={{ 
        fontSize: getResponsiveValue('1.3rem', '1.4rem', '1.5rem', responsive),
        textAlign: 'center'
      }}>Google Authentication</h2>
      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px',
          fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive)
        }}>
          {error}
        </div>
      )}
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          marginBottom: '20px', 
          color: '#666',
          fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive)
        }}>
          Sign in with your Google account to continue
        </p>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: getResponsiveValue('14px 20px', '13px 20px', '12px 20px', responsive),
            backgroundColor: '#db4437',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: getResponsiveValue('16px', '15px', '14px', responsive),
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            minHeight: '48px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
            <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14Z"/>
            <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.7Z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};
