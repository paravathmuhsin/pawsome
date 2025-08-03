import { useState, useEffect, useCallback } from 'react';
import { getPosts, createPost, togglePostLike, deletePost, type Post, type CreatePostData } from '../services/postService';
import { useAuth } from './useAuth';
import type { DocumentSnapshot } from 'firebase/firestore';

export const usePosts = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const currentLastDoc = reset ? null : lastDoc;
      const result = await getPosts(10, currentLastDoc || undefined);
      
      console.log(`📥 Fetched ${result.posts.length} posts (reset: ${reset})`);
      
      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
      }
      
      setLastDoc(result.lastDoc);
      const newHasMore = result.posts.length === 10 && result.lastDoc !== null;
      setHasMore(newHasMore);
    } catch (err) {
      setError(reset ? 'Failed to fetch posts' : 'Failed to load more posts');
      console.error('Error fetching posts:', err);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [lastDoc]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || initialLoading) {
      console.log('❌ Skipping loadMore:', { hasMore, loadingMore, initialLoading });
      return;
    }
    console.log('✅ Loading more posts...');
    await fetchPosts(false);
  }, [fetchPosts, hasMore, loadingMore, initialLoading]);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        const result = await getPosts(10);
        console.log('📊 Initial fetch:', result.posts.length, 'posts loaded');
        setPosts(result.posts);
        setLastDoc(result.lastDoc);
        setHasMore(result.posts.length === 10 && result.lastDoc !== null);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error('Error fetching posts:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    initialFetch();
  }, []);

  // Remove infinite scroll - using manual load more button instead
  // const { isFetching } = useInfiniteScroll(loadMorePosts, {
  //   hasMore,
  //   isLoading: loadingMore,
  //   threshold: 800
  // });
  const isFetching = false;

  const createNewPost = async (postData: CreatePostData): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      await createPost(currentUser.uid, postData);
      await fetchPosts(true); // Refresh posts from beginning
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
      await fetchPosts(true);
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
    fetchPosts(true);
  };

  return {
    posts,
    loading: initialLoading,
    loadingMore,
    error,
    hasMore,
    isFetching,
    createNewPost,
    likePost,
    removePost,
    refreshPosts,
    loadMorePosts
  };
};
