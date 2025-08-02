import { useState, useEffect, useCallback } from 'react';
import { getUserData, type UserData } from '../services/userService';
import { useAuth } from './useAuth';

export const useUserData = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!currentUser) {
      setUserData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserData(currentUser.uid);
      setUserData(data);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const refreshUserData = () => {
    fetchUserData();
  };

  return { userData, loading, error, refreshUserData };
};
