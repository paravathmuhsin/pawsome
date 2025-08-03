import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  type Timestamp,
  type DocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Post {
  id: string;
  createdBy: string;
  content: string;
  media: string[];
  likes: string[];
  commentsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreatePostData {
  content: string;
  media?: string[];
}

// Create a new post
export const createPost = async (userId: string, postData: CreatePostData): Promise<string> => {
  try {
    const postRef = await addDoc(collection(db, 'posts'), {
      createdBy: userId,
      content: postData.content,
      media: postData.media || [],
      likes: [],
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return postRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get all posts (latest first)
export const getPosts = async (
  limitCount: number = 10, 
  lastDoc?: DocumentSnapshot
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as Post);
    });
    
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    
    return { posts, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Like/unlike a post
export const togglePostLike = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    // First, get the current post to check if user already liked it
    const postDoc = await getDocs(query(collection(db, 'posts')));
    let isLiked = false;
    
    postDoc.forEach((doc) => {
      if (doc.id === postId) {
        const data = doc.data();
        isLiked = data.likes?.includes(userId) || false;
      }
    });
    
    if (isLiked) {
      // Remove like
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // Add like
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Delete a post (only by creator)
export const deletePost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Update comment count (called when comments are added/removed)
export const updateCommentCount = async (postId: string, increment_by: number): Promise<void> => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(increment_by),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating comment count:', error);
    throw error;
  }
};
