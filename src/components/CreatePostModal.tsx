import React, { useState } from 'react';
import { type CreatePostData } from '../services/postService';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { uploadMultipleImages, validateImageFile } from '../services/imageUpload';
import { useAuth } from '../hooks/useAuth';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: CreatePostData) => Promise<void>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onCreatePost
}) => {
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const responsive = useResponsive();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      setUploadingImages(true);
      
      // Upload selected files if any
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
      
      await onCreatePost({
        content: content.trim(),
        media: allImageUrls.filter(url => url.trim() !== '')
      });
      
      // Reset form
      setContent('');
      setImageUrls([]);
      setNewImageUrl('');
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Validate each file
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

  const handleClose = () => {
    setContent('');
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
        maxWidth: responsive.isMobile ? '100%' : '500px',
        maxHeight: responsive.isMobile ? '95vh' : '80vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: responsive.width < 480 ? 'wrap' : 'nowrap',
          gap: responsive.width < 480 ? '10px' : '0'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#333',
            fontSize: getResponsiveValue('1.3rem', '1.4rem', '1.5rem', responsive)
          }}>Create New Post</h2>
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
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: getResponsiveValue('0.9rem', '0.95rem', '1rem', responsive)
            }}>
              Content:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={getResponsiveValue(3, 3.5, 4, responsive)}
              style={{
                width: '100%',
                padding: getResponsiveValue('10px', '11px', '12px', responsive),
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: getResponsiveValue('16px', '15px', '14px', responsive)
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Images (Optional):
            </label>
            
            {/* File Upload Section */}
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
                📁 Upload from Computer
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

            {/* Selected Files Preview */}
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

            {/* URL Input Section */}
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
              disabled={loading || !content.trim()}
              style={{
                padding: getResponsiveValue('12px 20px', '11px 20px', '10px 20px', responsive),
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: (loading || !content.trim()) ? 'not-allowed' : 'pointer',
                fontSize: getResponsiveValue('16px', '15px', '14px', responsive),
                order: responsive.width < 480 ? 1 : 2
              }}
            >
              {uploadingImages ? 'Uploading Images...' : loading ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
