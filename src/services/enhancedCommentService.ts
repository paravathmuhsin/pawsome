import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  increment,
  query, 
  orderBy, 
  where,
  serverTimestamp,
  type Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Comment {
  id: string;
  postId: string;
  postType: 'posts' | 'adoptions' | 'events'; // Track which collection the post belongs to
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCommentData {
  postId: string;
  postType: 'posts' | 'adoptions' | 'events';
  content: string;
}

// Create a new comment and update post comment count
export const createComment = async (userId: string, commentData: CreateCommentData): Promise<string> => {
  try {
    // Add the comment
    const commentRef = await addDoc(collection(db, 'comments'), {
      postId: commentData.postId,
      postType: commentData.postType,
      userId: userId,
      content: commentData.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update the comment count in the appropriate collection
    const postRef = doc(db, commentData.postType, commentData.postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

    return commentRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Get comments for a specific post
export const getCommentsByPost = async (postId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Delete a comment and update post comment count
export const deleteComment = async (commentId: string, postId: string, postType: 'posts' | 'adoptions' | 'events'): Promise<void> => {
  try {
    // Delete the comment
    await deleteDoc(doc(db, 'comments', commentId));

    // Update the comment count in the appropriate collection
    const postRef = doc(db, postType, postId);
    await updateDoc(postRef, {
      commentsCount: increment(-1)
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
