const express = require('express');
const path = require('path');
const swisseph = require('swisseph');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Swiss Ephemeris setup
swisseph.swe_set_ephe_path(__dirname + '/ephe');

// Lahiri Ayanamsa (Sidereal)
const AYANAMSA = swisseph.SE_SIDM_LAHIRI;

// Graha (Planet) constants
const GRAHAS = {
  SUN: swisseph.SE_SUN,
  MOON: swisseph.SE_MOON,
  MARS: swisseph.SE_MARS,
  MERCURY: swisseph.SE_MERCURY,
  JUPITER: swisseph.SE_JUPITER,
  VENUS: swisseph.SE_VENUS,
  SATURN: swisseph.SE_SATURN,
  RAHU: swisseph.SE_MEAN_NODE,
  KETU: swisseph.SE_MEAN_NODE
};

const GRAHA_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const RASHI_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)', 
  'Dhanus (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

const BHAVA_NAMES = [
  'Lagna (1st)', 'Dhana (2nd)', 'Sahaja (3rd)', 'Sukha (4th)',
  'Putra (5th)', 'Ripu (6th)', 'Kalatra (7th)', 'Mrityu (8th)',
  'Dharma (9th)', 'Karma (10th)', 'Labha (11th)', 'Vyaya (12th)'
];

// Graha Lordship (which graha rules which rashi)
const RASHI_LORDS = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4]; // Mars, Venus, Mercury, Moon, Sun, Mercury, Venus, Mars, Jupiter, Saturn, Saturn, Jupiter

// Natural benefics and malefics
const NATURAL_BENEFICS = [1, 3, 4, 5]; // Moon, Mercury, Jupiter, Venus
const NATURAL_MALEFICS = [0, 2, 6]; // Sun, Mars, Saturn

// Exaltation rashis
const EXALTATION = {
  0: 0,   // Sun in Aries
  1: 1,   // Moon in Taurus
  2: 9,   // Mars in Capricorn
  3: 5,   // Mercury in Virgo
  4: 3,   // Jupiter in Cancer
  5: 11,  // Venus in Pisces
  6: 6    // Saturn in Libra
};

// Debilitation rashis (opposite of exaltation)
const DEBILITATION = {
  0: 6,   // Sun in Libra
  1: 7,   // Moon in Scorpio
  2: 3,   // Mars in Cancer
  3: 11,  // Mercury in Pisces
  4: 9,   // Jupiter in Capricorn
  5: 5,   // Venus in Virgo
  6: 0    // Saturn in Aries
};

// Own signs
const OWN_SIGNS = {
  0: [4],      // Sun: Leo
  1: [3],      // Moon: Cancer
  2: [0, 7],   // Mars: Aries, Scorpio
  3: [2, 5],   // Mercury: Gemini, Virgo
  4: [8, 11],  // Jupiter: Sagittarius, Pisces
  5: [1, 6],   // Venus: Taurus, Libra
  6: [9, 10]   // Saturn: Capricorn, Aquarius
};

// Moolatrikona signs
const MOOLATRIKONA = {
  0: 4,   // Sun: Leo
  1: 1,   // Moon: Taurus
  2: 0,   // Mars: Aries
  3: 5,   // Mercury: Virgo
  4: 8,   // Jupiter: Sagittarius
  5: 6,   // Venus: Libra
  6: 10   // Saturn: Aquarius
};

// Calculate Julian Day
function getJulianDay(year, month, day, hour, minute) {
  const utcHour = hour + minute / 60;
  return swisseph.swe_julday(year, month, day, utcHour, swisseph.SE_GREG_CAL);
}

// Calculate Ayanamsa
function getAyanamsa(jd) {
  swisseph.swe_set_sid_mode(AYANAMSA, 0, 0);
  return swisseph.swe_get_ayanamsa_ut(jd);
}

// Calculate planet position
function getPlanetPosition(jd, planet) {
  const result = swisseph.swe_calc_ut(jd, planet, swisseph.SEFLG_SWIEPH);
  if (result.error) {
    throw new Error(`Calculation error: ${result.error}`);
  }
  return result.longitude;
}

// Calculate Ascendant (Lagna)
function getAscendant(jd, lat, lon) {
  const houses = swisseph.swe_houses(jd, lat, lon, 'P');
  return houses.ascendant;
}

// Convert to Sidereal
function toSidereal(tropicalLong, ayanamsa) {
  let sidereal = tropicalLong - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  if (sidereal >= 360) sidereal -= 360;
  return sidereal;
}

// Get Rashi from longitude
function getRashi(longitude) {
  return Math.floor(longitude / 30);
}

// Get degree within Rashi
function getDegreeInRashi(longitude) {
  return longitude % 30;
}

