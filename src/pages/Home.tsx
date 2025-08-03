import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { CreatePostModal } from '../components/CreatePostModal';
import { PostCard } from '../components/PostCard';
import { type CreatePostData } from '../services/postService';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const { posts, loading, loadingMore, error, hasMore, createNewPost, likePost, removePost, loadMorePosts } = usePosts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const responsive = useResponsive();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px' }}>Loading posts...</div>
        {/* Show create button even while loading */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
        >
          ✨ Create New Post
        </button>
        {/* Create Post Modal - Available even while loading */}
        {isCreateModalOpen && (
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreatePost={async (postData: CreatePostData) => {
              await createNewPost(postData);
              setIsCreateModalOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px' }}>Error loading posts: {error}</div>
        {/* Show create button even on error */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
        >
          ✨ Create New Post
        </button>
        
        {/* Create Post Modal - Available even on error */}
        {isCreateModalOpen && (
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreatePost={async (postData: CreatePostData) => {
              await createNewPost(postData);
              setIsCreateModalOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: getResponsiveValue('10px', '15px', '20px', responsive)
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: getResponsiveValue('15px', '18px', '20px', responsive),
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#333',
            fontSize: getResponsiveValue('1.5rem', '1.75rem', '2rem', responsive),
            marginBottom: '10px',
            fontWeight: '700'
          }}>Welcome to Pawsome! 🐾</h1>
          <p style={{
            color: '#666',
            fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive),
            margin: '0 0 15px 0'
          }}>Share your pet moments with the community</p>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: getResponsiveValue('10px 20px', '11px 22px', '12px 24px', responsive),
              fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive),
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              width: responsive.width < 480 ? '100%' : 'auto'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5a6fd8';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ✨ Create New Post
          </button>
        </div>

        {/* Posts Feed */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {posts.length === 0 ? (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: getResponsiveValue('20px', '30px', '40px', responsive),
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: getResponsiveValue('2rem', '2.5rem', '3rem', responsive), marginBottom: '15px' }}>🐾</div>
              <h2 style={{ 
                color: '#333', 
                marginBottom: '10px',
                fontSize: getResponsiveValue('1.2rem', '1.35rem', '1.5rem', responsive)
              }}>No posts yet!</h2>
              <p style={{ 
                color: '#666', 
                marginBottom: '20px',
                fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive)
              }}>
                Be the first to share a moment with your furry friends.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: getResponsiveValue('10px 20px', '11px 22px', '12px 24px', responsive),
                  fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive),
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: responsive.width < 480 ? '100%' : 'auto'
                }}
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => likePost(post.id)}
                  onDelete={currentUser?.uid === post.createdBy ? () => removePost(post.id) : undefined}
                />
              ))}
              
              {/* Manual Load More Button */}
              {hasMore && !loadingMore && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <button
                    onClick={loadMorePosts}
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
                    📄 Load More Posts
                  </button>
                </div>
              )}
              
              {/* Loading more indicator */}
              {loadingMore && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ color: '#667eea', fontSize: '1rem' }}>Loading more posts...</div>
                </div>
              )}
              
              {/* End of content indicator */}
              {!hasMore && posts.length > 0 && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ color: '#999', fontSize: '0.9rem' }}>
                    🎉 You've reached the end! No more posts to load.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Post Modal */}
        {isCreateModalOpen && (
          <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreatePost={async (postData: CreatePostData) => {
              await createNewPost(postData);
              setIsCreateModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
