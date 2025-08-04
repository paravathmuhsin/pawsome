import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { LocationUpdate } from '../components/LocationUpdate';
import { NotificationSettingsComponent } from '../components/NotificationSettings';

export const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { userData, loading, error, refreshUserData } = useUserData();
  const [imageLoadError, setImageLoadError] = useState(false);

  // This should never happen since we're wrapped in ProtectedRoute, but adding for TypeScript
  if (!currentUser) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Handle logout error silently
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Profile</h2>
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading user data...
        </div>
      )}
      
      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {currentUser.photoURL && !imageLoadError ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              onError={() => setImageLoadError(true)}
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                marginBottom: '15px',
                border: '3px solid #e0e0e0'
              }} 
            />
          ) : (
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '15px',
                border: '3px solid #e0e0e0',
                margin: '0 auto 15px auto'
              }}
            >
              {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <h3 style={{ marginBottom: '15px', color: '#007bff' }}>Firebase Auth Data:</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Display Name:</strong> {currentUser.displayName || 'Not provided'}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Email:</strong> {currentUser.email}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>User ID:</strong> {currentUser.uid}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Email Verified:</strong> {currentUser.emailVerified ? 'Yes' : 'No'}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <strong>Account Created:</strong> {currentUser.metadata.creationTime}
        </div>
        
        <h3 style={{ marginBottom: '15px', color: '#28a745' }}>Profile Information:</h3>
        
        <LocationUpdate 
          currentLocation={userData?.location || null}
          onLocationUpdated={refreshUserData}
        />

        <NotificationSettingsComponent
          currentSettings={userData?.notificationSettings || null}
          onSettingsUpdated={refreshUserData}
        />
        
        {userData && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <strong>Login Count:</strong> {userData.loginCount}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>First Login:</strong> {userData.createdAt?.toDate().toLocaleString()}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Last Login:</strong> {userData.lastLoginAt?.toDate().toLocaleString()}
            </div>
          </>
        )}
      </div>
      
      <button 
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Sign Out
      </button>
    </div>
  );
};
