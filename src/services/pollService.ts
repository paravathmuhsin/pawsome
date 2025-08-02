import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  Timestamp,
  type Timestamp as TimestampType
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface PollOption {
  id: string; // Unique option ID
  text: string; // Option label
  voteCount: number; // Number of votes
}

export interface PollVote {
  userId: string; // User ID who voted
  optionId: string; // Option ID they voted for
  votedAt: TimestampType;
}

export interface Poll {
  id: string; // Unique poll ID
  createdBy: string; // User ID of poll creator
  question: string;
  options: PollOption[]; // Poll options
  votes: PollVote[]; // All votes
  allowMultiple: boolean; // Allow multiple selections
  expiresAt: TimestampType | null; // Expiration date (null for no expiration)
  createdAt: TimestampType;
  updatedAt: TimestampType;
  media?: string; // Optional: URL to image/video
  commentsCount: number;
  isActive: boolean; // Whether poll is still accepting votes
}

export interface CreatePollData {
  question: string;
  options: string[]; // Array of option texts
  allowMultiple: boolean;
  expiresAt?: Date | null; // Optional expiration
  media?: string;
}

// Create a new poll
export const createPoll = async (userId: string, pollData: CreatePollData): Promise<string> => {
  try {
    // Generate unique IDs for options
    const options: PollOption[] = pollData.options.map((text, index) => ({
      id: `option_${index}_${Date.now()}`,
      text,
      voteCount: 0
    }));

    const pollRef = await addDoc(collection(db, 'polls'), {
      createdBy: userId,
      question: pollData.question,
      options,
      votes: [],
      allowMultiple: pollData.allowMultiple,
      expiresAt: pollData.expiresAt ? pollData.expiresAt : null,
      isActive: true,
      media: pollData.media || '',
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return pollRef.id;
  } catch (error) {
    console.error('Error creating poll:', error);
    throw error;
  }
};

// Get all polls
export const getPolls = async (): Promise<Poll[]> => {
  try {
    const pollsQuery = query(
      collection(db, 'polls'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(pollsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Poll[];
  } catch (error) {
    console.error('Error fetching polls:', error);
    throw error;
  }
};

// Vote on a poll
export const voteOnPoll = async (pollId: string, userId: string, optionId: string): Promise<void> => {
  try {
    const pollRef = doc(db, 'polls', pollId);
    const pollDoc = await getDoc(pollRef);
    
    if (!pollDoc.exists()) {
      throw new Error('Poll not found');
    }

    const pollData = pollDoc.data() as Poll;
    
    // Check if poll is still active and not expired
    if (!pollData.isActive) {
      throw new Error('Poll is no longer active');
    }
    
    if (pollData.expiresAt && pollData.expiresAt.toDate() < new Date()) {
      throw new Error('Poll has expired');
    }

    // Check if user has already voted on this option
    const existingVote = pollData.votes.find(
      vote => vote.userId === userId && vote.optionId === optionId
    );
    
    if (existingVote) {
      throw new Error('You have already voted for this option');
    }

    // If multiple votes not allowed, check if user has voted on any option
    if (!pollData.allowMultiple) {
      const userHasVoted = pollData.votes.some(vote => vote.userId === userId);
      if (userHasVoted) {
        throw new Error('You have already voted on this poll');
      }
    }

    // Add the vote
    const newVote: PollVote = {
      userId,
      optionId,
      votedAt: Timestamp.now()
    };

    // Update options vote count and add vote
    const updatedOptions = pollData.options.map(option => 
      option.id === optionId 
        ? { ...option, voteCount: option.voteCount + 1 }
        : option
    );

    await updateDoc(pollRef, {
      votes: arrayUnion(newVote),
      options: updatedOptions,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error voting on poll:', error);
    throw error;
  }
};

// Remove vote from poll
export const removeVoteFromPoll = async (pollId: string, userId: string, optionId: string): Promise<void> => {
  try {
    const pollRef = doc(db, 'polls', pollId);
    const pollDoc = await getDoc(pollRef);
    
    if (!pollDoc.exists()) {
      throw new Error('Poll not found');
    }

    const pollData = pollDoc.data() as Poll;
    
    // Find the vote to remove
    const voteToRemove = pollData.votes.find(
      vote => vote.userId === userId && vote.optionId === optionId
    );
    
    if (!voteToRemove) {
      throw new Error('Vote not found');
    }

    // Update options vote count and remove vote
    const updatedOptions = pollData.options.map(option => 
      option.id === optionId 
        ? { ...option, voteCount: Math.max(0, option.voteCount - 1) }
        : option
    );

    await updateDoc(pollRef, {
      votes: arrayRemove(voteToRemove),
      options: updatedOptions,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error removing vote from poll:', error);
    throw error;
  }
};

// Close a poll (only creator can do this)
export const closePoll = async (pollId: string, userId: string): Promise<void> => {
  try {
    const pollRef = doc(db, 'polls', pollId);
    const pollDoc = await getDoc(pollRef);
    
    if (!pollDoc.exists()) {
      throw new Error('Poll not found');
    }

    const pollData = pollDoc.data() as Poll;
    
    if (pollData.createdBy !== userId) {
      throw new Error('Only the poll creator can close this poll');
    }

    await updateDoc(pollRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error closing poll:', error);
    throw error;
  }
};

// Delete a poll (only creator can do this)
export const deletePoll = async (pollId: string, userId: string): Promise<void> => {
  try {
    const pollRef = doc(db, 'polls', pollId);
    const pollDoc = await getDoc(pollRef);
    
    if (!pollDoc.exists()) {
      throw new Error('Poll not found');
    }

    const pollData = pollDoc.data() as Poll;
    
    if (pollData.createdBy !== userId) {
      throw new Error('Only the poll creator can delete this poll');
    }

    await deleteDoc(pollRef);

  } catch (error) {
    console.error('Error deleting poll:', error);
    throw error;
  }
};
