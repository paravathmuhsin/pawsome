import React, { useState, useEffect } from 'react';
import { updateUserLocation, type GeoLocation } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { getCurrentPosition, getAddressFromCoords } from '../utils/geolocation';

interface LocationUpdateProps {
  currentLocation: GeoLocation | null;
  onLocationUpdated: () => void;
}

export const LocationUpdate: React.FC<LocationUpdateProps> = ({ 
  currentLocation, 
  onLocationUpdated 
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');

  useEffect(() => {
    const loadLocationAddress = async () => {
      if (currentLocation) {
        try {
          const address = await getAddressFromCoords(
            currentLocation.latitude, 
            currentLocation.longitude
          );
          setLocationAddress(address);
        } catch {
          setLocationAddress(`${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`);
        }
      }
    };

    loadLocationAddress();
  }, [currentLocation]);

  const handleGetLocation = async () => {
    if (!currentUser) return;

    try {
      setError(null);
      setLoading(true);
      
      const position = await getCurrentPosition();
      await updateUserLocation(currentUser.uid, position);
      onLocationUpdated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatLocationInfo = () => {
    if (!currentLocation) return 'Not set';
    
    const lastUpdated = new Date(currentLocation.timestamp).toLocaleString();
    const accuracy = currentLocation.accuracy ? `±${Math.round(currentLocation.accuracy)}m` : '';
    
    return (
      <div>
        <div>{locationAddress}</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Updated: {lastUpdated} {accuracy && `(${accuracy})`}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <strong>Location:</strong>
      </div>
      
      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          padding: '8px',
          marginBottom: '10px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '10px'
      }}>
        <div style={{ flex: 1 }}>
          {formatLocationInfo()}
        </div>
        
        <button
          onClick={handleGetLocation}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            marginLeft: '10px',
            whiteSpace: 'nowrap'
          }}
        >
          {loading ? 'Getting Location...' : currentLocation ? 'Update Location' : 'Get My Location'}
        </button>
      </div>
      
      {currentLocation && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          📍 Coordinates: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
        </div>
      )}
      
      <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
        ℹ️ Your browser will ask for permission to access your location
      </div>
    </div>
  );
};
