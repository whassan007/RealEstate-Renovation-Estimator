import React, { useState, useMemo } from "react";

/* =========================================================================
   PARCEL — Rental Market Screener (WMCDA)
   Metro Detroit & Ann Arbor · 100 listings across 5 target markets
   - Strategic Weights panel (auto-balances to 100%)
   - Overall Utility Score (weighted, stacked-contribution horizontal bars)
   - Gross Monthly Yield comparison (vertical bars)
   - Financial Validation vs. a $560,000 / 27%-down / $3,850-rent deal
   ========================================================================= */

/* ---- Market data ---- */
const MARKETS = [
  { name: "Ann Arbor", n: 33, avgRent: 3667, medRent: 3600, maxRent: 4000, ge: 9, pct: 27.3, estPrice: 480000, safety: 70, appreciation: 92, amenities: 95 },
  { name: "Bloomfield", n: 16, avgRent: 3003, medRent: 3000, maxRent: 3900, ge: 1, pct: 6.2, estPrice: 450000, safety: 90, appreciation: 80, amenities: 85 },
  { name: "Plymouth", n: 9, avgRent: 2867, medRent: 2700, maxRent: 4000, ge: 1, pct: 11.1, estPrice: 420000, safety: 88, appreciation: 82, amenities: 84 },
  { name: "Rochester", n: 27, avgRent: 2644, medRent: 2450, maxRent: 3800, ge: 0, pct: 0, estPrice: 400000, safety: 85, appreciation: 80, amenities: 83 },
  { name: "Livonia", n: 15, avgRent: 2566, medRent: 2600, maxRent: 3400, ge: 0, pct: 0, estPrice: 300000, safety: 80, appreciation: 68, amenities: 70 },
  // ── New markets (analyst estimates — no listing dataset yet) ──
  { name: "Ithaca", n: 0, avgRent: 2800, medRent: 2700, maxRent: 4500, ge: 0, pct: 0, estPrice: 380000, safety: 66, appreciation: 74, amenities: 82 },
  { name: "Storrs", n: 0, avgRent: 2300, medRent: 2200, maxRent: 3600, ge: 0, pct: 0, estPrice: 310000, safety: 76, appreciation: 62, amenities: 58 },
  { name: "Berkeley", n: 0, avgRent: 3900, medRent: 3700, maxRent: 6500, ge: 0, pct: 0, estPrice: 950000, safety: 54, appreciation: 88, amenities: 94 },
];

const CRITERIA = [
  { key: "yield", label: "Rental Yield", hint: "Gross annual rent ÷ est. purchase price", color: "#0C6B57" },
  { key: "price", label: "Low Acquisition Price", hint: "Lower median home price scores higher", color: "#C99A2E" },
  { key: "safety", label: "Safety / Low Crime", hint: "Relative neighborhood safety", color: "#2D6E8E" },
  { key: "appreciation", label: "Asset Appreciation", hint: "Expected long-run value growth", color: "#BC6B3A" },
  { key: "amenities", label: "Amenities & Lifestyle", hint: "Walkability, dining, schools, downtown", color: "#8E5B7A" },
];
const DEFAULTS = [25, 20, 20, 20, 15];

/* deal config */
const BUFFER_DEFAULT = 500;  // monthly overhead above P&I (tax, ins, vacancy)
const BUFFER_MIN = 0;
const BUFFER_MAX = 2000;
const BUFFER_STEP = 50;
const YEARS = 30;
const PRICE_MIN = 300000;
const PRICE_MAX = 1200000;
const PRICE_STEP = 10000;
const DOWN_OPTIONS = [20, 25, 30, 35, 40];

/* Representative ZIP per market */
const AREA_ZIP = {
  "Ann Arbor": "48104",
  "Bloomfield": "48302",
  "Plymouth": "48170",
  "Rochester": "48307",
  "Livonia": "48154",
  "Ithaca": "14850",
  "Storrs": "06269",
  "Berkeley": "94704",
};

/* Seed rate */
const SEED_RATE = { rate: 6.5, apr: 6.634, points: 0.84, asOf: "2026-06-18", src: "seed" };
const seedRates = () =>
  Object.fromEntries(MARKETS.map((m) => [m.name, { zip: AREA_ZIP[m.name], ...SEED_RATE }]));

