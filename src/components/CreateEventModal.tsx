import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, message } from 'antd';
import type { Event } from '../services/eventService';
import { LocationPicker } from './LocationPicker';
import { useAuth } from '../hooks/useAuth';
import { Timestamp } from 'firebase/firestore';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: Omit<Event, 'eventId' | 'createdAt'>) => Promise<void>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const [location, setLocation] = useState<Event['location']>({
    address: '',
    latitude: 0,
    longitude: 0
  });
  const [locationError, setLocationError] = useState<string>();

  const handleLocationChange = (loc: { address: string; latitude: number; longitude: number }) => {
    setLocationError(undefined);
    setLocation(loc);
  };

  const handleSubmit = async () => {
    try {
      if (!location.address) {
        setLocationError('Please select a location');
        return;
      }
      setLoading(true);
      const values = await form.validateFields();
      
      const eventData: Omit<Event, 'eventId' | 'createdAt'> = {
        title: values.title,
        description: values.description,
        date: Timestamp.fromDate(values.date.toDate()),
        location: location,
        eventType: values.eventType,
        createdBy: currentUser?.uid || 'system'
      };

      // Only add imageUrl if it's not empty
      if (values.imageUrl) {
        eventData.imageUrl = values.imageUrl;
      }

      await onCreateEvent(eventData);
      message.success('Event created successfully!');
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      message.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Event"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          Create Event
        </Button>
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          eventType: 'walk'
        }}
      >
        <Form.Item
          name="title"
          label="Event Title"
          rules={[{ required: true, message: 'Please enter event title' }]}
        >
          <Input placeholder="Enter event title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter event description' }]}
        >
          <Input.TextArea rows={4} placeholder="Describe your event" />
        </Form.Item>

        <Form.Item
          name="eventType"
          label="Event Type"
          rules={[{ required: true, message: 'Please select event type' }]}
        >
          <Select>
            <Select.Option value="walk">Pet Walk</Select.Option>
            <Select.Option value="adoption">Adoption Camp</Select.Option>
            <Select.Option value="training">Training Session</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Event Date"
          rules={[{ required: true, message: 'Please select event date' }]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="Event Image URL"
        >
          <Input placeholder="Enter image URL (optional)" />
        </Form.Item>

        <Form.Item
          label="Location"
          validateStatus={locationError ? 'error' : ''}
          help={locationError}
        >
          <LocationPicker
            onLocationChange={handleLocationChange}
            location={location}
            error={locationError}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
