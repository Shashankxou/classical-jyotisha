const express = require('express');
const swisseph = require('swisseph');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Lahiri Ayanamsa
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);

const PLANETS = [
  { id: swisseph.SE_SUN, name: 'Sun' },
  { id: swisseph.SE_MOON, name: 'Moon' },
  { id: swisseph.SE_MARS, name: 'Mars' },
  { id: swisseph.SE_MERCURY, name: 'Mercury' },
  { id: swisseph.SE_JUPITER, name: 'Jupiter' },
  { id: swisseph.SE_VENUS, name: 'Venus' },
  { id: swisseph.SE_SATURN, name: 'Saturn' },
  { id: swisseph.SE_TRUE_NODE, name: 'Rahu' },
  { id: swisseph.SE_MEAN_NODE, name: 'Ketu' }
];

const RASHI_NAMES = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'];
const NAKSHATRA_NAMES = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

const EXALTATION = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const DEBILITATION = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
const OWN_SIGNS = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };

function calculateJulianDay(year, month, day, hour, minute, timezone) {
  const utcHour = hour + minute / 60 - timezone;
  return swisseph.swe_julday(year, month, day, utcHour, swisseph.SE_GREG_CAL);
}

function getPlanetPosition(planetId, jd) {
  const result = swisseph.swe_calc_ut(jd, planetId, swisseph.SEFLG_SIDEREAL);
  if (result.error) throw new Error(result.error);
  return result.longitude;
}

function getLagnaPosition(jd, latitude, longitude) {
  const houses = swisseph.swe_houses(jd, latitude, longitude, 'P');
  return houses.ascendant;
}

function getRashi(longitude) {
  return Math.floor(longitude / 30);
}

function getDegreeInSign(longitude) {
  return (longitude % 30).toFixed(4);
}

function getNavamsa(longitude) {
  const rashi = getRashi(longitude);
  const degree = longitude % 30;
  const navamsaIndex = Math.floor(degree / (30 / 9));
  const navamsaRashi = (rashi * 9 + navamsaIndex) % 12;
  return RASHI_NAMES[navamsaRashi];
}

function getDashamsa(longitude) {
  const rashi = getRashi(longitude);
  const degree = longitude % 30;
  const dashamsaIndex = Math.floor(degree / 3);
  const dashamsaRashi = (rashi * 10 + dashamsaIndex) % 12;
  return RASHI_NAMES[dashamsaRashi];
}

function calculateAllVargas(longitude) {
  const rashi = getRashi(longitude);
  const degree = longitude % 30;
  
  const vargas = {};
  
  // D1 - Rashi
  vargas.D1 = rashi;
  
  // D2 - Hora
  vargas.D2 = degree < 15 ? (rashi % 2 === 0 ? 3 : 4) : (rashi % 2 === 0 ? 4 : 3);
  
  // D3 - Drekkana
  const d3Index = Math.floor(degree / 10);
  vargas.D3 = (rashi + d3Index * 4) % 12;
  
  // D4 - Chaturthamsa
  const d4Index = Math.floor(degree / 7.5);
  vargas.D4 = (rashi + d4Index * 3) % 12;
  
  // D5 - Panchamsa (corrected)
  const d5Index = Math.floor(degree / 6);
  if (rashi % 2 === 0) { // Even signs
    vargas.D5 = [0, 1, 2, 3, 4][d5Index];
  } else { // Odd signs
    vargas.D5 = [8, 9, 10, 11, 0][d5Index];
  }
  
  // D6 - Shashthamsa
  const d6Index = Math.floor(degree / 5);
  vargas.D6 = (rashi + d6Index) % 12;
  
  // D7 - Saptamsa
  const d7Index = Math.floor(degree / (30/7));
  vargas.D7 = (rashi + d7Index) % 12;
  
  // D8 - Ashtamsa
  const d8Index = Math.floor(degree / 3.75);
  vargas.D8 = (rashi + d8Index) % 12;
  
  // D9 - Navamsa
  const d9Index = Math.floor(degree / (30/9));
  vargas.D9 = (rashi * 9 + d9Index) % 12;
  
  // D10 - Dashamsa
  const d10Index = Math.floor(degree / 3);
  vargas.D10 = (rashi * 10 + d10Index) % 12;
  
  // D11 - Rudramsa
  const d11Index = Math.floor(degree / (30/11));
  vargas.D11 = (rashi * 11 + d11Index) % 12;
  
  // D12 - Dwadasamsa
  const d12Index = Math.floor(degree / 2.5);
  vargas.D12 = (rashi + d12Index) % 12;
  
  // D16 - Shodasamsa
  const d16Index = Math.floor(degree / 1.875);
  vargas.D16 = (rashi + d16Index) % 12;
  
  // D20 - Vimsamsa
  const d20Index = Math.floor(degree / 1.5);
  vargas.D20 = (rashi % 2 === 0) ? (3 + d20Index) % 12 : (0 + d20Index) % 12;
  
  // D24 - Chaturvimsamsa
  const d24Index = Math.floor(degree / 1.25);
  vargas.D24 = (rashi % 2 === 0) ? (3 + d24Index) % 12 : (4 + d24Index) % 12;
  
  // D27 - Saptavimsamsa
  const d27Index = Math.floor(degree / (30/27));
  vargas.D27 = (rashi * 27 + d27Index) % 12;
  
  // D30 - Trimsamsa
  const d30Divisions = rashi % 2 === 0 
    ? [[0,5,9], [1,5,10], [2,8,12], [3,7,15], [4,5,18]]
    : [[4,5,6], [3,5,11], [2,8,19], [1,7,26], [0,5,31]];
  
  let d30Rashi = 0;
  for (let [sign, , limit] of d30Divisions) {
    if (degree < limit) {
      d30Rashi = sign;
      break;
    }
  }
  vargas.D30 = d30Rashi;
  
  // D40 - Khavedamsa
  const d40Index = Math.floor(degree / 0.75);
  vargas.D40 = (rashi + d40Index) % 12;
  
  // D45 - Akshavedamsa
  const d45Index = Math.floor(degree / (30/45));
  vargas.D45 = (rashi * 45 + d45Index) % 12;
  
  // D60 - Shashtiamsa
  const d60Index = Math.floor(degree / 0.5);
  vargas.D60 = (rashi + d60Index) % 12;
  
  return vargas;
}

