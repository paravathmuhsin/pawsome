import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationsDisplay: React.FC = () => {
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead
  } = useNotifications();

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        padding: '15px',
        borderRadius: '4px',
        margin: '20px'
      }}>
        {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#666'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
        <div>No notifications yet</div>
        <div style={{ fontSize: '14px', marginTop: '8px' }}>
          You'll receive notifications when new adoptions or events are posted near you
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0 }}>
          🔔 Notifications {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              padding: '4px 8px',
              fontSize: '12px',
              marginLeft: '8px'
            }}>
              {unreadCount}
            </span>
          )}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => notification.id && !notification.read && markAsRead(notification.id)}
            style={{
              backgroundColor: notification.read ? '#f8f9fa' : '#fff3cd',
              border: `1px solid ${notification.read ? '#dee2e6' : '#ffeaa7'}`,
              borderRadius: '8px',
              padding: '16px',
              cursor: notification.read ? 'default' : 'pointer',
              position: 'relative'
            }}
          >
            {!notification.read && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                backgroundColor: '#007bff',
                borderRadius: '50%'
              }} />
            )}

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ fontSize: '24px' }}>
                {notification.type === 'adoption' ? '🐾' : '📅'}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px',
                  color: '#333'
                }}>
                  {notification.title}
                </h4>
                
                <p style={{ 
                  margin: '0 0 8px 0', 
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {notification.body}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#999'
                }}>
                  <span>
                    {notification.createdAt?.toDate().toLocaleDateString()} at{' '}
                    {notification.createdAt?.toDate().toLocaleTimeString()}
                  </span>
                  
                  {notification.distance && (
                    <span>📍 {notification.distance}km away</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '14px',
          color: '#666'
        }}>
          {unreadCount > 0 ? (
            `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
          ) : (
            'All notifications read'
          )}
        </div>
      )}
    </div>
  );
};
