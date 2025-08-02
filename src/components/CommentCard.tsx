import React, { useState, useEffect } from 'react';
import { type Comment } from '../services/commentService';
import { getUserData, type UserData } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { type Timestamp } from 'firebase/firestore';

interface CommentCardProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, onDelete }) => {
  const { currentUser } = useAuth();
  const [authorData, setAuthorData] = useState<UserData | null>(null);
  const responsive = useResponsive();

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const userData = await getUserData(comment.userId);
        setAuthorData(userData);
      } catch (error) {
        console.error('Error fetching comment author data:', error);
      }
    };

    fetchAuthorData();
  }, [comment.userId]);

  const isOwner = currentUser ? comment.userId === currentUser.uid : false;

  const formatTimeAgo = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{
      padding: getResponsiveValue('8px', '10px', '12px', responsive),
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: '#fafafa'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        {authorData?.photoURL && (
          <img
            src={authorData.photoURL}
            alt={authorData.displayName || 'User avatar'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: getResponsiveValue('13px', '14px', '14px', responsive),
              color: '#333'
            }}>
              {authorData?.displayName || 'Unknown User'}
            </span>
            <span style={{ 
              fontSize: getResponsiveValue('11px', '12px', '12px', responsive), 
              color: '#666' 
            }}>
              {formatTimeAgo(comment.createdAt)}
            </span>
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px 4px',
                  marginLeft: 'auto'
                }}
              >
                Delete
              </button>
            )}
          </div>
          <div style={{ 
            fontSize: getResponsiveValue('13px', '14px', '14px', responsive),
            color: '#333',
            lineHeight: '1.4'
          }}>
            {comment.content}
          </div>
        </div>
      </div>
    </div>
  );
};
