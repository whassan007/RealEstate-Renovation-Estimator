import React from 'react';
import { CheckCircle2, TrendingUp, AlertOctagon } from 'lucide-react';

const ExecutiveSummary = ({ result, property }) => {
  const wScore = parseFloat(result.wScore.total);
  let recommendation = 'NO-GO';
  let badgeClass = 'bg-fail text-fail border-status-fail';

  if (wScore >= 80) {
    recommendation = 'GO';
    badgeClass = 'bg-pass text-pass border-status-pass';
  } else if (wScore >= 60) {
    recommendation = 'CONDITIONAL';
    badgeClass = 'bg-yellow-900/20 text-status-warn border-status-warn';
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Executive Summary</h2>
          <p className="text-secondary">{property.address}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-gradient-accent mb-1">{result.wScore.total} <span className="text-lg text-secondary font-normal">/ 100</span></div>
          <div className="text-xs uppercase tracking-widest text-muted">W-Score</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col items-center justify-center">
          <span className="text-sm text-secondary mb-2">Recommendation</span>
          <span className={`px-4 py-1 border rounded-full font-bold tracking-wide ${badgeClass}`}>
            {recommendation}
          </span>
        </div>
        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
          <h4 className="text-sm text-secondary mb-2 flex items-center gap-1"><TrendingUp size={14} /> Top Strengths</h4>
          <ul className="text-sm space-y-1 list-disc pl-4 text-white">
            <li>Strong Cap Rate ({result.financials.capRate}%)</li>
            <li>Passes CBKS Baseline</li>
            <li>Market Tier: {property.marketTier}</li>
          </ul>
        </div>
        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
          <h4 className="text-sm text-secondary mb-2 flex items-center gap-1"><AlertOctagon size={14} /> Top Risks</h4>
          <ul className="text-sm space-y-1 list-disc pl-4 text-white">
            <li>Pending full document review</li>
            <li>Management structure unverified</li>
          </ul>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm uppercase tracking-wider text-secondary mb-3">Score Breakdown</h3>
        <div className="flex items-center gap-2 mb-2">
          {Object.entries(result.wScore.components).map(([key, val]) => (
            <div key={key} className="flex-1 bg-black/30 rounded px-3 py-2 border border-white/5">
              <div className="text-xs text-muted capitalize">{key}</div>
              <div className="font-bold text-white">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
