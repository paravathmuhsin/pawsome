import React, { useState, useCallback } from 'react';
import { useResponsive, getResponsiveValue } from '../hooks/useResponsive';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  location: LocationData | null;
  onLocationChange: (location: LocationData) => void;
  error?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onLocationChange,
  error
}) => {
  const [addressInput, setAddressInput] = useState(location?.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const responsive = useResponsive();

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address using OpenStreetMap Nominatim (free, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            const locationData = { address, latitude, longitude };
            onLocationChange(locationData);
            setAddressInput(address);
            updateMapUrl(latitude, longitude);
          } else {
            // Fallback to coordinates
            const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            const locationData = { address, latitude, longitude };
            onLocationChange(locationData);
            setAddressInput(address);
            updateMapUrl(latitude, longitude);
          }
        } catch (error) {
          console.error('Error getting address:', error);
          // Fallback to coordinates
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const locationData = { address, latitude, longitude };
          onLocationChange(locationData);
          setAddressInput(address);
          updateMapUrl(latitude, longitude);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please enter an address manually.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [onLocationChange]);

  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim()) return;

    setIsLoading(true);
    try {
      // Simple geocoding using OpenStreetMap Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);
          
          const locationData = { 
            address: display_name || address, 
            latitude, 
            longitude 
          };
          onLocationChange(locationData);
          setAddressInput(display_name || address);
          updateMapUrl(latitude, longitude);
        } else {
          alert('Address not found. Please try a different address.');
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('Error finding address. Please try again.');
    }
    setIsLoading(false);
  }, [onLocationChange]);

  const updateMapUrl = (lat: number, lng: number) => {
    // Create a simple map URL using OpenStreetMap
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
    setMapUrl(mapUrl);
  };

  React.useEffect(() => {
    if (location?.latitude && location?.longitude) {
      updateMapUrl(location.latitude, location.longitude);
    }
  }, [location]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Location *
      </label>
      
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '12px',
        flexDirection: responsive.isMobile ? 'column' : 'row'
      }}>
        <input
          type="text"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              geocodeAddress(addressInput);
            }
          }}
          placeholder="Enter address or city"
          style={{
            flex: 1,
            padding: '8px',
            border: error ? '1px solid #dc3545' : '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        
        <button
          type="button"
          onClick={() => geocodeAddress(addressInput)}
          disabled={isLoading || !addressInput.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || !addressInput.trim() ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {isLoading ? '🔍 Searching...' : '🔍 Find'}
        </button>
        
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {isLoading ? '📍 Getting...' : '📍 Use Current'}
        </button>
      </div>

      {error && (
        <div style={{
          color: '#dc3545',
          fontSize: '14px',
          marginBottom: '12px'
        }}>
          {error}
        </div>
      )}

      {location && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '12px',
          borderRadius: '4px',
          border: '1px solid #e9ecef',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Selected Location:
          </div>
          <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>
            {location.address}
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        </div>
      )}

      {mapUrl && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden',
          height: getResponsiveValue('200px', '250px', '300px', responsive)
        }}>
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="Location Map"
          />
        </div>
      )}
    </div>
  );
};
