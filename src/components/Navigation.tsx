import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { useNotifications } from '../hooks/useNotifications';

export const Navigation: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const responsive = useResponsive();
  const { unreadCount } = useNotifications();

  const linkStyle = (path: string) => ({
    padding: getResponsiveValue('8px 12px', '9px 14px', '10px 15px', responsive),
    margin: getResponsiveValue('0 2px', '0 3px', '0 5px', responsive),
    textDecoration: 'none',
    color: location.pathname === path ? '#007bff' : '#666',
    backgroundColor: location.pathname === path ? '#f8f9fa' : 'transparent',
    borderRadius: '4px',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive),
    whiteSpace: 'nowrap' as const
  });

  return (
    <nav style={{
      padding: getResponsiveValue('10px 15px', '12px 18px', '15px 20px', responsive),
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      marginBottom: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: responsive.isMobile ? 'wrap' : 'nowrap',
        gap: responsive.isMobile ? '10px' : '0'
      }}>
        <Link 
          to="/" 
          style={{ 
            fontSize: getResponsiveValue('20px', '22px', '24px', responsive),
            fontWeight: 'bold', 
            textDecoration: 'none', 
            color: '#007bff',
            order: responsive.isMobile ? 1 : 0
          }}
        >
          🐾 Pawsome
        </Link>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          flexWrap: responsive.isMobile ? 'wrap' : 'nowrap',
          gap: responsive.isMobile ? '5px' : '0',
          order: responsive.isMobile ? 2 : 0
        }}>
          {currentUser ? (
            <>
              <Link to="/" style={linkStyle('/')}>
                Home
              </Link>
              
              <Link to="/adoption" style={linkStyle('/adoption')}>
                Adoption
              </Link>
              
              <Link to="/polls" style={linkStyle('/polls')}>
                Polls
              </Link>
              
              <Link to="/events" style={linkStyle('/events')}>
                Events
              </Link>
              
              <Link to="/notifications" style={{
                ...linkStyle('/notifications'),
                position: 'relative'
              }}>
                🔔 Notifications
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    minWidth: '16px',
                    textAlign: 'center'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <Link to="/profile" style={linkStyle('/profile')}>
                Profile
              </Link>
              
              <div style={{ 
                marginLeft: responsive.isMobile ? '0' : '15px',
                marginTop: responsive.isMobile ? '5px' : '0',
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                width: responsive.isMobile ? '100%' : 'auto',
                justifyContent: responsive.isMobile ? 'center' : 'flex-start'
              }}>
                <img 
                  src={currentUser.photoURL || '/images/default-avatar.jpg'} 
                  alt="Profile" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/images/default-avatar.jpg';
                  }}
                  style={{ 
                    width: getResponsiveValue('28px', '30px', '32px', responsive),
                    height: getResponsiveValue('28px', '30px', '32px', responsive),
                    borderRadius: '50%',
                    border: '1px solid #e0e0e0'
                  }} 
                />
                <span style={{ 
                  fontSize: getResponsiveValue('12px', '13px', '14px', responsive),
                  color: '#666',
                  maxWidth: responsive.isMobile ? '150px' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" style={linkStyle('/auth')}>
                Sign In
              </Link>
              <div style={{
                padding: getResponsiveValue('8px 12px', '9px 14px', '10px 15px', responsive),
                margin: getResponsiveValue('0 2px', '0 3px', '0 5px', responsive),
                color: '#999',
                fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive),
                fontStyle: 'italic'
              }}>
                Sign in to explore features
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
