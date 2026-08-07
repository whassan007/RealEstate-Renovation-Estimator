const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({ origin: true });

admin.initializeApp();

// Use the API key we generated via gcloud. 
// Note: In production, use Firebase Secret Manager.
const GOOGLE_API_KEY = 'AIzaSyAiqzTbvil2c4KMGBgb9NEFQadEWSaIFHE';
const CX = '01260c2e8a3a14079';

/* ─── Real estate site domain → platform name mapping ─── */
const PLATFORM_MAP = {
  'zillow.com': { name: 'Zillow', icon: '🏠', region: 'US' },
  'redfin.com': { name: 'Redfin', icon: '🔴', region: 'US' },
  'realtor.com': { name: 'Realtor.com', icon: '🏡', region: 'US' },
  'trulia.com': { name: 'Trulia', icon: '🏘️', region: 'US' },
  'realtor.ca': { name: 'Realtor.ca', icon: '🍁', region: 'CA' },
  'rew.ca': { name: 'REW', icon: '🏔️', region: 'CA' },
  'zolo.ca': { name: 'Zolo', icon: '📍', region: 'CA' },
  'centris.ca': { name: 'Centris', icon: '🏢', region: 'CA' },
  'funda.nl': { name: 'Funda', icon: '🇳🇱', region: 'EU' },
  'seloger.com': { name: 'SeLoger', icon: '🇫🇷', region: 'EU' },
  'immoscout24.de': { name: 'ImmobilienScout24', icon: '🇩🇪', region: 'EU' },
  'idealista.com': { name: 'Idealista', icon: '🇪🇸', region: 'EU' },
  'vivanuncios.com.mx': { name: 'Vivanuncios', icon: '🇲🇽', region: 'MX' },
  'lamudi.com.mx': { name: 'Lamudi', icon: '🇲🇽', region: 'MX' },
  'propiedades.com': { name: 'Propiedades', icon: '🇲🇽', region: 'MX' },
  'inmuebles24.com': { name: 'Inmuebles24', icon: '🇲🇽', region: 'MX' },
};

/* ─── Detect platform from a URL ─── */
function detectPlatform(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    for (const [domain, info] of Object.entries(PLATFORM_MAP)) {
      if (hostname.includes(domain)) return { ...info, domain };
    }
  } catch (e) { /* ignore */ }
  return { name: 'Unknown', icon: '🌐', region: 'Other', domain: 'unknown' };
}

/* ─── Check if a URL looks like an actual property listing page ─── */
function isListingURL(url) {
  const listingPatterns = [
    /zillow\.com\/homedetails/i,
    /zillow\.com\/homes\//i,
    /zillow\.com\/[^/]+\/[^/]+-/i,
    /redfin\.com\/.*\d{5}/i,
    /redfin\.com\/[A-Z]{2}\//i,
    /realtor\.com\/realestate/i,
    /realtor\.com\/[^/]+\/[^/]+/i,
    /trulia\.com\/home/i,
    /trulia\.com\/p\//i,
    /realtor\.ca\/.*listing/i,
    /realtor\.ca\/real-estate/i,
    /rew\.ca\/properties/i,
    /zolo\.ca\/.*listing/i,
    /centris\.ca\//i,
    /funda\.nl\/.*koop/i,
    /funda\.nl\/.*huur/i,
    /seloger\.com\/.*annonces/i,
    /immoscout24\.de\/.*expose/i,
    /idealista\.com\/.*inmueble/i,
    /idealista\.com\/.*venta/i,
    /vivanuncios\.com\.mx/i,
    /lamudi\.com\.mx/i,
    /propiedades\.com/i,
    /inmuebles24\.com/i,
  ];

  // Also accept any URL from a known real estate domain
  const hostname = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  const isKnownDomain = Object.keys(PLATFORM_MAP).some(d => hostname.includes(d));

  return isKnownDomain || listingPatterns.some(p => p.test(url));
}

