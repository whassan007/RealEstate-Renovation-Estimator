import React, { useState, useEffect } from 'react';

export default function ContractorDashboard() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [markup, setMarkup] = useState(20);

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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar - Request List */}
      <div style={{ width: '300px', borderRight: '1px solid #ddd', background: '#f8f9fa', padding: '1rem' }}>
        <h3>Quote Requests ({requests.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {requests.map(req => (
            <div 
              key={req.id} 
              onClick={() => selectRequest(req)}
              style={{
                padding: '1rem', 
                background: selectedRequest?.id === req.id ? '#e3f2fd' : 'white', 
                border: '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <strong>{req.address}</strong>
              <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                {req.status} • {req.property?.sqft} sq ft
              </div>
            </div>
          ))}
          {requests.length === 0 && <p style={{color: '#888'}}>No quote requests yet.</p>}
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, padding: '2rem', background: '#fff' }}>
        {selectedRequest ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Estimate Workspace: {selectedRequest.address}</h2>
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
                  Save & Issue Quote
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '1.2em' }}>
            Select a quote request from the left to view the workspace.
          </div>
        )}
      </div>
    </div>
  );
}

const thStyle = { padding: '12px', color: '#555' };
const tdStyle = { padding: '12px' };
const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' };
