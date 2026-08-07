import React from 'react';
import { Mountain, Eye, Flame, Wind, Map } from 'lucide-react';

const LAYERS = [
  { id: 'terrain',    icon: Mountain, tooltip: 'Terrain' },
  { id: 'streetview', icon: Eye,      tooltip: 'Street View' },
  { id: 'divider1',   type: 'divider' },
  { id: 'wildfires',  icon: Flame,    tooltip: 'Wildfires' },
  { id: 'airquality', icon: Wind,     tooltip: 'Air Quality' },
  { id: 'divider2',   type: 'divider' },
  { id: 'boundaries', icon: Map,      tooltip: 'State & County Lines' },
];

const MapLayerSwitcher = ({ activeLayers, onToggleLayer }) => {
  return (
    <div className="layer-switcher">
      {LAYERS.map((layer) => {
        if (layer.type === 'divider') {
          return <div key={layer.id} className="layer-divider" />;
        }

        const Icon = layer.icon;
        const isActive = activeLayers.has(layer.id);

        return (
          <button
            key={layer.id}
            className={`layer-btn ${isActive ? 'active' : ''}`}
            data-tooltip={layer.tooltip}
            onClick={() => onToggleLayer(layer.id)}
            aria-label={`Toggle ${layer.tooltip} layer`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
};

export default MapLayerSwitcher;
