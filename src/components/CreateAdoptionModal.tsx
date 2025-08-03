import React, { useState } from 'react';
import { type CreateAdoptionData, type AdoptionPost } from '../services/adoptionService';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { uploadMultipleImages, validateImageFile } from '../services/imageUpload';
import { useAuth } from '../hooks/useAuth';
import { LocationPicker } from './LocationPicker';

interface CreateAdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAdoption: (adoptionData: CreateAdoptionData) => Promise<void>;
}

export const CreateAdoptionModal: React.FC<CreateAdoptionModalProps> = ({
  isOpen,
  onClose,
  onCreateAdoption
}) => {
  const [formData, setFormData] = useState<CreateAdoptionData>({
    name: '',
    type: 'dog',
    breed: '',
    age: 0,
    gender: 'unknown',
    size: 'medium',
    color: '',
    description: '',
    story: '',
    vaccinated: false,
    spayedNeutered: false,
    location: {
      address: '',
      latitude: 0,
      longitude: 0
    },
    media: []
  });
  
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const responsive = useResponsive();
  const { currentUser } = useAuth();

  const handleInputChange = <K extends keyof CreateAdoptionData>(field: K, value: CreateAdoptionData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (location: CreateAdoptionData['location']) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      try {
        fileArray.forEach(file => validateImageFile(file));
        setSelectedFiles(prev => [...prev, ...fileArray]);
        setError(null);
      } catch (validationError) {
        setError(validationError instanceof Error ? validationError.message : 'Invalid file');
      }
    }
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.location.address.trim()) {
      setError('Please select a location');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setUploadingImages(true);
      
      let allImageUrls = [...imageUrls];
      if (selectedFiles.length > 0 && currentUser) {
        try {
          const uploadedUrls = await uploadMultipleImages(selectedFiles, currentUser.uid);
          allImageUrls = [...allImageUrls, ...uploadedUrls];
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          setError('Failed to upload images');
          return;
        }
      }
      
      setUploadingImages(false);
      
      await onCreateAdoption({
        ...formData,
        media: allImageUrls.filter(url => url.trim() !== '')
      });
      
      handleClose();
    } catch (err) {
      setError('Failed to create adoption post');
      console.error('Error creating adoption:', err);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'dog',
      breed: '',
      age: 0,
      gender: 'unknown',
      size: 'medium',
      color: '',
      description: '',
      story: '',
      vaccinated: false,
      spayedNeutered: false,
      location: {
        address: '',
        latitude: 0,
        longitude: 0
      },
      media: []
    });
    setImageUrls([]);
    setNewImageUrl('');
    setSelectedFiles([]);
    setError(null);
    onClose();
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
        padding: getResponsiveValue('16px', '20px', '24px', responsive),
        width: '100%',
        maxWidth: responsive.isMobile ? '100%' : '600px',
        maxHeight: responsive.isMobile ? '95vh' : '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#333',
            fontSize: getResponsiveValue('1.3rem', '1.4rem', '1.5rem', responsive)
          }}>🏠 Create Adoption Post</h2>
          <button
            onClick={handleClose}
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

        {error && (
          <div style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Pet Basic Info */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#667eea' }}>Pet Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Bella, Max, Luna"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as AdoptionPost['type'])}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="hamster">Hamster</option>
                  <option value="fish">Fish</option>
                  <option value="reptile">Reptile</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Breed
                </label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  placeholder="e.g., Golden Retriever, Mixed"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Age (months)
                </label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 24 for 2 years"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value as AdoptionPost['gender'])}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: responsive.isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value as AdoptionPost['size'])}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Golden, Black and white"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Health Info */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#667eea' }}>Health Information</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.vaccinated}
                  onChange={(e) => handleInputChange('vaccinated', e.target.checked)}
                />
                <span>Vaccinated</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.spayedNeutered}
                  onChange={(e) => handleInputChange('spayedNeutered', e.target.checked)}
                />
                <span>Spayed/Neutered</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell us about this pet's personality, needs, and what makes them special..."
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          {/* Story */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Their Story (Optional)
            </label>
            <textarea
              value={formData.story}
              onChange={(e) => handleInputChange('story', e.target.value)}
              placeholder="Share their backstory, how they came to need a home, or special circumstances..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Location */}
          <LocationPicker
            location={formData.location.address ? formData.location : undefined}
            onLocationChange={handleLocationChange}
            error={error && !formData.location.address ? 'Please select a location' : undefined}
          />

          {/* Images */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Photos (Optional):
            </label>
            
            {/* File Upload */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ 
                display: 'inline-block',
                padding: '10px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                📁 Upload Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                Max 5MB per image. JPEG, PNG, GIF, WebP allowed.
              </span>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Selected Files:</div>
                {selectedFiles.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    padding: '8px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '4px'
                  }}>
                    <div style={{ fontSize: '20px' }}>📷</div>
                    <span style={{ flex: 1, fontSize: '14px' }}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* URL Input */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#666' }}>
                Or add image URL:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!newImageUrl.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: newImageUrl.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Image Preview */}
            {imageUrls.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Added Images:</div>
                {imageUrls.map((url, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    padding: '4px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span style={{ flex: 1, fontSize: '14px', color: '#666' }}>
                      {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImageUrl(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            flexDirection: responsive.width < 480 ? 'column' : 'row'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: getResponsiveValue('12px 20px', '11px 20px', '10px 20px', responsive),
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: getResponsiveValue('16px', '15px', '14px', responsive),
                order: responsive.width < 480 ? 2 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.description.trim()}
              style={{
                padding: getResponsiveValue('12px 20px', '11px 20px', '10px 20px', responsive),
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || !formData.name.trim() || !formData.description.trim()) ? 'not-allowed' : 'pointer',
                fontSize: getResponsiveValue('16px', '15px', '14px', responsive),
                order: responsive.width < 480 ? 1 : 2
              }}
            >
              {loading ? (uploadingImages ? 'Uploading Images...' : 'Creating...') : '🏠 Create Adoption Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
