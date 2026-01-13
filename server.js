const express = require('express');
const path = require('path');
const swisseph = require('swisseph');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

swisseph.swe_set_ephe_path(__dirname + '/ephe');

const AYANAMSA = swisseph.SE_SIDM_LAHIRI;

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
const RASHI_NAMES = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'];
const BHAVA_NAMES = ['Lagna (1st)', 'Dhana (2nd)', 'Sahaja (3rd)', 'Sukha (4th)', 'Putra (5th)', 'Ripu (6th)', 'Kalatra (7th)', 'Mrityu (8th)', 'Dharma (9th)', 'Karma (10th)', 'Labha (11th)', 'Vyaya (12th)'];

// Nakshatra data for Vimshottari Dasha
const NAKSHATRAS = [
  { name: 'Ashwini', lord: 7, start: 0 },
  { name: 'Bharani', lord: 5, start: 13.333333 },
  { name: 'Krittika', lord: 0, start: 26.666667 },
  { name: 'Rohini', lord: 1, start: 40 },
  { name: 'Mrigashira', lord: 2, start: 53.333333 },
  { name: 'Ardra', lord: 7, start: 66.666667 },
  { name: 'Punarvasu', lord: 4, start: 80 },
  { name: 'Pushya', lord: 6, start: 93.333333 },
  { name: 'Ashlesha', lord: 3, start: 106.666667 },
  { name: 'Magha', lord: 7, start: 120 },
  { name: 'Purva Phalguni', lord: 5, start: 133.333333 },
  { name: 'Uttara Phalguni', lord: 0, start: 146.666667 },
  { name: 'Hasta', lord: 1, start: 160 },
  { name: 'Chitra', lord: 2, start: 173.333333 },
  { name: 'Swati', lord: 7, start: 186.666667 },
  { name: 'Vishakha', lord: 4, start: 200 },
  { name: 'Anuradha', lord: 6, start: 213.333333 },
  { name: 'Jyeshta', lord: 3, start: 226.666667 },
  { name: 'Mula', lord: 7, start: 240 },
  { name: 'Purva Ashadha', lord: 5, start: 253.333333 },
  { name: 'Uttara Ashadha', lord: 0, start: 266.666667 },
  { name: 'Shravana', lord: 1, start: 280 },
  { name: 'Dhanishta', lord: 2, start: 293.333333 },
  { name: 'Shatabhisha', lord: 7, start: 306.666667 },
  { name: 'Purva Bhadrapada', lord: 4, start: 320 },
  { name: 'Uttara Bhadrapada', lord: 6, start: 333.333333 },
  { name: 'Revati', lord: 3, start: 346.666667 }
];

// Vimshottari Dasha periods (in years)
const DASHA_PERIODS = [6, 10, 7, 17, 16, 20, 19, 7, 18]; // Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Ketu, Rahu
const DASHA_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury

// Lordship and dignity data
const RASHI_LORDS = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4];
const NATURAL_BENEFICS = [1, 3, 4, 5];
const NATURAL_MALEFICS = [0, 2, 6];
const EXALTATION = { 0: 0, 1: 1, 2: 9, 3: 5, 4: 3, 5: 11, 6: 6 };
const DEBILITATION = { 0: 6, 1: 7, 2: 3, 3: 11, 4: 9, 5: 5, 6: 0 };
const OWN_SIGNS = { 0: [4], 1: [3], 2: [0, 7], 3: [2, 5], 4: [8, 11], 5: [1, 6], 6: [9, 10] };
const MOOLATRIKONA = { 0: 4, 1: 1, 2: 0, 3: 5, 4: 8, 5: 6, 6: 10 };

// Friend/Enemy relationships
const FRIENDS = {
  0: [1, 2, 4], 1: [0, 3], 2: [0, 1, 4], 3: [0, 5], 4: [0, 1, 2], 5: [3, 6], 6: [3, 5]
};
const ENEMIES = {
  0: [5, 6], 1: [], 2: [3], 3: [1], 4: [3, 5], 5: [0, 1], 6: [0, 1, 2]
};

function getJulianDay(year, month, day, hour, minute) {
  const utcHour = hour + minute / 60;
  return swisseph.swe_julday(year, month, day, utcHour, swisseph.SE_GREG_CAL);
}

function getAyanamsa(jd) {
  swisseph.swe_set_sid_mode(AYANAMSA, 0, 0);
  return swisseph.swe_get_ayanamsa_ut(jd);
}

function getPlanetPosition(jd, planet) {
  const result = swisseph.swe_calc_ut(jd, planet, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);
  if (result.error) throw new Error(`Calculation error: ${result.error}`);
  return { longitude: result.longitude, speed: result.longitudeSpeed };
}