/* ─── Parse price from text ─── */
function extractPrice(text) {
  if (!text) return null;
  
  // Match various price formats: $500,000 | €250.000 | £1,200,000 | CAD $450,000 | MXN $2,500,000
  const patterns = [
    /[\$€£][\s]?([0-9]{1,3}(?:[,.]?[0-9]{3})+)/,
    /(?:USD|CAD|EUR|GBP|MXN)\s?\$?\s?([0-9]{1,3}(?:[,.]?[0-9]{3})+)/i,
    /([0-9]{1,3}(?:[,.]?[0-9]{3})+)\s?(?:USD|CAD|EUR|GBP|MXN)/i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const cleaned = m[1].replace(/[,.]/g, (ch, idx, str) => {
        // Keep last separator as decimal if it's followed by exactly 2 digits
        const afterSep = str.substring(idx + 1);
        if (/^\d{2}$/.test(afterSep)) return '.';
        return '';
      });
      const val = parseInt(cleaned);
      if (val > 1000 && val < 100000000) return val;
    }
  }
  return null;
}

/* ─── Parse bedrooms/bathrooms from text ─── */
function extractBedBath(text) {
  if (!text) return { beds: null, baths: null };
  const bedMatch = text.match(/(\d+)\s*(?:bed|br|bdr|bedroom|bd)/i);
  const bathMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
  return {
    beds: bedMatch ? parseInt(bedMatch[1]) : null,
    baths: bathMatch ? parseFloat(bathMatch[1]) : null,
  };
}

/* ─── Parse sqft from text ─── */
function extractSqft(text) {
  if (!text) return null;
  const m = text.match(/([0-9,]+)\s*(?:sq\.?\s*ft|sqft|square\s*feet|sf)/i);
  if (m) return parseInt(m[1].replace(/,/g, ''));
  // European m²
  const m2 = text.match(/([0-9,]+)\s*(?:m²|m2|sqm)/i);
  if (m2) return Math.round(parseInt(m2[1].replace(/,/g, '')) * 10.764);
  return null;
}

