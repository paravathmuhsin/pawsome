import { useState, useEffect, useCallback } from 'react';
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
import { DocumentSnapshot } from 'firebase/firestore';

export const useAdoptions = () => {
  const [adoptions, setAdoptions] = useState<AdoptionPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { currentUser } = useAuth();

  // Fetch adoption posts
  const fetchAdoptions = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setAdoptions([]);
        setLastDoc(null);
        setHasMore(true);
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      const startAfter = reset ? undefined : lastDoc || undefined;
      const fetchedAdoptions = await getAdoptionPosts(9, startAfter);
      
      if (reset) {
        setAdoptions(fetchedAdoptions.posts);
      } else {
        setAdoptions(prev => [...prev, ...fetchedAdoptions.posts]);
      }

      setLastDoc(fetchedAdoptions.lastDoc);
      setHasMore(fetchedAdoptions.posts.length === 9 && fetchedAdoptions.lastDoc !== null);
    } catch (err) {
      setError(reset ? 'Failed to load adoption posts' : 'Failed to load more adoption posts');
      console.error('Error fetching adoptions:', err);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [lastDoc]);

  // Load more adoptions for manual button
  const loadMoreAdoptions = useCallback(async () => {
    if (!hasMore || loadingMore || initialLoading) {
      console.log('❌ Skipping loadMore:', { hasMore, loadingMore, initialLoading });
      return;
    }
    console.log('✅ Loading more adoptions...');
    await fetchAdoptions(false);
  }, [fetchAdoptions, hasMore, loadingMore, initialLoading]);

  // Initial load
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        const result = await getAdoptionPosts(9);
        console.log('📊 Initial adoption fetch:', result.posts.length, 'adoptions loaded');
        setAdoptions(result.posts);
        setLastDoc(result.lastDoc);
        setHasMore(result.posts.length === 9 && result.lastDoc !== null);
      } catch (err) {
        setError('Failed to fetch adoption posts');
        console.error('Error fetching adoptions:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    initialFetch();
  }, []);

  // Remove infinite scroll - using manual load more button instead
  const isFetching = false;

  // Create a new adoption post
  const createNewAdoption = async (adoptionData: CreateAdoptionData) => {
    if (!currentUser) {
      throw new Error('You must be logged in to create an adoption post');
    }

    try {
      setError(null);
      const adoptionId = await createAdoptionPost(currentUser.uid, adoptionData);
      
      // Refresh the list to show the new adoption
      await fetchAdoptions(true);
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

  return {
    adoptions,
    loading: initialLoading,
    loadingMore: loadingMore || isFetching,
    error,
    hasMore,
    createNewAdoption,
    likeAdoption,
    toggleAdoptionInterest,
    completeAdoption,
    removeAdoption,
    refreshAdoptions: () => fetchAdoptions(true),
    loadMoreAdoptions
  };
};
