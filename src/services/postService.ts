import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
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
import { sendPushNotification } from './fcmService';
import { getUserData } from './userService';

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
    
    // Get the current post to check if user already liked it and get post data
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data() as Post;
    const isLiked = postData.likes?.includes(userId) || false;
    const postOwnerId = postData.createdBy;
    
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
      
      // Send push notification to post owner (only when adding a like, not removing)
      if (postOwnerId !== userId) { // Don't notify yourself
        try {
          // Get user data for the liker's name
          const likerData = await getUserData(userId);
          const likerName = likerData?.displayName || 'Someone';
          
          // Send push notification
          await sendPushNotification(
            postOwnerId,
            '❤️ New Like!',
            `${likerName} liked your post`,
            {
              type: 'like',
              postId: postId,
              likerId: userId,
              likerName: likerName
            }
          );
        } catch (notificationError) {
          console.error('Error sending like notification:', notificationError);
          // Don't throw here - the like should still work even if notification fails
        }
      }
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