// Determine Graha dignity
function getGrahaDignity(grahaIndex, rashi) {
  if (EXALTATION[grahaIndex] === rashi) return 'Exalted (Uccha)';
  if (DEBILITATION[grahaIndex] === rashi) return 'Debilitated (Neecha)';
  if (OWN_SIGNS[grahaIndex] && OWN_SIGNS[grahaIndex].includes(rashi)) return 'Own Sign (Sva-kshetra)';
  if (MOOLATRIKONA[grahaIndex] === rashi) return 'Moolatrikona';
  return 'Neutral/Guest';
}

// Functional nature (simplified - full logic requires lagna-specific analysis)
function getFunctionalNature(grahaIndex, lagnaRashi) {
  if (NATURAL_BENEFICS.includes(grahaIndex)) {
    return 'Functional Benefic (tentative)';
  } else if (NATURAL_MALEFICS.includes(grahaIndex)) {
    return 'Functional Malefic (tentative)';
  }
  return 'Neutral';
}

// Calculate Bhava from Lagna
function getBhavaFromLagna(grahaLongitude, lagnaLongitude) {
  let diff = grahaLongitude - lagnaLongitude;
  if (diff < 0) diff += 360;
  return Math.floor(diff / 30) + 1;
}

// Graha Drishti (aspects)
function getGrahaDrishti(grahaIndex) {
  const aspects = [7]; // All grahas aspect 7th house
  
  if (grahaIndex === 2) aspects.push(4, 8); // Mars aspects 4th and 8th
  if (grahaIndex === 4) aspects.push(5, 9); // Jupiter aspects 5th and 9th
  if (grahaIndex === 6) aspects.push(3, 10); // Saturn aspects 3rd and 10th
  
  return aspects;
}

// Main chart calculation endpoint
app.post('/api/calculate-chart', (req, res) => {
  try {
    const { year, month, day, hour, minute, latitude, longitude, timezone } = req.body;
    
    // Validate input
    if (!year || !month || !day || hour === undefined || minute === undefined || !latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Insufficient data. Required: year, month, day, hour, minute, latitude, longitude' 
      });
    }

    // Convert to UTC
    const utcHour = hour - (timezone || 0);
    
    // Calculate Julian Day
    const jd = getJulianDay(year, month, day, utcHour, minute);
    
    // Get Ayanamsa
    const ayanamsa = getAyanamsa(jd);
    
    // Calculate Lagna (Ascendant)
    const tropicalLagna = getAscendant(jd, latitude, longitude);
    const siderealLagna = toSidereal(tropicalLagna, ayanamsa);
    const lagnaRashi = getRashi(siderealLagna);
    const lagnaDegree = getDegreeInRashi(siderealLagna);
    
    // Calculate all Grahas
    const grahas = [];
    
    for (let i = 0; i < 9; i++) {
      let longitude;
      
      if (i === 7) { // Rahu
        const rahuTropical = getPlanetPosition(jd, GRAHAS.RAHU);
        longitude = toSidereal(rahuTropical, ayanamsa);
      } else if (i === 8) { // Ketu (180° from Rahu)
        const rahuTropical = getPlanetPosition(jd, GRAHAS.RAHU);
        let ketuLong = toSidereal(rahuTropical, ayanamsa) + 180;
        if (ketuLong >= 360) ketuLong -= 360;
        longitude = ketuLong;
      } else {
        const planetId = Object.values(GRAHAS)[i];
        const tropicalLong = getPlanetPosition(jd, planetId);
        longitude = toSidereal(tropicalLong, ayanamsa);
      }
      
      const rashi = getRashi(longitude);
      const degree = getDegreeInRashi(longitude);
      const bhava = getBhavaFromLagna(longitude, siderealLagna);
      const dignity = getGrahaDignity(i, rashi);
      const functionalNature = getFunctionalNature(i, lagnaRashi);
      const drishti = getGrahaDrishti(i);
      
      grahas.push({
        name: GRAHA_NAMES[i],
        longitude: longitude.toFixed(4),
        rashi: RASHI_NAMES[rashi],
        rashiIndex: rashi,
        degree: degree.toFixed(2),
        bhava: BHAVA_NAMES[bhava - 1],
        bhavaIndex: bhava,
        dignity: dignity,
        functionalNature: functionalNature,
        drishti: drishti
      });
    }
    
    // Lagna Lord
    const lagnaLordIndex = RASHI_LORDS[lagnaRashi];
    const lagnaLord = grahas[lagnaLordIndex];
    
    // Response
    res.json({
      success: true,
      ayanamsa: ayanamsa.toFixed(4),
      lagna: {
        longitude: siderealLagna.toFixed(4),
        rashi: RASHI_NAMES[lagnaRashi],
        rashiIndex: lagnaRashi,
        degree: lagnaDegree.toFixed(2),
        lord: lagnaLord.name
      },
      grahas: grahas,
      metadata: {
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minute}`,
        location: `${latitude}, ${longitude}`,
        timezone: timezone || 0,
        julianDay: jd.toFixed(4)
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      note: 'Calculation failed. Verify input data.' 
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Classical Jyotisha server running on port ${PORT}`);
});