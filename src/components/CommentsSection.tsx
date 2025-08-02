import React, { useState } from 'react';
import { useComments } from '../hooks/useComments';
import { CommentCard } from './CommentCard';
import { useAuth } from '../hooks/useAuth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';

interface CommentsSectionProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
  collection?: 'posts' | 'adoptions' | 'polls'; // Add collection type
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  postId, 
  isOpen, 
  onClose,
  onCommentAdded,
  onCommentDeleted,
  collection = 'posts' // Default to posts for backward compatibility
}) => {
  const { currentUser } = useAuth();
  const { comments, loading, error, addComment, removeComment } = useComments(postId, collection);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const responsive = useResponsive();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !currentUser) return;

    try {
      setSubmitting(true);
      await addComment(newComment.trim());
      setNewComment('');
      onCommentAdded?.(); // Notify parent about new comment
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await removeComment(commentId);
      onCommentDeleted?.(); // Notify parent about deleted comment
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: getResponsiveValue('10px', '15px', '20px', responsive)
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: responsive.isMobile ? '100%' : '600px',
        maxHeight: responsive.isMobile ? '95vh' : '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: getResponsiveValue('16px', '20px', '24px', responsive),
          borderBottom: '1px solid #eee'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: '#333',
            fontSize: getResponsiveValue('1.2rem', '1.3rem', '1.4rem', responsive)
          }}>
            Comments ({comments.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: getResponsiveValue('20px', '22px', '24px', responsive),
              cursor: 'pointer',
              color: '#666',
              padding: '4px',
              minWidth: '32px',
              minHeight: '32px'
            }}
          >
            ×
          </button>
        </div>

        {/* Comments List */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              color: '#666'
            }}>
              Loading comments...
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              color: '#dc3545'
            }}>
              {error}
            </div>
          ) : comments.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              color: '#666'
            }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map(comment => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>

        {/* Add Comment Form */}
        {currentUser && (
          <div style={{
            padding: getResponsiveValue('16px', '20px', '24px', responsive),
            borderTop: '1px solid #eee'
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end'
              }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    resize: 'none',
                    fontFamily: 'inherit',
                    fontSize: getResponsiveValue('14px', '15px', '16px', responsive)
                  }}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: newComment.trim() ? '#007bff' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                    fontSize: getResponsiveValue('14px', '15px', '16px', responsive),
                    whiteSpace: 'nowrap'
                  }}
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
