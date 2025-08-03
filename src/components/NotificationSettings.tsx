import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateNotificationSettings, type NotificationSettings } from '../services/userService';
import { requestNotificationPermission } from '../services/notificationService';

interface NotificationSettingsProps {
  currentSettings: NotificationSettings | null;
  onSettingsUpdated: () => void;
}

export const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({
  currentSettings,
  onSettingsUpdated
}) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotificationsEnabled: false,
    adoptionNotifications: true,
    eventNotifications: true,
    notificationRadius: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
    
    // Check current notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [currentSettings]);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        setError('Notification permission is required to enable push notifications');
        return;
      }
      setPermissionStatus('granted');
    }
    
    setSettings(prev => ({ ...prev, pushNotificationsEnabled: enabled }));
  };

  const handleSaveSettings = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      
      await updateNotificationSettings(currentUser.uid, settings);
      onSettingsUpdated();
    } catch (err) {
      setError('Failed to update notification settings');
      console.error('Error updating settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const radiusOptions = [
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 75, label: '75 km' },
    { value: 100, label: '100 km' },
    { value: 150, label: '150 km' },
    { value: 200, label: '200 km' }
  ];

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '20px', color: '#007bff' }}>
        🔔 Notification Settings
      </h3>

      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          padding: '10px',
          marginBottom: '15px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {permissionStatus === 'denied' && (
        <div style={{
          color: '#856404',
          backgroundColor: '#fff3cd',
          padding: '10px',
          marginBottom: '15px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          ⚠️ Notifications are blocked. Please enable them in your browser settings to receive push notifications.
        </div>
      )}

      {/* Enable/Disable Push Notifications */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          <input
            type="checkbox"
            checked={settings.pushNotificationsEnabled}
            onChange={(e) => handleToggleNotifications(e.target.checked)}
            style={{ marginRight: '10px', transform: 'scale(1.2)' }}
          />
          Enable Push Notifications
        </label>
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '5px', 
          marginLeft: '25px' 
        }}>
          Get notified when new adoptions or events are posted near you
        </p>
      </div>

      {/* Notification Types */}
      <div style={{ 
        marginBottom: '20px', 
        opacity: settings.pushNotificationsEnabled ? 1 : 0.5,
        pointerEvents: settings.pushNotificationsEnabled ? 'auto' : 'none'
      }}>
        <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Notification Types:</h4>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.adoptionNotifications}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                adoptionNotifications: e.target.checked 
              }))}
              style={{ marginRight: '10px' }}
            />
            🐾 Pet Adoptions
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.eventNotifications}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                eventNotifications: e.target.checked 
              }))}
              style={{ marginRight: '10px' }}
            />
            📅 Events
          </label>
        </div>
      </div>

      {/* Notification Radius */}
      <div style={{ 
        marginBottom: '20px',
        opacity: settings.pushNotificationsEnabled ? 1 : 0.5,
        pointerEvents: settings.pushNotificationsEnabled ? 'auto' : 'none'
      }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '10px', 
          fontSize: '16px',
          fontWeight: '500'
        }}>
          📍 Notification Radius:
        </label>
        <select
          value={settings.notificationRadius}
          onChange={(e) => setSettings(prev => ({ 
            ...prev, 
            notificationRadius: parseInt(e.target.value) 
          }))}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        >
          {radiusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '5px' 
        }}>
          You'll receive notifications for posts within {settings.notificationRadius}km of your location
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 20px',
          backgroundColor: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '500'
        }}
      >
        {loading ? 'Saving...' : 'Save Notification Settings'}
      </button>

      {permissionStatus === 'granted' && settings.pushNotificationsEnabled && (
        <div style={{
          color: '#155724',
          backgroundColor: '#d4edda',
          padding: '10px',
          marginTop: '15px',
          borderRadius: '4px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          ✅ Push notifications are enabled and ready!
        </div>
      )}
    </div>
  );
};
