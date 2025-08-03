import { useState, useEffect, useCallback } from 'react';
import { 
  type Poll, 
  type CreatePollData,
  getPolls, 
  createPoll, 
  voteOnPoll,
  removeVoteFromPoll,
  closePoll,
  deletePoll 
} from '../services/pollService';
import { useAuth } from './useAuth';
import { type Timestamp, DocumentSnapshot } from 'firebase/firestore';

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { currentUser } = useAuth();

  // Fetch polls
  const fetchPolls = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setPolls([]);
        setLastDoc(null);
        setHasMore(true);
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      const startAfter = reset ? undefined : lastDoc || undefined;
      const fetchedPolls = await getPolls(10, startAfter);
      
      if (reset) {
        setPolls(fetchedPolls.polls);
      } else {
        setPolls(prev => [...prev, ...fetchedPolls.polls]);
      }

      setLastDoc(fetchedPolls.lastDoc);
      setHasMore(fetchedPolls.polls.length === 10 && fetchedPolls.lastDoc !== null);
    } catch (err) {
      setError(reset ? 'Failed to load polls' : 'Failed to load more polls');
      console.error('Error fetching polls:', err);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [lastDoc]);

  // Load more polls for manual button
  const loadMorePolls = useCallback(async () => {
    if (!hasMore || loadingMore || initialLoading) {
      console.log('❌ Skipping loadMore:', { hasMore, loadingMore, initialLoading });
      return;
    }
    console.log('✅ Loading more polls...');
    await fetchPolls(false);
  }, [fetchPolls, hasMore, loadingMore, initialLoading]);

  // Initial load
  useEffect(() => {
    const initialFetch = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        const result = await getPolls(10);
        console.log('� Initial polls fetch:', result.polls.length, 'polls loaded');
        setPolls(result.polls);
        setLastDoc(result.lastDoc);
        setHasMore(result.polls.length === 10 && result.lastDoc !== null);
      } catch (err) {
        setError('Failed to fetch polls');
        console.error('Error fetching polls:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    initialFetch();
  }, []);

  // Remove infinite scroll - using manual load more button instead
  const isFetching = false;

  // Create a new poll
  const createNewPoll = async (pollData: CreatePollData) => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a poll');
    }

    try {
      setError(null);
      const pollId = await createPoll(currentUser.uid, pollData);
      
      // Refresh the list to show the new poll
      await fetchPolls(true);
      return pollId;
    } catch (err) {
      setError('Failed to create poll');
      console.error('Error creating poll:', err);
      throw err;
    }
  };

  // Vote on a poll
  const votePoll = async (pollId: string, optionId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await voteOnPoll(pollId, currentUser.uid, optionId);
      
      // Update local state optimistically
      setPolls(prev => prev.map(poll => {
        if (poll.id === pollId) {
          const updatedOptions = poll.options.map(option =>
            option.id === optionId
              ? { ...option, voteCount: option.voteCount + 1 }
              : option
          );
          
          const newVote = {
            userId: currentUser.uid,
            optionId,
            votedAt: new Date() as unknown as Timestamp // Temporary for optimistic update
          };

          return {
            ...poll,
            options: updatedOptions,
            votes: [...poll.votes, newVote]
          };
        }
        return poll;
      }));
    } catch (err) {
      setError('Failed to vote on poll');
      console.error('Error voting on poll:', err);
      // Refresh to get correct state
      await fetchPolls();
      throw err;
    }
  };

  // Remove vote from poll
  const removeVote = async (pollId: string, optionId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await removeVoteFromPoll(pollId, currentUser.uid, optionId);
      
      // Update local state optimistically
      setPolls(prev => prev.map(poll => {
        if (poll.id === pollId) {
          const updatedOptions = poll.options.map(option =>
            option.id === optionId
              ? { ...option, voteCount: Math.max(0, option.voteCount - 1) }
              : option
          );
          
          const updatedVotes = poll.votes.filter(
            vote => !(vote.userId === currentUser.uid && vote.optionId === optionId)
          );

          return {
            ...poll,
            options: updatedOptions,
            votes: updatedVotes
          };
        }
        return poll;
      }));
    } catch (err) {
      setError('Failed to remove vote');
      console.error('Error removing vote:', err);
      // Refresh to get correct state
      await fetchPolls();
      throw err;
    }
  };

  // Close a poll
  const closePollById = async (pollId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await closePoll(pollId, currentUser.uid);
      
      // Update local state
      setPolls(prev => prev.map(poll => 
        poll.id === pollId 
          ? { ...poll, isActive: false }
          : poll
      ));
    } catch (err) {
      setError('Failed to close poll');
      console.error('Error closing poll:', err);
      throw err;
    }
  };

  // Delete a poll
  const removePoll = async (pollId: string) => {
    if (!currentUser) return;

    try {
      setError(null);
      await deletePoll(pollId, currentUser.uid);
      
      // Remove from local state
      setPolls(prev => prev.filter(poll => poll.id !== pollId));
    } catch (err) {
      setError('Failed to delete poll');
      console.error('Error deleting poll:', err);
      throw err;
    }
  };

  return {
    polls,
    loading: initialLoading,
    loadingMore: loadingMore || isFetching,
    error,
    hasMore,
    createNewPoll,
    votePoll,
    removeVote,
    closePollById,
    removePoll,
    refreshPolls: () => fetchPolls(true),
    loadMorePolls
  };
};
