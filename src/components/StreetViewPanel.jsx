import React from 'react';
import { Eye, X } from 'lucide-react';

const StreetViewPanel = ({ lat, lng, onClose }) => {
  // Google Maps Embed API — Street View mode (free, no API key needed for basic)
  const src = `https://www.google.com/maps/embed?pb=!4v0!6m8!1m7!1s!2m2!1d${lat}!2d${lng}!3f0!4f0!5f0.7820865974627469&output=svembed`;

  // Fallback: use static street-level satellite view
  const fallbackSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=18&t=k&output=embed`;

  return (
    <div className="streetview-panel">
      <div className="sv-header">
        <h4>
          <Eye size={14} />
          Street View
        </h4>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={12} />
        </button>
      </div>
      <div className="sv-body">
        <iframe
          src={fallbackSrc}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Street View"
        />
      </div>
      <div className="sv-coords">
        LAT {lat.toFixed(6)} · LNG {lng.toFixed(6)}
      </div>
    </div>
  );
};

export default StreetViewPanel;
