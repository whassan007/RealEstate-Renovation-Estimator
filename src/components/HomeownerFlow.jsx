import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Search, Bell, Heart, Home, Mail, SlidersHorizontal, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

function MapEventHandler({ properties, onBoundsChanged, onMapClick }) {
  const map = useMapEvents({
    moveend: () => updateBounds(),
    zoomend: () => updateBounds(),
    load: () => updateBounds(),
    click: async (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });

  const updateBounds = () => {
    if (!map) return;
    const bounds = map.getBounds();
    const visible = properties.filter(p => bounds.contains([p.lat, p.lng]));
    onBoundsChanged(visible);
  };

  // Initial update
  useEffect(() => {
    updateBounds();
  }, [properties]);

  return null;
}

export default function HomeownerFlow() {
  const [searchQuery, setSearchQuery] = useState('San Jose, CA');
  const [mapCenter, setMapCenter] = useState([37.3382, -121.8863]);
  const [properties, setProperties] = useState([]);
  const [visibleProperties, setVisibleProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [customMarker, setCustomMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Intelligence State
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateData, setEstimateData] = useState(null);
  const [quoteRequested, setQuoteRequested] = useState(false);

  // Walkthrough State
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [scopeAnswers, setScopeAnswers] = useState({});

  const handleMapClick = async (latlng) => {
    setLoading(true);
    setQuoteRequested(false);
    setEstimateData(null);
    setWalkthroughStep(0);
    setScopeAnswers({});
    setCustomMarker([latlng.lat, latlng.lng]);
    
    let address = "Selected Location";
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        address = data.display_name.split(',').slice(0, 3).join(','); // Get a clean short address
      }
    } catch (e) {
      console.warn("Reverse geocode failed", e);
    }
    
    // Generate synthetic property for quoting
    const customProp = {
      id: `custom-${Date.now()}`,
      address: address,
      lat: latlng.lat,
      lng: latlng.lng,
      price: 250000 + (Math.random() * 500000),
      beds: 2 + Math.floor(Math.random() * 3),
      baths: 1 + Math.floor(Math.random() * 2),
      sqft: 1200 + Math.floor(Math.random() * 1500),
      image: `https://picsum.photos/seed/${Date.now()}/400/300`
    };
    
    setSelectedProperty(customProp);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSelectedProperty(null);
    setCustomMarker(null);
    setQuoteRequested(false);
    setEstimateData(null);
    setWalkthroughStep(0);
    setScopeAnswers({});
    
    // Geocode the search query
    let baseLat = 37.3382;
    let baseLng = -121.8863;
    
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        baseLat = parseFloat(geoData[0].lat);
        baseLng = parseFloat(geoData[0].lon);
      }
    } catch (error) {
      console.warn("Geocoding failed, falling back to default.", error);
    }
    
    setMapCenter([baseLat, baseLng]);
    
    // Fetch REAL properties from intelligence layer
    let fetchedProps = [];
    try {
      const propRes = await fetch(`http://localhost:8000/properties?query=${encodeURIComponent(searchQuery)}`);
      const propData = await propRes.json();
      fetchedProps = propData.properties || [];
    } catch (error) {
      console.error("Failed to fetch real properties from backend:", error);
    }
    
    // Scatter the pins around the geocoded city center so we can see them on the map
    const propsWithCoords = fetchedProps.map(p => ({
      ...p,
      lat: baseLat + (Math.random() - 0.5) * 0.10,
      lng: baseLng + (Math.random() - 0.5) * 0.10
    }));
    
    setProperties(propsWithCoords);
    setVisibleProperties(propsWithCoords);
    setLoading(false);
  };

  useEffect(() => { handleSearch(); }, []);

  const getIntelligenceEstimate = async () => {
    setEstimateLoading(true);
    try {
      const res = await fetch('http://localhost:8000/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: {
            property_id: selectedProperty.id,
            region: searchQuery,
            items: Object.values(scopeAnswers)
          },
          sqft: selectedProperty.sqft,
          quality: scopeAnswers.quality || 'Standard'
        })
      });
      const data = await res.json();
      setEstimateData(data);
    } catch (e) {
      console.error("Intelligence API Error:", e);
      // Fallback
      setEstimateData({
        min_total: selectedProperty.sqft * 50 * 0.8,
        max_total: selectedProperty.sqft * 50 * 1.3,
        confidence_score: 0.6,
        confidence_level: 'MEDIUM',
        line_items: [
           { item: 'Cabinets', material_unit_cost: 5000, labor_unit_cost: 2000, quantity: 1, unit: 'LS', source: 'Fallback', confidence: 0.5 }
        ],
        cost_drivers: { 'Cabinetry': 45, 'Labor': 30, 'Plumbing': 15, 'Other': 10 },
        assumptions: ["Fallback estimation logic"],
        unknowns: ["Intelligence API offline"],
        stale_data_warnings: ["Pricing data is 14 months old."]
      });
    }
    setEstimateLoading(false);
  };

  const answerQuestion = (questionKey, answer) => {
    const newAnswers = { ...scopeAnswers, [questionKey]: answer };
    setScopeAnswers(newAnswers);
    
    // Adaptive logic
    if (questionKey === 'project_type' && answer === 'Bathroom') {
      setWalkthroughStep(1); // Go to bathroom specific
    } else if (questionKey === 'project_type' && answer === 'Kitchen') {
      setWalkthroughStep(2); // Go to kitchen specific
    } else if (walkthroughStep === 1 || walkthroughStep === 2) {
      setWalkthroughStep(3); // Layout changes?
    } else if (walkthroughStep === 3) {
      setWalkthroughStep(4); // Quality
    } else if (walkthroughStep === 4) {
      setWalkthroughStep(5); // Done
    }
  };

  useEffect(() => {
    if (walkthroughStep === 5) {
      getIntelligenceEstimate();
    }
  }, [walkthroughStep]);

  const requestQuote = () => {
    const requests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
    requests.push({
      id: Date.now().toString(),
      address: selectedProperty.address,
      property: selectedProperty,
      packageSelected: scopeAnswers,
      guestimate: { min: estimateData.min_total, max: estimateData.max_total },
      intelligence_data: estimateData,
      status: 'Requested',
      requestedAt: new Date().toISOString()
    });
    localStorage.setItem('quoteRequests', JSON.stringify(requests));
    setQuoteRequested(true);
  };

  const renderWalkthrough = () => {
    if (walkthroughStep === 0) {
      return (
        <div style={walkthroughCard}>
          <h3>What are you renovating?</h3>
          <button style={btnChoice} onClick={() => answerQuestion('project_type', 'Kitchen')}>Kitchen</button>
          <button style={btnChoice} onClick={() => answerQuestion('project_type', 'Bathroom')}>Bathroom</button>
          <button style={btnChoice} onClick={() => answerQuestion('project_type', 'Full House')}>Full House</button>
        </div>
      );
    }
    if (walkthroughStep === 1) {
      return (
        <div style={walkthroughCard}>
          <h3>What are you changing in the Bathroom?</h3>
          <button style={btnChoice} onClick={() => answerQuestion('bathroom_scope', 'Everything')}>Everything</button>
          <button style={btnChoice} onClick={() => answerQuestion('bathroom_scope', 'Fixtures only')}>Fixtures only</button>
          <button style={btnChoice} onClick={() => answerQuestion('bathroom_scope', 'Shower/tub')}>Shower/tub</button>
          <button style={btnChoice} onClick={() => answerQuestion('bathroom_scope', 'Cosmetic update')}>Cosmetic update</button>
        </div>
      );
    }
    if (walkthroughStep === 2) {
      return (
        <div style={walkthroughCard}>
          <h3>What are you changing in the Kitchen?</h3>
          <button style={btnChoice} onClick={() => answerQuestion('kitchen_scope', 'Everything')}>Everything</button>
          <button style={btnChoice} onClick={() => answerQuestion('kitchen_scope', 'Keep appliances')}>Keep appliances</button>
          <button style={btnChoice} onClick={() => answerQuestion('kitchen_scope', 'Cosmetic only')}>Cosmetic only</button>
        </div>
      );
    }
    if (walkthroughStep === 3) {
      return (
        <div style={walkthroughCard}>
          <h3>Are you moving plumbing or changing the layout?</h3>
          <button style={btnChoice} onClick={() => answerQuestion('layout_change', 'Yes')}>Yes</button>
          <button style={btnChoice} onClick={() => answerQuestion('layout_change', 'No')}>No</button>
          <button style={btnChoice} onClick={() => answerQuestion('layout_change', 'Not sure')}>Not sure</button>
        </div>
      );
    }
    if (walkthroughStep === 4) {
      return (
        <div style={walkthroughCard}>
          <h3>Scenario Modeling: Quality Level</h3>
          <p style={{fontSize: '0.85em', color: '#666'}}>Changes actual materials (e.g. Laminate vs Quartz vs Natural Stone)</p>
          <button style={btnChoice} onClick={() => answerQuestion('quality', 'Budget')}>Budget (Laminate/Basic)</button>
          <button style={btnChoice} onClick={() => answerQuestion('quality', 'Standard')}>Standard (Quartz)</button>
          <button style={btnChoice} onClick={() => answerQuestion('quality', 'Premium')}>Premium (Natural Stone/Custom)</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{ width: '70px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', background: 'white', zIndex: 10 }}>
        <div style={navItemStyle}><Search size={24} /><span style={navTextStyle}>Search</span></div>
        <div style={navItemStyle}><Bell size={24} /><span style={navTextStyle}>Updates</span></div>
        <div style={navItemStyle}><Heart size={24} /><span style={navTextStyle}>Saved</span></div>
        <div style={navItemStyle}><Home size={24} /><span style={navTextStyle}>Plan</span></div>
        <div style={navItemStyle}><Mail size={24} /><span style={navTextStyle}>Inbox</span></div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <div style={{ height: '64px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', padding: '0 1rem', background: 'white', zIndex: 10 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#f5f6f7', borderRadius: '24px', padding: '0.5rem 1rem', width: '300px' }}>
            <input 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1rem' }} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search address, city, ZIP"
            />
            <Search size={18} color="#888" onClick={handleSearch} style={{ cursor: 'pointer' }} />
          </form>
        </div>

        {/* Split Screen Content */}
        <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
          
          {/* MAP */}
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <MapUpdater center={mapCenter} />
              <MapEventHandler properties={properties} onBoundsChanged={setVisibleProperties} onMapClick={handleMapClick} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {properties.map(p => (
                <Marker key={p.id} position={[p.lat, p.lng]} eventHandlers={{ click: () => { setSelectedProperty(p); setWalkthroughStep(0); }}}>
                  <Popup>{p.address}</Popup>
                </Marker>
              ))}
              {customMarker && (
                <Marker position={customMarker}>
                  <Popup>Custom Selected Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ width: '45%', minWidth: '400px', maxWidth: '600px', background: 'white', boxShadow: '-2px 0 10px rgba(0,0,0,0.1)', zIndex: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Searching {searchQuery}...</div>
            ) : selectedProperty ? (
              <div>
                <div style={{ position: 'relative' }}>
                  <img src={selectedProperty.image} alt="Property" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <button onClick={() => setSelectedProperty(null)} style={{ position: 'absolute', top: '10px', left: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' }}>←</button>
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8em' }}>
                    <strong>Property Intelligence</strong><br/>
                    Estimated area: {selectedProperty.sqft} sqft<br/>
                    Building type: Single Family
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{selectedProperty.address}</h1>
                  <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #ddd' }} />

                  {quoteRequested ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <h2 style={{ color: '#2ecc71', margin: '0 0 1rem 0' }}>Quote Requested!</h2>
                      <button style={filterBtnStyle} onClick={() => { setQuoteRequested(false); setSelectedProperty(null); }}>Back to Search</button>
                    </div>
                  ) : walkthroughStep < 5 ? (
                    <div>
                      <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Adaptive Walkthrough</h2>
                      {renderWalkthrough()}
                    </div>
                  ) : (
                    <div>
                      <h2 style={{fontSize: '1.2rem'}}>Renovation Intelligence Estimate</h2>
                      
                      {estimateLoading || !estimateData ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#006aff' }}>Initializing Construction Agents...</div>
                      ) : (
                        <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '1.5rem' }}>
                           
                           {estimateData.stale_data_warnings?.length > 0 && (
                             <div style={{ background: '#ffeaa7', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85em', color: '#d35400', marginBottom: '1rem' }}>
                               ⚠ {estimateData.stale_data_warnings[0]}
                             </div>
                           )}

                           <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Estimated Range ({scopeAnswers.quality} Quality)</p>
                           <h1 style={{ margin: 0, color: '#2b2b2b', fontSize: '2.2rem' }}>
                             ${estimateData.min_total.toLocaleString()} - ${estimateData.max_total.toLocaleString()}
                           </h1>
                           <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ fontSize: '0.9em', color: '#888' }}>Confidence: <strong>{estimateData.confidence_level}</strong> ({estimateData.confidence_score * 100}%)</span>
                           </div>

                           <div style={{ marginTop: '1.5rem' }}>
                             <strong>Major Cost Drivers:</strong>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                               {Object.entries(estimateData.cost_drivers || {}).map(([key, pct]) => (
                                 <div key={key} style={{ display: 'flex', alignItems: 'center', fontSize: '0.85em' }}>
                                   <span style={{ width: '100px' }}>{key}</span>
                                   <div style={{ flex: 1, background: '#eee', height: '8px', borderRadius: '4px', margin: '0 10px' }}>
                                     <div style={{ width: `${pct}%`, background: '#006aff', height: '100%', borderRadius: '4px' }}></div>
                                   </div>
                                   <span style={{ width: '40px', textAlign: 'right' }}>{pct}%</span>
                                 </div>
                               ))}
                             </div>
                           </div>

                           <div style={{ marginTop: '1.5rem' }}>
                             <strong>Assumptions:</strong>
                             <ul style={{ fontSize: '0.85rem', color: '#555', paddingLeft: '20px' }}>
                               {estimateData.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                             </ul>
                           </div>
                           <div style={{ marginTop: '1rem' }}>
                             <strong>Unknowns:</strong>
                             <ul style={{ fontSize: '0.85rem', color: '#e67e22', paddingLeft: '20px' }}>
                               {estimateData.unknowns.map((a, i) => <li key={i}>{a}</li>)}
                             </ul>
                           </div>

                           <button onClick={() => setWalkthroughStep(4)} style={{ ...filterBtnStyle, marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                             Change Scenario (Quality)
                           </button>

                           <button onClick={requestQuote} style={{ width: '100%', background: '#006aff', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem', cursor: 'pointer' }}>
                             Request Detailed Quote
                           </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // LIST VIEW
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{searchQuery}</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9em' }}>{visibleProperties.length} results visible in map area</p>
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {visibleProperties.map(p => (
                    <div key={p.id} onClick={() => setSelectedProperty(p)} style={{ border: '1px solid #e8e9ea', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
                      <img src={p.image} alt={p.address} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      <div style={{ padding: '0.75rem' }}>
                        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>${p.price?.toLocaleString()}</h3>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const navItemStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px 0', cursor: 'pointer', color: '#555' };
const navTextStyle = { fontSize: '0.7rem', marginTop: '4px' };
const filterBtnStyle = { background: 'white', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '16px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const walkthroughCard = { padding: '1rem', border: '1px solid #eee', borderRadius: '8px', background: '#fafafa' };
const btnChoice = { display: 'block', width: '100%', padding: '12px', marginBottom: '8px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' };