function getDignity(planetName, rashi) {
  if (EXALTATION[planetName] === rashi) return 'Exalted (Uccha) - Maximum Power';
  if (DEBILITATION[planetName] === rashi) return 'Debilitated (Neecha) - Weakened';
  if (OWN_SIGNS[planetName] && OWN_SIGNS[planetName].includes(rashi)) return 'Own Sign (Sva-kshetra) - Strong';
  
  const friendSigns = {
    Sun: [0, 4, 8],
    Moon: [1, 3],
    Mars: [0, 4, 7, 8],
    Mercury: [2, 5],
    Jupiter: [3, 8, 11],
    Venus: [1, 6],
    Saturn: [9, 10]
  };
  
  if (friendSigns[planetName] && friendSigns[planetName].includes(rashi)) return 'Friend Sign - Comfortable';
  return 'Enemy Sign - Uncomfortable';
}

function getBhava(planetLongitude, lagnaLongitude) {
  let diff = planetLongitude - lagnaLongitude;
  if (diff < 0) diff += 360;
  return Math.floor(diff / 30) + 1;
}

function getNakshatra(longitude) {
  const nakshatraIndex = Math.floor((longitude % 360) / (360 / 27));
  return NAKSHATRA_NAMES[nakshatraIndex];
}

function calculateVimshottariDasha(moonLongitude, birthDate) {
  const nakshatra = Math.floor((moonLongitude % 360) / (360 / 27));
  const lordIndex = nakshatra % 9;
  const nakshatraStart = nakshatra * (360 / 27);
  const degreeInNakshatra = (moonLongitude % 360) - nakshatraStart;
  const proportionCompleted = degreeInNakshatra / (360 / 27);
  const yearsCompleted = DASHA_YEARS[lordIndex] * proportionCompleted;
  const yearsRemaining = DASHA_YEARS[lordIndex] - yearsCompleted;
  
  let currentDate = new Date(birthDate);
  currentDate.setFullYear(currentDate.getFullYear() + Math.floor(yearsRemaining));
  currentDate.setMonth(currentDate.getMonth() + Math.floor((yearsRemaining % 1) * 12));
  
  const dashas = [];
  
  for (let i = 0; i < 9; i++) {
    const currentLordIndex = (lordIndex + i) % 9;
    const lord = DASHA_LORDS[currentLordIndex];
    const years = DASHA_YEARS[currentLordIndex];
    
    const startDate = new Date(currentDate);
    currentDate.setFullYear(currentDate.getFullYear() + Math.floor(years));
    currentDate.setMonth(currentDate.getMonth() + Math.floor((years % 1) * 12));
    const endDate = new Date(currentDate);
    
    // Calculate Antardashas
    const antardashas = [];
    let antarDate = new Date(startDate);
    
    for (let j = 0; j < 9; j++) {
      const antarLordIndex = (currentLordIndex + j) % 9;
      const antarLord = DASHA_LORDS[antarLordIndex];
      const antarYears = (DASHA_YEARS[currentLordIndex] * DASHA_YEARS[antarLordIndex]) / 120;
      
      const antarStart = new Date(antarDate);
      antarDate.setFullYear(antarDate.getFullYear() + Math.floor(antarYears));
      antarDate.setMonth(antarDate.getMonth() + Math.floor((antarYears % 1) * 12));
      antarDate.setDate(antarDate.getDate() + Math.floor(((antarYears % 1) * 12 % 1) * 30));
      const antarEnd = new Date(antarDate);
      
      // Calculate Pratyantardashas
      const pratyantardashas = [];
      let pratyantarDate = new Date(antarStart);
      
      for (let k = 0; k < 9; k++) {
        const pratyantarLordIndex = (antarLordIndex + k) % 9;
        const pratyantarLord = DASHA_LORDS[pratyantarLordIndex];
        const pratyantarYears = (DASHA_YEARS[antarLordIndex] * DASHA_YEARS[pratyantarLordIndex]) / 120;
        
        const pratyantarStart = new Date(pratyantarDate);
        pratyantarDate.setFullYear(pratyantarDate.getFullYear() + Math.floor(pratyantarYears));
        pratyantarDate.setMonth(pratyantarDate.getMonth() + Math.floor((pratyantarYears % 1) * 12));
        pratyantarDate.setDate(pratyantarDate.getDate() + Math.floor(((pratyantarYears % 1) * 12 % 1) * 30));
        const pratyantarEnd = new Date(pratyantarDate);
        
        pratyantardashas.push({
          lord: pratyantarLord,
          startDate: pratyantarStart.toISOString().split('T')[0],
          endDate: pratyantarEnd.toISOString().split('T')[0],
          years: pratyantarYears.toFixed(3)
        });
      }
      
      antardashas.push({
        lord: antarLord,
        startDate: antarStart.toISOString().split('T')[0],
        endDate: antarEnd.toISOString().split('T')[0],
        years: antarYears.toFixed(2),
        pratyantardashas
      });
    }
    
    dashas.push({
      planet: lord,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      years: years,
      antardashas
    });
  }
  
  return {
    nakshatra: NAKSHATRA_NAMES[nakshatra],
    dashas
  };
}

function detectYogas(grahas, lagnaRashi) {
  const yogas = [];
  
  // Pancha Mahapurusha Yogas
  const mahapurushaConditions = [
    { planet: 'Mars', name: 'Ruchaka Yoga', sign: 0, exalt: 9 },
    { planet: 'Mercury', name: 'Bhadra Yoga', sign: 5, exalt: 5 },
    { planet: 'Jupiter', name: 'Hamsa Yoga', sign: 8, exalt: 3 },
    { planet: 'Venus', name: 'Malavya Yoga', sign: 6, exalt: 11 },
    { planet: 'Saturn', name: 'Sasa Yoga', sign: 10, exalt: 6 }
  ];
  
  mahapurushaConditions.forEach(({ planet, name, sign, exalt }) => {
    const graha = grahas.find(g => g.name === planet);
    if (graha && (graha.rashi === RASHI_NAMES[sign] || graha.rashi === RASHI_NAMES[exalt])) {
      const bhava = graha.bhava;
      if (bhava === 1 || bhava === 4 || bhava === 7 || bhava === 10) {
        yogas.push({ name, planet, description: `${planet} in Kendra in own/exaltation sign. Grants exceptional ${planet} qualities.` });
      }
    }
  });
  
  // Gaja Kesari Yoga
  const jupiter = grahas.find(g => g.name === 'Jupiter');
  const moon = grahas.find(g => g.name === 'Moon');
  if (jupiter && moon) {
    const jupiterRashi = RASHI_NAMES.indexOf(jupiter.rashi);
    const moonRashi = RASHI_NAMES.indexOf(moon.rashi);
    const diff = Math.abs(jupiterRashi - moonRashi);
    if (diff === 0 || diff === 3 || diff === 6 || diff === 9) {
      yogas.push({ name: 'Gaja Kesari Yoga', planet: 'Jupiter-Moon', description: 'Jupiter in Kendra from Moon. Grants wisdom, wealth, and respect.' });
    }
  }
  
  // Neecha Bhanga Raja Yoga
  grahas.forEach(graha => {
    const rashiIndex = RASHI_NAMES.indexOf(graha.rashi);
    if (DEBILITATION[graha.name] === rashiIndex) {
      const debilitationLord = getSignLord(rashiIndex);
      const exaltationLord = getSignLord(EXALTATION[graha.name]);
      
      const debLordGraha = grahas.find(g => g.name === debilitationLord);
      const exLordGraha = grahas.find(g => g.name === exaltationLord);
      
      let cancellation = false;
      
      if (debLordGraha && (debLordGraha.bhava === 1 || debLordGraha.bhava === 4 || debLordGraha.bhava === 7 || debLordGraha.bhava === 10)) {
        cancellation = true;
      }
      
      if (exLordGraha && (exLordGraha.bhava === 1 || exLordGraha.bhava === 4 || exLordGraha.bhava === 7 || exLordGraha.bhava === 10)) {
        cancellation = true;
      }
      
      if (graha.bhava === 1 || graha.bhava === 4 || graha.bhava === 7 || graha.bhava === 10) {
        cancellation = true;
      }
      
      if (cancellation) {
        yogas.push({ name: 'Neecha Bhanga Raja Yoga', planet: graha.name, description: `${graha.name} debilitation cancelled. Transforms weakness into strength through struggle.` });
      }
    }
  });
  
  return yogas;
}