const usd = (v) => "$" + Math.round(v).toLocaleString();
const usd0 = (v) => "$" + Math.round(v).toLocaleString();
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function rebalance(weights, idx, raw) {
  const newVal = clamp(Math.round(raw), 0, 100);
  const otherSum = weights.reduce((s, w, i) => (i === idx ? s : s + w), 0);
  const target = 100 - newVal;
  const out = weights.slice();
  out[idx] = newVal;
  if (otherSum <= 0) {
    const others = weights.length - 1;
    weights.forEach((_, i) => { if (i !== idx) out[i] = target / others; });
  } else {
    weights.forEach((w, i) => { if (i !== idx) out[i] = w * (target / otherSum); });
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.round(out[i]);
  let drift = 100 - out.reduce((a, b) => a + b, 0);
  if (drift !== 0) {
    let bestI = -1, best = -Infinity;
    out.forEach((w, i) => { if (i !== idx && w > best) { best = w; bestI = i; } });
    if (bestI >= 0) out[bestI] = clamp(out[bestI] + drift, 0, 100);
    else out[idx] = clamp(out[idx] + drift, 0, 100);
  }
  return out;
}

function pAndI(loan, annualPct) {
  const r = annualPct / 100 / 12, n = YEARS * 12;
  if (r === 0) return loan / n;
  return loan * r / (1 - Math.pow(1 + r, -n));
}

/* ── CORS-proxy scraper helpers (no API key required) ── */

// Recursively find the first value for a key in a nested object
function findDeep(obj, key, depth = 0, max = 8) {
  if (depth >= max || obj == null || typeof obj !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
  for (const v of Object.values(obj)) {
    if (typeof v === 'object' && v !== null) {
      const r = findDeep(v, key, depth + 1, max);
      if (r !== undefined) return r;
    }
  }
  return undefined;
}

// Parse a number from any value, returning null if invalid
function toNum(v) {
  if (typeof v === 'number' && !isNaN(v) && v > 0) return v;
  if (!v) return null;
  const n = parseFloat(String(v).replace(/[,$\s]/g, ''));
  return isNaN(n) || n <= 0 ? null : n;
}

// Fetch HTML via CORS proxies (tries allorigins, then corsproxy.io)
async function fetchViaProxy(targetUrl) {
  const proxies = [
    async (u) => {
      const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error('allorigins ' + r.status);
      const d = await r.json();
      return d.contents || '';
    },
    async (u) => {
      const r = await fetch(`https://corsproxy.io/?${encodeURIComponent(u)}`, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error('corsproxy ' + r.status);
      return r.text();
    },
  ];
  const errors = [];
  for (const proxy of proxies) {
    try {
      const html = await proxy(targetUrl);
      if (html && html.length > 200) return html;
    } catch(e) { errors.push(e.message); }
  }
  throw new Error('All proxies failed: ' + errors.join('; ') + '. The site may block automated access.');
}

// Parse JSON-LD structures to handle complex nested properties (Zillow, Homes.com, etc.)
function parseJsonLd(doc, url) {
  const listings = [];
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const items = [];
      const traverse = (val) => {
        if (val == null) return;
        if (Array.isArray(val)) {
          val.forEach(traverse);
        } else if (typeof val === 'object') {
          if (val['@type']) items.push(val);
          if (val['@graph']) traverse(val['@graph']);
          for (const k of Object.keys(val)) {
            if (k !== '@graph' && typeof val[k] === 'object') {
              traverse(val[k]);
            }
          }
        }
      };
      traverse(data);

      let price = null;
      let address = null, city = null, state = null, zip = null;
      let beds = null, baths = null, sqft = null, yearBuilt = null;
      let propertyType = null;

      for (const item of items) {
        const types = [].concat(item['@type'] || []).map(t => String(t).toLowerCase());
        
        // Extract price from offers
        if (item.offers) {
          const offers = [].concat(item.offers);
          for (const offer of offers) {
            if (offer.price) price = toNum(offer.price);
            if (offer.lowPrice) price = toNum(offer.lowPrice);
          }
        }
        if (item.price) price = toNum(item.price);

        // Extract address & specs from house/apartment/residence types
        if (types.some(t => /residence|dwelling|house|home|apartment|property|realestate|accommodation/i.test(t))) {
          propertyType = item['@type'];
          if (item.address) {
            address = item.address.streetAddress || address;
            city = item.address.addressLocality || city;
            state = item.address.addressRegion || state;
            zip = item.address.postalCode || zip;
          }
          if (item.numberOfBedrooms) beds = toNum(item.numberOfBedrooms);
          if (item.numberOfBathroomsTotal || item.numberOfBathroomsFull) {
            baths = toNum(item.numberOfBathroomsTotal ?? item.numberOfBathroomsFull);
          }
          if (item.floorSize?.value) sqft = toNum(item.floorSize.value);
          if (item.yearBuilt) yearBuilt = toNum(item.yearBuilt);
        }
      }

      if (price) {
        // Fallback for address/specs if they were direct on the top-level
        for (const item of items) {
          if (item.address && !address) {
            address = item.address.streetAddress;
            city = item.address.addressLocality;
            state = item.address.addressRegion;
            zip = item.address.postalCode;
          }
          if (item.numberOfBedrooms && !beds) beds = toNum(item.numberOfBedrooms);
        }

        listings.push({
          title: address || doc.title || "Listing",
          listPrice: price,
          address: address || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          beds: beds || null,
          baths: baths || null,
          sqft: sqft || null,
          yearBuilt: yearBuilt || null,
          propertyType: propertyType ? (Array.isArray(propertyType) ? propertyType.join(', ') : String(propertyType)) : "Single Family",
          url: url
        });
      }
    } catch (e) {
      console.warn("JSON-LD parse error: ", e);
    }
  }
  return listings;
}

// Extract QMI and Design Plans from Toll Brothers Next.js payload
function parseTollBrothersNextData(html, url) {
  const listings = [];
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const nextScript = doc.querySelector('script#__NEXT_DATA__');
    if (!nextScript) return listings;
    
    const parsed = JSON.parse(nextScript.textContent);
    const perfect = parsed.props?.pageProps?.serverResults?.perfect || [];
    
    // Find community
    const community = perfect.find(item => 
      item.homeProperties && item.homeProperties.length > 0
    ) || perfect.find(item => 
      item.communities && item.communities.some(c => c.homeProperties && c.homeProperties.length > 0)
    );

    let homeProps = [];
    let communityName = "Toll Brothers Community";
    let communityAddress = null;
    let communityCity = null;
    let communityState = null;
    let communityZip = null;

    if (community) {
      if (community.homeProperties) {
        homeProps = community.homeProperties;
        communityName = community.name || communityName;
        if (community.address) {
          communityAddress = community.address.streetAddress;
          communityCity = community.address.addressLocality;
          communityState = community.address.addressRegion;
          communityZip = community.address.postalCode;
        }
      } else if (community.communities) {
        const subComm = community.communities.find(c => c.homeProperties && c.homeProperties.length > 0);
        if (subComm) {
          homeProps = subComm.homeProperties;
          communityName = subComm.name || communityName;
          if (subComm.address) {
            communityAddress = subComm.address.streetAddress;
            communityCity = subComm.address.addressLocality;
            communityState = subComm.address.addressRegion;
            communityZip = subComm.address.postalCode;
          }
        }
      }
    }

    if (homeProps.length > 0) {
      homeProps.forEach(hp => {
        let hpUrl = url;
        if (hp.url) {
          try {
            hpUrl = new URL(hp.url, url).toString();
          } catch(e) {}
        }
        
        listings.push({
          title: hp.name || (hp.isQdh ? "Quick Move-In" : "Design Plan"),
          listPrice: toNum(hp.price ?? hp.pricedFrom),
          address: hp.address?.streetAddress || (hp.isQdh && hp.homeSite ? `Home Site ${hp.homeSite}` : communityAddress),
          city: hp.address?.addressLocality || communityCity,
          state: hp.address?.addressRegion || communityState,
          zip: hp.address?.postalCode || communityZip,
          beds: toNum(hp.minBed ?? hp.beds),
          baths: toNum(hp.minBath ?? hp.baths),
          sqft: toNum(hp.minSqft ?? hp.sqft),
          yearBuilt: toNum(hp.yearBuilt) || new Date().getFullYear(),
          hoaMonthly: toNum(hp.hoaFee ?? hp.hoaMonthly),
          rentEstimate: null,
          propertyType: hp.isQdh ? "Quick Move-In Home" : "Design Plan",
          url: hpUrl
        });
      });
    }
  } catch (e) {
    console.error("Error parsing Toll Brothers Next.js data", e);
  }
  return listings;
}