function getAscendant(jd, lat, lon) {
  const houses = swisseph.swe_houses(jd, lat, lon, 'P');
  return houses.ascendant;
}

function toSidereal(tropicalLong, ayanamsa) {
  let sidereal = tropicalLong - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  if (sidereal >= 360) sidereal -= 360;
  return sidereal;
}

function getRashi(longitude) {
  return Math.floor(longitude / 30);
}

function getDegreeInRashi(longitude) {
  return longitude % 30;
}

function getGrahaDignity(grahaIndex, rashi, degree) {
  if (EXALTATION[grahaIndex] === rashi) return 'Exalted (Uccha)';
  if (DEBILITATION[grahaIndex] === rashi) return 'Debilitated (Neecha)';
  if (OWN_SIGNS[grahaIndex] && OWN_SIGNS[grahaIndex].includes(rashi)) return 'Own Sign (Sva-kshetra)';
  if (MOOLATRIKONA[grahaIndex] === rashi) return 'Moolatrikona';
  
  const lord = RASHI_LORDS[rashi];
  if (FRIENDS[grahaIndex] && FRIENDS[grahaIndex].includes(lord)) return 'Friend Sign';
  if (ENEMIES[grahaIndex] && ENEMIES[grahaIndex].includes(lord)) return 'Enemy Sign';
  return 'Neutral';
}

function getBhavaFromLagna(grahaLongitude, lagnaLongitude) {
  let diff = grahaLongitude - lagnaLongitude;
  if (diff < 0) diff += 360;
  return Math.floor(diff / 30) + 1;
}

function getGrahaDrishti(grahaIndex) {
  const aspects = [7];
  if (grahaIndex === 2) aspects.push(4, 8);
  if (grahaIndex === 4) aspects.push(5, 9);
  if (grahaIndex === 6) aspects.push(3, 10);
  return aspects;
}

// Calculate Navamsa (D9)
function calculateNavamsa(longitude) {
  const rashi = getRashi(longitude);
  const degree = getDegreeInRashi(longitude);
  const navamsaPart = Math.floor(degree / 3.333333);
  
  const isOdd = rashi % 2 === 0;
  let navamsaRashi;
  
  if (isOdd) {
    navamsaRashi = (rashi + navamsaPart) % 12;
  } else {
    navamsaRashi = ((rashi + 8) + navamsaPart) % 12;
  }
  
  return navamsaRashi;
}

// Calculate Dashamsa (D10)
function calculateDashamsa(longitude) {
  const rashi = getRashi(longitude);
  const degree = getDegreeInRashi(longitude);
  const dashamsaPart = Math.floor(degree / 3);
  
  const isOdd = rashi % 2 === 0;
  let dashamsaRashi;
  
  if (isOdd) {
    dashamsaRashi = (rashi + dashamsaPart) % 12;
  } else {
    dashamsaRashi = ((rashi + 8) + dashamsaPart) % 12;
  }
  
  return dashamsaRashi;
}

// Vimshottari Dasha calculation
function calculateVimshottariDasha(moonLongitude, birthDate) {
  const nakshatra = NAKSHATRAS.find((n, i) => {
    const nextStart = i < 26 ? NAKSHATRAS[i + 1].start : 360;
    return moonLongitude >= n.start && moonLongitude < nextStart;
  });
  
  const lordIndex = nakshatra.lord;
  const progressInNakshatra = moonLongitude - nakshatra.start;
  const totalNakshatraSpan = 13.333333;
  const balanceRatio = (totalNakshatraSpan - progressInNakshatra) / totalNakshatraSpan;
  
  const fullPeriod = DASHA_PERIODS[lordIndex];
  const balanceYears = fullPeriod * balanceRatio;
  
  const dashas = [];
  let currentDate = new Date(birthDate);
  let startIndex = lordIndex;
  
  for (let i = 0; i < 9; i++) {
    const planetIndex = (startIndex + i) % 9;
    const years = DASHA_PERIODS[planetIndex];
    const actualYears = i === 0 ? balanceYears : years;
    
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + Math.floor(actualYears));
    endDate.setMonth(endDate.getMonth() + Math.round((actualYears % 1) * 12));
    
    dashas.push({
      planet: GRAHA_NAMES[planetIndex],
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      years: actualYears.toFixed(2)
    });
    
    currentDate = endDate;
  }
  
  return { nakshatra: nakshatra.name, dashas };
}

