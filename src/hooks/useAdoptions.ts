import { useState, useEffect } from 'react';
import { 
  type AdoptionPost, 
  type CreateAdoptionData,
  getAdoptionPosts, 
  createAdoptionPost, 
  toggleAdoptionLike, 
  toggleInterest,
  markAdoptionCompleted,
  deleteAdoptionPost 
} from '../services/adoptionService';
import { useAuth } from './useAuth';

export const useAdoptions = () => {
  const [adoptions, setAdoptions] = useState<AdoptionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch adoption posts
  const fetchAdoptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAdoptions = await getAdoptionPosts();
      setAdoptions(fetchedAdoptions);
    } catch (err) {
      setError('Failed to load adoption posts');
      console.error('Error fetching adoptions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new adoption post
  const createNewAdoption = async (adoptionData: CreateAdoptionData) => {
    if (!currentUser) {
      throw new Error('You must be logged in to create an adoption post');
    }

    try {
      setError(null);
      const adoptionId = await createAdoptionPost(currentUser.uid, adoptionData);
      
      // Refresh the list to show the new adoption
      await fetchAdoptions();
      return adoptionId;
    } catch (err) {
      setError('Failed to create adoption post');
      console.error('Error creating adoption:', err);
      throw err;
    }
  };

  // Toggle like on an adoption post
  const likeAdoption = async (adoptionId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await toggleAdoptionLike(adoptionId, currentUser.uid);
      
      // Update local state optimistically
      setAdoptions(prev => prev.map(adoption => {
        if (adoption.id === adoptionId) {
          const isLiked = adoption.likes.includes(currentUser.uid);
          return {
            ...adoption,
            likes: isLiked 
              ? adoption.likes.filter(uid => uid !== currentUser.uid)
              : [...adoption.likes, currentUser.uid]
          };
        }
        return adoption;
      }));
    } catch (err) {
      setError('Failed to update like');
      console.error('Error liking adoption:', err);
    }
  };

  // Toggle interest in an adoption
  const toggleAdoptionInterest = async (adoptionId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await toggleInterest(adoptionId, currentUser.uid);
      
      // Update local state optimistically
      setAdoptions(prev => prev.map(adoption => {
        if (adoption.id === adoptionId) {
          const isInterested = adoption.interested.includes(currentUser.uid);
          return {
            ...adoption,
            interested: isInterested 
              ? adoption.interested.filter(uid => uid !== currentUser.uid)
              : [...adoption.interested, currentUser.uid]
          };
        }
        return adoption;
      }));
    } catch (err) {
      setError('Failed to update interest');
      console.error('Error updating interest:', err);
    }
  };

  // Mark adoption as completed
  const completeAdoption = async (adoptionId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await markAdoptionCompleted(adoptionId, currentUser.uid);
      
      // Update local state
      setAdoptions(prev => prev.map(adoption => 
        adoption.id === adoptionId 
          ? { ...adoption, isAvailable: false }
          : adoption
      ));
    } catch (err) {
      setError('Failed to mark adoption as completed');
      console.error('Error completing adoption:', err);
      throw err;
    }
  };

  // Remove an adoption post
  const removeAdoption = async (adoptionId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await deleteAdoptionPost(adoptionId, currentUser.uid);
      
      // Remove from local state
      setAdoptions(prev => prev.filter(adoption => adoption.id !== adoptionId));
    } catch (err) {
      setError('Failed to delete adoption post');
      console.error('Error deleting adoption:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAdoptions();
  }, []);

  return {
    adoptions,
    loading,
    error,
    createNewAdoption,
    likeAdoption,
    toggleAdoptionInterest,
    completeAdoption,
    removeAdoption,
    refreshAdoptions: fetchAdoptions
  };
};
