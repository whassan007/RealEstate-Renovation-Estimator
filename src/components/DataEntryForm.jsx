import React, { useState } from 'react';

const DataEntryForm = ({ onAnalyze }) => {
  const [property, setProperty] = useState({
    address: '123 Main St, Example City',
    price: '500000',
    grossRent: '5000',
    expenses: '1500',
    schoolRating: '8',
    crimeIndex: '40',
    vacancyRate: '4',
    jobGrowth: '2.5',
    marketTier: 'Stable'
  });

  const [baselines, setBaselines] = useState({
    schoolRatingState: '6',
    schoolRatingNational: '5',
    crimeIndexState: '50',
    crimeIndexNational: '55',
    vacancyRateState: '6',
    vacancyRateNational: '5',
    jobGrowthState: '1.5',
    jobGrowthNational: '1.2'
  });

  const handlePropChange = (e) => setProperty({ ...property, [e.target.name]: e.target.value });
  const handleBaseChange = (e) => setBaselines({ ...baselines, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(property, baselines);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="overflow-y-auto pr-2 pb-4" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <h3 className="text-sm text-secondary uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Property Details</h3>
        
        <div className="input-group">
          <label>Address / Identifier</label>
          <input className="input-field" name="address" value={property.address} onChange={handlePropChange} required />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="input-group">
            <label>Purchase Price ($)</label>
            <input className="input-field" type="number" name="price" value={property.price} onChange={handlePropChange} required />
          </div>
          <div className="input-group">
            <label>Market Tier</label>
            <select className="input-field bg-transparent" name="marketTier" value={property.marketTier} onChange={handlePropChange}>
              <option value="Stable">Stable (US/CA)</option>
              <option value="UK">UK Markets</option>
              <option value="EU">EU Markets</option>
              <option value="Emerging">Emerging</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="input-group">
            <label>Gross Rent/mo</label>
            <input className="input-field" type="number" name="grossRent" value={property.grossRent} onChange={handlePropChange} />
          </div>
          <div className="input-group">
            <label>Expenses/mo</label>
            <input className="input-field" type="number" name="expenses" value={property.expenses} onChange={handlePropChange} />
          </div>
        </div>

        <h3 className="text-sm text-secondary uppercase tracking-wider mt-4 mb-2 border-b border-white/10 pb-1">Metrics (HIB & LIB)</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="input-group">
            <label>School Rating (HIB)</label>
            <input className="input-field" type="number" step="0.1" name="schoolRating" value={property.schoolRating} onChange={handlePropChange} />
          </div>
          <div className="input-group">
            <label>Crime Index (LIB)</label>
            <input className="input-field" type="number" step="0.1" name="crimeIndex" value={property.crimeIndex} onChange={handlePropChange} />
          </div>
          <div className="input-group">
            <label>Job Growth % (HIB)</label>
            <input className="input-field" type="number" step="0.1" name="jobGrowth" value={property.jobGrowth} onChange={handlePropChange} />
          </div>
          <div className="input-group">
            <label>Vacancy % (LIB)</label>
            <input className="input-field" type="number" step="0.1" name="vacancyRate" value={property.vacancyRate} onChange={handlePropChange} />
          </div>
        </div>

        <h3 className="text-sm text-secondary uppercase tracking-wider mt-4 mb-2 border-b border-white/10 pb-1">Baselines (State / National)</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="input-group">
            <label>School Base (State)</label>
            <input className="input-field" type="number" step="0.1" name="schoolRatingState" value={baselines.schoolRatingState} onChange={handleBaseChange} />
          </div>
          <div className="input-group">
            <label>School Base (Nat)</label>
            <input className="input-field" type="number" step="0.1" name="schoolRatingNational" value={baselines.schoolRatingNational} onChange={handleBaseChange} />
          </div>
          <div className="input-group">
            <label>Crime Base (State)</label>
            <input className="input-field" type="number" step="0.1" name="crimeIndexState" value={baselines.crimeIndexState} onChange={handleBaseChange} />
          </div>
          <div className="input-group">
            <label>Crime Base (Nat)</label>
            <input className="input-field" type="number" step="0.1" name="crimeIndexNational" value={baselines.crimeIndexNational} onChange={handleBaseChange} />
          </div>
        </div>
      </div>
      
      <button type="submit" className="btn btn-primary w-full mt-auto">Run Analysis Protocol</button>
    </form>
  );
};

export default DataEntryForm;
