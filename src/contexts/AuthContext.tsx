import React, { createContext, useEffect, useState } from 'react';
import { 
  type User, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createOrUpdateUser } from '../services/userService';
import { cleanupFCMToken } from '../services/notificationService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Save user data to Firestore
    if (result.user) {
      await createOrUpdateUser(result.user);
    }
  };

  const logout = async (): Promise<void> => {
    // Clean up FCM token before signing out
    if (currentUser) {
      try {
        await cleanupFCMToken(currentUser.uid);
      } catch (error) {
        console.error('Error cleaning up FCM token:', error);
        // Continue with logout even if cleanup fails
      }
    }
    
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user is signed in, update their data in Firestore
      if (user) {
        try {
          await createOrUpdateUser(user);
        } catch (error) {
          console.error('Error updating user data:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
