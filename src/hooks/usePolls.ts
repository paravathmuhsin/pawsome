import { useState, useEffect } from 'react';
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
import { type Timestamp } from 'firebase/firestore';

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch polls
  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPolls = await getPolls();
      setPolls(fetchedPolls);
    } catch (err) {
      setError('Failed to load polls');
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new poll
  const createNewPoll = async (pollData: CreatePollData) => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a poll');
    }

    try {
      setError(null);
      const pollId = await createPoll(currentUser.uid, pollData);
      
      // Refresh the list to show the new poll
      await fetchPolls();
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

  useEffect(() => {
    fetchPolls();
  }, []);

  return {
    polls,
    loading,
    error,
    createNewPoll,
    votePoll,
    removeVote,
    closePollById,
    removePoll,
    refreshPolls: fetchPolls
  };
};
