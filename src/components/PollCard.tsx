import React, { useState, useEffect } from 'react';
import { type Poll } from '../services/pollService';
import { useAuth } from '../hooks/useAuth';
import { getUserData, type UserData } from '../services/userService';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { CommentsSection } from './CommentsSection';
import { type Timestamp } from 'firebase/firestore';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  onRemoveVote: (pollId: string, optionId: string) => void;
  onClose?: (pollId: string) => void;
  onDelete?: (pollId: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ 
  poll, 
  onVote, 
  onRemoveVote,
  onClose,
  onDelete 
}) => {
  const { currentUser } = useAuth();
  const [authorData, setAuthorData] = useState<UserData | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(poll.commentsCount || 0);
  const responsive = useResponsive();

  // Update comment count when poll.commentsCount changes
  useEffect(() => {
    setCommentCount(poll.commentsCount || 0);
  }, [poll.commentsCount]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const userData = await getUserData(poll.createdBy);
        setAuthorData(userData);
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };

    fetchAuthorData();
  }, [poll.createdBy]);

  const isOwner = currentUser ? poll.createdBy === currentUser.uid : false;
  const userVotes = currentUser 
    ? poll.votes.filter(vote => vote.userId === currentUser.uid)
    : [];
  const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);

  const formatTimeAgo = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatTimeRemaining = (expiresAt: Timestamp | null) => {
    if (!expiresAt) return null;
    
    const expireDate = expiresAt.toDate();
    const now = new Date();
    const diffInMs = expireDate.getTime() - now.getTime();
    
    if (diffInMs <= 0) return 'Expired';
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d remaining`;
    if (diffInHours > 0) return `${diffInHours}h remaining`;
    return `${diffInMinutes}m remaining`;
  };

  const handleVote = (optionId: string) => {
    if (!currentUser) return;
    
    const hasVotedForOption = userVotes.some(vote => vote.optionId === optionId);
    
    if (hasVotedForOption) {
      onRemoveVote(poll.id, optionId);
    } else {
      onVote(poll.id, optionId);
    }
  };

  const isExpired = poll.expiresAt && poll.expiresAt.toDate() < new Date();
  const canVote = poll.isActive && !isExpired && currentUser;

  return (
    <div style={{
      backgroundColor: poll.isActive && !isExpired ? 'rgba(255, 255, 255, 0.95)' : 'rgba(245, 245, 245, 0.95)',
      borderRadius: '12px',
      padding: getResponsiveValue('15px', '18px', '20px', responsive),
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      border: poll.isActive && !isExpired ? '2px solid transparent' : '2px solid #ffc107'
    }}>
      {/* Status Badge */}
      {(!poll.isActive || isExpired) && (
        <div style={{
          backgroundColor: isExpired ? '#dc3545' : '#ffc107',
          color: isExpired ? 'white' : '#000',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'inline-block'
        }}>
          {isExpired ? 'Expired 🕐' : 'Closed 🔒'}
        </div>
      )}

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
            <span style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '12px',
              backgroundColor: '#28a745',
              color: 'white'
            }}>
              📊 Poll
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {formatTimeAgo(poll.createdAt)}
            {poll.expiresAt && (
              <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                • {formatTimeRemaining(poll.expiresAt)}
              </span>
            )}
          </div>
        </div>
        
        {isOwner && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {poll.isActive && !isExpired && onClose && (
              <button
                onClick={() => onClose(poll.id)}
                style={{
                  background: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Close poll"
              >
                🔒 Close
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(poll.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc3545',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                title="Delete poll"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Poll Question */}
      <div style={{
        marginBottom: '16px'
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: getResponsiveValue('1.2rem', '1.3rem', '1.4rem', responsive),
          color: '#333'
        }}>
          {poll.question}
        </h3>
        
        {poll.allowMultiple && (
          <div style={{
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic'
          }}>
            Multiple selections allowed
          </div>
        )}
      </div>

      {/* Poll Media */}
      {poll.media && (
        <div style={{ marginBottom: '16px' }}>
          <img
            src={poll.media}
            alt="Poll media"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Poll Options */}
      <div style={{
        marginBottom: '16px'
      }}>
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
          const hasVoted = userVotes.some(vote => vote.optionId === option.id);
          
          return (
            <div
              key={option.id}
              onClick={() => canVote && handleVote(option.id)}
              style={{
                position: 'relative',
                marginBottom: '8px',
                padding: '12px',
                borderRadius: '8px',
                border: hasVoted ? '2px solid #28a745' : '1px solid #e9ecef',
                backgroundColor: hasVoted ? 'rgba(40, 167, 69, 0.1)' : '#f8f9fa',
                cursor: canVote ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}
            >
              {/* Progress bar background */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: hasVoted ? 'rgba(40, 167, 69, 0.2)' : 'rgba(0, 123, 255, 0.1)',
                  transition: 'width 0.3s ease',
                  zIndex: 1
                }}
              />
              
              {/* Option content */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {hasVoted && <span style={{ color: '#28a745' }}>✓</span>}
                  <span style={{ fontWeight: hasVoted ? 'bold' : 'normal' }}>
                    {option.text}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <span>{option.voteCount} votes</span>
                  <span>({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Poll Stats */}
      <div style={{
        marginBottom: '16px',
        fontSize: '14px',
        color: '#666',
        textAlign: 'center'
      }}>
        Total votes: {totalVotes}
        {userVotes.length > 0 && (
          <span style={{ marginLeft: '12px', color: '#28a745' }}>
            • You voted for {userVotes.length} option{userVotes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0',
        flexWrap: 'wrap'
      }}>
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
        postId={poll.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentCount(prev => prev + 1)}
        onCommentDeleted={() => setCommentCount(prev => Math.max(0, prev - 1))}
        collection="polls"
      />
    </div>
  );
};