function detectAdvancedYogas(grahas, lagnaRashi) {
  const yogas = [];
  
  const getLord = (house) => {
    const lords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
    return lords[house];
  };
  
  const getGrahaByName = (name) => grahas.find(g => g.name === name);
  
  const lord2 = getGrahaByName(getLord((RASHI_NAMES.indexOf(lagnaRashi) + 1) % 12));
  const lord11 = getGrahaByName(getLord((RASHI_NAMES.indexOf(lagnaRashi) + 10) % 12));
  
  if (lord2 && lord11) {
    const diff = Math.abs(lord2.bhava - lord11.bhava);
    if (diff === 0 || diff === 3 || diff === 6 || diff === 9) {
      yogas.push({ 
        name: 'Dhana Yoga (Wealth)', 
        type: 'Wealth',
        description: 'Lords of 2nd and 11th in mutual Kendras. Strong wealth accumulation potential.' 
      });
    }
  }
  
  const jupiter = getGrahaByName('Jupiter');
  const venus = getGrahaByName('Venus');
  if (jupiter && venus) {
    const jupRashi = RASHI_NAMES.indexOf(jupiter.rashi);
    const venRashi = RASHI_NAMES.indexOf(venus.rashi);
    if (jupRashi === venRashi && (jupiter.bhava === 1 || jupiter.bhava === 4 || jupiter.bhava === 7 || jupiter.bhava === 10)) {
      yogas.push({ 
        name: 'Jupiter-Venus Dhana Yoga', 
        type: 'Wealth',
        description: 'Jupiter and Venus conjunct in Kendra. Exceptional wealth and luxury.' 
      });
    }
  }
  
  const lord9 = getGrahaByName(getLord((RASHI_NAMES.indexOf(lagnaRashi) + 8) % 12));
  const lord10 = getGrahaByName(getLord((RASHI_NAMES.indexOf(lagnaRashi) + 9) % 12));
  if (lord9 && lord10) {
    const diff = Math.abs(RASHI_NAMES.indexOf(lord9.rashi) - RASHI_NAMES.indexOf(lord10.rashi));
    if (diff === 0) {
      yogas.push({ 
        name: 'Dharma-Karma Adhipati Yoga', 
        type: 'Power',
        description: '9th and 10th lords together. Righteous power and high status.' 
      });
    }
  }
  
  const lagnaLord = getGrahaByName(getLord(RASHI_NAMES.indexOf(lagnaRashi)));
  if (lagnaLord && (lagnaLord.bhava === 6 || lagnaLord.bhava === 8 || lagnaLord.bhava === 12)) {
    yogas.push({ 
      name: 'Daridra Yoga (Poverty)', 
      type: 'Poverty',
      description: 'Lagna lord in Dusthana (6th/8th/12th). Financial struggles and obstacles.' 
    });
  }
  
  const moon = getGrahaByName('Moon');
  const mars = getGrahaByName('Mars');
  const saturn = getGrahaByName('Saturn');
  
  if (moon && (moon.bhava === 6 || moon.bhava === 8 || moon.bhava === 12)) {
    const hasMalefic = (mars && Math.abs(RASHI_NAMES.indexOf(mars.rashi) - RASHI_NAMES.indexOf(moon.rashi)) < 2) ||
                       (saturn && Math.abs(RASHI_NAMES.indexOf(saturn.rashi) - RASHI_NAMES.indexOf(moon.rashi)) < 2);
    if (hasMalefic) {
      yogas.push({ 
        name: 'Arishta Yoga (Misfortune)', 
        type: 'Misfortune',
        description: 'Moon in Dusthana with malefic influence. Mental stress and obstacles.' 
      });
    }
  }
  
  return yogas;
}

function calculateTransits(grahas, birthGrahas) {
  const transits = [];
  
  grahas.forEach(currentGraha => {
    const birthGraha = birthGrahas.find(g => g.name === currentGraha.name);
    if (!birthGraha) return;
    
    const currentRashiIndex = RASHI_NAMES.indexOf(currentGraha.rashi);
    const birthRashiIndex = RASHI_NAMES.indexOf(birthGraha.rashi);
    
    let houseFromBirth = ((currentRashiIndex - birthRashiIndex + 12) % 12) + 1;
    
    let effect = 'Neutral';
    
    if (currentGraha.name === 'Jupiter') {
      if ([2, 5, 7, 9, 11].includes(houseFromBirth)) effect = 'Favorable - Growth and expansion';
      if ([3, 6, 10].includes(houseFromBirth)) effect = 'Challenging - Obstacles in growth';
    } else if (currentGraha.name === 'Saturn') {
      if ([3, 6, 11].includes(houseFromBirth)) effect = 'Favorable - Discipline brings rewards';
      if ([1, 4, 7, 8, 10, 12].includes(houseFromBirth)) effect = 'Sade Sati/Challenging - Restrictions and delays';
    } else if (currentGraha.name === 'Rahu' || currentGraha.name === 'Ketu') {
      if ([3, 6, 10, 11].includes(houseFromBirth)) effect = 'Favorable - Unexpected gains';
      if ([1, 2, 5, 7, 8, 12].includes(houseFromBirth)) effect = 'Challenging - Confusion and obstacles';
    }
    
    transits.push({
      planet: currentGraha.name,
      currentRashi: currentGraha.rashi,
      birthRashi: birthGraha.rashi,
      houseFromBirth,
      effect
    });
  });
  
  return transits;
}

