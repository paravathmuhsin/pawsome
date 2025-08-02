import React, { useState, useEffect } from 'react';
import { type Post } from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import { getUserData, type UserData } from '../services/userService';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { CommentsSection } from './CommentsSection';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete }) => {
  const { currentUser } = useAuth();
  const [authorData, setAuthorData] = useState<UserData | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentsCount || 0);
  const responsive = useResponsive();

  // Update comment count when post.commentsCount changes
  useEffect(() => {
    setCommentCount(post.commentsCount || 0);
  }, [post.commentsCount]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const userData = await getUserData(post.createdBy);
        setAuthorData(userData);
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };

    fetchAuthorData();
  }, [post.createdBy]);

  const isLiked = currentUser ? post.likes.includes(currentUser.uid) : false;
  const isOwner = currentUser ? post.createdBy === currentUser.uid : false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const displayImages = showAllImages ? post.media : post.media.slice(0, 4);

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: getResponsiveValue('15px', '18px', '20px', responsive),
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px',
        flexWrap: responsive.isMobile ? 'wrap' : 'nowrap',
        gap: responsive.isMobile ? '10px' : '0'
      }}>
        {authorData?.photoURL && (
          <img
            src={authorData.photoURL}
            alt="Author"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              marginRight: '12px'
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>
              {authorData?.displayName || 'Unknown User'}
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {formatTimeAgo(post.createdAt)}
          </div>
        </div>
        
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
            title="Delete post"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{
        marginBottom: '16px',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap'
      }}>
        {post.content}
      </div>

      {/* Images */}
      {post.media.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: responsive.width < 480 ? '1fr' : 
                                 post.media.length === 1 ? '1fr' : 
                                 'repeat(2, 1fr)',
            gap: '8px',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {displayImages.map((imageUrl, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  backgroundColor: '#f0f0f0'
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {!showAllImages && index === 3 && post.media.length > 4 && (
                  <div
                    onClick={() => setShowAllImages(true)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    +{post.media.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {showAllImages && post.media.length > 4 && (
            <button
              onClick={() => setShowAllImages(false)}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Show less
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <button
          onClick={() => onLike(post.id)}
          disabled={!currentUser}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: currentUser ? 'pointer' : 'not-allowed',
            color: isLiked ? '#dc3545' : '#666',
            padding: '8px',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
          }}
        >
          {isLiked ? '❤️' : '🤍'} {post.likes.length}
        </button>

        <button
          onClick={() => setShowComments(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            padding: '8px',
            borderRadius: '6px'
          }}
        >
          💬 {commentCount}
        </button>
      </div>

      {/* Comments Section */}
      <CommentsSection
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentCount(prev => prev + 1)}
        onCommentDeleted={() => setCommentCount(prev => Math.max(0, prev - 1))}
      />
    </div>
  );
};
