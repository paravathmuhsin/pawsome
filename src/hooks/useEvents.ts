import { useState, useEffect, useCallback } from 'react';
import { 
  type Event, 
  type EventResponse,
  eventService 
} from '../services/eventService';
import { useAuth } from './useAuth';
import { DocumentSnapshot } from 'firebase/firestore';

export const useEvents = (eventType?: string, location?: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { currentUser } = useAuth();

  // Fetch events based on filters
  const fetchEvents = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setEvents([]);
        setLastDoc(null);
        setHasMore(true);
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      let result: Event[] | { events: Event[], lastDoc: DocumentSnapshot | null };
      const startAfter = reset ? undefined : lastDoc || undefined;
      
      if (location && (!eventType || eventType === 'all')) {
        result = await eventService.getEventsByLocation(location);
      } else if (eventType && eventType !== 'all') {
        result = await eventService.getEventsByType(eventType);
      } else {
        result = await eventService.getAllEvents(10, startAfter);
      }

      // Handle both old and new return types
      const newEvents = Array.isArray(result) ? result : result.events;
      const newLastDoc = Array.isArray(result) ? null : result.lastDoc;

      if (reset) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      setLastDoc(newLastDoc);
      setHasMore(newEvents.length === 10 && newLastDoc !== null);
    } catch (err) {
      setError(reset ? 'Failed to load events' : 'Failed to load more events');
      console.error('Error fetching events:', err);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [eventType, location, lastDoc]);

  // Load more events for manual button
  const loadMoreEvents = useCallback(async () => {
    if (!hasMore || loadingMore || initialLoading) {
      console.log('❌ Skipping loadMore:', { hasMore, loadingMore, initialLoading });
      return;
    }
    console.log('✅ Loading more events...');
    await fetchEvents(false);
  }, [fetchEvents, hasMore, loadingMore, initialLoading]);

  // Initial load and filter changes
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        let result: Event[] | { events: Event[], lastDoc: DocumentSnapshot | null };
        
        if (location && (!eventType || eventType === 'all')) {
          result = await eventService.getEventsByLocation(location);
        } else if (eventType && eventType !== 'all') {
          result = await eventService.getEventsByType(eventType);
        } else {
          result = await eventService.getAllEvents(10);
        }

        // Handle both old and new return types
        const newEvents = Array.isArray(result) ? result : result.events;
        const newLastDoc = Array.isArray(result) ? null : result.lastDoc;

        console.log('📊 Initial events fetch:', newEvents.length, 'events loaded');
        setEvents(newEvents);
        setLastDoc(newLastDoc);
        setHasMore(newEvents.length === 10 && newLastDoc !== null);
      } catch (err) {
        setError('Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    initialFetch();
  }, [eventType, location]);

  // Remove infinite scroll - using manual load more button instead
  const isFetching = false;

  // Create a new event
  const createNewEvent = async (eventData: Omit<Event, 'eventId' | 'createdAt'>) => {
    if (!currentUser) {
      throw new Error('You must be logged in to create an event');
    }

    try {
      setError(null);
      const newEvent = await eventService.createEvent(eventData);
      
      // Refresh the list to show the new event
      await fetchEvents(true);
      return newEvent.eventId;
    } catch (err) {
      setError('Failed to create event');
      console.error('Error creating event:', err);
      throw err;
    }
  };

  // RSVP to an event
  const handleRSVP = async (eventId: string, responseType: 'interested' | 'going') => {
    if (!currentUser) {
      throw new Error('You must be logged in to RSVP');
    }

    try {
      setError(null);
      const response: EventResponse = {
        userId: currentUser.uid,
        eventId,
        response: responseType
      };
      
      await eventService.respondToEvent(response);
      
      // Update the local state
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.eventId === eventId) {
            const updatedEvent = { ...event };
            
            if (responseType === 'interested') {
              updatedEvent.interestedCount = (updatedEvent.interestedCount || 0) + 1;
            } else {
              updatedEvent.goingCount = (updatedEvent.goingCount || 0) + 1;
            }
            
            return updatedEvent;
          }
          return event;
        })
      );
    } catch (err) {
      setError('Failed to update RSVP');
      console.error('Error updating RSVP:', err);
      throw err;
    }
  };

  return {
    events,
    loading: initialLoading,
    loadingMore: loadingMore || isFetching,
    error,
    hasMore,
    fetchEvents: () => fetchEvents(true),
    createNewEvent,
    handleRSVP,
    loadMoreEvents
  };
};
