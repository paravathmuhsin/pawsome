import React, { useState, useEffect } from 'react';
import { type AdoptionPost } from '../services/adoptionService';
import { useAuth } from '../hooks/useAuth';
import { getUserData, type UserData } from '../services/userService';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { CommentsSection } from './CommentsSection';
import { type Timestamp } from 'firebase/firestore';

interface AdoptionCardProps {
  adoption: AdoptionPost;
  onLike: (adoptionId: string) => void;
  onInterest: (adoptionId: string) => void;
  onComplete?: (adoptionId: string) => void;
  onDelete?: (adoptionId: string) => void;
}

export const AdoptionCard: React.FC<AdoptionCardProps> = ({ 
  adoption, 
  onLike, 
  onInterest, 
  onComplete, 
  onDelete 
}) => {
  const { currentUser } = useAuth();
  const [authorData, setAuthorData] = useState<UserData | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(adoption.commentsCount || 0);
  const [showInterestedUsers, setShowInterestedUsers] = useState(false);
  const [interestedUsersData, setInterestedUsersData] = useState<UserData[]>([]);
  const responsive = useResponsive();

  // Update comment count when adoption.commentsCount changes
  useEffect(() => {
    setCommentCount(adoption.commentsCount || 0);
  }, [adoption.commentsCount]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const userData = await getUserData(adoption.createdBy);
        setAuthorData(userData);
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };

    fetchAuthorData();
  }, [adoption.createdBy]);

  const isLiked = currentUser ? adoption.likes.includes(currentUser.uid) : false;
  const isInterested = currentUser ? adoption.interested.includes(currentUser.uid) : false;
  const isOwner = currentUser ? adoption.createdBy === currentUser.uid : false;

  // Fetch interested users data when owner clicks to view
  const fetchInterestedUsers = async () => {
    if (!isOwner || adoption.interested.length === 0) return;
    
    try {
      const usersData = await Promise.all(
        adoption.interested.map(userId => getUserData(userId))
      );
      setInterestedUsersData(usersData.filter(user => user !== null) as UserData[]);
      setShowInterestedUsers(true);
    } catch (error) {
      console.error('Error fetching interested users:', error);
    }
  };

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

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'hamster': return '🐹';
      case 'fish': return '🐠';
      case 'reptile': return '🦎';
      default: return '🐾';
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Small';
      case 'medium': return 'Medium';
      case 'large': return 'Large';
      case 'extra-large': return 'Extra Large';
      default: return size;
    }
  };

  const displayImages = showAllImages ? adoption.media : adoption.media.slice(0, 4);

  return (
    <div style={{
      backgroundColor: adoption.isAvailable ? 'rgba(255, 255, 255, 0.95)' : 'rgba(245, 245, 245, 0.95)',
      borderRadius: '12px',
      padding: getResponsiveValue('15px', '18px', '20px', responsive),
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
      border: adoption.isAvailable ? '2px solid transparent' : '2px solid #ffc107'
    }}>
      {/* Availability Badge */}
      {!adoption.isAvailable && (
        <div style={{
          backgroundColor: '#ffc107',
          color: '#000',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '10px',
          display: 'inline-block'
        }}>
          Adopted ✨
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
              backgroundColor: '#667eea',
              color: 'white'
            }}>
              🏠 Adoption
            </span>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {formatTimeAgo(adoption.createdAt)}
          </div>
        </div>
        
        {isOwner && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {adoption.isAvailable && onComplete && (
              <button
                onClick={() => onComplete(adoption.id)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Mark as adopted"
              >
                ✅ Adopted
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(adoption.id)}
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
        )}
      </div>

      {/* Pet Info Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: getResponsiveValue('1.4rem', '1.5rem', '1.6rem', responsive),
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {getTypeEmoji(adoption.type)} {adoption.name}
        </h3>
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#e9ecef',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {adoption.breed}
          </span>
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#e9ecef',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {Math.floor(adoption.age / 12)}y {adoption.age % 12}m
          </span>
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#e9ecef',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {getSizeLabel(adoption.size)}
          </span>
        </div>
      </div>

      {/* Pet Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: responsive.isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '8px'
      }}>
        <div><strong>Gender:</strong> {adoption.gender}</div>
        <div><strong>Color:</strong> {adoption.color}</div>
        <div><strong>Vaccinated:</strong> {adoption.vaccinated ? '✅ Yes' : '❌ No'}</div>
        <div><strong>Spayed/Neutered:</strong> {adoption.spayedNeutered ? '✅ Yes' : '❌ No'}</div>
        <div style={{ gridColumn: responsive.isMobile ? '1' : '1 / -1' }}>
          <strong>Location:</strong> {adoption.location.address}
        </div>
      </div>

      {/* Description */}
      <div style={{
        marginBottom: '16px',
        lineHeight: '1.5'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>About {adoption.name}:</p>
        <p style={{ margin: '0', whiteSpace: 'pre-wrap' }}>{adoption.description}</p>
      </div>

      {/* Story (if available) */}
      {adoption.story && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#667eea' }}>Their Story:</p>
          <p style={{ margin: '0', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{adoption.story}</p>
        </div>
      )}

      {/* Images */}
      {adoption.media.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: responsive.width < 480 ? '1fr' : 
                                 adoption.media.length === 1 ? '1fr' : 
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
                  alt={`${adoption.name} photo ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {!showAllImages && index === 3 && adoption.media.length > 4 && (
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
                    +{adoption.media.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {showAllImages && adoption.media.length > 4 && (
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
        gap: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onLike(adoption.id)}
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
            borderRadius: '6px'
          }}
        >
          {isLiked ? '❤️' : '🤍'} {adoption.likes.length}
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

        {adoption.isAvailable && !isOwner && (
          <button
            onClick={() => onInterest(adoption.id)}
            disabled={!currentUser}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isInterested ? '#28a745' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              cursor: currentUser ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {isInterested ? '✅ Interested' : '🐾 I\'m Interested'}
          </button>
        )}

        {adoption.interested.length > 0 && (
          <span 
            onClick={isOwner ? fetchInterestedUsers : undefined}
            style={{
              fontSize: '12px',
              color: '#666',
              padding: '4px 8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              cursor: isOwner ? 'pointer' : 'default',
              border: isOwner ? '1px solid #667eea' : 'none',
              transition: 'all 0.2s ease'
            }}
            title={isOwner ? 'Click to view interested users' : undefined}
          >
            {adoption.interested.length} interested {isOwner ? '👁️' : ''}
          </span>
        )}
      </div>

      {/* Interested Users Modal */}
      {showInterestedUsers && isOwner && (
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
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                Interested Users ({adoption.interested.length})
              </h3>
              <button
                onClick={() => setShowInterestedUsers(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            
            {interestedUsersData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {interestedUsersData.map((user, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>
                        {user.displayName || 'Unknown User'}
                      </div>
                      {user.location && (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          📍 {user.location.latitude.toFixed(4)}, {user.location.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666' 
              }}>
                Loading interested users...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <CommentsSection
        postId={adoption.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentCount(prev => prev + 1)}
        onCommentDeleted={() => setCommentCount(prev => Math.max(0, prev - 1))}
        collection="adoptions"
      />
    </div>
  );
};
