import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc, updateDoc, deleteDoc, orderBy, limit, startAfter, type DocumentSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { notifyEligibleUsers } from './notificationService';

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
  interestedCount?: number;
  goingCount?: number;
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
    
    // Trigger notifications for eligible users
    try {
      await notifyEligibleUsers(
        {
          id: docRef.id,
          eventName: event.title,
          description: event.description,
          location: event.location ? {
            latitude: event.location.latitude,
            longitude: event.location.longitude
          } : undefined,
          createdBy: event.createdBy
        },
        'event'
      );
    } catch (notificationError) {
      console.error('Error sending event notifications:', notificationError);
      // Don't throw error - event creation should succeed even if notifications fail
    }
    
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

  async getAllEvents(
    limitCount: number = 10, 
    lastDoc?: DocumentSnapshot
  ): Promise<{ events: Event[]; lastDoc: DocumentSnapshot | null }> {
    let q = query(
      eventsCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(
        eventsCollection,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      eventId: doc.id
    })) as Event[];
    
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    
    return { events, lastDoc: newLastDoc };
  },

  async respondToEvent(response: EventResponse) {
    try {
      // First, remove any existing response from this user
      const existingResponseQuery = query(
        eventResponsesCollection,
        where('eventId', '==', response.eventId),
        where('userId', '==', response.userId)
      );
      const existingResponseDocs = await getDocs(existingResponseQuery);
      
      if (!existingResponseDocs.empty) {
        // Delete the old response document
        const oldDoc = existingResponseDocs.docs[0];
        const oldResponse = oldDoc.data() as EventResponse;
        await deleteDoc(doc(eventResponsesCollection, oldDoc.id));
        
        // Update the counts based on the old response
        await this.updateEventCounts(response.eventId, oldResponse.response, -1);
      }

      // Add the new response
      const docRef = await addDoc(eventResponsesCollection, response);
      
      // Initialize counts if they don't exist
      const eventRef = doc(eventsCollection, response.eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as Event;
        if (typeof eventData.interestedCount === 'undefined') {
          await updateDoc(eventRef, { interestedCount: 0 });
        }
        if (typeof eventData.goingCount === 'undefined') {
          await updateDoc(eventRef, { goingCount: 0 });
        }
      }

      // Update the counts based on the new response
      await this.updateEventCounts(response.eventId, response.response, 1);
      
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  async updateEventCounts(eventId: string, responseType: 'interested' | 'going', change: number) {
    try {
      const eventRef = doc(eventsCollection, eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as Event;
        const updateData: Partial<Event> = {};
        
        if (responseType === 'interested') {
          const newCount = Math.max(0, (eventData.interestedCount || 0) + change);
          updateData.interestedCount = newCount;
        } else {
          const newCount = Math.max(0, (eventData.goingCount || 0) + change);
          updateData.goingCount = newCount;
        }
        
        await updateDoc(eventRef, updateData);
      }
    } catch (error) {
      throw error;
    }
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