// Neecha Bhanga (Debilitation Cancellation) check
function checkNeechaBhanga(grahaIndex, rashi, grahas, lagnaRashi) {
  if (DEBILITATION[grahaIndex] !== rashi) return null;
  
  const cancellations = [];
  
  // Rule 1: Lord of debilitation sign is in kendra from Lagna
  const debilLord = RASHI_LORDS[rashi];
  const debilLordGraha = grahas[debilLord];
  const debilLordBhava = debilLordGraha.bhavaIndex;
  if ([1, 4, 7, 10].includes(debilLordBhava)) {
    cancellations.push('Lord of debilitation sign in Kendra from Lagna');
  }
  
  // Rule 2: Exalted lord of the sign where debilitated planet is placed
  const exaltLord = Object.keys(EXALTATION).find(k => EXALTATION[k] === rashi);
  if (exaltLord) {
    const exaltLordGraha = grahas[parseInt(exaltLord)];
    if (exaltLordGraha.dignity.includes('Exalted')) {
      cancellations.push('Exalted lord of debilitation sign');
    }
  }
  
  // Rule 3: Debilitated planet in kendra from Moon
  const moonRashi = grahas[1].rashiIndex;
  const diff = (rashi - moonRashi + 12) % 12;
  if ([0, 3, 6, 9].includes(diff)) {
    cancellations.push('Debilitated planet in Kendra from Moon');
  }
  
  return cancellations.length > 0 ? cancellations : null;
}

// Classical Yoga detection
function detectYogas(grahas, lagnaRashi) {
  const yogas = [];
  
  // Pancha Mahapurusha Yogas
  const mahapurushaGrahas = [2, 3, 4, 5, 6]; // Mars, Mercury, Jupiter, Venus, Saturn
  mahapurushaGrahas.forEach(gi => {
    const graha = grahas[gi];
    if ((graha.dignity.includes('Exalted') || graha.dignity.includes('Own Sign')) && 
        [1, 4, 7, 10].includes(graha.bhavaIndex)) {
      const yogaNames = ['Ruchaka', 'Bhadra', 'Hamsa', 'Malavya', 'Sasa'];
      yogas.push({
        name: `${yogaNames[mahapurushaGrahas.indexOf(gi)]} Yoga (Pancha Mahapurusha)`,
        planet: graha.name,
        description: `${graha.name} in ${graha.dignity} in Kendra`
      });
    }
  });
  
  // Gaja Kesari Yoga
  const jupiter = grahas[4];
  const moon = grahas[1];
  const diff = Math.abs(jupiter.rashiIndex - moon.rashiIndex);
  if ([1, 4, 7, 10].includes(diff)) {
    yogas.push({
      name: 'Gaja Kesari Yoga',
      planet: 'Jupiter-Moon',
      description: 'Jupiter in Kendra from Moon'
    });
  }
  
  // Neecha Bhanga Raja Yoga
  grahas.forEach((graha, gi) => {
    if (graha.dignity.includes('Debilitated')) {
      const cancellation = checkNeechaBhanga(gi, graha.rashiIndex, grahas, lagnaRashi);
      if (cancellation) {
        yogas.push({
          name: 'Neecha Bhanga Raja Yoga',
          planet: graha.name,
          description: `Debilitation cancelled: ${cancellation.join(', ')}`
        });
      }
    }
  });
  
  return yogas;
}

// Simplified Shadbala calculation (conceptual)
function calculateShadbala(graha, grahaIndex, jd, latitude) {
  let total = 0;
  
  // Sthana Bala (Positional Strength)
  if (graha.dignity.includes('Exalted')) total += 60;
  else if (graha.dignity.includes('Own Sign')) total += 45;
  else if (graha.dignity.includes('Moolatrikona')) total += 50;
  else if (graha.dignity.includes('Friend')) total += 30;
  else if (graha.dignity.includes('Enemy')) total += 15;
  else total += 22.5;
  
  // Dik Bala (Directional Strength)
  const dikBalaHouses = { 0: 10, 1: 4, 2: 10, 3: 1, 4: 1, 5: 4, 6: 7 };
  if (dikBalaHouses[grahaIndex] === graha.bhavaIndex) total += 60;
  
  // Kaal Bala (Temporal Strength) - simplified
  const isDaytime = graha.bhavaIndex <= 6;
  if ([0, 2, 4].includes(grahaIndex) && isDaytime) total += 30;
  if ([1, 5, 6].includes(grahaIndex) && !isDaytime) total += 30;
  
  // Chesta Bala (Motional Strength)
  if (graha.speed > 0) total += 30;
  else if (graha.speed < 0) total += 60; // Retrograde
  
  // Naisargika Bala (Natural Strength)
  const naisargika = [60, 51.43, 17.14, 25.70, 34.28, 42.85, 8.57];
  total += naisargika[grahaIndex] || 0;
  
  return (total / 60).toFixed(2); // Convert to Rupas
}

