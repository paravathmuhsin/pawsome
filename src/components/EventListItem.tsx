import React from 'react';
import { Button, Typography, Space, Tag } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Event } from '../services/eventService';

const { Text, Title } = Typography;

interface EventListItemProps {
  event: Event;
  onRSVP: (response: 'interested' | 'going') => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({ event, onRSVP }) => {
  console.log('Event data:', event);
  console.log('Event date:', event.date);
  return (
    <div style={{
      display: 'flex',
      padding: '20px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      marginBottom: '16px',
      gap: '20px',
      alignItems: 'center',
      border: '1px solid #e8e8e8'
    }}>
      {/* Left: Event Image */}
      <div style={{
        flexShrink: 0,
        width: '120px',
        height: '120px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={event.imageUrl || '/images/default-event.jpg'} 
          alt={event.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = '/images/default-event.jpg';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Middle: Event Details */}
      <div style={{ flex: 1 }}>
        <Tag color={
          event.eventType === 'walk' ? 'green' :
          event.eventType === 'adoption' ? 'blue' :
          event.eventType === 'training' ? 'orange' : 'default'
        }>
          {event.eventType ? (
            event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)
          ) : (
            'Unknown Type'
          )}
        </Tag>
        
        <Title level={4} style={{ margin: '8px 0' }}>
          {event.title}
        </Title>
        
        <Space direction="vertical" size="small">
          <Text type="secondary">
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {event.date ? event.date.toDate().toLocaleDateString(undefined, { 
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Date not set'}
          </Text>
          <Text type="secondary">
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            {event.location?.address || 'Location TBD'}
          </Text>
        </Space>
      </div>

      {/* Right: RSVP Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0,
        minWidth: '120px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Button
            onClick={() => onRSVP('interested')}
            style={{ 
              width: '100%',
              borderColor: '#1890ff',
              color: '#1890ff',
              marginBottom: '4px'
            }}
          >
            Interested
          </Button>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: '12px' }}>
            {event.interestedCount || 0} interested
          </Text>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            onClick={() => onRSVP('going')}
            style={{ 
              width: '100%',
              background: '#1890ff',
              marginBottom: '4px'
            }}
          >
            Going
          </Button>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: '12px' }}>
            {event.goingCount || 0} going
          </Text>
        </div>
      </div>
    </div>
  );
};
