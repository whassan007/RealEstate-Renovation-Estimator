export const runCBKS = (property, baselines) => {
  const fails = [];

  // HIB: Higher is Better -> Property metric must be > MAX(State Median, National Median)
  const hibMetrics = ['schoolRating', 'jobGrowth', 'incomeGrowth'];
  hibMetrics.forEach(metric => {
    if (property[metric] !== undefined && property[metric] !== null && property[metric] !== '') {
      const stateVal = parseFloat(baselines[`${metric}State`] || 0);
      const natVal = parseFloat(baselines[`${metric}National`] || 0);
      const reqBase = Math.max(stateVal, natVal);
      const propVal = parseFloat(property[metric]);
      
      if (propVal <= reqBase) {
        fails.push({
          metric,
          type: 'HIB',
          propertyValue: propVal,
          requiredBaseline: reqBase,
          variance: propVal - reqBase
        });
      }
    }
  });

  // LIB: Lower is Better -> Property metric must be < MIN(State Median, National Median)
  const libMetrics = ['crimeIndex', 'vacancyRate', 'dom', 'employerConcentration'];
  libMetrics.forEach(metric => {
    if (property[metric] !== undefined && property[metric] !== null && property[metric] !== '') {
      const stateVal = parseFloat(baselines[`${metric}State`] || Infinity);
      const natVal = parseFloat(baselines[`${metric}National`] || Infinity);
      const reqBase = Math.min(stateVal, natVal);
      const propVal = parseFloat(property[metric]);
      
      if (propVal >= reqBase) {
        fails.push({
          metric,
          type: 'LIB',
          propertyValue: propVal,
          requiredBaseline: reqBase,
          variance: propVal - reqBase
        });
      }
    }
  });

  return {
    pass: fails.length === 0,
    fails
  };
};

export const calculateFinancials = (property) => {
  // Simple placeholders for financial model
  const price = parseFloat(property.price || 0);
  const grossRent = parseFloat(property.grossRent || 0) * 12; // Annual
  const expenses = parseFloat(property.expenses || 0) * 12; // Annual
  const noi = grossRent - expenses;
  const capRate = price > 0 ? (noi / price) * 100 : 0;
  
  // Assuming 20% down payment for CoC
  const downPayment = price * 0.2;
  const debtService = price > 0 ? (price * 0.8 * 0.07) : 0; // Rough 7% interest-only placeholder
  const cashFlow = noi - debtService;
  const cocReturn = downPayment > 0 ? (cashFlow / downPayment) * 100 : 0;

  return {
    noi: noi.toFixed(2),
    capRate: capRate.toFixed(2),
    cocReturn: cocReturn.toFixed(2),
    grossRent: grossRent.toFixed(2),
    expenses: expenses.toFixed(2)
  };
};

export const calculateWScore = (property, financials, municipalScore, marketTier = 'Stable') => {
  // Mock scoring logic based on inputs
  const finScore = Math.min(100, Math.max(0, financials.capRate * 10)); 
  const riskScore = property.crimeIndex ? Math.max(0, 100 - parseFloat(property.crimeIndex)) : 50;
  const qolScore = property.schoolRating ? parseFloat(property.schoolRating) * 10 : 50;
  const marketScore = property.jobGrowth ? 50 + parseFloat(property.jobGrowth) * 10 : 50;
  const mgmtScore = municipalScore || 50;

  let weights = {};
  if (marketTier === 'Stable') weights = { fin: 0.35, mkt: 0.25, qol: 0.20, risk: 0.15, mgmt: 0.05 };
  else if (marketTier === 'UK') weights = { fin: 0.30, mkt: 0.20, qol: 0.15, risk: 0.25, mgmt: 0.10 };
  else if (marketTier === 'EU') weights = { fin: 0.25, mkt: 0.20, qol: 0.25, risk: 0.20, mgmt: 0.10 };
  else weights = { fin: 0.20, mkt: 0.15, qol: 0.10, risk: 0.45, mgmt: 0.10 };

  const wScore = (
    (finScore * weights.fin) +
    (marketScore * weights.mkt) +
    (qolScore * weights.qol) +
    (riskScore * weights.risk) +
    (mgmtScore * weights.mgmt)
  );

  return {
    total: wScore.toFixed(1),
    components: {
      financial: finScore.toFixed(1),
      market: marketScore.toFixed(1),
      qol: qolScore.toFixed(1),
      risk: riskScore.toFixed(1),
      management: mgmtScore.toFixed(1)
    }
  };
};