// Ashtakavarga calculation (simplified)
function calculateAshtakavarga(grahas) {
  const ashtakavarga = Array(12).fill(0);
  
  grahas.forEach((graha, gi) => {
    if (gi >= 7) return; // Skip Rahu/Ketu
    
    // Simplified: Add points based on benefic/malefic nature
    const isBenefic = NATURAL_BENEFICS.includes(gi);
    const points = isBenefic ? 5 : 3;
    
    for (let house = 0; house < 12; house++) {
      const diff = (house - graha.rashiIndex + 12) % 12;
      if ([0, 2, 4, 5, 8, 9, 11].includes(diff)) {
        ashtakavarga[house] += points;
      }
    }
  });
  
  return ashtakavarga;
}

app.post('/api/calculate-chart', (req, res) => {
  try {
    const { year, month, day, hour, minute, latitude, longitude, timezone } = req.body;
    
    if (!year || !month || !day || hour === undefined || minute === undefined || !latitude || !longitude) {
      return res.status(400).json({ error: 'Insufficient data' });
    }

    const utcHour = hour - (timezone || 0);
    const jd = getJulianDay(year, month, day, utcHour, minute);
    const ayanamsa = getAyanamsa(jd);
    
    const tropicalLagna = getAscendant(jd, latitude, longitude);
    const siderealLagna = toSidereal(tropicalLagna, ayanamsa);
    const lagnaRashi = getRashi(siderealLagna);
    const lagnaDegree = getDegreeInRashi(siderealLagna);
    
    const grahas = [];
    
    for (let i = 0; i < 9; i++) {
      let longitude, speed = 0;
      
      if (i === 7) {
        const rahuData = getPlanetPosition(jd, GRAHAS.RAHU);
        longitude = toSidereal(rahuData.longitude, ayanamsa);
        speed = rahuData.speed;
      } else if (i === 8) {
        const rahuData = getPlanetPosition(jd, GRAHAS.RAHU);
        let ketuLong = toSidereal(rahuData.longitude, ayanamsa) + 180;
        if (ketuLong >= 360) ketuLong -= 360;
        longitude = ketuLong;
        speed = -rahuData.speed;
      } else {
        const planetData = getPlanetPosition(jd, Object.values(GRAHAS)[i]);
        longitude = toSidereal(planetData.longitude, ayanamsa);
        speed = planetData.speed;
      }
      
      const rashi = getRashi(longitude);
      const degree = getDegreeInRashi(longitude);
      const bhava = getBhavaFromLagna(longitude, siderealLagna);
      const dignity = getGrahaDignity(i, rashi, degree);
      const drishti = getGrahaDrishti(i);
      const navamsa = calculateNavamsa(longitude);
      const dashamsa = calculateDashamsa(longitude);
      
      grahas.push({
        name: GRAHA_NAMES[i],
        longitude: longitude.toFixed(4),
        rashi: RASHI_NAMES[rashi],
        rashiIndex: rashi,
        degree: degree.toFixed(2),
        bhava: BHAVA_NAMES[bhava - 1],
        bhavaIndex: bhava,
        dignity: dignity,
        drishti: drishti,
        navamsa: RASHI_NAMES[navamsa],
        dashamsa: RASHI_NAMES[dashamsa],
        speed: speed.toFixed(4),
        isRetrograde: speed < 0
      });
    }
    
    const lagnaLordIndex = RASHI_LORDS[lagnaRashi];
    const lagnaLord = grahas[lagnaLordIndex];
    
    // Calculate Shadbala for all planets
    const shadbala = grahas.map((g, i) => ({
      planet: g.name,
      strength: calculateShadbala(g, i, jd, latitude)
    }));
    
    // Calculate Vimshottari Dasha
    const moonLongitude = grahas[1].longitude;
    const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dashaSystem = calculateVimshottariDasha(parseFloat(moonLongitude), birthDate);
    
    // Detect Yogas
    const yogas = detectYogas(grahas, lagnaRashi);
    
    // Calculate Ashtakavarga
    const ashtakavarga = calculateAshtakavarga(grahas);
    
    res.json({
      success: true,
      ayanamsa: ayanamsa.toFixed(4),
      lagna: {
        longitude: siderealLagna.toFixed(4),
        rashi: RASHI_NAMES[lagnaRashi],
        rashiIndex: lagnaRashi,
        degree: lagnaDegree.toFixed(2),
        lord: lagnaLord.name,
        navamsa: RASHI_NAMES[calculateNavamsa(siderealLagna)]
      },
      grahas: grahas,
      shadbala: shadbala,
      vimshottariDasha: dashaSystem,
      yogas: yogas,
      ashtakavarga: ashtakavarga.map((points, house) => ({
        house: BHAVA_NAMES[house],
        points: points
      })),
      metadata: {
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minute}`,
        location: `${latitude}, ${longitude}`,
        timezone: timezone || 0,
        julianDay: jd.toFixed(4)
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Classical Jyotisha server running on port ${PORT}`);
});