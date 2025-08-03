import React, { useState } from 'react';
import { useAdoptions } from '../hooks/useAdoptions';
import { AdoptionCard } from '../components/AdoptionCard';
import { CreateAdoptionModal } from '../components/CreateAdoptionModal';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { useAuth } from '../hooks/useAuth';
import { type CreateAdoptionData } from '../services/adoptionService';

export const AdoptionPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    adoptions,
    loading,
    loadingMore,
    error,
    hasMore,
    createNewAdoption,
    likeAdoption,
    toggleAdoptionInterest,
    completeAdoption,
    loadMoreAdoptions
  } = useAdoptions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const responsive = useResponsive();

  const handleCreateAdoption = async (adoptionData: CreateAdoptionData) => {
    await createNewAdoption(adoptionData);
    setIsCreateModalOpen(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🐾</div>
          <div>Loading pets looking for homes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        fontSize: '18px',
        color: '#dc3545'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>😔</div>
          <div>Error loading adoptions: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: getResponsiveValue('10px', '15px', '20px', responsive),
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexDirection: responsive.isMobile ? 'column' : 'row',
        gap: responsive.isMobile ? '16px' : '0'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: getResponsiveValue('1.8rem', '2rem', '2.2rem', responsive),
            color: '#333',
            textAlign: responsive.isMobile ? 'center' : 'left'
          }}>
            🏠 Pet Adoption
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#666',
            fontSize: getResponsiveValue('14px', '15px', '16px', responsive),
            textAlign: responsive.isMobile ? 'center' : 'left'
          }}>
            Find your perfect furry, feathered, or scaly companion
          </p>
        </div>
        
        {currentUser && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: getResponsiveValue('12px 20px', '11px 18px', '10px 16px', responsive),
              fontSize: getResponsiveValue('16px', '15px', '14px', responsive),
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              width: responsive.isMobile ? '100%' : 'auto',
              justifyContent: 'center'
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
            <span style={{ fontSize: '18px' }}>➕</span>
            Post Pet for Adoption
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: responsive.isMobile ? 'repeat(2, 1fr)' : responsive.isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
        gap: getResponsiveValue('12px', '14px', '16px', responsive),
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: getResponsiveValue('12px', '14px', '16px', responsive),
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: getResponsiveValue('20px', '22px', '24px', responsive), marginBottom: '4px' }}>🐕</div>
          <div style={{ fontSize: getResponsiveValue('18px', '20px', '22px', responsive), fontWeight: 'bold', color: '#333' }}>
            {adoptions.filter(a => a.type === 'dog' && a.isAvailable).length}
          </div>
          <div style={{ fontSize: getResponsiveValue('12px', '13px', '14px', responsive), color: '#666' }}>Dogs</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: getResponsiveValue('12px', '14px', '16px', responsive),
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: getResponsiveValue('20px', '22px', '24px', responsive), marginBottom: '4px' }}>🐱</div>
          <div style={{ fontSize: getResponsiveValue('18px', '20px', '22px', responsive), fontWeight: 'bold', color: '#333' }}>
            {adoptions.filter(a => a.type === 'cat' && a.isAvailable).length}
          </div>
          <div style={{ fontSize: getResponsiveValue('12px', '13px', '14px', responsive), color: '#666' }}>Cats</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: getResponsiveValue('12px', '14px', '16px', responsive),
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: getResponsiveValue('20px', '22px', '24px', responsive), marginBottom: '4px' }}>🐾</div>
          <div style={{ fontSize: getResponsiveValue('18px', '20px', '22px', responsive), fontWeight: 'bold', color: '#333' }}>
            {adoptions.filter(a => !['dog', 'cat'].includes(a.type) && a.isAvailable).length}
          </div>
          <div style={{ fontSize: getResponsiveValue('12px', '13px', '14px', responsive), color: '#666' }}>Others</div>
        </div>
        
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: getResponsiveValue('12px', '14px', '16px', responsive),
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #d4edda'
        }}>
          <div style={{ fontSize: getResponsiveValue('20px', '22px', '24px', responsive), marginBottom: '4px' }}>❤️</div>
          <div style={{ fontSize: getResponsiveValue('18px', '20px', '22px', responsive), fontWeight: 'bold', color: '#28a745' }}>
            {adoptions.filter(a => !a.isAvailable).length}
          </div>
          <div style={{ fontSize: getResponsiveValue('12px', '13px', '14px', responsive), color: '#666' }}>Adopted</div>
        </div>
      </div>

      {/* Pet Listings */}
      {adoptions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🐾</div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '24px' }}>No pets available for adoption yet</h3>
          <p style={{ margin: 0, fontSize: '16px' }}>
            {currentUser 
              ? "Be the first to post a pet for adoption!" 
              : "Check back later for pets looking for their forever homes."
            }
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: responsive.isMobile 
              ? '1fr' 
              : responsive.isTablet 
                ? 'repeat(2, 1fr)' 
                : 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: getResponsiveValue('16px', '18px', '20px', responsive)
          }}>
            {adoptions.map((adoption) => (
              <AdoptionCard
                key={adoption.id}
                adoption={adoption}
                onLike={likeAdoption}
                onInterest={toggleAdoptionInterest}
                onComplete={completeAdoption}
              />
            ))}
          </div>
          
          {/* Manual Load More Button */}
          {hasMore && !loadingMore && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px'
            }}>
              <button
                onClick={loadMoreAdoptions}
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
                🐾 Load More Pets
              </button>
            </div>
          )}
          
          {/* Loading more indicator */}
          {loadingMore && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              color: '#667eea',
              fontSize: '1rem'
            }}>
              Loading more pets...
            </div>
          )}
          
          {/* End of content indicator */}
          {!hasMore && adoptions.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              color: '#999',
              fontSize: '0.9rem'
            }}>
              🎉 You've seen all the pets looking for homes!
            </div>
          )}
        </>
      )}

      {/* Create Adoption Modal */}
      <CreateAdoptionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAdoption={handleCreateAdoption}
      />
    </div>
  );
};
