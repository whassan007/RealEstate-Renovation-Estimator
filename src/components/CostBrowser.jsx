import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function CostBrowser() {
  const { t } = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/inventory')
      .then(res => res.json())
      .then(data => {
        setInventory(data.inventory);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch inventory", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('loading_inventory') || 'Loading Inventory...'}</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#0f172a', marginBottom: '1.5rem' }}>{t('admin_cost_browser') || 'Cost Transparency Browser'}</h1>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Inventory List */}
          <div className="glass" style={{ flex: '1', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#475569', marginBottom: '1rem' }}>{t('inventory_assemblies') || 'Reconstruction Assemblies'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {inventory.map(item => (
                <div 
                  key={item.id}
                  className="pulse-hover"
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: '1rem',
                    border: selectedItem?.id === item.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedItem?.id === item.id ? '#f0f9ff' : 'white'
                  }}
                >
                  <strong style={{ display: 'block', color: '#1e293b' }}>{item.name}</strong>
                  <span style={{ fontSize: '0.85em', color: '#64748b' }}>{item.category} • {item.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="glass" style={{ flex: '2', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            {selectedItem ? (
              <div className="animate-fade-in">
                <h2 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>{selectedItem.name}</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Parts Breakdown */}
                  <div>
                    <h3 style={{ color: '#3b82f6', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>{t('parts_breakdown') || 'Parts & Materials'}</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#334155' }}>
                      <li style={listItemStyle}><strong>Material:</strong> {selectedItem.parts_breakdown.material_name}</li>
                      <li style={listItemStyle}><strong>Retail Price:</strong> ${selectedItem.parts_breakdown.retail_price.toFixed(2)}</li>
                      <li style={listItemStyle}><strong>Cost per {selectedItem.unit}:</strong> ${selectedItem.parts_breakdown.unit_cost_per_sf?.toFixed(2) || selectedItem.parts_breakdown.unit_cost_per_lf?.toFixed(2)}</li>
                      <li style={listItemStyle}><strong>Source:</strong> <span style={tagStyle}>{selectedItem.parts_breakdown.source}</span></li>
                    </ul>
                  </div>

                  {/* Installation Breakdown */}
                  <div>
                    <h3 style={{ color: '#10b981', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>{t('install_breakdown') || 'Installation & Labor'}</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#334155' }}>
                      <li style={listItemStyle}><strong>Labor Rate (per {selectedItem.unit}):</strong> ${selectedItem.installation_breakdown.labor_rate_per_unit.toFixed(2)}</li>
                      <li style={listItemStyle}><strong>Equipment (per {selectedItem.unit}):</strong> ${selectedItem.installation_breakdown.equipment_per_unit.toFixed(2)}</li>
                      <li style={listItemStyle}><strong>Waste Factor:</strong> {selectedItem.installation_breakdown.waste_factor_pct}%</li>
                      <li style={listItemStyle}><strong>Delivery Base:</strong> ${selectedItem.installation_breakdown.delivery_base.toFixed(2)}</li>
                      <li style={listItemStyle}><strong>Source:</strong> <span style={tagStyle}>{selectedItem.installation_breakdown.source}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                {t('select_inventory_item') || 'Select an assembly from the left to view its cost breakdown.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const listItemStyle = { padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' };
const tagStyle = { background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85em', color: '#475569' };
