import React from 'react';
import { Card, Typography, Button, Space, Tag } from 'antd';
import type { Event } from '../services/eventService';
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface EventCardProps {
  event: Event;
  onRSVP?: (response: 'interested' | 'going') => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onRSVP }) => {
  const formatDate = (date: any) => {
    if (!date) return 'Date not set';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card
      className="event-card"
      style={{
        marginBottom: 16,
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: 'none',
        backgroundColor: '#ffffff'
      }}
      actions={
        onRSVP
          ? [
              <Button 
                key="interested" 
                onClick={() => onRSVP('interested')}
                style={{
                  borderRadius: '6px',
                  margin: '0 8px',
                  backgroundColor: '#f0f2f5',
                  border: 'none'
                }}
              >
                Interested
              </Button>,
              <Button 
                key="going" 
                type="primary" 
                onClick={() => onRSVP('going')}
                style={{
                  borderRadius: '6px',
                  margin: '0 8px',
                  backgroundColor: '#1890ff',
                  border: 'none'
                }}
              >
                Going
              </Button>,
            ]
          : undefined
      }
    >
      {event.imageUrl && (
        <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      )}
      <Space direction="vertical" size="small" style={{ width: '100%', padding: '16px' }}>
        <Tag 
          color={
            event.eventType === 'walk' ? 'green' : 
            event.eventType === 'adoption' ? 'blue' : 
            'orange'
          }
          style={{ 
            borderRadius: '4px', 
            padding: '4px 8px',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          {event.eventType}
        </Tag>
        <Title 
          level={4} 
          style={{ 
            margin: '8px 0', 
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a'
          }}
        >
          {event.title}
        </Title>
        <Space style={{ color: '#666' }}>
          <CalendarOutlined style={{ fontSize: '16px' }} />
          <Text style={{ fontSize: '14px' }}>{formatDate(event.date)}</Text>
        </Space>
        <Space style={{ color: '#666' }}>
          <EnvironmentOutlined style={{ fontSize: '16px' }} />
          <Text style={{ fontSize: '14px' }}>{event.location.address}</Text>
        </Space>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#666',
            marginTop: '8px'
          }}
        >
          {event.description}
        </Text>
      </Space>
    </Card>
  );
};


