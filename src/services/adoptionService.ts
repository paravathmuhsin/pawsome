import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Timestamp,
  type DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { notifyEligibleUsers } from './notificationService';

export interface AdoptionPost {
  id: string;
  createdBy: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other';
  breed: string;
  age: number; // in months
  gender: 'male' | 'female' | 'unknown';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  color: string;
  description: string;
  story?: string; // optional backstory
  vaccinated: boolean;
  spayedNeutered: boolean;
  isAvailable: boolean;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  interested: string[]; // array of userIds
  media: string[]; // photos/videos
  likes: string[];
  commentsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateAdoptionData {
  name: string;
  type: AdoptionPost['type'];
  breed: string;
  age: number;
  gender: AdoptionPost['gender'];
  size: AdoptionPost['size'];
  color: string;
  description: string;
  story?: string;
  vaccinated: boolean;
  spayedNeutered: boolean;
  location: AdoptionPost['location'];
  media?: string[];
}

// Create a new adoption post
export const createAdoptionPost = async (userId: string, adoptionData: CreateAdoptionData): Promise<string> => {
  try {
    const adoptionRef = await addDoc(collection(db, 'adoptions'), {
      createdBy: userId,
      name: adoptionData.name,
      type: adoptionData.type,
      breed: adoptionData.breed,
      age: adoptionData.age,
      gender: adoptionData.gender,
      size: adoptionData.size,
      color: adoptionData.color,
      description: adoptionData.description,
      story: adoptionData.story || '',
      vaccinated: adoptionData.vaccinated,
      spayedNeutered: adoptionData.spayedNeutered,
      isAvailable: true, // Always true when creating
      location: adoptionData.location,
      interested: [],
      media: adoptionData.media || [],
      likes: [],
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Trigger notifications for eligible users
    try {
      await notifyEligibleUsers(
        {
          id: adoptionRef.id,
          petName: adoptionData.name,
          description: adoptionData.description,
          location: {
            latitude: adoptionData.location.latitude,
            longitude: adoptionData.location.longitude
          },
          createdBy: userId
        },
        'adoption'
      );
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't throw error - post creation should succeed even if notifications fail
    }
    
    return adoptionRef.id;
  } catch (error) {
    console.error('Error creating adoption post:', error);
    throw error;
  }
};

// Get all adoption posts (available first)
export const getAdoptionPosts = async (
  limitCount: number = 10, 
  lastDoc?: DocumentSnapshot
): Promise<{ posts: AdoptionPost[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, 'adoptions'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'adoptions'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AdoptionPost));
    
    // Sort in JavaScript to put available pets first
    const sortedPosts = posts.sort((a, b) => {
      if (a.isAvailable === b.isAvailable) {
        return 0; // Keep original order (already sorted by createdAt desc)
      }
      return a.isAvailable ? -1 : 1; // Available pets first
    });

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return { posts: sortedPosts, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Error fetching adoption posts:', error);
    throw error;
  }
};

// Show interest in an adoption
export const toggleInterest = async (adoptionId: string, userId: string): Promise<void> => {
  try {
    const adoptionRef = doc(db, 'adoptions', adoptionId);
    
    // First get the current document to check if user is already interested
    const adoptionDoc = await import('firebase/firestore').then(fb => fb.getDoc(adoptionRef));
    if (!adoptionDoc.exists()) throw new Error('Adoption post not found');
    
    const data = adoptionDoc.data() as AdoptionPost;
    const isAlreadyInterested = data.interested.includes(userId);
    
    if (isAlreadyInterested) {
      // Remove interest
      await updateDoc(adoptionRef, {
        interested: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // Add interest
      await updateDoc(adoptionRef, {
        interested: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error toggling interest:', error);
    throw error;
  }
};

// Like/unlike an adoption post
export const toggleAdoptionLike = async (adoptionId: string, userId: string): Promise<void> => {
  try {
    const adoptionRef = doc(db, 'adoptions', adoptionId);
    
    // Get current document to check if user already liked
    const adoptionDoc = await import('firebase/firestore').then(fb => fb.getDoc(adoptionRef));
    if (!adoptionDoc.exists()) throw new Error('Adoption post not found');
    
    const data = adoptionDoc.data() as AdoptionPost;
    const isAlreadyLiked = data.likes.includes(userId);
    
    if (isAlreadyLiked) {
      // Remove like
      await updateDoc(adoptionRef, {
        likes: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // Add like
      await updateDoc(adoptionRef, {
        likes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Mark adoption as completed/unavailable
export const markAdoptionCompleted = async (adoptionId: string, userId: string): Promise<void> => {
  try {
    const adoptionRef = doc(db, 'adoptions', adoptionId);
    
    // Verify user owns this adoption post
    const adoptionDoc = await import('firebase/firestore').then(fb => fb.getDoc(adoptionRef));
    if (!adoptionDoc.exists()) throw new Error('Adoption post not found');
    
    const data = adoptionDoc.data() as AdoptionPost;
    if (data.createdBy !== userId) {
      throw new Error('You can only mark your own adoption posts as completed');
    }
    
    await updateDoc(adoptionRef, {
      isAvailable: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking adoption as completed:', error);
    throw error;
  }
};

// Delete an adoption post
export const deleteAdoptionPost = async (adoptionId: string, userId: string): Promise<void> => {
  try {
    const adoptionRef = doc(db, 'adoptions', adoptionId);
    
    // Verify user owns this adoption post
    const adoptionDoc = await import('firebase/firestore').then(fb => fb.getDoc(adoptionRef));
    if (!adoptionDoc.exists()) throw new Error('Adoption post not found');
    
    const data = adoptionDoc.data() as AdoptionPost;
    if (data.createdBy !== userId) {
      throw new Error('You can only delete your own adoption posts');
    }
    
    await deleteDoc(adoptionRef);
  } catch (error) {
    console.error('Error deleting adoption post:', error);
    throw error;
  }
};
