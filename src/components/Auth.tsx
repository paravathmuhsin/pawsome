import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';

export const Auth: React.FC = () => {
  const { currentUser, signInWithGoogle, signInWithGithub, logout } = useAuth();
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

  const handleGithubSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGithub();
    } catch (error) {
      setError('Failed to sign in with GitHub: ' + (error as Error).message);
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
      }}>Sign In to Pawsome</h2>
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
          Choose your preferred sign-in method to continue
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
            minHeight: '48px',
            marginBottom: '12px'
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

        <button
          onClick={handleGithubSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: getResponsiveValue('14px 20px', '13px 20px', '12px 20px', responsive),
            backgroundColor: '#333',
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with GitHub'}
        </button>
      </div>
    </div>
  );
};