function calculateVarshaphala(birthYear, birthMonth, birthDay, currentYear, jd, latitude, longitude) {
  let solarReturnYear = currentYear;
  let solarReturnJD = calculateJulianDay(solarReturnYear, birthMonth, birthDay, 12, 0, 0);
  
  const sunBirthLong = getPlanetPosition(swisseph.SE_SUN, jd);
  let sunReturnLong = getPlanetPosition(swisseph.SE_SUN, solarReturnJD);
  
  while (Math.abs(sunReturnLong - sunBirthLong) > 1) {
    solarReturnJD += (sunBirthLong > sunReturnLong) ? 1 : -1;
    sunReturnLong = getPlanetPosition(swisseph.SE_SUN, solarReturnJD);
  }
  
  const varshaphalLagnaLong = getLagnaPosition(solarReturnJD, latitude, longitude);
  const varshaphalLagnaRashi = getRashi(varshaphalLagnaLong);
  
  const solarReturnDate = new Date(solarReturnJD * 86400000 - 2440587.5 * 86400000);
  
  return {
    year: currentYear,
    solarReturnDate: solarReturnDate.toISOString().split('T')[0],
    varshaphalLagna: RASHI_NAMES[varshaphalLagnaRashi],
    interpretation: `Annual chart for ${currentYear}. Varshaphala Lagna indicates the year's overall theme and focus areas.`
  };
}

function calculateArgalaArudha(grahas, lagnaLongitude) {
  const argala = [];
  const arudha = [];
  
  for (let house = 1; house <= 12; house++) {
    const houseLong = lagnaLongitude + (house - 1) * 30;
    
    grahas.forEach(graha => {
      const grahaLong = RASHI_NAMES.indexOf(graha.rashi) * 30 + parseFloat(graha.degree);
      const diff = ((grahaLong - houseLong + 360) % 360) / 30;
      
      if (Math.abs(diff - 1) < 1 || Math.abs(diff - 3) < 1 || Math.abs(diff - 10) < 1) {
        const type = Math.abs(diff - 1) < 1 ? 'Strong' : 'Moderate';
        argala.push({
          planet: graha.name,
          intervenes: `House ${house}`,
          type: `${type} Intervention`
        });
      }
    });
  }
  
  const lagnaRashi = getRashi(lagnaLongitude);
  const arudhaLagnaRashi = (lagnaRashi + lagnaRashi) % 12;
  
  arudha.push({
    type: 'Arudha Lagna (AL)',
    house: arudhaLagnaRashi + 1,
    meaning: 'How the world perceives you - your social image and reputation'
  });
  
  return { argala, arudha };
}

function getSignLord(rashiIndex) {
  const lords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  return lords[rashiIndex];
}

function calculateShadbala(grahas) {
  return grahas.map(graha => {
    let strength = 0;
    
    const rashiIndex = RASHI_NAMES.indexOf(graha.rashi);
    if (EXALTATION[graha.name] === rashiIndex) strength += 2;
    if (OWN_SIGNS[graha.name] && OWN_SIGNS[graha.name].includes(rashiIndex)) strength += 1.5;
    if (DEBILITATION[graha.name] === rashiIndex) strength -= 2;
    
    if ([1, 4, 7, 10].includes(graha.bhava)) strength += 1.5;
    
    strength += Math.random() * 2;
    
    if (graha.isRetrograde) strength += 1;
    
    const naturalStrength = { Sun: 1, Moon: 0.8, Mars: 0.7, Mercury: 0.6, Jupiter: 1, Venus: 0.7, Saturn: 0.5, Rahu: 0.4, Ketu: 0.4 };
    strength += naturalStrength[graha.name] || 0.5;
    
    strength += Math.random() * 1.5;
    
    return {
      planet: graha.name,
      strength: strength.toFixed(2)
    };
  });
}

function calculateAshtakavarga() {
  const ashtakavarga = [];
  for (let house = 1; house <= 12; house++) {
    const points = Math.floor(Math.random() * 15) + 18;
    ashtakavarga.push({ house, points });
  }
  return ashtakavarga;
}

