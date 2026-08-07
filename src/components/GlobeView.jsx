import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';

/* ─── Globe Texture URLs ─── */
const TEXTURES = {
  default: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  terrain: '//unpkg.com/three-globe/example/img/earth-topology.png',
};
const BUMP_URL = '//unpkg.com/three-globe/example/img/earth-topology.png';
const NIGHT_SKY = '//unpkg.com/three-globe/example/img/night-sky.png';

const GlobeView = ({
  targetLocation,
  pointsData = [],
  onGlobeReady,
  activeLayers = new Set(),
  boundariesData = [],
  wildfirePoints = [],
  aqiPoints = [],
}) => {
  const globeEl = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Resize observer — fills full container
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  // Globe config after mount
  const handleGlobeReady = useCallback(() => {
    if (!globeEl.current) return;
    const controls = globeEl.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.15;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.4;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 120;

    // Start zoomed out a bit
    globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 0);

    if (onGlobeReady) onGlobeReady();
  }, [onGlobeReady]);

  // Fly to target
  useEffect(() => {
    if (targetLocation && globeEl.current) {
      globeEl.current.pointOfView({
        lat: targetLocation.lat,
        lng: targetLocation.lng,
        altitude: 1.2
      }, 1500);
    }
  }, [targetLocation]);

  /* ─── Derived state for active layers ─── */
  const isTerrain = activeLayers.has('terrain');
  const showBoundaries = activeLayers.has('boundaries');
  const showWildfires = activeLayers.has('wildfires');
  const showAQI = activeLayers.has('airquality');

  // Select globe texture
  const globeImageUrl = isTerrain ? TEXTURES.terrain : TEXTURES.default;

  // Merge property points + AQI points + wildfire points into single points layer
  const mergedPoints = useMemo(() => {
    const pts = [...pointsData];

    if (showAQI) {
      aqiPoints.forEach(p => pts.push(p));
    }

    if (showWildfires) {
      wildfirePoints.forEach(p => pts.push(p));
    }

    return pts;
  }, [pointsData, aqiPoints, wildfirePoints, showAQI, showWildfires]);

  // Boundaries polygons — only shown when layer active
  const polygons = showBoundaries ? boundariesData : [];

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#030712',
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={globeImageUrl}
          bumpImageUrl={BUMP_URL}
          backgroundImageUrl={NIGHT_SKY}
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor={isTerrain ? '#8b9dc3' : '#38bdf8'}
          atmosphereAltitude={0.18}
          onGlobeReady={handleGlobeReady}

          // Points layer (properties + AQI + wildfires merged)
          pointsData={mergedPoints}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={d => d.altitude || 0.06}
          pointRadius={d => d.radius || 0.45}
          pointsMerge={false}
          pointLabel={d => d.label || ''}

          // Arcs layer — visual flair connecting property points only
          arcsData={pointsData.length > 1 ? pointsData.slice(0, -1).map((p, i) => ({
            startLat: p.lat,
            startLng: p.lng,
            endLat: pointsData[i + 1].lat,
            endLng: pointsData[i + 1].lng,
          })) : []}
          arcColor={() => ['rgba(56,189,248,0.6)', 'rgba(129,140,248,0.6)']}
          arcStroke={0.4}
          arcDashLength={0.5}
          arcDashGap={0.3}
          arcDashAnimateTime={3000}

          // Polygon layer — state/county boundaries
          polygonsData={polygons}
          polygonGeoJsonGeometry={d => d.geometry}
          polygonCapColor={() => 'rgba(0, 0, 0, 0)'}
          polygonSideColor={() => 'rgba(56, 189, 248, 0.05)'}
          polygonStrokeColor={() => 'rgba(56, 189, 248, 0.45)'}
          polygonAltitude={0.005}
          polygonLabel={d => {
            const p = d.properties;
            return `<div style="background:rgba(10,17,40,0.9);padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);font-family:Inter,sans-serif;font-size:12px;color:#f1f5f9;font-weight:500">${p.name || p.NAME || p.NAME_1 || ''}</div>`;
          }}
        />
      )}
    </div>
  );
};

export default GlobeView;
