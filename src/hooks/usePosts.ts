import { useState, useEffect, useCallback } from 'react';
import { getPosts, createPost, togglePostLike, deletePost, type Post, type CreatePostData } from '../services/postService';
import { useAuth } from './useAuth';

export const usePosts = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createNewPost = async (postData: CreatePostData): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await createPost(currentUser.uid, postData);
      await fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const likePost = async (postId: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await togglePostLike(postId, currentUser.uid);
      
      // Optimistically update the UI
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(currentUser.uid);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(uid => uid !== currentUser.uid)
                : [...post.likes, currentUser.uid]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      await fetchPosts();
    }
  };

  const removePost = async (postId: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const refreshPosts = () => {
    fetchPosts();
  };

  return {
    posts,
    loading,
    error,
    createNewPost,
    likePost,
    removePost,
    refreshPosts
  };
};
