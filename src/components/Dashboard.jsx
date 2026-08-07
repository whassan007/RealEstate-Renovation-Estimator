import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronUp, Cpu, ShieldCheck, ShieldX, Satellite, Layers, ExternalLink } from 'lucide-react';
import GlobeView from './GlobeView';
import MapLayerSwitcher from './MapLayerSwitcher';
import StreetViewPanel from './StreetViewPanel';
import ExecutiveSummary from './ExecutiveSummary';
import { runCBKS, calculateFinancials, calculateWScore } from '../engine/WMethod';

/* ─── Demo wildfire data (major US fire-prone regions) ─── */
const WILDFIRE_DATA = [
  { lat: 36.78, lng: -119.42, intensity: 0.9 }, { lat: 37.25, lng: -119.85, intensity: 0.7 },
  { lat: 34.15, lng: -118.15, intensity: 0.8 }, { lat: 39.80, lng: -121.50, intensity: 0.6 },
  { lat: 40.58, lng: -122.39, intensity: 0.95 }, { lat: 44.06, lng: -121.31, intensity: 0.5 },
  { lat: 42.33, lng: -122.87, intensity: 0.7 }, { lat: 46.87, lng: -114.00, intensity: 0.6 },
  { lat: 35.20, lng: -111.65, intensity: 0.4 }, { lat: 33.75, lng: -116.95, intensity: 0.85 },
  { lat: 38.90, lng: -120.00, intensity: 0.75 }, { lat: 41.20, lng: -123.50, intensity: 0.55 },
  { lat: 47.75, lng: -120.74, intensity: 0.45 }, { lat: 43.60, lng: -110.80, intensity: 0.35 },
  { lat: 35.60, lng: -118.90, intensity: 0.65 }, { lat: 39.30, lng: -120.60, intensity: 0.80 },
].map((f, i) => ({
  lat: f.lat, lng: f.lng, color: `rgba(${200 + Math.round(f.intensity * 55)}, ${60 + Math.round((1 - f.intensity) * 80)}, 20, 0.9)`,
  altitude: 0.04 + f.intensity * 0.06, radius: 0.3 + f.intensity * 0.5,
  label: `<div style="background:rgba(10,17,40,0.9);padding:4px 8px;border-radius:6px;border:1px solid rgba(248,113,113,0.3);font-family:Inter,sans-serif;font-size:11px;color:#f87171;font-weight:600">🔥 Active Fire · Intensity ${Math.round(f.intensity * 100)}%</div>`,
  id: `fire-${i}`,
}));

/* ─── Demo AQI data (major US cities) ─── */
const AQI_COLORS = { good: '#34d399', moderate: '#fbbf24', unhealthy: '#f97316', veryUnhealthy: '#ef4444', hazardous: '#a855f7' };
const AQI_DATA = [
  { lat: 40.71, lng: -74.00, aqi: 42, city: 'New York' }, { lat: 34.05, lng: -118.24, aqi: 128, city: 'Los Angeles' },
  { lat: 41.88, lng: -87.63, aqi: 55, city: 'Chicago' }, { lat: 29.76, lng: -95.37, aqi: 85, city: 'Houston' },
  { lat: 33.45, lng: -112.07, aqi: 72, city: 'Phoenix' }, { lat: 47.61, lng: -122.33, aqi: 38, city: 'Seattle' },
  { lat: 25.76, lng: -80.19, aqi: 48, city: 'Miami' }, { lat: 39.74, lng: -104.99, aqi: 65, city: 'Denver' },
  { lat: 37.77, lng: -122.42, aqi: 95, city: 'San Francisco' }, { lat: 42.36, lng: -71.06, aqi: 35, city: 'Boston' },
  { lat: 33.75, lng: -84.39, aqi: 78, city: 'Atlanta' }, { lat: 30.27, lng: -97.74, aqi: 52, city: 'Austin' },
  { lat: 32.78, lng: -96.80, aqi: 68, city: 'Dallas' }, { lat: 42.33, lng: -83.05, aqi: 82, city: 'Detroit' },
  { lat: 36.17, lng: -115.14, aqi: 110, city: 'Las Vegas' }, { lat: 45.52, lng: -122.68, aqi: 145, city: 'Portland' },
].map((c, i) => {
  const color = c.aqi <= 50 ? AQI_COLORS.good : c.aqi <= 100 ? AQI_COLORS.moderate : c.aqi <= 150 ? AQI_COLORS.unhealthy : c.aqi <= 200 ? AQI_COLORS.veryUnhealthy : AQI_COLORS.hazardous;
  const level = c.aqi <= 50 ? 'Good' : c.aqi <= 100 ? 'Moderate' : c.aqi <= 150 ? 'Unhealthy' : 'Very Unhealthy';
  return {
    lat: c.lat, lng: c.lng, color, altitude: 0.03, radius: 0.55,
    label: `<div style="background:rgba(10,17,40,0.9);padding:4px 8px;border-radius:6px;border:1px solid ${color}33;font-family:Inter,sans-serif;font-size:11px;color:${color};font-weight:600">${c.city} · AQI ${c.aqi} · ${level}</div>`,
    id: `aqi-${i}`,
  };
});

