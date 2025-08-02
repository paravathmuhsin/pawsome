import { useState, useEffect } from 'react';
import { type Comment, getCommentsByPost, createComment, deleteComment } from '../services/commentService';
import { useAuth } from './useAuth';

export const useComments = (postId: string, collection: 'posts' | 'adoptions' | 'polls' = 'posts') => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch comments for the post
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await getCommentsByPost(postId);
      setComments(fetchedComments);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new comment
  const addComment = async (content: string) => {
    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }

    try {
      setError(null);
      const commentId = await createComment(currentUser.uid, {
        postId,
        content,
        collection
      });
      
      // Refresh comments to show the new one
      await fetchComments();
      return commentId;
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  // Delete a comment
  const removeComment = async (commentId: string) => {
    try {
      setError(null);
      await deleteComment(commentId, postId, collection);
      
      // Remove from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadComments = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedComments = await getCommentsByPost(postId);
        setComments(fetchedComments);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  return {
    comments,
    loading,
    error,
    addComment,
    removeComment,
    refreshComments: fetchComments
  };
};
