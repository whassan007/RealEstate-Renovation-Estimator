import React, { useState } from 'react';
import { Search } from 'lucide-react';

const TerraSearchTerminal = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="flex flex-col h-full justify-center p-6">
      <h2 className="text-2xl font-bold mb-4 font-outfit text-gradient-accent">Terra-W Terminal</h2>
      <p className="text-secondary mb-6 text-sm">
        Input location, criteria, and budget. The engine will aggregate regional listings and apply CBKS Phase 3 protocol.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input 
            type="text" 
            className="input-field w-full pl-12 py-4 text-lg" 
            placeholder="e.g., Multifamily homes in London under £1M"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={24} />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary py-3 text-lg"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Initiating Macro-Zoom...' : 'Execute Zoom Sequence'}
        </button>
      </form>
    </div>
  );
};

export default TerraSearchTerminal;
