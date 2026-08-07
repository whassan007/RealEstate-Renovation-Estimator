import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomeownerFlow from './components/HomeownerFlow';
import ContractorDashboard from './components/ContractorDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem' }}>
          <Link to="/">Homeowner Guestimate</Link>
          <Link to="/contractor">Contractor Dashboard</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomeownerFlow />} />
          <Route path="/contractor/*" element={<ContractorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