// Extract QMI and Design Plans from Toll Brothers DOM cards
function parseTollBrothersDOM(doc, url) {
  const listings = [];
  const cards = doc.querySelectorAll('a[class*="ModelCard_modelCardContainer"]');
  if (cards.length === 0) return listings;
  
  const titleHeader = doc.querySelector('h1')?.textContent.trim() || "Toll Brothers Community";
  let communityAddress = null, communityCity = null, communityState = null, communityZip = null;
  
  const streetAddressEl = doc.querySelector('.CommunityContactBar_nameSalesTeam__bKVor');
  if (streetAddressEl) {
    communityAddress = streetAddressEl.textContent.trim();
    const cityStateZipEl = streetAddressEl.nextElementSibling;
    if (cityStateZipEl) {
      const parts = cityStateZipEl.textContent.split(',');
      if (parts.length >= 2) {
        communityCity = parts[0].trim();
        const zipParts = parts[1].trim().split(/\s+/);
        communityState = zipParts[0]?.trim();
        communityZip = zipParts[1]?.trim();
      }
    }
  }

  cards.forEach(card => {
    const titleEl = card.querySelector('h5') || card.querySelector('[class*="GridModelCard_name"]');
    const priceEl = card.querySelector('span[class*="price"]') || card.querySelector('[class*="GridModelCard_price"]');
    const addressEl = card.querySelector('span[class*="Location_address"]') || card.querySelector('.Location_address__vO9Iv');
    const homeSiteEl = card.querySelector('span[class*="Location_homeSite"]') || card.querySelector('.Location_homeSite__7uU62');
    
    let beds = null, baths = null, sqft = null;
    const specCols = card.querySelectorAll('.StructuralDetails_column__pVe1s');
    specCols.forEach(col => {
      const num = toNum(col.querySelector('.StructuralDetails_number__TP3do')?.textContent);
      const unit = col.querySelector('.StructuralDetails_unit__or9GG')?.textContent.toLowerCase();
      if (unit.includes('bedroom') || unit.includes('bed')) beds = num;
      if (unit.includes('bath')) baths = num;
      if (unit.includes('sq ft') || unit.includes('sqft')) sqft = num;
    });

    let address = null;
    if (addressEl) {
      address = addressEl.textContent.replace(/,\s*$/, '').trim();
    } else if (homeSiteEl) {
      address = `Home Site ${homeSiteEl.textContent.replace('Home Site', '').trim()}`;
    }

    let urlPath = card.getAttribute('href');
    if (urlPath) {
      try {
        urlPath = new URL(urlPath, url).toString();
      } catch(e) {}
    }

    if (priceEl) {
      listings.push({
        title: titleEl?.textContent.replace(/\s+/g, ' ').trim() || "Home",
        listPrice: toNum(priceEl.textContent),
        address: address || communityAddress || titleHeader,
        city: communityCity || "Ann Arbor",
        state: communityState || "MI",
        zip: communityZip || "48104",
        beds: beds,
        baths: baths,
        sqft: sqft,
        yearBuilt: new Date().getFullYear(),
        hoaMonthly: null,
        rentEstimate: null,
        propertyType: addressEl ? "Quick Move-In Home" : "Design Plan",
        url: urlPath || url
      });
    }
  });
  return listings;
}

// Premium Claude extraction using Anthropic API key to bypass CORS
async function fetchPropertyDataViaClaude(url, key) {
  const headers = {
    "Content-Type": "application/json",
    "anthropic-dangerous-direct-browser-access": "true",
    "x-api-key": key,
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      system:
        "You are a real estate data extraction assistant. " +
        "Your job is to extract the details of a single house or multiple houses/plans listed on a page. " +
        "You MUST use your web search tool to find and visit the exact URL provided: " + url + " " +
        "Analyze the page content carefully. " +
        "If the URL is a single property details page (like a Zillow homedetail or Homes.com property), extract its info. " +
        "If the URL is a community page or has multiple home designs/quick move-in homes (like Toll Brothers), extract all of them. " +
        "Respond with ONLY a minified JSON array of objects, containing no markdown formatting or extra text. " +
        "Each object MUST have the following structure: " +
        '{"title":string,"listPrice":number,"address":string,"city":string,"state":string,"zip":string,"beds":number,"baths":number,"sqft":number,"yearBuilt":number,"hoaMonthly":number,"rentEstimate":number,"propertyType":string,"url":string}. ' +
        "If any field is missing or null, set it to null. Ensure price, beds, baths, sqft are numbers. " +
        "If you cannot find any listings, return an empty array [].",
      messages: [
        { role: "user", content: `Please visit the URL ${url} and extract all property listings or home designs on it. Return them as a JSON array.` },
      ],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  if (!res.ok) throw new Error("API " + res.status);
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const cleaned = text.replace(/```json|```/g, "").trim();
  const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
  const arr = JSON.parse(match ? match[0] : cleaned);
  if (!Array.isArray(arr)) throw new Error("Invalid response format");
  return arr;
}

// Parse listing data out of raw HTML using various strategies
function extractFromHTML(html, url) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const isTollBrothers = url.includes("tollbrothers.com");
  
  if (isTollBrothers) {
    let list = parseTollBrothersNextData(html, url);
    if (list.length > 0) return list;
    list = parseTollBrothersDOM(doc, url);
    if (list.length > 0) return list;
  }
  
  const jsonLdList = parseJsonLd(doc, url);
  if (jsonLdList.length > 0) {
    return jsonLdList;
  }

  const r = {};
  const meta = (n) => doc.querySelector(`meta[property="${n}"],meta[name="${n}"]`)?.getAttribute('content');

  const ndEl = doc.querySelector('#__NEXT_DATA__');
  if (ndEl) {
    try {
      const nd = JSON.parse(ndEl.textContent);
      r.listPrice  ??= toNum(findDeep(nd, 'price') ?? findDeep(nd, 'listPrice') ?? findDeep(nd, 'unformattedPrice'));
      r.beds       ??= toNum(findDeep(nd, 'bedrooms')   ?? findDeep(nd, 'beds'));
      r.baths      ??= toNum(findDeep(nd, 'bathrooms')  ?? findDeep(nd, 'baths'));
      r.sqft       ??= toNum(findDeep(nd, 'livingArea') ?? findDeep(nd, 'squareFeet'));
      r.yearBuilt  ??= toNum(findDeep(nd, 'yearBuilt'));
      r.city       ??= findDeep(nd, 'city')  ?? findDeep(nd, 'addressCity');
      r.state      ??= findDeep(nd, 'state') ?? findDeep(nd, 'addressState');
      r.zip        ??= findDeep(nd, 'zipcode') ?? findDeep(nd, 'zip') ?? findDeep(nd, 'postalCode');
      r.address    ??= findDeep(nd, 'streetAddress') ?? findDeep(nd, 'address');
      r.rentEstimate ??= toNum(findDeep(nd, 'rentZestimate') ?? findDeep(nd, 'rentEstimate'));
      r.hoaMonthly   ??= toNum(findDeep(nd, 'hoaFee')        ?? findDeep(nd, 'monthlyHoaFee'));
      r.daysOnMarket ??= toNum(findDeep(nd, 'daysOnMarket')  ?? findDeep(nd, 'dom'));
    } catch(e) {}
  }

  const rx = (pat) => { const m = html.match(pat); return m ? toNum(m[1]) : null; };
  r.listPrice  ??= rx(/"(?:price|listPrice|unformattedPrice)"\s*:\s*(\d{4,})/)
                ?? rx(/"list_price"\s*:\s*(\d{4,})/);
  r.beds       ??= rx(/"bedrooms"\s*:\s*(\d+)/);
  r.baths      ??= rx(/"bathrooms"\s*:\s*(\d+(?:\.\d+)?)/);
  r.sqft       ??= rx(/"(?:livingArea|squareFeet|sqft|building_size)"\s*:\s*(\d{3,})/);
  r.yearBuilt  ??= rx(/"yearBuilt"\s*:\s*((?:19|20)\d{2})/);
  r.hoaMonthly ??= rx(/"(?:hoaFee|monthlyHoaFee)"\s*:\s*(\d+)/);
  r.rentEstimate ??= rx(/"(?:rentZestimate|rentEstimate|rent_estimate)"\s*:\s*(\d{3,})/);

  r.listPrice ??= toNum(meta('og:price:amount') ?? meta('product:price:amount'));
  r.address   ??= meta('og:street-address');
  r.city      ??= meta('og:locality');
  r.state     ??= meta('og:region');
  r.zip       ??= meta('og:postal-code');

  if (!r.listPrice) {
    const title = doc.title || meta('og:title') || '';
    const pm = title.match(/\$(([\d,]+))/);
    if (pm) r.listPrice = toNum(pm[1]);
  }

  if (r.listPrice) {
    if (r.sqft) r.pricePerSqft = Math.round(r.listPrice / r.sqft);
    try { r.source = new URL(url).hostname.replace('www.', '').split('.')[0]; } catch(e) {}
    return [{
      title: r.address || doc.title || "Listing",
      listPrice: r.listPrice,
      address: r.address || null,
      city: r.city || null,
      state: r.state || null,
      zip: r.zip || null,
      beds: r.beds || null,
      baths: r.baths || null,
      sqft: r.sqft || null,
      yearBuilt: r.yearBuilt || null,
      hoaMonthly: r.hoaMonthly || null,
      rentEstimate: r.rentEstimate || null,
      propertyType: "Single Family",
      url: url
    }];
  }

  throw new Error('Could not find a list price in the page. The site may require JavaScript rendering or block CORS proxies.');
}

