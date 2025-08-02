import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  increment,
  query, 
  where,
  serverTimestamp,
  type Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  collection?: 'posts' | 'adoptions' | 'polls'; // Add collection type
}

// Create a new comment
export const createComment = async (userId: string, commentData: CreateCommentData): Promise<string> => {
  try {
    const commentRef = await addDoc(collection(db, 'comments'), {
      postId: commentData.postId,
      userId: userId,
      content: commentData.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update the post's comment count
    try {
      const collection = commentData.collection || 'posts'; // Default to posts for backward compatibility
      const postRef = doc(db, collection, commentData.postId);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });
    } catch (updateError) {
      console.warn('Could not update post comment count:', updateError);
      // Don't throw error here, comment was still created successfully
    }

    return commentRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Get comments for a specific post
export const getCommentsByPost = async (postId: string): Promise<Comment[]> => {
  try {
    // Simplified query - get all comments for the post, then sort in memory
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
      // Removed orderBy to avoid index requirement
    );
    
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
    
    // Sort comments by creation time in memory
    return comments.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime();
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string, postId?: string, collection?: 'posts' | 'adoptions' | 'polls'): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'comments', commentId));

    // Update the post's comment count if postId is provided
    if (postId) {
      try {
        const targetCollection = collection || 'posts'; // Default to posts for backward compatibility
        const postRef = doc(db, targetCollection, postId);
        await updateDoc(postRef, {
          commentsCount: increment(-1)
        });
      } catch (updateError) {
        console.warn('Could not update post comment count:', updateError);
        // Don't throw error here, comment was still deleted successfully
      }
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
