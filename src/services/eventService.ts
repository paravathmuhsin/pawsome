import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Event {
  eventId?: string;
  title: string;
  description: string;
  date: Timestamp;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  eventType: 'walk' | 'adoption' | 'training';
  imageUrl?: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface EventResponse {
  userId: string;
  eventId: string;
  response: 'interested' | 'going';
}

const eventsCollection = collection(db, 'events');
const eventResponsesCollection = collection(db, 'eventResponses');

export const eventService = {
  async createEvent(event: Omit<Event, 'eventId' | 'createdAt'>) {
    const eventData = {
      ...event,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(eventsCollection, eventData);
    return { ...eventData, eventId: docRef.id };
  },

  async getEventsByLocation(address: string) {
    const q = query(eventsCollection, where('location.address', '==', address));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      eventId: doc.id,
    })) as Event[];
  },

  async getEventsByType(eventType: string) {
    const q = query(eventsCollection, where('eventType', '==', eventType));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      eventId: doc.id
    })) as Event[];
  },

  async getAllEvents() {
    const querySnapshot = await getDocs(eventsCollection);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      eventId: doc.id
    })) as Event[];
  },

  async respondToEvent(response: EventResponse) {
    return addDoc(eventResponsesCollection, response);
  },

  async getUpcomingEvents() {
    const now = Timestamp.now();
    const q = query(eventsCollection, where('date', '>=', now));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      eventId: doc.id,
    })) as Event[];
  }
};