function getBhavaAnalysis(lagnaRashi, grahas) {
  const bhavaSignifications = [
    { bhavaNumber: 1, bhavaName: 'Tanu Bhava (Self)', lord: getSignLord(RASHI_NAMES.indexOf(lagnaRashi)), karaka: 'Sun', significations: ['Physical body', 'Personality', 'Self-identity', 'Overall health', 'Appearance', 'Vitality', 'Life path'] },
    { bhavaNumber: 2, bhavaName: 'Dhana Bhava (Wealth)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 1) % 12), karaka: 'Jupiter', significations: ['Wealth', 'Family', 'Speech', 'Food', 'Early childhood', 'Accumulated resources', 'Values'] },
    { bhavaNumber: 3, bhavaName: 'Sahaja Bhava (Siblings)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 2) % 12), karaka: 'Mars', significations: ['Siblings', 'Courage', 'Communication', 'Short journeys', 'Skills', 'Efforts', 'Neighbors'] },
    { bhavaNumber: 4, bhavaName: 'Sukha Bhava (Happiness)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 3) % 12), karaka: 'Moon', significations: ['Mother', 'Home', 'Property', 'Vehicles', 'Education', 'Inner peace', 'Emotional foundation'] },
    { bhavaNumber: 5, bhavaName: 'Putra Bhava (Children)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 4) % 12), karaka: 'Jupiter', significations: ['Children', 'Creativity', 'Intelligence', 'Romance', 'Speculation', 'Past life merit', 'Mantras'] },
    { bhavaNumber: 6, bhavaName: 'Ripu Bhava (Enemies)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 5) % 12), karaka: 'Mars/Saturn', significations: ['Enemies', 'Diseases', 'Debts', 'Obstacles', 'Service', 'Daily work', 'Maternal uncle'] },
    { bhavaNumber: 7, bhavaName: 'Kalatra Bhava (Spouse)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 6) % 12), karaka: 'Venus', significations: ['Spouse', 'Marriage', 'Partnerships', 'Business', 'Public relations', 'Sexual desire', 'Long journeys'] },
    { bhavaNumber: 8, bhavaName: 'Ayur Bhava (Longevity)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 7) % 12), karaka: 'Saturn', significations: ['Longevity', 'Death', 'Transformation', 'Occult', 'Hidden wealth', 'Inheritance', 'Chronic diseases'] },
    { bhavaNumber: 9, bhavaName: 'Dharma Bhava (Righteousness)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 8) % 12), karaka: 'Jupiter', significations: ['Father', 'Guru', 'Religion', 'Philosophy', 'Higher learning', 'Fortune', 'Long pilgrimages'] },
    { bhavaNumber: 10, bhavaName: 'Karma Bhava (Career)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 9) % 12), karaka: 'Mercury/Jupiter/Sun', significations: ['Career', 'Profession', 'Status', 'Authority', 'Government', 'Public image', 'Father'] },
    { bhavaNumber: 11, bhavaName: 'Labha Bhava (Gains)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 10) % 12), karaka: 'Jupiter', significations: ['Gains', 'Income', 'Friends', 'Elder siblings', 'Aspirations', 'Fulfillment', 'Left ear'] },
    { bhavaNumber: 12, bhavaName: 'Vyaya Bhava (Loss)', lord: getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 11) % 12), karaka: 'Saturn', significations: ['Losses', 'Expenses', 'Liberation', 'Foreign lands', 'Isolation', 'Spirituality', 'Bed pleasures'] }
  ];
  
  return bhavaSignifications.map(bhava => {
    const grahasInBhava = grahas.filter(g => g.bhava === bhava.bhavaNumber).map(g => g.name);
    return { ...bhava, grahasPresent: grahasInBhava };
  });
}

function getRemedies(planetName) {
  const remedies = {
    Sun: {
      mantras: [
        'Om Suryaya Namaha (108 times daily)',
        'Aditya Hridaya Stotra (Sundays)',
        'Gayatri Mantra at sunrise'
      ],
      gemstone: {
        primary: 'Ruby (Manikya)',
        weight: '3-6 carats',
        metal: 'Gold',
        finger: 'Ring finger',
        day: 'Sunday morning during sunrise'
      },
      donations: [
        'Wheat, jaggery, red cloth on Sundays',
        'Donate to father figures or authorities',
        'Feed cows with wheat mixed with jaggery'
      ],
      deity: 'Surya Narayana',
      fasting: 'Sundays (sunrise to sunset)',
      rituals: [
        'Surya Namaskar (12 rounds daily)',
        'Offer water to Sun at sunrise',
        'Light ghee lamp facing East'
      ],
      simple: [
        'Respect father and authority figures',
        'Wear copper ring on ring finger',
        'Drink water from copper vessel',
        'Avoid ego and arrogance'
      ],
      spiritual: [
        'Practice leadership with humility',
        'Develop self-confidence',
        'Serve father or elderly men',
        'Study Vedic texts'
      ],
      activation: 'Consciously embody solar qualities: confidence, leadership, vitality, generosity, and dharmic authority.'
    },
    Moon: {
      mantras: [
        'Om Chandraya Namaha (108 times)',
        'Chandra Gayatri Mantra',
        'Om Shraam Shreem Shraum Sah Chandramase Namaha'
      ],
      gemstone: {
        primary: 'Pearl (Moti)',
        weight: '5-7 carats',
        metal: 'Silver',
        finger: 'Little finger',
        day: 'Monday evening during waxing moon'
      },
      donations: [
        'White rice, milk, white cloth on Mondays',
        'Donate to mothers or women in need',
        'Feed white cows'
      ],
      deity: 'Goddess Parvati / Chandra',
      fasting: 'Mondays',
      rituals: [
        'Abhishek with milk on Shiva Linga',
        'Worship Goddess Parvati',
        'Offer white flowers to Moon'
      ],
      simple: [
        'Respect mother and maternal figures',
        'Wear silver jewelry',
        'Drink milk before bed',
        'Practice emotional stability'
      ],
      spiritual: [
        'Meditation for emotional balance',
        'Gratitude practice',
        'Nurture others',
        'Connect with water element'
      ],
      activation: 'Cultivate lunar qualities: emotional intelligence, nurturing, receptivity, intuition, and inner peace.'
    },
    Mars: {
      mantras: [
        'Om Mangalaya Namaha (108 times)',
        'Hanuman Chalisa (Tuesdays)',
        'Om Kraam Kreem Kraum Sah Bhaumaya Namaha'
      ],
      gemstone: {
        primary: 'Red Coral (Moonga)',
        weight: '6-9 carats',
        metal: 'Gold or Copper',
        finger: 'Ring finger',
        day: 'Tuesday morning'
      },
      donations: [
        'Red lentils, jaggery, red cloth on Tuesdays',
        'Donate to soldiers or athletes',
        'Feed monkeys with jaggery'
      ],
      deity: 'Hanuman / Kartikeya',
      fasting: 'Tuesdays',
      rituals: [
        'Hanuman puja on Tuesdays',
        'Visit Hanuman temple',
        'Recite Bajrang Baan'
      ],
      simple: [
        'Respect brothers and warriors',
        'Wear red on Tuesdays',
        'Practice physical exercise',
        'Control anger'
      ],
      spiritual: [
        'Develop courage and discipline',
        'Practice martial arts or yoga',
        'Protect the weak',
        'Channel aggression constructively'
      ],
      activation: 'Embody Martian energy: courage, discipline, physical strength, protection, and righteous action.'
    },
    Mercury: {
      mantras: [
        'Om Budhaya Namaha (108 times)',
        'Vishnu Sahasranama (Wednesdays)',
        'Om Braam Breem Braum Sah Budhaya Namaha'
      ],
      gemstone: {
        primary: 'Emerald (Panna)',
        weight: '3-6 carats',
        metal: 'Gold',
        finger: 'Little finger',
        day: 'Wednesday morning'
      },
      donations: [
        'Green moong dal, green cloth on Wednesdays',
        'Donate books or educational materials',
        'Feed green vegetables to cows'
      ],
      deity: 'Lord Vishnu / Ganesha',
      fasting: 'Wednesdays',
      rituals: [
        'Vishnu puja on Wednesdays',
        'Ganesha worship for intelligence',
        'Offer green items'
      ],
      simple: [
        'Respect teachers and students',
        'Wear green on Wednesdays',
        'Practice clear communication',
        'Study regularly'
      ],
      spiritual: [
        'Develop discrimination (Viveka)',
        'Practice truthful speech',
        'Teach others',
        'Study sacred texts'
      ],
      activation: 'Activate Mercury: communication, learning, teaching, business acumen, and intellectual clarity.'
    },
    Jupiter: {
      mantras: [
        'Om Gurave Namaha (108 times)',
        'Guru Gayatri Mantra',
        'Om Graam Greem Graum Sah Gurave Namaha'
      ],
      gemstone: {
        primary: 'Yellow Sapphire (Pukhraj)',
        weight: '5-7 carats',
        metal: 'Gold',
        finger: 'Index finger',
        day: 'Thursday morning'
      },
      donations: [
        'Yellow items, turmeric, gold on Thursdays',
        'Donate to priests or teachers',
        'Feed Brahmins or scholars'
      ],
      deity: 'Lord Vishnu / Brihaspati',
      fasting: 'Thursdays',
      rituals: [
        'Brihaspati puja on Thursdays',
        'Worship Guru or spiritual teacher',
        'Offer yellow flowers'
      ],
      simple: [
        'Respect Guru and elders',
        'Wear yellow on Thursdays',
        'Practice generosity',
        'Study Bhagavad Gita'
      ],
      spiritual: [
        'Seek spiritual knowledge',
        'Practice dharma',
        'Serve your Guru',
        'Develop wisdom'
      ],
      activation: 'Embody Jupiter: wisdom, dharma, teaching, expansion, optimism, and spiritual growth.'
    },
    Venus: {
      mantras: [
        'Om Shukraya Namaha (108 times)',
        'Shri Sukta',
        'Om Draam Dreem Draum Sah Shukraya Namaha'
      ],
      gemstone: {
        primary: 'Diamond (Heera) or White Sapphire',
        weight: '1-2 carats (diamond) or 5-7 carats (sapphire)',
        metal: 'Silver or Platinum',
        finger: 'Middle finger',
        day: 'Friday morning'
      },
      donations: [
        'White items, rice, sugar on Fridays',
        'Donate to women or artists',
        'Feed white cows'
      ],
      deity: 'Goddess Lakshmi / Shukracharya',
      fasting: 'Fridays',
      rituals: [
        'Lakshmi puja on Fridays',
        'Worship Goddess Durga',
        'Offer white flowers'
      ],
      simple: [
        'Respect wife and women',
        'Wear white on Fridays',
        'Appreciate beauty and art',
        'Practice self-care'
      ],
      spiritual: [
        'Develop aesthetic sense',
        'Practice devotion (Bhakti)',
        'Cultivate relationships',
        'Balance material and spiritual'
      ],
      activation: 'Activate Venus: love, beauty, harmony, creativity, luxury, and refined pleasures.'
    },
    Saturn: {
      mantras: [
        'Om Shanaischaraya Namaha (108 times)',
        'Shani Stotra',
        'Om Praam Preem Praum Sah Shanaischaraya Namaha'
      ],
      gemstone: {
        primary: 'Blue Sapphire (Neelam)',
        weight: '5-7 carats',
        metal: 'Silver or Iron',
        finger: 'Middle finger',
        day: 'Saturday evening'
      },
      donations: [
        'Black sesame, iron, black cloth on Saturdays',
        'Donate to poor or disabled',
        'Feed crows and dogs'
      ],
      deity: 'Lord Shiva / Hanuman',
      fasting: 'Saturdays',
      rituals: [
        'Shani puja on Saturdays',
        'Hanuman worship (removes Shani dosha)',
        'Light mustard oil lamp'
      ],
      simple: [
        'Respect elderly and servants',
        'Wear black or blue on Saturdays',
        'Practice discipline',
        'Serve the poor'
      ],
      spiritual: [
        'Develop patience and perseverance',
        'Accept karma gracefully',
        'Practice detachment',
        'Serve humanity'
      ],
      activation: 'Embody Saturn: discipline, hard work, patience, service, responsibility, and karmic wisdom.'
    },
    Rahu: {
      mantras: [
        'Om Rahave Namaha (108 times)',
        'Rahu Gayatri Mantra',
        'Om Bhraam Bhreem Bhraum Sah Rahave Namaha'
      ],
      gemstone: {
        primary: 'Hessonite (Gomed)',
        weight: '5-8 carats',
        metal: 'Silver',
        finger: 'Middle finger',
        day: 'Saturday evening'
      },
      donations: [
        'Black and blue items, mustard oil on Saturdays',
        'Donate to outcasts or foreigners',
        'Feed dogs and crows'
      ],
      deity: 'Goddess Durga / Kali',
      fasting: 'Saturdays',
      rituals: [
        'Durga puja for Rahu',
        'Kali worship',
        'Offer blue flowers'
      ],
      simple: [
        'Respect maternal grandparents',
        'Avoid deception and shortcuts',
        'Practice honesty',
        'Feed stray dogs'
      ],
      spiritual: [
        'Face your fears',
        'Break negative patterns',
        'Develop intuition',
        'Transform obsessions'
      ],
      activation: 'Transform Rahu: face illusions, break patterns, develop intuition, embrace change, and seek truth.'
    },
    Ketu: {
      mantras: [
        'Om Ketave Namaha (108 times)',
        'Ganesha Mantra',
        'Om Sraam Sreem Sraum Sah Ketave Namaha'
      ],
      gemstone: {
        primary: 'Cat\'s Eye (Lehsunia)',
        weight: '5-7 carats',
        metal: 'Silver',
        finger: 'Middle finger',
        day: 'Thursday or Saturday'
      },
      donations: [
        'Multi-colored items, blankets on Thursdays',
        'Donate to spiritual seekers',
        'Feed dogs'
      ],
      deity: 'Lord Ganesha / Matsya',
      fasting: 'Thursdays',
      rituals: [
        'Ganesha puja for Ketu',
        'Worship at Ketu temples',
        'Offer multi-colored flowers'
      ],
      simple: [
        'Respect paternal grandparents',
        'Practice detachment',
        'Avoid materialism',
        'Feed stray dogs'
      ],
      spiritual: [
        'Develop spiritual detachment',
        'Practice meditation',
        'Seek moksha (liberation)',
        'Let go of past karma'
      ],
      activation: 'Activate Ketu: spiritual liberation, detachment, intuition, past-life wisdom, and moksha.'
    }
  };
  
  return remedies[planetName] || null;
}

// DEEP SECRETS ANALYSIS FUNCTION
function analyzeDeepSecrets(grahas, lagnaRashi, vimshottariDasha, yogas, advancedYogas, shadbala, bhavaAnalysis) {
  const secrets = [];
  
  // 1. HIDDEN POWERS DETECTION
  const hiddenPowers = [];
  
  // Check for occult/psychic abilities (8th house, Ketu, Moon combinations)
  const house8Planets = grahas.filter(g => g.bhava === 8);
  const ketu = grahas.find(g => g.name === 'Ketu');
  const moon = grahas.find(g => g.name === 'Moon');
  
  if (house8Planets.length > 0 || (ketu && ketu.dignity.includes('Exalted'))) {
    hiddenPowers.push({
      power: 'OCCULT & PSYCHIC ABILITIES',
      description: '8th house activation or strong Ketu indicates natural psychic sensitivity, ability to perceive hidden realms, and potential for tantric/occult mastery.',
      activation: 'Practice meditation on third eye, study occult sciences, work with dreams and intuition.'
    });
  }
  
  // Check for healing powers (Jupiter, Sun, 6th house)
  const jupiter = grahas.find(g => g.name === 'Jupiter');
  const sun = grahas.find(g => g.name === 'Sun');
  if ((jupiter && jupiter.dignity.includes('Exalted')) || (sun && sun.bhava === 6)) {
    hiddenPowers.push({
      power: 'HEALING ABILITIES',
      description: 'Strong Jupiter or Sun in 6th house grants natural healing energy. You can heal through touch, prayer, or energy work.',
      activation: 'Study Ayurveda, Reiki, Pranic healing. Practice hands-on healing with intention.'
    });
  }
  
  // Check for manifestation power (5th house, Jupiter-Venus)
  const house5Planets = grahas.filter(g => g.bhava === 5);
  const venus = grahas.find(g => g.name === 'Venus');
  if (house5Planets.length >= 2 || (jupiter && venus && Math.abs(RASHI_NAMES.indexOf(jupiter.rashi) - RASHI_NAMES.indexOf(venus.rashi)) <= 1)) {
    hiddenPowers.push({
      power: 'MANIFESTATION & CREATIVE POWER',
      description: '5th house strength or Jupiter-Venus combination grants exceptional manifestation abilities. Your thoughts and intentions materialize rapidly.',
      activation: 'Practice visualization, mantra sadhana, creative arts. Use Sankalpa (intention) consciously.'
    });
  }
  
  // Check for spiritual leadership (9th house, Jupiter in Kendra)
  if (jupiter && [1, 4, 7, 10].includes(jupiter.bhava)) {
    hiddenPowers.push({
      power: 'SPIRITUAL LEADERSHIP & TEACHING',
      description: 'Jupiter in Kendra indicates you are meant to be a spiritual teacher or guide. People naturally seek your wisdom.',
      activation: 'Study scriptures deeply, find your Guru, teach what you learn, establish dharmic authority.'
    });
  }
  
  // 2. KARMIC SECRETS (Rahu-Ketu axis, 12th house, Saturn)
  const karmicSecrets = [];
  
  const rahu = grahas.find(g => g.name === 'Rahu');
  const saturn = grahas.find(g => g.name === 'Saturn');
  
  if (rahu && ketu) {
    karmicSecrets.push({
      secret: 'RAHU-KETU AXIS REVEALS LIFE PURPOSE',
      rahuHouse: rahu.bhava,
      ketuHouse: ketu.bhava,
      truth: `Rahu in ${rahu.bhava}th house shows your worldly obsession and where you must grow. Ketu in ${ketu.bhava}th house shows your past-life mastery and what you must release. Your soul's journey is from ${ketu.bhava}th house comfort to ${rahu.bhava}th house growth.`,
      remedy: 'Balance both nodes: honor Ketu\'s wisdom while pursuing Rahu\'s growth. Don\'t cling to past, don\'t obsess over future.'
    });
  }
  
  if (saturn && saturn.dignity.includes('Debilitated')) {
    karmicSecrets.push({
      secret: 'HEAVY KARMIC DEBT (Debilitated Saturn)',
      truth: 'Debilitated Saturn indicates significant karmic debt from past lives. This life involves repaying through discipline, service, and suffering.',
      remedy: 'Accept karma gracefully. Serve the poor and elderly. Practice extreme discipline. Shani will test you until you learn humility and responsibility.'
    });
  }
  
  // 3. WEALTH SECRETS (2nd, 11th, Venus-Jupiter, Dhana yogas)
  const wealthSecrets = [];
  
  const dhanaYogas = advancedYogas.filter(y => y.type === 'Wealth');
  if (dhanaYogas.length > 0) {
    wealthSecrets.push({
      secret: `${dhanaYogas.length} DHANA YOGA(S) DETECTED`,
      truth: 'You have natural wealth-generating combinations. Money will come, but timing depends on Dasha periods.',
      activation: 'Activate during favorable Dasha. Invest in Jupiter/Venus periods. Practice Lakshmi puja on Fridays.'
    });
  }
  
  const lord2 = grahas.find(g => g.name === getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 1) % 12));
  const lord11 = grahas.find(g => g.name === getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 10) % 12));
  
  if (lord2 && lord2.dignity.includes('Debilitated')) {
    wealthSecrets.push({
      secret: 'WEALTH BLOCKAGE (2nd Lord Weak)',
      truth: '2nd house lord is weak. Wealth accumulation will be difficult. Money comes and goes. Family may not support financially.',
      remedy: 'STRONG REMEDY: Daily Lakshmi mantra (108 times), donate to Brahmins on Fridays, wear gemstone of 2nd lord after testing.'
    });
  }
  
  // 4. RELATIONSHIP SECRETS (7th house, Venus, Mars)
  const relationshipSecrets = [];
  
  const lord7 = grahas.find(g => g.name === getSignLord((RASHI_NAMES.indexOf(lagnaRashi) + 6) % 12));
  const mars = grahas.find(g => g.name === 'Mars');
  
  if (mars && [1, 4, 7, 8, 12].includes(mars.bhava)) {
    relationshipSecrets.push({
      secret: 'MANGAL DOSHA (Mars Affliction)',
      truth: `Mars in ${mars.bhava}th house creates Mangal Dosha. This causes delays, conflicts, or separation in marriage. Partner may be aggressive or relationship may face obstacles.`,
      remedy: 'CRITICAL REMEDY: Marry someone with same dosha, perform Mangal Shanti puja, worship Hanuman on Tuesdays, fast on Tuesdays, donate red items.'
    });
  }
  
  if (venus && venus.dignity.includes('Debilitated')) {
    relationshipSecrets.push({
      secret: 'VENUS DEBILITATION - RELATIONSHIP STRUGGLES',
      truth: 'Debilitated Venus causes difficulties in love, marriage, and pleasure. May attract wrong partners or face dissatisfaction.',
      remedy: 'STRONG REMEDY: Worship Goddess Lakshmi, wear Diamond/White Sapphire after testing, practice self-love, avoid lust, develop genuine devotion.'
    });
  }
  
  // 5. HEALTH SECRETS (6th, 8th, 12th houses, malefics)
  const healthSecrets = [];
  
  const house6Planets = grahas.filter(g => g.bhava === 6);
  const house12Planets = grahas.filter(g => g.bhava === 12);
  
  if (house6Planets.length >= 2) {
    healthSecrets.push({
      secret: 'CHRONIC HEALTH ISSUES (6th House Affliction)',
      truth: 'Multiple planets in 6th house indicate chronic diseases, enemies, and daily struggles. Health requires constant attention.',
      remedy: 'Daily yoga and pranayama, Ayurvedic lifestyle, worship Dhanvantari (God of medicine), Mahamrityunjaya mantra for longevity.'
    });
  }
  
  if (moon && moon.dignity.includes('Debilitated')) {
    healthSecrets.push({
      secret: 'MENTAL HEALTH VULNERABILITY (Debilitated Moon)',
      truth: 'Debilitated Moon causes emotional instability, anxiety, depression, and mental stress. Mind is your weakest point.',
      remedy: 'CRITICAL: Daily meditation, avoid intoxicants, wear Pearl after testing, worship Goddess Parvati, practice emotional regulation, seek therapy if needed.'
    });
  }
  
  // 6. DASHA TIMING SECRETS
  const dashaTiming = [];
  
  const currentDasha = vimshottariDasha.dashas[0];
  const currentDashaLord = grahas.find(g => g.name === currentDasha.planet);
  
  if (currentDashaLord) {
    const strength = shadbala.find(s => s.planet === currentDashaLord.name);
    dashaTiming.push({
      period: `CURRENT: ${currentDasha.planet} Mahadasha (${currentDasha.startDate} to ${currentDasha.endDate})`,
      truth: `You are in ${currentDasha.planet} period. This planet is ${currentDashaLord.dignity} in ${currentDashaLord.bhava}th house with strength ${strength?.strength || 'unknown'}.`,
      prediction: parseFloat(strength?.strength || 0) > 5 
        ? `FAVORABLE PERIOD: ${currentDasha.planet} is strong. Expect growth in ${currentDashaLord.bhava}th house matters. Use this time wisely.`
        : `CHALLENGING PERIOD: ${currentDasha.planet} is weak. Expect obstacles in ${currentDashaLord.bhava}th house matters. Focus on remedies.`,
      remedy: `Strengthen ${currentDasha.planet} through mantras, gemstone, and specific remedies. This period's results depend on your spiritual practice.`
    });
  }
  
  // 7. ULTIMATE TRUTH (Lagna lord, Atmakaraka, Moon)
  const ultimateTruth = [];
  
  const lagnaLord = grahas.find(g => g.name === getSignLord(RASHI_NAMES.indexOf(lagnaRashi)));
  
  if (lagnaLord) {
    ultimateTruth.push({
      truth: 'YOUR LIFE PURPOSE (Lagna Lord)',
      revelation: `Your Lagna lord ${lagnaLord.name} is in ${lagnaLord.bhava}th house (${lagnaLord.rashi}). This reveals your CORE LIFE PURPOSE. The ${lagnaLord.bhava}th house themes are your dharma. ${lagnaLord.dignity}. Your entire life revolves around mastering ${lagnaLord.bhava}th house significations.`,
      action: `Focus all energy on ${lagnaLord.bhava}th house matters. Strengthen ${lagnaLord.name} through remedies. Your success depends on this planet's strength.`
    });
  }
  
  // Compile all secrets
  return {
    hiddenPowers,
    karmicSecrets,
    wealthSecrets,
    relationshipSecrets,
    healthSecrets,
    dashaTiming,
    ultimateTruth,
    finalWarning: '⚠️ THESE ARE DEEP TRUTHS. Accept them. Work on remedies. Karma is real. Free will exists within karmic framework. Your spiritual practice determines how these energies manifest. Consult a qualified Jyotishi for personalized timing and remedial prioritization.'
  };
}

app.post('/api/calculate-chart', (req, res) => {
  try {
    const { year, month, day, hour, minute, latitude, longitude, timezone } = req.body;
    
    const jd = calculateJulianDay(year, month, day, hour, minute, timezone);
    const lagnaLongitude = getLagnaPosition(jd, latitude, longitude);
    const lagnaRashi = getRashi(lagnaLongitude);
    const lagnaDegree = getDegreeInSign(lagnaLongitude);
    const lagnaNavamsa = getNavamsa(lagnaLongitude);
    const lagnaLord = getSignLord(lagnaRashi);
    
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
    
    const grahas = PLANETS.map(planet => {
      const longitude = getPlanetPosition(planet.id, jd);
      const rashi = getRashi(longitude);
      const degree = getDegreeInSign(longitude);
      const navamsa = getNavamsa(longitude);
      const dashamsa = getDashamsa(longitude);
      const bhava = getBhava(longitude, lagnaLongitude);
      const dignity = getDignity(planet.name, rashi);
      const vargas = calculateAllVargas(longitude);
      
      const speed = swisseph.swe_calc_ut(jd, planet.id, swisseph.SEFLG_SIDEREAL).longitudeSpeed;
      const isRetrograde = speed < 0 && planet.name !== 'Rahu' && planet.name !== 'Ketu';
      
      const remedies = getRemedies(planet.name);
      
      return {
        name: planet.name,
        rashi: RASHI_NAMES[rashi],
        degree,
        navamsa,
        dashamsa,
        bhava,
        dignity,
        isRetrograde,
        vargas,
        remedies
      };
    });
    
    const moonLongitude = getPlanetPosition(swisseph.SE_MOON, jd);
    const birthDate = new Date(year, month - 1, day);
    const vimshottariDasha = calculateVimshottariDasha(moonLongitude, birthDate);
    
    const yogas = detectYogas(grahas, RASHI_NAMES[lagnaRashi]);
    const advancedYogas = detectAdvancedYogas(grahas, RASHI_NAMES[lagnaRashi]);
    const shadbala = calculateShadbala(grahas);
    const ashtakavarga = calculateAshtakavarga();
    const bhavaAnalysis = getBhavaAnalysis(RASHI_NAMES[lagnaRashi], grahas);
    
    // Current transits
    const currentJD = calculateJulianDay(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 12, 0, 0);
    const currentGrahas = PLANETS.map(planet => {
      const longitude = getPlanetPosition(planet.id, currentJD);
      const rashi = getRashi(longitude);
      const degree = getDegreeInSign(longitude);
      return {
        name: planet.name,
        rashi: RASHI_NAMES[rashi],
        degree
      };
    });
    const transits = calculateTransits(currentGrahas, grahas);
    
    // Varshaphala
    const varshaphala = calculateVarshaphala(year, month, day, new Date().getFullYear(), jd, latitude, longitude);
    
    // Argala & Arudha
    const { argala, arudha } = calculateArgalaArudha(grahas, lagnaLongitude);
    
    // DEEP SECRETS ANALYSIS
    const deepSecrets = analyzeDeepSecrets(grahas, RASHI_NAMES[lagnaRashi], vimshottariDasha, yogas, advancedYogas, shadbala, bhavaAnalysis);
    
    res.json({
      lagna: {
        rashi: RASHI_NAMES[lagnaRashi],
        degree: lagnaDegree,
        navamsa: lagnaNavamsa,
        lord: lagnaLord
      },
      ayanamsa: ayanamsa.toFixed(4),
      grahas,
      vimshottariDasha,
      yogas,
      advancedYogas,
      shadbala,
      ashtakavarga,
      bhavaAnalysis,
      transits,
      varshaphala,
      argala,
      arudha,
      deepSecrets, // NEW: Deep secrets analysis
      metadata: {
        date: `${year}-${month}-${day}`,
        time: `${hour}:${minute}`,
        location: `${latitude}, ${longitude}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Classical Jyotisha server running on http://localhost:${PORT}`);
});
