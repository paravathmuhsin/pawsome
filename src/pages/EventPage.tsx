import React, { useState } from 'react';
import { Select, Space, Typography, Button, ConfigProvider, theme, DatePicker, App } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import type { Event } from '../services/eventService';
import { EventListItem } from '../components/EventListItem';
import { CreateEventModal } from '../components/CreateEventModal';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { useUserData } from '../hooks/useUserData';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';

const { Title } = Typography;
const { Option } = Select;
const { useApp } = App;

export const EventPage: React.FC = () => {
  const { message } = useApp();
  const [eventType, setEventType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { currentUser } = useAuth();
  const { userData } = useUserData();
  const responsive = useResponsive();
  
  const {
    events,
    loading,
    loadingMore,
    hasMore,
    createNewEvent,
    handleRSVP,
    loadMoreEvents
  } = useEvents(eventType, userData?.city);

  const handleCreateEvent = async (eventData: Omit<Event, 'eventId' | 'createdAt'>) => {
    if (!currentUser) {
      message.error('You must be logged in to create an event');
      return;
    }
    
    try {
      await createNewEvent({
        ...eventData,
        createdBy: currentUser.uid
      });
      message.success('Event created successfully!');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating event:', error);
      message.error('Failed to create event. Please try again.');
    }
  };

  const handleEventRSVP = async (eventId: string, response: 'interested' | 'going') => {
    if (!currentUser) {
      message.error('You must be logged in to RSVP for events');
      return;
    }

    try {
      await handleRSVP(eventId, response);
      // Silent success - no message
    } catch (error) {
      console.error('Error updating RSVP:', error);
      // Only show error message for actual failures
      message.error('Failed to update RSVP. Please try again.');
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div style={{
        padding: getResponsiveValue('10px', '15px', '20px', responsive),
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexDirection: responsive.isMobile ? 'column' : 'row',
            gap: responsive.isMobile ? '16px' : '0'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: getResponsiveValue('1.8rem', '2rem', '2.2rem', responsive),
                color: '#333',
                textAlign: responsive.isMobile ? 'center' : 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CalendarOutlined style={{ color: '#1890ff' }} /> Pet Events
              </h1>
              <p style={{
                margin: '8px 0 0 0',
                color: '#666',
                fontSize: getResponsiveValue('14px', '15px', '16px', responsive),
                textAlign: responsive.isMobile ? 'center' : 'left'
              }}>
                Join and create exciting pet-friendly events in your area
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {currentUser && (
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background: '#1890ff',
                    borderRadius: '8px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 20px',
                    fontWeight: 500
                  }}
                  icon={<PlusOutlined />}
                >
                  Create Event
                </Button>
              )}
              <Select
                value={eventType}
                style={{ 
                  width: 180,
                  borderRadius: '8px'
                }}
                size="large"
                onChange={(value) => {
                  setEventType(value);
                }}
              >
                <Option value="all">All Events</Option>
                <Option value="walk">Pet Walks</Option>
                <Option value="adoption">Adoption Camps</Option>
                <Option value="training">Training Sessions</Option>
              </Select>
              
              <DatePicker 
                onChange={() => {
                  // TODO: Implement date filtering logic
                }}
                size="large"
                style={{
                  borderRadius: '8px',
                  width: '160px'
                }}
                placeholder="Filter by date"
              />
            </div>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ fontSize: '24px' }}>🐾</div>
              <Space>
                <Typography.Text type="secondary">Loading events</Typography.Text>
                <Typography.Text type="secondary" style={{ animation: 'dots 1.4s infinite' }}>...</Typography.Text>
              </Space>
              <style>{`
                @keyframes dots {
                  0%, 20% { content: '.'; }
                  40% { content: '..'; }
                  60% { content: '...'; }
                  80%, 100% { content: ''; }
                }
              `}</style>
            </div>
          ) : (
            <>
              <div 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {events.map((event, index) => (
                  <div
                    key={event.eventId}
                    style={{
                      animation: `fadeInUp 0.3s ease forwards`,
                      animationDelay: `${index * 0.1}s`,
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    <EventListItem
                      event={event}
                      onRSVP={(response) => handleEventRSVP(event.eventId!, response)}
                    />
                  </div>
                ))}
                <style>{`
                  @keyframes fadeInUp {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}</style>
              </div>
              
              {/* Manual Load More Button */}
              {hasMore && !loadingMore && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <Button 
                    onClick={loadMoreEvents}
                    type="primary"
                    size="large"
                    style={{
                      background: '#1890ff',
                      borderRadius: '8px',
                      height: '40px',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                    }}
                  >
                    📅 Load More Events
                  </Button>
                </div>
              )}
              
              {/* Loading more indicator */}
              {loadingMore && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#1890ff'
                }}>
                  <Typography.Text>Loading more events...</Typography.Text>
                </div>
              )}
              
              {/* End of content indicator */}
              {!hasMore && events.length > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#999'
                }}>
                  <Typography.Text type="secondary">
                    🎉 You've seen all available events!
                  </Typography.Text>
                </div>
              )}
            </>
          )}
          
          {!loading && events.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px 0',
              color: '#666'
            }}>
              <Title level={4} style={{ color: '#666' }}>No events found</Title>
              <Typography.Text>Try adjusting your filters or check back later for new events.</Typography.Text>
            </div>
          )}
        </Space>

        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateEvent={handleCreateEvent}
        />
      </div>
    </ConfigProvider>
  );
};