exports.aggregateListings = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).send({ error: 'Search query is required.' });
      }

      console.log(`[Terra-W] Initiating Global Data Aggregation for query: ${query}`);

      // ── Enhance the query to target actual property listings ──
      const listingQuery = `${query} for sale listing price`;

      let allSearchItems = [];
      
      // Make up to 2 API calls (20 results) to maximize listing coverage
      for (let startIndex = 1; startIndex <= 11; startIndex += 10) {
        try {
          const response = await axios.get(`https://customsearch.googleapis.com/customsearch/v1`, {
            params: {
              key: GOOGLE_API_KEY,
              cx: CX,
              q: listingQuery,
              num: 10,
              start: startIndex,
            }
          });
          const items = response.data.items || [];
          allSearchItems = allSearchItems.concat(items);
          
          // If fewer than 10 results, no more pages
          if (items.length < 10) break;
        } catch (searchError) {
          console.error(`Google Custom Search Error (page ${startIndex}):`, searchError.message);
          // If first page fails, try without enhancement
          if (startIndex === 1) {
            try {
              const fallbackResp = await axios.get(`https://customsearch.googleapis.com/customsearch/v1`, {
                params: { key: GOOGLE_API_KEY, cx: CX, q: query, num: 10 }
              });
              allSearchItems = fallbackResp.data.items || [];
            } catch (e2) {
              console.error("Fallback search also failed:", e2.message);
            }
          }
          break;
        }
      }

      // ── Filter to only real listing pages from known platforms ──
      const listingItems = allSearchItems.filter(item => isListingURL(item.link));
      
      // Use filtered listing items, but fall back to all items if filtering removes everything
      const searchItems = listingItems.length > 0 ? listingItems : allSearchItems;

      console.log(`[Terra-W] Raw results: ${allSearchItems.length}, Verified listings: ${listingItems.length}`);

      // ── Extract location context ──
      const locationMatch = query.match(/(in|near|around)\s+([a-zA-Z\s,]+)/i);
      const location = locationMatch ? locationMatch[2].trim() : "Target Location";
      
      let marketTier = 'Stable';
      if (location.match(/UK|London|Manchester|Birmingham|Edinburgh|Glasgow/i)) marketTier = 'UK';
      else if (location.match(/EU|Spain|France|Germany|Netherlands|Paris|Berlin|Amsterdam|Madrid|Barcelona/i)) marketTier = 'EU';
      else if (location.match(/Mexico|Mexico City|Guadalajara|Monterrey|Cancun/i)) marketTier = 'MX';
      else if (location.match(/Canada|Toronto|Vancouver|Montreal|Ottawa|Calgary/i)) marketTier = 'CA';

      // ── Parse Google Search results into Terra-W property listings ──
      const properties = searchItems.map((item, index) => {
        const combined = `${item.title || ''} ${item.snippet || ''}`;
        const platform = detectPlatform(item.link);
        
        // Extract real data from the listing snippet
        const price = extractPrice(combined);
        const { beds, baths } = extractBedBath(combined);
        const sqft = extractSqft(combined);
        
        // Use extracted price or generate a reasonable estimate
        const listPrice = price || (200000 + Math.floor(Math.random() * 600000));
        
        // Generate financial estimates based on price
        const monthlyRent = listPrice * 0.007; // 0.7% rule estimate
        const monthlyExpenses = monthlyRent * 0.40; // 40% expense ratio

        return {
          id: `${platform.domain}-${index}`,
          address: item.title,
          url: item.link,
          source: platform.name,
          sourceIcon: platform.icon,
          sourceRegion: platform.region,
          snippet: item.snippet || '',
          price: listPrice,
          priceExtracted: price !== null, // true if we found a real price
          beds,
          baths,
          sqft,
          grossRent: monthlyRent,
          expenses: monthlyExpenses,
          // Generate contextual metrics (in production these would come from census/API data)
          schoolRating: 5 + Math.floor(Math.random() * 5), // 5-9
          crimeIndex: 15 + Math.floor(Math.random() * 50), // 15-65
          vacancyRate: 2 + Math.floor(Math.random() * 7),   // 2-9%
          jobGrowth: 0.5 + Math.random() * 3,               // 0.5-3.5%
          marketTier
        };
      });

      // ── Tally which platforms returned results ──
      const platformBreakdown = {};
      properties.forEach(p => {
        if (!platformBreakdown[p.source]) {
          platformBreakdown[p.source] = { count: 0, icon: p.sourceIcon };
        }
        platformBreakdown[p.source].count++;
      });

      const results = {
        macroZoom: {
          location,
          coordinates: "Coordinates derived from Search",
          marketClassification: marketTier,
          baselines: {
            crimeIndexState: 45,
            crimeIndexNational: 50,
            vacancyRateState: 5.2,
            vacancyRateNational: 6.0,
            schoolRatingState: 6.5,
            schoolRatingNational: 5.5,
            jobGrowthState: 1.8,
            jobGrowthNational: 1.2
          }
        },
        scan: {
          platformsSearched: Object.entries(platformBreakdown).map(
            ([name, info]) => `${info.icon} ${name} (${info.count})`
          ),
          totalRawHits: allSearchItems.length,
          verifiedListings: listingItems.length,
          initialHits: searchItems.length,
          properties: properties.length > 0 ? properties : [
            {
              id: "no-results",
              address: `No listings found for "${query}"`,
              url: '#',
              source: 'N/A',
              sourceIcon: '❌',
              sourceRegion: 'N/A',
              snippet: 'Try broadening your search or using a different location.',
              price: 0,
              priceExtracted: false,
              grossRent: 0,
              expenses: 0,
              schoolRating: 0,
              crimeIndex: 0,
              vacancyRate: 0,
              jobGrowth: 0,
              marketTier
            }
          ]
        }
      };

      res.status(200).send({ data: results });

    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Terra-W core exception during data aggregation.' });
    }
  });
});
