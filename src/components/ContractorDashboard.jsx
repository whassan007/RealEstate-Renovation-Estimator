import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import CostBrowser from './CostBrowser';

export default function ContractorDashboard() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [markup, setMarkup] = useState(20);
  const [activeTab, setActiveTab] = useState('quotes'); // 'quotes' or 'inventory'

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
    setRequests(data);
  }, []);

  const selectRequest = (req) => {
    setSelectedRequest(req);
    // If we have intelligence data line items, use those! Otherwise fallback.
    if (req.intelligence_data && req.intelligence_data.line_items.length > 0) {
      setLineItems(req.intelligence_data.line_items.map((item, idx) => ({
        id: idx,
        category: 'Scope',
        description: item.item,
        qty: item.quantity,
        unit: item.unit,
        material: item.material_unit_cost,
        labor: item.labor_unit_cost,
        source: item.source,
        confidence: item.confidence
      })));
    } else {
      setLineItems([
        { id: 1, category: 'Demo', description: 'Demolition', qty: 1, unit: 'EA', material: 0, labor: 1500, source: 'Manual' },
      ]);
    }
  };

  const calculateTotals = () => {
    const directMaterial = lineItems.reduce((acc, item) => acc + (Number(item.material) * Number(item.qty)), 0);
    const directLabor = lineItems.reduce((acc, item) => acc + (Number(item.labor) * Number(item.qty)), 0);
    const directCost = directMaterial + directLabor;
    const totalMarkup = directCost * (markup / 100);
    const clientPrice = directCost + totalMarkup;
    return { directMaterial, directLabor, directCost, totalMarkup, clientPrice };
  };

  const totals = calculateTotals();

  const handleUpdateItem = (id, field, value) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setLineItems([...lineItems, { id: Date.now(), category: 'General', description: 'New Item', qty: 1, unit: 'EA', material: 0, labor: 0, source: 'Manual' }]);
  };

  const saveQuote = () => {
    const updatedRequests = requests.map(r => {
      if (r.id === selectedRequest.id) {
        return { ...r, lineItems, status: 'Quote Sent', quoteTotal: totals.clientPrice };
      }
      return r;
    });
    localStorage.setItem('quoteRequests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    alert('Quote saved and marked as sent!');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div className="glass" style={{ width: '320px', borderRight: '1px solid rgba(0,0,0,0.05)', background: '#ffffff', padding: '1.5rem', zIndex: 10 }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Dashboard</h3>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('quotes')}
            style={{ 
              textAlign: 'left', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', border: 'none',
              background: activeTab === 'quotes' ? '#3b82f6' : 'transparent',
              color: activeTab === 'quotes' ? 'white' : '#475569',
              fontWeight: activeTab === 'quotes' ? 'bold' : 'normal'
            }}
          >
            {t('quote_requests')} <span style={{ background: activeTab === 'quotes' ? 'rgba(255,255,255,0.3)' : '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8em', marginLeft: '8px' }}>{requests.length}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            style={{ 
              textAlign: 'left', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', border: 'none',
              background: activeTab === 'inventory' ? '#3b82f6' : 'transparent',
              color: activeTab === 'inventory' ? 'white' : '#475569',
              fontWeight: activeTab === 'inventory' ? 'bold' : 'normal'
            }}
          >
            {t('admin_cost_browser') || 'Cost Transparency Browser'}
          </button>
        </div>

        {activeTab === 'quotes' && (
          <>
            <h4 style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85em', textTransform: 'uppercase' }}>Recent Requests</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {requests.map(req => (
            <div 
              key={req.id} 
              className="pulse-hover"
              onClick={() => selectRequest(req)}
              style={{
                padding: '1.25rem', 
                background: selectedRequest?.id === req.id ? '#f0f9ff' : 'white', 
                border: selectedRequest?.id === req.id ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: selectedRequest?.id === req.id ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 1px 2px 0 rgba(0,0,0,0.05)'
              }}
            >
              <strong style={{ display: 'block', marginBottom: '6px', color: '#0f172a' }}>{req.address}</strong>
              <div style={{ fontSize: '0.85em', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                {req.status} • {req.property?.sqft} sq ft
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9em' }}>No quote requests yet.</p>
              <a href="/" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontSize: '0.85em', fontWeight: 'bold' }}>
                Create a Guestimate
              </a>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, padding: '2rem', background: '#f8fafc', overflowY: 'auto' }}>
        {activeTab === 'inventory' ? (
          <CostBrowser />
        ) : selectedRequest ? (
          <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{t('estimate_workspace')}: {selectedRequest.address}</h2>
              <span style={{ padding: '0.25rem 0.75rem', background: '#3498db', color: 'white', borderRadius: '16px', fontSize: '0.9em' }}>
                {selectedRequest.status}
              </span>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem', display: 'flex', gap: '2rem', border: '1px solid #eee' }}>
              <div>
                <strong style={{color: '#555'}}>Property Data</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1em' }}>~{selectedRequest.property?.sqft} sqft | {selectedRequest.property?.beds} Bed</p>
              </div>
              <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '2rem' }}>
                <strong style={{color: '#555'}}>Agent Confidence</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1em', color: selectedRequest.intelligence_data?.confidence_level === 'HIGH' ? '#2ecc71' : '#e67e22' }}>
                  {selectedRequest.intelligence_data?.confidence_level || 'UNKNOWN'} 
                  {selectedRequest.intelligence_data ? ` (${selectedRequest.intelligence_data.confidence_score * 100}%)` : ''}
                </p>
              </div>
              <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '2rem' }}>
                <strong style={{color: '#555'}}>Intelligence Estimate</strong>
                <p style={{ margin: '4px 0', fontSize: '1.1em', color: '#2c3e50', fontWeight: 'bold' }}>
                  ${Math.round(selectedRequest.guestimate?.min).toLocaleString()} - ${Math.round(selectedRequest.guestimate?.max).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedRequest.intelligence_data && (
              <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <strong>Assumptions:</strong>
                  <ul style={{ fontSize: '0.85rem', color: '#555' }}>
                    {selectedRequest.intelligence_data.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <strong>Unknowns:</strong>
                  <ul style={{ fontSize: '0.85rem', color: '#e67e22' }}>
                    {selectedRequest.intelligence_data.unknowns.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <h3 style={{ marginTop: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Detailed Quote Builder</h3>
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9em' }}>
                <thead>
                  <tr style={{ background: '#f5f6f7' }}>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Unit</th>
                    <th style={thStyle}>Material Cost</th>
                    <th style={thStyle}>Labor Cost</th>
                    <th style={thStyle}>Source / Provenance</th>
                    <th style={thStyle}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tdStyle}>
                        <input style={inputStyle} value={item.category} onChange={e => handleUpdateItem(item.id, 'category', e.target.value)} />
                      </td>
                      <td style={tdStyle}>
                        <input style={inputStyle} value={item.description} onChange={e => handleUpdateItem(item.id, 'description', e.target.value)} />
                      </td>
                      <td style={tdStyle}>
                        <input type="number" style={{...inputStyle, width: '60px'}} value={item.qty} onChange={e => handleUpdateItem(item.id, 'qty', e.target.value)} />
                      </td>
                      <td style={tdStyle}>
                        <input style={{...inputStyle, width: '60px'}} value={item.unit} onChange={e => handleUpdateItem(item.id, 'unit', e.target.value)} />
                      </td>
                      <td style={tdStyle}>
                        <input type="number" style={{...inputStyle, width: '90px'}} value={item.material} onChange={e => handleUpdateItem(item.id, 'material', e.target.value)} />
                      </td>
                      <td style={tdStyle}>
                        <input type="number" style={{...inputStyle, width: '90px'}} value={item.labor} onChange={e => handleUpdateItem(item.id, 'labor', e.target.value)} />
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.8em', background: item.source === 'Manual' ? '#ffeaa7' : '#e3f2fd', padding: '4px 8px', borderRadius: '12px', color: '#555' }}>
                          {item.source} {item.confidence ? `(${(item.confidence * 100).toFixed(0)}%)` : ''}
                        </span>
                      </td>
                      <td style={{...tdStyle, fontWeight: 'bold'}}>
                        ${((Number(item.material) + Number(item.labor)) * Number(item.qty)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addItem} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', background: 'white', border: '1px solid #ccc', borderRadius: '4px' }}>+ Add Line Item</button>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '350px', background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={summaryRowStyle}>
                  <span>Direct Cost (Material & Labor)</span>
                  <span>${totals.directCost.toLocaleString()}</span>
                </div>
                <div style={summaryRowStyle}>
                  <span>Markup %</span>
                  <input type="number" style={{ width: '60px', padding: '4px', textAlign: 'right' }} value={markup} onChange={e => setMarkup(e.target.value)} />
                </div>
                <div style={summaryRowStyle}>
                  <span>Markup Value</span>
                  <span>${totals.totalMarkup.toLocaleString()}</span>
                </div>
                <hr style={{ margin: '1rem 0', borderColor: '#ddd' }} />
                <div style={{ ...summaryRowStyle, fontSize: '1.3em', fontWeight: 'bold', color: '#2ecc71' }}>
                  <span>Client Quote Price</span>
                  <span>${totals.clientPrice.toLocaleString()}</span>
                </div>
                <button 
                  onClick={saveQuote}
                  style={{ width: '100%', padding: '1rem', background: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em' }}>
                  {t('save_changes')}
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2em' }}>
            {t('no_properties') /* Reusing this string as placeholder */}
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: '16px', color: '#64748b', fontWeight: '500', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' };
const tdStyle = { padding: '16px', color: '#1e293b' };
const inputStyle = { padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', color: '#475569' };
