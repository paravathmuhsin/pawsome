import React, { useState } from 'react';
import { PollCard } from '../components/PollCard';
import { CreatePollModal } from '../components/CreatePollModal';
import { usePolls } from '../hooks/usePolls';
import { useAuth } from '../hooks/useAuth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { type CreatePollData } from '../services/pollService';

export const PollPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    polls, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    createNewPoll, 
    votePoll, 
    removeVote, 
    closePollById, 
    removePoll,
    loadMorePolls
  } = usePolls();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed' | 'my-polls'>('all');
  const responsive = useResponsive();

  const filteredPolls = polls.filter(poll => {
    switch (filter) {
      case 'active':
        return poll.isActive && (!poll.expiresAt || poll.expiresAt.toDate() > new Date());
      case 'closed':
        return !poll.isActive || (poll.expiresAt && poll.expiresAt.toDate() <= new Date());
      case 'my-polls':
        return currentUser ? poll.createdBy === currentUser.uid : false;
      default:
        return true;
    }
  });

  const handleCreatePoll = async (pollData: CreatePollData) => {
    try {
      await createNewPoll(pollData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      await votePoll(pollId, optionId);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleRemoveVote = async (pollId: string, optionId: string) => {
    try {
      await removeVote(pollId, optionId);
    } catch (error) {
      console.error('Error removing vote:', error);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    if (window.confirm('Are you sure you want to close this poll? This action cannot be undone.')) {
      try {
        await closePollById(pollId);
      } catch (error) {
        console.error('Error closing poll:', error);
      }
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      try {
        await removePoll(pollId);
      } catch (error) {
        console.error('Error deleting poll:', error);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: getResponsiveValue('10px', '15px', '20px', responsive),
      paddingTop: getResponsiveValue('80px', '90px', '100px', responsive)
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: getResponsiveValue('15px', '20px', '25px', responsive),
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: getResponsiveValue('1.8rem', '2.2rem', '2.5rem', responsive),
            color: '#333',
            fontWeight: 'bold'
          }}>
            📊 Community Polls
          </h1>
          <p style={{
            margin: 0,
            color: '#666',
            fontSize: getResponsiveValue('0.9rem', '1rem', '1.1rem', responsive)
          }}>
            Create polls and gather community opinions
          </p>
        </div>

        {/* Action Bar */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: getResponsiveValue('15px', '18px', '20px', responsive),
          marginBottom: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: responsive.isMobile ? 'wrap' : 'nowrap',
          gap: responsive.isMobile ? '15px' : '10px'
        }}>
          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'All Polls', icon: '📊' },
              { key: 'active', label: 'Active', icon: '🟢' },
              { key: 'closed', label: 'Closed', icon: '🔒' },
              { key: 'my-polls', label: 'My Polls', icon: '👤' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                style={{
                  padding: responsive.isMobile ? '6px 10px' : '8px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: filter === key ? '#007bff' : '#f8f9fa',
                  color: filter === key ? 'white' : '#666',
                  cursor: 'pointer',
                  fontSize: responsive.isMobile ? '12px' : '14px',
                  fontWeight: filter === key ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{icon}</span>
                <span>{responsive.isMobile && label.includes(' ') ? label.split(' ')[0] : label}</span>
              </button>
            ))}
          </div>

          {/* Create Poll Button */}
          {currentUser && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: responsive.isMobile ? '8px 16px' : '10px 20px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: '#28a745',
                color: 'white',
                cursor: 'pointer',
                fontSize: responsive.isMobile ? '14px' : '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>+</span>
              <span>{responsive.isMobile ? 'New' : 'Create Poll'}</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '10px'
            }}>
              📊
            </div>
            <p>Loading polls...</p>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: '2px solid #dc3545'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '10px',
              color: '#dc3545'
            }}>
              ❌
            </div>
            <p style={{ color: '#dc3545', margin: '0' }}>
              Error loading polls: {error}
            </p>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              📊
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {filter === 'all' ? 'No polls yet' : 
               filter === 'active' ? 'No active polls' :
               filter === 'closed' ? 'No closed polls' :
               'You haven\'t created any polls yet'}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>
              {filter === 'my-polls' 
                ? 'Create your first poll to get started!'
                : 'Be the first to create a poll and engage the community!'}
            </p>
            {currentUser && filter !== 'my-polls' && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: '#28a745',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                }}
              >
                📊 Create First Poll
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Poll Count */}
            <div style={{
              marginBottom: '20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {filteredPolls.length} poll{filteredPolls.length !== 1 ? 's' : ''} found
              {filter === 'all' && ` (Total: ${polls.length})`}
            </div>

            {/* Poll List */}
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                onRemoveVote={handleRemoveVote}
                onClose={handleClosePoll}
                onDelete={handleDeletePoll}
              />
            ))}
            
            {/* Manual Load More - Only show when filter is 'all' */}
            {filter === 'all' && (
              <>
                {/* Manual Load More Button */}
                {hasMore && !loadingMore && (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    <button
                      onClick={loadMorePolls}
                      style={{
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#5a67d8';
                        (e.target as HTMLElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = '#667eea';
                        (e.target as HTMLElement).style.transform = 'translateY(0)';
                      }}
                    >
                      📊 Load More Polls
                    </button>
                  </div>
                )}
                
                {/* Loading more indicator */}
                {loadingMore && (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ color: '#667eea', fontSize: '1rem' }}>Loading more polls...</div>
                  </div>
                )}
                
                {/* End of content indicator */}
                {!hasMore && polls.length > 0 && (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '20px',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ color: '#999', fontSize: '0.9rem' }}>
                      🎉 You've reached the end! No more polls to load.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Login Prompt */}
        {!currentUser && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: '2px solid #ffc107'
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '10px'
            }}>
              👤
            </div>
            <p style={{ margin: '0 0 10px 0', color: '#333' }}>
              Sign in to create polls and vote!
            </p>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Join the community and share your opinions
            </p>
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePoll}
      />
    </div>
  );
};
