import React, { useState } from 'react';
import { type CreatePollData } from '../services/pollService';
import { useAuth } from '../hooks/useAuth';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';
import { uploadImage } from '../services/imageUpload';

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pollData: CreatePollData) => Promise<void>;
}

export const CreatePollModal: React.FC<CreatePollModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const { currentUser } = useAuth();
  const responsive = useResponsive();
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [expirationTime, setExpirationTime] = useState('');
  const [media, setMedia] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) { // Limit to 10 options
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) { // Minimum 2 options
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageUpload = async (file: File) => {
    if (!currentUser) return;
    
    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file, 'polls');
      setMedia(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    if (!question.trim()) {
      alert('Please enter a poll question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      alert('Please enter at least 2 options');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let expiresAt: Date | null = null;
      
      // Parse expiration date and time if provided
      if (expirationDate) {
        if (expirationTime) {
          expiresAt = new Date(`${expirationDate}T${expirationTime}`);
        } else {
          expiresAt = new Date(`${expirationDate}T23:59:59`);
        }
        
        // Validate that expiration is in the future
        if (expiresAt <= new Date()) {
          alert('Expiration date must be in the future');
          setIsSubmitting(false);
          return;
        }
      }

      const pollData: CreatePollData = {
        question: question.trim(),
        options: validOptions.map(opt => opt.trim()),
        allowMultiple,
        expiresAt,
        media: media.trim() || undefined
      };

      await onSubmit(pollData);
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setAllowMultiple(false);
      setExpirationDate('');
      setExpirationTime('');
      setMedia('');
      
      onClose();
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Error creating poll. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      padding: responsive.isMobile ? '10px' : '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: responsive.isMobile ? '100%' : '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: getResponsiveValue('20px', '24px', '30px', responsive)
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: getResponsiveValue('1.4rem', '1.6rem', '1.8rem', responsive),
            color: '#333'
          }}>
            Create Poll 📊
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Poll Question */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Poll Question *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                minHeight: '80px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Poll Options */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Poll Options * (min 2, max 10)
            </label>
            
            {options.map((option, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '8px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginTop: '8px'
                }}
              >
                + Add Option
              </button>
            )}
          </div>

          {/* Poll Settings */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                Allow multiple selections
              </span>
            </label>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Poll Expiration (Optional)
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                    Time
                  </label>
                  <input
                    type="time"
                    value={expirationTime}
                    onChange={(e) => setExpirationTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              {expirationDate && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Poll will expire on {new Date(`${expirationDate}T${expirationTime || '23:59:59'}`).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Media Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Poll Image (Optional)
            </label>
            
            <div style={{ marginBottom: '12px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="poll-image-upload"
              />
              <label
                htmlFor="poll-image-upload"
                style={{
                  display: 'inline-block',
                  padding: '10px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: uploadingImage ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  border: 'none',
                  opacity: uploadingImage ? 0.7 : 1
                }}
              >
                {uploadingImage ? 'Uploading...' : '📷 Upload Image'}
              </label>
            </div>

            {/* Image URL Input (Alternative) */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
                Or paste image URL
              </label>
              <input
                type="url"
                value={media}
                onChange={(e) => setMedia(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={uploadingImage}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  opacity: uploadingImage ? 0.7 : 1
                }}
              />
            </div>

            {/* Image Preview */}
            {media && (
              <div style={{ marginTop: '8px' }}>
                <img
                  src={media}
                  alt="Poll preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMedia('');
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#666',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage || !question.trim() || options.filter(opt => opt.trim()).length < 2}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: isSubmitting || uploadingImage || !question.trim() || options.filter(opt => opt.trim()).length < 2 
                  ? '#ccc' 
                  : '#007bff',
                color: 'white',
                cursor: isSubmitting || uploadingImage || !question.trim() || options.filter(opt => opt.trim()).length < 2 
                  ? 'not-allowed' 
                  : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {isSubmitting ? 'Creating...' : uploadingImage ? 'Uploading Image...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