const BOUNDARIES_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
const US_STATES_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

/* ─── City coordinate lookup (fallback for demo) ─── */
const CITY_COORDS = {
  'new york': { lat: 40.7128, lng: -74.0060 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'ann arbor': { lat: 42.2808, lng: -83.7430 },
  'anne arbor': { lat: 42.2808, lng: -83.7430 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'detroit': { lat: 42.3314, lng: -83.0458 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
};

function guessCoords(query) {
  const q = query.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (q.includes(city)) return coords;
  }
  // Random fallback
  return { lat: 38 + (Math.random() - 0.5) * 20, lng: -40 + (Math.random() - 0.5) * 60 };
}

const Dashboard = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [macroData, setMacroData] = useState(null);
  const [aggregatedProperties, setAggregatedProperties] = useState([]);
  const [scanMeta, setScanMeta] = useState(null);
  const [targetLocation, setTargetLocation] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedProp, setExpandedProp] = useState(null);
  const [activeLayers, setActiveLayers] = useState(new Set());
  const [boundariesData, setBoundariesData] = useState([]);

  // Toggle a map layer
  const handleToggleLayer = useCallback((layerId) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }, []);

  // Fetch boundaries GeoJSON when layer activated
  useEffect(() => {
    if (!activeLayers.has('boundaries') || boundariesData.length > 0) return;
    fetch('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces.geojson')
      .then(r => r.json())
      .then(data => setBoundariesData(data.features || []))
      .catch(() => {
        fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
          .then(r => r.json())
          .then(data => setBoundariesData(data.features || []))
          .catch(console.error);
      });
  }, [activeLayers, boundariesData.length]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setMacroData(null);
    setAggregatedProperties([]);
    setScanMeta(null);
    setPanelOpen(false);
    setExpandedProp(null);

    // Fly globe to estimated location
    const coords = guessCoords(query);
    setTargetLocation(coords);

    try {
      const response = await fetch('https://us-central1-wael-bot.cloudfunctions.net/aggregateListings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const { data } = await response.json();
      setMacroData(data.macroZoom);
      setScanMeta({
        platformsSearched: data.scan.platformsSearched,
        totalRawHits: data.scan.totalRawHits,
        verifiedListings: data.scan.verifiedListings,
      });

      const processed = data.scan.properties.map(prop => {
        const cbks = runCBKS(prop, data.macroZoom.baselines);
        let financials = null;
        let wScore = null;

        if (cbks.pass) {
          financials = calculateFinancials(prop);
          wScore = calculateWScore(prop, financials, 75, prop.marketTier);
        }

        return { ...prop, cbks, financials, wScore };
      });

      setAggregatedProperties(processed);
      setPanelOpen(true);
    } catch (error) {
      console.error('Terra-W API Error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Build points for globe
  const globePoints = useMemo(() => {
    if (!targetLocation || aggregatedProperties.length === 0) return [];
    return aggregatedProperties.map((p, i) => ({
      lat: targetLocation.lat + (Math.random() - 0.5) * 0.15,
      lng: targetLocation.lng + (Math.random() - 0.5) * 0.15,
      color: p.cbks?.pass ? '#34d399' : '#f87171',
      id: p.id,
    }));
  }, [aggregatedProperties, targetLocation]);

  const passCount = aggregatedProperties.filter(p => p.cbks?.pass).length;
  const failCount = aggregatedProperties.length - passCount;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* ═══ GLOBE — Full Viewport ═══ */}
      <GlobeView
        targetLocation={targetLocation}
        pointsData={globePoints}
        activeLayers={activeLayers}
        boundariesData={boundariesData}
        wildfirePoints={WILDFIRE_DATA}
        aqiPoints={AQI_DATA}
      />

      {/* ═══ MAP LAYER SWITCHER — Bottom Left ═══ */}
      <div style={{ position: 'absolute', bottom: 50, left: 20, zIndex: 25 }}>
        <MapLayerSwitcher activeLayers={activeLayers} onToggleLayer={handleToggleLayer} />
      </div>

      {/* ═══ STREET VIEW PANEL — Bottom Left ═══ */}
      {activeLayers.has('streetview') && targetLocation && (
        <div style={{ position: 'absolute', bottom: 50, left: 80, zIndex: 24, width: 380, maxWidth: 'calc(100vw - 100px)' }}>
          <StreetViewPanel
            lat={targetLocation.lat}
            lng={targetLocation.lng}
            onClose={() => handleToggleLayer('streetview')}
          />
        </div>
      )}

      {/* ═══ TOP BAR ═══ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 28px',
        background: 'linear-gradient(180deg, rgba(3,7,18,0.85) 0%, rgba(3,7,18,0) 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2
          }}>
            <span className="text-gradient-accent">Terra-W</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
            Spatial Intelligence Engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'auto' }}>
          {macroData && (
            <span className="badge badge-info" style={{ animationDelay: '0.1s' }}>
              <Layers size={11} /> {macroData.marketClassification}
            </span>
          )}
          <span className="badge badge-pass">
            <Satellite size={11} /> Online
          </span>
        </div>
      </div>

      {/* ═══ SEARCH BAR — Google Earth style ═══ */}
      <div style={{
        position: 'absolute',
        top: panelOpen ? 80 : '50%',
        left: '50%',
        transform: panelOpen ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
        zIndex: 30,
        width: '90%',
        maxWidth: 680,
        transition: 'top 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Tagline — only when centered */}
        {!panelOpen && !isSearching && aggregatedProperties.length === 0 && (
          <div className="anim-fade-in-up" style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32,
              color: '#fff', letterSpacing: '-0.02em', marginBottom: 8,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}>
              Search the world for real estate
            </h2>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(255,255,255,0.55)',
              textShadow: '0 1px 8px rgba(0,0,0,0.4)',
            }}>
              Institutional-grade underwriting powered by the W-Method
            </p>
          </div>
        )}

        <form onSubmit={handleSearch}>
          <div className="search-bar">
            <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search a city, region, or market…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />
            {query && !isSearching && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 4, display: 'flex', borderRadius: '50%',
                }}
              >
                <X size={16} />
              </button>
            )}
            <button type="submit" disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <><div className="spinner" /> Scanning…</>
              ) : (
                <>Search</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ═══ RESULTS PANEL — Right Side Drawer ═══ */}
      {panelOpen && (
        <div
          className="glass-panel custom-scroll anim-slide-in"
          style={{
            position: 'absolute',
            top: 20, right: 20, bottom: 20,
            width: 420,
            maxWidth: 'calc(100vw - 40px)',
            zIndex: 25,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Panel Header */}
          <div style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, margin: 0 }}>
                Analysis Results
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {aggregatedProperties.length} listings • {passCount} pass • {failCount} fail
              </p>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer',
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Platform Sources & Scan Stats */}
          {scanMeta && (
            <div style={{
              padding: '10px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Sources ({scanMeta.verifiedListings || 0} verified of {scanMeta.totalRawHits || 0} hits)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {scanMeta.platformsSearched?.map((platform, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6,
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                  }}>
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Macro Zoom Summary */}
          {macroData && (
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{macroData.location}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tier</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{macroData.marketClassification}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vacancy</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{Math.max(macroData.baselines.vacancyRateState, macroData.baselines.vacancyRateNational)}%</div>
              </div>
            </div>
          )}

          {/* Scrollable Property List */}
          <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {aggregatedProperties.map((prop, idx) => (
              <div
                key={prop.id}
                className="anim-fade-in-up"
                style={{
                  animationDelay: `${idx * 0.06}s`,
                  marginBottom: 10,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  transition: 'border-color var(--transition)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Property Row */}
                <button
                  onClick={() => setExpandedProp(expandedProp === prop.id ? null : prop.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', color: 'var(--text-primary)',
                    cursor: 'pointer', padding: '12px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: prop.cbks.pass ? 'var(--pass-bg)' : 'var(--fail-bg)',
                      color: prop.cbks.pass ? 'var(--pass)' : 'var(--fail)',
                    }}>
                      {prop.cbks.pass ? <ShieldCheck size={15} /> : <ShieldX size={15} />}
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }}>
                        {prop.address}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                        {prop.source && prop.source !== 'Unknown' && (
                          <span style={{
                            fontSize: 10, padding: '1px 5px', borderRadius: 4,
                            background: 'rgba(167, 139, 250, 0.12)',
                            border: '1px solid rgba(167, 139, 250, 0.2)',
                            color: '#a78bfa', fontFamily: 'var(--font-mono)',
                          }}>
                            {prop.sourceIcon} {prop.source}
                          </span>
                        )}
                        {prop.price > 0 && (
                          <span style={{
                            fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                            color: prop.priceExtracted ? 'var(--pass)' : 'var(--text-muted)',
                          }}>
                            ${prop.price.toLocaleString()}
                            {!prop.priceExtracted && <span style={{ fontSize: 9, fontWeight: 400 }}> est.</span>}
                          </span>
                        )}
                      </div>
                      {(prop.beds || prop.baths || prop.sqft) && (
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {prop.beds && `${prop.beds}bd`}{prop.baths && ` · ${prop.baths}ba`}{prop.sqft && ` · ${prop.sqft.toLocaleString()}sqft`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 6 }}>
                    <span className={`badge ${prop.cbks.pass ? 'badge-pass' : 'badge-fail'}`} style={{ fontSize: 10 }}>
                      {prop.cbks.pass ? 'PASS' : 'FAIL'}
                    </span>
                    {expandedProp === prop.id ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                  </div>
                </button>

                {/* Expanded Detail */}
                {expandedProp === prop.id && (
                  <div style={{ padding: '0 14px 14px', animation: 'fadeInUp 0.3s ease forwards' }}>
                    {/* Listing snippet & link */}
                    {prop.snippet && (
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: 10, fontFamily: 'var(--font-sans)' }}>
                        {prop.snippet}
                      </p>
                    )}
                    {prop.url && prop.url !== '#' && (
                      <a
                        href={prop.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, color: 'var(--accent)', textDecoration: 'none',
                          padding: '4px 10px', borderRadius: 6,
                          background: 'rgba(56, 189, 248, 0.06)',
                          border: '1px solid rgba(56, 189, 248, 0.12)',
                          marginBottom: 12,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.06)'; }}
                      >
                        <ExternalLink size={12} /> View Original Listing
                      </a>
                    )}
                    {prop.cbks.pass && prop.wScore ? (
                      <div>
                        {/* W-Score Bar */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>W-Score</span>
                            <span style={{ fontSize: 14, fontWeight: 700 }} className="text-gradient-accent">{prop.wScore.total}/100</span>
                          </div>
                          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              width: `${prop.wScore.total}%`,
                              background: `linear-gradient(90deg, var(--accent), var(--accent-alt))`,
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>

                        {/* Score Components */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                          {Object.entries(prop.wScore.components).map(([key, val]) => (
                            <div key={key} style={{
                              background: 'rgba(255,255,255,0.02)', borderRadius: 6,
                              padding: '8px 6px', textAlign: 'center',
                              border: '1px solid var(--border)',
                            }}>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize', marginBottom: 2 }}>{key}</div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {/* Financials */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                          padding: '10px 12px', borderRadius: 8,
                          background: 'rgba(56, 189, 248, 0.04)',
                          border: '1px solid rgba(56, 189, 248, 0.10)',
                        }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Cap Rate</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{prop.financials.capRate}%</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CoC Return</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{prop.financials.cocReturn}%</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '10px 12px', borderRadius: 8,
                        background: 'var(--fail-bg)',
                        border: '1px solid rgba(248,113,113,0.15)',
                        fontSize: 12, color: 'var(--fail)',
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>CBKS Kill-Switch Triggered</div>
                        {prop.cbks.fails.map((f, i) => (
                          <div key={i} style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>
                            <strong style={{ color: 'var(--fail)' }}>{f.metric}</strong>: {f.propertyValue.toFixed(1)} vs required {f.requiredBaseline.toFixed(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BOTTOM STATUS BAR ═══ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 28px',
        background: 'linear-gradient(0deg, rgba(3,7,18,0.8) 0%, rgba(3,7,18,0) 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pass)', display: 'inline-block', animation: 'pulseGlow 2s ease infinite', boxShadow: '0 0 6px var(--pass)' }} />
            SPATIAL ENGINE ONLINE
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          {targetLocation ? `LAT ${targetLocation.lat.toFixed(4)} · LNG ${targetLocation.lng.toFixed(4)}` : 'GEOSTATIONARY ORBIT'}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
