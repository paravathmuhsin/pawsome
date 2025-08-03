import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Select, Space, Typography, Button, ConfigProvider, theme, DatePicker, App } from 'antd';
import type { Event } from '../services/eventService';
import { eventService } from '../services/eventService';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';

const { Title } = Typography;
const { Option } = Select;
const { useApp } = App;

export const EventPage: React.FC = () => {
  const { message } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventType, setEventType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { userData } = useUserData();

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      let loadedEvents: Event[] = [];

      if (currentUser && userData?.city && eventType === 'all') {
        loadedEvents = await eventService.getEventsByLocation(userData.city);
      } else if (eventType !== 'all') {
        loadedEvents = await eventService.getEventsByType(eventType);
      } else {
        loadedEvents = await eventService.getAllEvents();
      }

      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      message.error('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, userData?.city, eventType, message]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async (eventData: Omit<Event, 'eventId' | 'createdAt'>) => {
    if (!currentUser) {
      message.error('You must be logged in to create an event');
      return;
    }
    
    try {
      await eventService.createEvent({
        ...eventData,
        createdBy: currentUser.uid
      });
      message.success('Event created successfully!');
      setShowCreateModal(false);
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      message.error('Failed to create event. Please try again.');
    }
  };

  const handleRSVP = async (eventId: string, response: 'interested' | 'going') => {
    if (!currentUser) {
      message.error('You must be logged in to RSVP for events');
      return;
    }

    try {
      await eventService.respondToEvent({
        eventId,
        userId: currentUser.uid,
        response
      });
      message.success('RSVP updated successfully!');
      loadEvents();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      message.error('Failed to update RSVP. Please try again.');
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <div style={{ 
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: window.innerWidth < 768 ? '16px' : '0'
          }}>
            <Title 
              level={2}
              style={{
                margin: 0,
                color: '#1a1a1a',
                fontSize: '28px',
                fontWeight: 600
              }}
            >
              Events Near You
            </Title>
            
            <Space size="middle">
              <Button type="primary" onClick={() => setShowCreateModal(true)}>
                Create Event
              </Button>
              <Select
                value={eventType}
                style={{ 
                  width: 180,
                  borderRadius: '8px'
                }}
                onChange={setEventType}
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
                style={{
                  borderRadius: '8px'
                }}
                placeholder="Filter by date"
              />
            </Space>
          </div>

          {isLoading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px 0' 
            }}>
              Loading events...
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {events.map((event) => (
                <Col xs={24} sm={12} md={8} lg={6} key={event.eventId}>
                  <EventCard 
                    event={event}
                    onRSVP={(response) => handleRSVP(event.eventId!, response)}
                  />
                </Col>
              ))}
            </Row>
          )}
          
          {!isLoading && events.length === 0 && (
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
