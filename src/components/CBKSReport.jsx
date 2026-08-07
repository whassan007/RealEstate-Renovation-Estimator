import React from 'react';
import { ShieldX, AlertTriangle } from 'lucide-react';

const CBKSReport = ({ cbks }) => {
  return (
    <div className="flex flex-col h-full justify-center p-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-fail flex items-center justify-center text-status-fail">
          <ShieldX size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-status-fail">STATUS: FAIL</h2>
          <p className="text-muted">CBKS Kill-Switch Triggered</p>
        </div>
      </div>

      <div className="bg-black/20 p-6 rounded-lg border border-red-500/30 mb-6">
        <h3 className="text-lg mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-status-warn"/> Failed Metric(s)</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Rule</th>
              <th>Property</th>
              <th>Baseline Required</th>
              <th>Variance</th>
            </tr>
          </thead>
          <tbody>
            {cbks.fails.map((fail, idx) => (
              <tr key={idx}>
                <td className="font-medium text-white">{fail.metric.replace(/([A-Z])/g, ' $1').trim()}</td>
                <td>{fail.type} ({fail.type === 'HIB' ? '>' : '<'})</td>
                <td className="text-status-fail font-bold">{fail.propertyValue.toFixed(1)}</td>
                <td>{fail.requiredBaseline.toFixed(1)}</td>
                <td className="text-status-fail">{fail.variance > 0 ? '+' : ''}{fail.variance.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center p-4 bg-red-900/10 border border-red-500/20 rounded-md">
        <p className="text-lg font-bold">Recommendation: <span className="text-status-fail">REJECT</span></p>
        <p className="text-sm text-secondary mt-1">Property does not meet minimum institutional baselines. Halt further analysis.</p>
      </div>
    </div>
  );
};

export default CBKSReport;
