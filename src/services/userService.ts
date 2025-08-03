import { doc, getDoc, setDoc, updateDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { db } from '../firebase/config';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  location: GeoLocation | null;
  city?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  loginCount: number;
}

// Create or update user document in Firestore
export const createOrUpdateUser = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // User exists, update login info (but preserve location if it exists)
      const existingData = userSnap.data();
      await updateDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: serverTimestamp(),
        loginCount: (existingData.loginCount || 0) + 1,
        // Keep existing location if it exists
        ...(existingData.location ? { location: existingData.location } : {})
      });
    } else {
      // New user, create document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        location: null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        loginCount: 1
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Update user location
export const updateUserLocation = async (uid: string, location: GeoLocation): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      location: location
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};