export default function ParcelScreener() {
  const [weights, setWeights] = useState(DEFAULTS);
  const [price, setPrice] = useState(560000);
  const [downPct, setDownPct] = useState(25);
  const [buffer, setBuffer] = useState(BUFFER_DEFAULT);
  const [rates, setRates] = useState(seedRates);
  const [rateStatus, setRateStatus] = useState("seed");
  const [rateError, setRateError] = useState("");
  // URL import
  const [apiKey, setApiKey] = useState("");
  const [lookupOpen, setLookupOpen] = useState(false);
  const [propUrl, setPropUrl] = useState("");
  const [propStatus, setPropStatus] = useState("idle"); // idle | loading | done | error
  const [propData, setPropData] = useState(null);
  const [propError, setPropError] = useState("");

  const setOne = (idx, val) => setWeights((w) => rebalance(w, idx, val));
  const reset = () => setWeights(DEFAULTS);

  const down = price * (downPct / 100);
  const loan = price - down;

  // Per-market derived needed rent = P&I at that market's rate + overhead buffer
  const neededRent = (marketName) => pAndI(loan, rates[marketName].rate) + buffer;

  /* ── Platform detection ─────────────────────── */
  function detectPlatform(url) {
    try {
      const h = new URL(url).hostname.replace("www.", "");
      if (h.includes("zillow"))   return { name: "Zillow",   color: "#006AFF", icon: "Z" };
      if (h.includes("redfin"))   return { name: "Redfin",   color: "#CC1A1A", icon: "R" };
      if (h.includes("realtor"))  return { name: "Realtor",  color: "#D92228", icon: "RL" };
      if (h.includes("trulia"))   return { name: "Trulia",   color: "#5E7F27", icon: "T" };
      if (h.includes("compass"))  return { name: "Compass",  color: "#1A1A1A", icon: "C" };
      return { name: "Listing", color: "var(--ink-soft)", icon: "🔗" };
    } catch { return null; }
  }

  /* ── Property URL extraction via CORS proxy (no API key) ── */
  async function fetchPropertyData() {
    if (!propUrl.trim()) return;
    setPropStatus("loading");
    setPropError("");
    setPropData(null);
    try {
      let results = [];
      if (apiKey) {
        results = await fetchPropertyDataViaClaude(propUrl, apiKey);
      } else {
        const html = await fetchViaProxy(propUrl);
        results = extractFromHTML(html, propUrl);
      }
      
      if (!results || results.length === 0) {
        throw new Error("No properties found on the page.");
      }
      setPropData(results);
      setPropStatus("done");
    } catch(e) {
      setPropStatus("error");
      setPropError(e.message || "Extraction failed.");
    }
  }

  function applyPropertyPrice(itemPrice) {
    setPrice(clamp(Math.round(itemPrice / PRICE_STEP) * PRICE_STEP, PRICE_MIN, PRICE_MAX));
  }

  async function fetchAreaRate(zip) {
    const headers = {
      "Content-Type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    };
    if (apiKey) headers["x-api-key"] = apiKey;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system:
          "You retrieve Bank of America's CURRENT published 30-year fixed PURCHASE mortgage rate. " +
          "Use web search against bankofamerica.com/mortgage/mortgage-rates and reputable rate trackers. " +
          "Assume excellent credit (740+). Respond with ONLY minified JSON, no markdown, no prose: " +
          '{"rate":number,"apr":number,"points":number,"asOf":"YYYY-MM-DD"}. ' +
          "If a ZIP-specific figure is unavailable, return BoA's current national 30-year fixed rate.",
        messages: [
          { role: "user", content: `Bank of America 30-year fixed purchase rate for ZIP ${zip} (Michigan), loan ~$${Math.round(loan)}.` },
        ],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const obj = JSON.parse(match ? match[0] : cleaned);
    if (typeof obj.rate !== "number") throw new Error("no rate");
    return obj;
  }

  async function refreshRates() {
    setRateStatus("loading");
    setRateError("");
    try {
      const results = await Promise.allSettled(
        MARKETS.map((m) => fetchAreaRate(AREA_ZIP[m.name]).then((r) => [m.name, r]))
      );
      let anyOk = false;
      setRates((prev) => {
        const next = { ...prev };
        results.forEach((res) => {
          if (res.status === "fulfilled") {
            anyOk = true;
            const [name, r] = res.value;
            next[name] = {
              ...next[name],
              rate: r.rate,
              apr: typeof r.apr === "number" ? r.apr : next[name].apr,
              points: typeof r.points === "number" ? r.points : next[name].points,
              asOf: r.asOf || next[name].asOf,
              src: "live",
            };
          }
        });
        return next;
      });
      if (anyOk) setRateStatus("live");
      else { setRateStatus("error"); setRateError("No rates returned — showing seeded values. You can edit any rate by hand."); }
    } catch (e) {
      setRateStatus("error");
      setRateError("Live lookup unavailable — showing seeded values. You can edit any rate by hand.");
    }
  }

  function setManualRate(name, val) {
    const v = clamp(parseFloat(val) || 0, 0, 20);
    setRates((prev) => ({ ...prev, [name]: { ...prev[name], rate: v, src: "manual" } }));
  }

  const model = useMemo(() => {
    const maxAnnYield = Math.max(...MARKETS.map((m) => (m.avgRent * 12) / m.estPrice));
    const minPrice = Math.min(...MARKETS.map((m) => m.estPrice));
    const wf = weights.map((w) => w / 100);

    const rows = MARKETS.map((m) => {
      const annYield = (m.avgRent * 12) / m.estPrice;
      const monthlyYield = (m.avgRent / m.estPrice) * 100;
      const s = {
        yield: (annYield / maxAnnYield) * 100,
        price: (minPrice / m.estPrice) * 100,
        safety: m.safety,
        appreciation: m.appreciation,
        amenities: m.amenities,
      };
      const parts = {};
      let total = 0;
      CRITERIA.forEach((c, i) => { const p = wf[i] * s[c.key]; parts[c.key] = p; total += p; });
      // Gate: market rent ceiling must cover P&I at that market's rate + buffer
      const mRate = rates[m.name] ? rates[m.name].rate : SEED_RATE.rate;
      const mPI = pAndI(loan, mRate);
      const mNeeded = mPI + buffer;
      const excluded = m.maxRent < mNeeded;
      return { m, s, parts, total, annYield: annYield * 100, monthlyYield, excluded,
               mPI, mNeeded, mRate };
    });
    rows.sort((a, b) => b.total - a.total);
    const eligibleRows = rows.filter((r) => !r.excluded);
    const excludedRows = rows.filter((r) => r.excluded);
    return {
      rows,
      eligibleRows,
      excludedRows,
      maxMonthlyYield: Math.max(...rows.map((r) => r.monthlyYield)),
    };
  }, [weights, rates, loan, buffer]);

  const leader = model.eligibleRows[0] || model.rows[0];
  const leaderRate = rates[leader.m.name] ? rates[leader.m.name].rate : SEED_RATE.rate;
  const leaderPI = pAndI(loan, leaderRate);
  const leaderNeeded = leaderPI + buffer;
  const dealAnnYield = (leaderNeeded * 12) / price * 100;

  const verdict = (m) => {
    const nr = neededRent(m.name);
    const pi = pAndI(loan, rates[m.name].rate);
    if (m.maxRent < nr)
      return { tag: "BELOW CEILING", tone: "fail", note: `Ceiling ${usd(m.maxRent)} < needed ${usd(nr)}` };
    if (m.pct >= 15)
      return { tag: "SUPPORTS", tone: "pass", note: `${m.pct}% of listings ≥ ${usd(nr)} (${m.ge} of ${m.n})` };
    return { tag: "TOP OF MARKET", tone: "stretch", note: `Only ${m.ge} of ${m.n} listings reach ${usd(nr)}` };
  };
  const verdicts = MARKETS.map((m) => ({ m, v: verdict(m) }));
  const supports = verdicts.filter((x) => x.v.tone === "pass").map((x) => x.m.name);
  const stretch = verdicts.filter((x) => x.v.tone === "stretch").map((x) => x.m.name);
  const fail = verdicts.filter((x) => x.v.tone === "fail").map((x) => x.m.name);

  const coverage = leader.mNeeded - leaderPI; // buffer (should equal buffer)

  return (
    <div className="parcel-root">
      <header className="masthead">
        <svg className="contours" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
          {[0, 24, 48, 72, 96, 120, 150, 184].map((o, i) => (
            <path key={i}
              d={`M -20 ${40 + o} C 220 ${-10 + o}, 430 ${120 + o * 0.4}, 660 ${60 + o * 0.7} S 1060 ${10 + o}, 1240 ${70 + o * 0.5}`}
              fill="none" stroke="var(--pine)" strokeWidth="1" opacity={0.10 - i * 0.006} />
          ))}
        </svg>
        <div className="masthead-inner">
          <div className="brandline">
            <span className="mark">◳</span>
            <span className="eyebrow">Weighted Multi-Criteria Decision Analysis</span>
          </div>
          <h1>Rental Market Screener</h1>
          <p className="sub">
            Metro Detroit &amp; Ann Arbor · <b>100 listings</b> across five target markets ·
            ranked on your strategic priorities and stress-tested against a fixed acquisition scenario.
          </p>
        </div>
      </header>

      <div className="layout">
        {/* ============ SIDEBAR: STRATEGIC WEIGHTS ============ */}
        <aside className="sidebar">
          <div className="panel-head">
            <h2>Strategic Weights</h2>
            <span className="wmcda-chip">WMCDA</span>
          </div>
          <p className="panel-note">Allocate 100 points across the criteria. Adjusting one re-balances the rest.</p>

          <div className="sliders">
            {CRITERIA.map((c, i) => (
              <div className="slider-row" key={c.key}>
                <div className="slider-top">
                  <span className="swatch" style={{ background: c.color }} />
                  <label htmlFor={"sl-" + c.key}>{c.label}</label>
                  <span className="weight-val">{weights[i]}%</span>
                </div>
                <input
                  id={"sl-" + c.key}
                  type="range" min="0" max="100" step="1"
                  value={weights[i]}
                  onChange={(e) => setOne(i, Number(e.target.value))}
                  style={{ accentColor: c.color }}
                />
                <span className="slider-hint">{c.hint}</span>
              </div>
            ))}
          </div>

          <div className="total-bar">
            <span>Total allocation</span>
            <span className="total-num">100%</span>
          </div>
          <button className="reset-btn" onClick={reset}>Reset to defaults</button>

          <div className="leader-tag">
            <span className="leader-label">Current leader</span>
            <span className="leader-name">{leader.m.name}</span>
            <span className="leader-score">{leader.total.toFixed(1)}</span>
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className="main">

          {/* ACQUISITION SCENARIO + BOA RATES */}
          <section className="card scenario">
            <div className="card-head">
              <div>
                <h3>Acquisition scenario</h3>
                <p className="card-sub">Import a listing URL or set the deal manually, then pull live Bank of America rates per market.</p>
              </div>
            </div>

            {/* ── URL IMPORT PANEL ── */}
            <div className="lookup-panel">
              <button
                className="lookup-toggle"
                onClick={() => setLookupOpen(o => !o)}
                aria-expanded={lookupOpen}
              >
                <span className="lookup-toggle-icon">{lookupOpen ? "▾" : "▸"}</span>
                <span>Import from listing URL</span>
                <span className="lookup-toggle-chips">
                  <span className="plat-chip" style={{background:"#006AFF"}}>Zillow</span>
                  <span className="plat-chip" style={{background:"#CC1A1A"}}>Redfin</span>
                  <span className="plat-chip" style={{background:"#D92228"}}>Realtor</span>
                </span>
              </button>

              {lookupOpen && (
                <div className="lookup-body">
                  {/* URL input — no API key needed */}
                  <p className="lookup-hint">Paste a Zillow, Redfin, or Realtor.com listing URL. Data is fetched via public CORS proxies — no API key required.</p>
                  <div className="lookup-url-row">
                    {(() => {
                      const plat = detectPlatform(propUrl);
                      return plat ? (
                        <span className="url-plat-badge" style={{background: plat.color}}>{plat.name}</span>
                      ) : (
                        <span className="url-plat-badge" style={{background:"var(--ink-soft)"}}>URL</span>
                      );
                    })()}
                    <input
                      id="prop-url-input"
                      type="url"
                      className="url-input"
                      value={propUrl}
                      onChange={e => { setPropUrl(e.target.value); setPropStatus("idle"); setPropData(null); }}
                      onKeyDown={e => e.key === "Enter" && fetchPropertyData()}
                      placeholder="https://www.zillow.com/… or redfin.com/… or realtor.com/…"
                    />
                    <button
                      className="extract-btn"
                      onClick={fetchPropertyData}
                      disabled={!propUrl.trim() || propStatus === "loading"}
                    >
                      {propStatus === "loading" ? (
                        <><span className="spin">⟳</span> Extracting…</>
                      ) : "Extract"}
                    </button>
                  </div>

                  {/* Error */}
                  {propStatus === "error" && (
                    <p className="lookup-error">⚠ {propError}</p>
                  )}

                  {/* Extracted property card */}
                  {propStatus === "done" && propData && (() => {
                    const plat = detectPlatform(propUrl);
                    const list = Array.isArray(propData) ? propData : [propData];
                    return (
                      <div className="prop-list-container">
                        {list.length > 1 && (
                          <p className="prop-list-count">Found <b>{list.length}</b> potential properties/plans on this page:</p>
                        )}
                        <div className="prop-cards-grid">
                          {list.map((item, idx) => {
                            const pricePerSqft = (item.listPrice && item.sqft) ? Math.round(item.listPrice / item.sqft) : null;
                            return (
                              <div className="prop-card" key={idx}>
                                <div className="prop-card-head">
                                  <div>
                                    <div className="prop-price">{usd0(item.listPrice)}</div>
                                    <div className="prop-title">{item.title}</div>
                                    {(item.address && item.address !== item.title) && (
                                      <div className="prop-address">
                                        {item.address}{item.city ? `, ${item.city}` : ""}{item.state ? ` ${item.state}` : ""} {item.zip || ""}
                                      </div>
                                    )}
                                  </div>
                                  {plat && <span className="prop-source-badge" style={{background: plat.color}}>{plat.name}</span>}
                                </div>

                                <div className="prop-stats">
                                  {item.beds    != null && <div className="ps"><span className="ps-v">{item.beds}</span><span className="ps-k">beds</span></div>}
                                  {item.baths   != null && <div className="ps"><span className="ps-v">{item.baths}</span><span className="ps-k">baths</span></div>}
                                  {item.sqft    != null && <div className="ps"><span className="ps-v">{item.sqft.toLocaleString()}</span><span className="ps-k">sqft</span></div>}
                                  {pricePerSqft != null && <div className="ps"><span className="ps-v">{usd0(pricePerSqft)}</span><span className="ps-k">/sqft</span></div>}
                                  {item.yearBuilt   != null && <div className="ps"><span className="ps-v">{item.yearBuilt}</span><span className="ps-k">built</span></div>}
                                  {item.hoaMonthly  != null && <div className="ps"><span className="ps-v">{usd0(item.hoaMonthly)}</span><span className="ps-k">HOA/mo</span></div>}
                                  {item.rentEstimate != null && <div className="ps hl"><span className="ps-v">{usd0(item.rentEstimate)}</span><span className="ps-k">est. rent</span></div>}
                                </div>

                                {item.propertyType && <p className="prop-type">{item.propertyType}</p>}

                                <div className="prop-apply-row">
                                  {item.listPrice < PRICE_MIN || item.listPrice > PRICE_MAX ? (
                                    <p className="prop-clamp-note">
                                      ⚠ List price {usd0(item.listPrice)} is outside the slider range — will be clamped to {item.listPrice < PRICE_MIN ? usd0(PRICE_MIN) : usd0(PRICE_MAX)}.
                                    </p>
                                  ) : null}
                                  <button className="apply-btn" onClick={() => applyPropertyPrice(item.listPrice)}>
                                    ↳ Apply {usd0(item.listPrice)} to deal
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="scen-controls">
              <div className="ctrl price-ctrl">
                <div className="ctrl-top">
                  <label htmlFor="price-range">Purchase price</label>
                  <span className="ctrl-val">{usd0(price)}</span>
                </div>
                <input
                  id="price-range" type="range"
                  min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  style={{ accentColor: "var(--pine)" }}
                />
                <div className="ctrl-scale"><span>{usd0(PRICE_MIN)}</span><span>{usd0(PRICE_MAX)}</span></div>
              </div>

              <div className="ctrl down-ctrl">
                <div className="ctrl-top"><label>Down payment</label><span className="ctrl-val">{usd0(down)}</span></div>
                <div className="down-seg">
                  {DOWN_OPTIONS.map((p) => (
                    <button key={p}
                      className={"seg-btn" + (downPct === p ? " on" : "")}
                      onClick={() => setDownPct(p)}>{p}%</button>
                  ))}
                </div>
                <span className="ctrl-foot">Financed: <b>{usd0(loan)}</b> · gross yield {dealAnnYield.toFixed(2)}%</span>
              </div>

              <div className="ctrl rent-ctrl">
                <div className="ctrl-top">
                  <label htmlFor="buffer-range">Overhead buffer <span className="ctrl-label-sub">(tax · ins · vacancy)</span></label>
                  <span className="ctrl-val rent-val">{usd0(buffer)}<span className="ctrl-val-unit">/mo</span></span>
                </div>
                <input
                  id="buffer-range" type="range"
                  min={BUFFER_MIN} max={BUFFER_MAX} step={BUFFER_STEP}
                  value={buffer}
                  onChange={(e) => setBuffer(Number(e.target.value))}
                  style={{ accentColor: "var(--gold)" }}
                />
                <div className="ctrl-scale"><span>{usd0(BUFFER_MIN)}</span><span>{usd0(BUFFER_MAX)}</span></div>

                {/* Derived needed rent display */}
                <div className="needed-rent-derived">
                  <div className="nrd-row">
                    <span className="nrd-label">P&amp;I (leader · {leaderRate.toFixed(2)}%)</span>
                    <span className="nrd-val">{usd0(leaderPI)}</span>
                  </div>
                  <div className="nrd-row">
                    <span className="nrd-label">+ Overhead buffer</span>
                    <span className="nrd-val">+ {usd0(buffer)}</span>
                  </div>
                  <div className="nrd-row nrd-total">
                    <span className="nrd-label">= Needed monthly rent</span>
                    <span className="nrd-val nrd-total-val">{usd0(leaderNeeded)}<span className="ctrl-val-unit">/mo</span></span>
                  </div>
                </div>

                <span className="ctrl-foot rent-foot" style={{ marginTop: "8px" }}>
                  <span className="rent-gate-pills">
                    {MARKETS.map((m) => {
                      const nr = neededRent(m.name);
                      const ok = m.maxRent >= nr;
                      return (
                        <span key={m.name} className={"rent-pill " + (ok ? "ok" : "no")} title={`Needed: ${usd0(nr)} · Ceiling: ${usd0(m.maxRent)}`}>
                          {m.name}
                        </span>
                      );
                    })}
                  </span>
                  <span className="rent-foot-note">Markets whose ceiling clears their needed rent</span>
                </span>
              </div>
            </div>

            <div className="rates-head">
              <div>
                <h4 className="rates-title">Mortgage rates by area · Bank of America</h4>
                <span className={"rate-status " + rateStatus}>
                  {rateStatus === "seed" && `Seeded from BoA rate sheet · ${rates["Plymouth"].asOf}`}
                  {rateStatus === "loading" && "Querying current BoA rates…"}
                  {rateStatus === "live" && `Live · web-searched BoA rates · ${rates["Plymouth"].asOf}`}
                  {rateStatus === "error" && rateError}
                </span>
              </div>
              <div className="rates-actions">
                <input
                  type="password"
                  className="rate-apikey-input"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Anthropic key (for live rates)"
                  autoComplete="off"
                  title="Optional: provide your Anthropic API key to fetch live Bank of America rates via web search"
                />
                <button className="refresh-btn" onClick={refreshRates} disabled={rateStatus === "loading"}>
                  {rateStatus === "loading" ? "Fetching…" : "↻ Get live BoA rates"}
                </button>
              </div>
            </div>

            <div className="rates-table">
              <div className="rt-row rt-head">
                <span>Area</span><span>ZIP</span><span>30-yr fixed</span><span>APR</span><span>Pts</span><span>P&amp;I / mo</span><span>Needed rent</span><span>Source</span>
              </div>
              {MARKETS.map((m) => {
                const r = rates[m.name];
                const pi = pAndI(loan, r.rate);
                const nr = pi + buffer;
                const clears = m.maxRent >= nr;
                return (
                  <div className="rt-row" key={m.name}>
                    <span className="rt-area">{m.name}</span>
                    <span className="rt-zip">{r.zip}</span>
                    <span className="rt-rate">
                      <input type="number" step="0.001" min="0" max="20"
                        value={r.rate}
                        onChange={(e) => setManualRate(m.name, e.target.value)} />%
                    </span>
                    <span>{r.apr ? r.apr.toFixed(3) + "%" : "—"}</span>
                    <span>{r.points != null ? r.points.toFixed(2) : "—"}</span>
                    <span className="rt-pi">{usd0(pi)}</span>
                    <span className={"rt-needed " + (clears ? "ok" : "bad")}>{usd0(nr)}</span>
                    <span className={"rt-src " + r.src}>{r.src}</span>
                  </div>
                );
              })}
            </div>
            <p className="micro">
              Rates query BoA's published 30-yr fixed purchase rate per ZIP via web search (assumes excellent credit).
              Any rate cell is editable. <b>Needed rent</b> = P&amp;I + {usd0(buffer)} buffer; green = market ceiling clears it.
            </p>
          </section>

          {/* UTILITY SCORE */}
          <section className="card">
            <div className="card-head">
              <div>
                <h3>Overall Utility Score</h3>
                <p className="card-sub">
                  Weighted contribution of every criterion, summed per market (0–100).
                  Ranking covers only markets whose ceiling clears P&amp;I + {usd0(buffer)} buffer.
                </p>
              </div>
              <div className="legend">
                {CRITERIA.map((c, i) => (
                  <span className="legend-item" key={c.key}>
                    <span className="dot" style={{ background: c.color }} />
                    {c.label.split(" ")[0]} <em>{weights[i]}%</em>
                  </span>
                ))}
              </div>
            </div>

            <div className="util-chart">
              <div className="util-grid">
                {[0, 25, 50, 75, 100].map((g) => (
                  <div className="vline" style={{ left: g + "%" }} key={g}><span>{g}</span></div>
                ))}
              </div>
              {model.eligibleRows.map((r, idx) => (
                <div className={"util-row" + (idx === 0 ? " lead" : "")} key={r.m.name}>
                  <div className="util-label">
                    <span className="rank">{idx === 0 ? "★" : (idx + 1)}</span>
                    <span className="city">{r.m.name}</span>
                  </div>
                  <div className="util-track">
                    {CRITERIA.map((c) => {
                      const w = r.parts[c.key];
                      if (w <= 0) return null;
                      return (
                        <span key={c.key} className="seg"
                          style={{ width: w + "%", background: c.color }}
                          title={`${c.label}: ${w.toFixed(1)} pts`} />
                      );
                    })}
                  </div>
                  <span className="util-total">{r.total.toFixed(1)}</span>
                </div>
              ))}
            </div>

            {model.excludedRows.length > 0 && (
              <div className="excluded-block">
                <span className="excluded-head">
                  Excluded — ceiling below P&amp;I + {usd0(buffer)} buffer
                </span>
                {model.excludedRows.map((r) => (
                  <div className="excl-row" key={r.m.name}
                    title={`${r.m.name}: would score ${r.total.toFixed(1)}, but ceiling ${usd(r.m.maxRent)} < needed ${usd(Math.round(r.mNeeded))}`}>
                    <span className="excl-city">{r.m.name}</span>
                    <span className="excl-reason">ceiling {usd(r.m.maxRent)} &lt; {usd(Math.round(r.mNeeded))}</span>
                    <span className="excl-score">{r.total.toFixed(1)}</span>
                  </div>
                ))}
                <p className="excl-note">
                  These markets are disqualified from the ranking because their rents can't reach the target deal —
                  their would-be scores are shown struck through for reference.
                </p>
              </div>
            )}
          </section>

          <div className="lower-grid">
            {/* GROSS MONTHLY YIELD */}
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>Gross Monthly Yield</h3>
                  <p className="card-sub">Avg market rent ÷ est. purchase price (monthly rent-to-price).</p>
                </div>
              </div>
              <div className="yield-chart">
                {model.rows
                  .slice()
                  .sort((a, b) => b.monthlyYield - a.monthlyYield)
                  .map((r) => {
                    const h = (r.monthlyYield / model.maxMonthlyYield) * 100;
                    return (
                      <div className={"ycol" + (r.excluded ? " excl" : "")} key={r.m.name}>
                        <div className="ybar-wrap">
                          <span className="ybar-val">{r.monthlyYield.toFixed(2)}%</span>
                          <div className="ybar" style={{ height: h + "%" }} />
                        </div>
                        <span className="ycity">{r.m.name}{r.excluded ? " *" : ""}</span>
                        <span className="yann">{r.annYield.toFixed(1)}% / yr</span>
                      </div>
                    );
                  })}
              </div>
              <p className="micro">
                Bars show <b>monthly</b> yield; the figure beneath each is the annualized equivalent.
                <b> *</b> excluded from the ranking — ceiling below derived needed rent.
              </p>
            </section>

            {/* FINANCIAL VALIDATION */}
            <section className="card">
              <div className="card-head">
                <div>
                  <h3>Financial Validation</h3>
                  <p className="card-sub">Two tests per market: does the rent ceiling clear P&amp;I + {usd0(buffer)} buffer, and by how much?</p>
                </div>
              </div>

              <ul className="verdicts">
                {verdicts
                  .sort((a, b) => b.m.maxRent - a.m.maxRent)
                  .map(({ m, v }) => {
                    const r = rates[m.name];
                    const pi = pAndI(loan, r.rate);
                    const nr = pi + buffer;
                    // Cash flow = max achievable rent (ceiling) minus all-in needed rent
                    const cov = m.maxRent - nr;
                    return (
                      <li key={m.name} className={"vrow " + v.tone}>
                        <div className="vrow-top">
                          <span className="vcity">{m.name}</span>
                          <span className={"stamp " + v.tone}>{v.tag}</span>
                          <span className="vnote">{v.note}</span>
                        </div>
                        <div className="vrow-fin">
                          <span>{r.rate.toFixed(3)}% · P&amp;I {usd0(pi)} + {usd0(buffer)} = <b>{usd0(nr)}</b> needed</span>
                          <span className={"cov " + (cov >= 0 ? "ok" : "bad")}>
                            {cov >= 0 ? "+" : "−"}{usd0(Math.abs(cov))} ceiling headroom
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </ul>
              <p className="micro">Headroom = market rent ceiling − (P&amp;I + {usd0(buffer)} buffer). Positive means the deal fits within observed rents.</p>
            </section>
          </div>

          {/* SUMMARY / VERDICT */}
          <section className="card summary">
            <h3>Summary &amp; verdict</h3>
            <p>
              The ranking is gated by feasibility: any market whose rent ceiling can't cover P&amp;I
              + the {usd0(buffer)}/mo overhead buffer is removed — it can't cash-flow this deal.
              {model.excludedRows.length > 0 && (
                <> That removes <b>{model.excludedRows.map((r) => r.m.name).join(" and ")}</b> from the field.</>
              )}
              {" "}Among the markets that qualify, <b>{leader.m.name}</b> leads with a utility score of
              {" "}<b>{leader.total.toFixed(1)}</b>. At {usd0(price)} ({downPct}% down → {usd0(loan)} financed at{" "}
              {leaderRate.toFixed(2)}%), P&amp;I is {usd0(leaderPI)}/mo; adding the {usd0(buffer)} buffer sets the{" "}
              <b>needed rent at {usd0(leaderNeeded)}/mo</b>. The ceiling headroom vs that target is{" "}
              <b>{usd0(Math.abs(leader.m.maxRent - leaderNeeded))}/mo</b>
              {leader.m.maxRent >= leaderNeeded ? " above" : " below"} the market ceiling.
            </p>
            <div className="feasrow">
              <FeasTag tone="pass" title="Supports the rent" names={supports.length ? supports : ["—"]} />
              <FeasTag tone="stretch" title="Top of market only" names={stretch.length ? stretch : ["—"]} />
              <FeasTag tone="fail" title="Below rent ceiling — excluded" names={fail.length ? fail : ["—"]} />
            </div>
            <p className="tension">
              The tension this resolves: <b>Livonia</b> posts the strongest yield (lowest entry price) and would otherwise
              top the ranking, but its rent ceiling ({usd0(3400)}) falls below its own P&amp;I + buffer requirement — so it's disqualified
              rather than crowned. <b>Rochester</b> ({usd0(3800)} ceiling) falls out for the same reason. <b>Ann Arbor</b> is
              the only market where the derived needed rent is broadly achievable (27% of listings at or above it), making it the
              realistic home for this acquisition.
            </p>
          </section>

          <footer className="assumptions">
            <h4>Assumptions &amp; provenance</h4>
            <p>
              <b>From your data (100 listings):</b> all rent figures for the five Metro Detroit / Ann Arbor markets —
              average, median, ceiling, and the count of listings per market — plus every yield and feasibility verdict.
              {" "}<b>Analyst inputs (not in the rent file):</b> estimated median purchase prices
              (Livonia {usd0(300000)}, Rochester {usd0(400000)}, Plymouth {usd0(420000)}, Bloomfield {usd0(450000)},
              Ann Arbor {usd0(480000)}) and the 0–100 baselines for Safety, Appreciation, and Amenities.
              {" "}<b>New markets — fully analyst-estimated (no listing dataset):</b>{" "}
              Ithaca, NY (ZIP 14850), Storrs, CT (ZIP 06269), and Berkeley, CA (ZIP 94704) have been added with estimated
              rent ranges and purchase prices based on comparable college-town and Bay Area market data. Replace these
              figures with your own underwriting once listing data is available.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function FeasTag({ tone, title, names }) {
  return (
    <div className={"feas " + tone}>
      <span className="feas-title">{title}</span>
      <span className="feas-names">{names.join(" · ")}</span>
    </div>
  );
}
