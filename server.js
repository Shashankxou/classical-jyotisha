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

// Bhava significations (BPHS Chapters 11-23)
const BHAVA_SIGNIFICATIONS = {
  1: { name: 'Lagna (Tanu)', significations: ['Self', 'Body', 'Vitality', 'Personality', 'Head', 'Overall health', 'Life path', 'Appearance'], karaka: 'Sun' },
  2: { name: 'Dhana', significations: ['Wealth', 'Speech', 'Family', 'Food', 'Face', 'Right eye', 'Early education', 'Accumulated assets'], karaka: 'Jupiter' },
  3: { name: 'Sahaja', significations: ['Courage', 'Siblings', 'Short journeys', 'Communication', 'Skills', 'Hands', 'Efforts', 'Neighbors'], karaka: 'Mars' },
  4: { name: 'Sukha', significations: ['Mother', 'Property', 'Vehicles', 'Education', 'Happiness', 'Heart', 'Home', 'Comforts'], karaka: 'Moon' },
  5: { name: 'Putra', significations: ['Children', 'Intellect', 'Creativity', 'Romance', 'Speculation', 'Mantras', 'Past life merit', 'Stomach'], karaka: 'Jupiter' },
  6: { name: 'Ripu (Shatru)', significations: ['Enemies', 'Diseases', 'Debts', 'Service', 'Obstacles', 'Maternal uncle', 'Litigation', 'Daily work'], karaka: 'Mars/Saturn' },
  7: { name: 'Kalatra', significations: ['Spouse', 'Partnership', 'Marriage', 'Business', 'Sexual organs', 'Trade', 'Public relations', 'Death'], karaka: 'Venus' },
  8: { name: 'Mrityu (Randhra)', significations: ['Longevity', 'Death', 'Occult', 'Transformation', 'Hidden wealth', 'Inheritance', 'Chronic diseases', 'Mysteries'], karaka: 'Saturn' },
  9: { name: 'Dharma (Bhagya)', significations: ['Fortune', 'Father', 'Guru', 'Religion', 'Long journeys', 'Higher education', 'Dharma', 'Thighs'], karaka: 'Jupiter' },
  10: { name: 'Karma', significations: ['Career', 'Status', 'Authority', 'Government', 'Profession', 'Knees', 'Public image', 'Actions'], karaka: 'Sun/Mercury/Jupiter' },
  11: { name: 'Labha', significations: ['Gains', 'Income', 'Friends', 'Elder siblings', 'Fulfillment', 'Left ear', 'Aspirations', 'Networks'], karaka: 'Jupiter' },
  12: { name: 'Vyaya', significations: ['Losses', 'Expenses', 'Moksha', 'Foreign lands', 'Isolation', 'Bed pleasures', 'Left eye', 'Spirituality'], karaka: 'Saturn' }
};

// Planetary remedies database (BPHS + Lal Kitab + Traditional)
const PLANETARY_REMEDIES = {
  0: { // Sun
    mantras: ['Om Suryaya Namaha (108 times daily)', 'Aditya Hridaya Stotra (Sundays)', 'Gayatri Mantra (sunrise)'],
    gemstone: { primary: 'Ruby (Manik)', weight: '3-5 carats', metal: 'Gold/Copper', finger: 'Ring finger', day: 'Sunday sunrise' },
    donations: ['Wheat', 'Jaggery', 'Red cloth', 'Copper', 'Ruby (if affordable)'],
    fasting: 'Sundays (sunrise to sunset)',
    deity: 'Surya Bhagavan',
    rituals: ['Surya Namaskar (12 rounds daily)', 'Offer water to Sun at sunrise', 'Light ghee lamp to Sun'],
    simple: ['Eat jaggery before important work', 'Throw copper coin in flowing river', 'Spend time in sunlight', 'Respect father and authority'],
    spiritual: ['Practice Surya Bhedana Pranayama', 'Meditate facing east at sunrise', 'Chant Gayatri 108 times'],
    activation: 'Wake before sunrise, offer Arghya to Sun, practice leadership and confidence'
  },
  1: { // Moon
    mantras: ['Om Chandraya Namaha (108 times)', 'Chandra Gayatri', 'Om Shram Shreem Shraum Sah Chandraya Namaha'],
    gemstone: { primary: 'Pearl (Moti)', weight: '5-7 carats', metal: 'Silver', finger: 'Little finger', day: 'Monday evening' },
    donations: ['White rice', 'Milk', 'Silver', 'White cloth', 'Camphor'],
    fasting: 'Mondays',
    deity: 'Chandra/Shiva',
    rituals: ['Worship Shiva on Mondays', 'Offer milk to Shiva Linga', 'Rudra Abhishek'],
    simple: ['Drink water from silver vessel', 'Respect mother', 'Feed white cows', 'Keep water pot at bedside'],
    spiritual: ['Practice Chandra Bhedana Pranayama', 'Meditate on full moon nights', 'Develop emotional stability'],
    activation: 'Connect with mother, practice gratitude, nurture others, moon gazing meditation'
  },
  2: { // Mars
    mantras: ['Om Mangalaya Namaha (108 times)', 'Hanuman Chalisa (Tuesdays)', 'Kartikeya Mantras'],
    gemstone: { primary: 'Red Coral (Moonga)', weight: '5-8 carats', metal: 'Gold/Copper', finger: 'Ring finger', day: 'Tuesday' },
    donations: ['Red lentils', 'Jaggery', 'Red cloth', 'Copper utensils', 'Wheat bread'],
    fasting: 'Tuesdays',
    deity: 'Hanuman/Kartikeya',
    rituals: ['Hanuman puja on Tuesdays', 'Visit Hanuman temple', 'Recite Hanuman Chalisa'],
    simple: ['Feed red lentils to birds', 'Respect brothers', 'Exercise under Banyan tree', 'Control anger'],
    spiritual: ['Practice martial arts or yoga', 'Develop courage through challenges', 'Channel aggression constructively'],
    activation: 'Physical exercise, competitive sports, assertiveness training, protect the weak'
  },
  3: { // Mercury
    mantras: ['Om Budhaya Namaha (108 times)', 'Vishnu Sahasranama', 'Budha Gayatri'],
    gemstone: { primary: 'Emerald (Panna)', weight: '3-6 carats', metal: 'Gold', finger: 'Little finger', day: 'Wednesday' },
    donations: ['Green vegetables', 'Green cloth', 'Books', 'Pens', 'Educational materials'],
    fasting: 'Wednesdays',
    deity: 'Vishnu/Ganesha',
    rituals: ['Vishnu puja', 'Read scriptures', 'Ganesha worship for intelligence'],
    simple: ['Feed green fodder to cows', 'Donate to students', 'Clean teeth with alum', 'Respect teachers'],
    spiritual: ['Study sacred texts', 'Practice Bhramari Pranayama', 'Develop discrimination (Viveka)'],
    activation: 'Learn new skills, write daily, communicate clearly, teach others'
  },
  4: { // Jupiter
    mantras: ['Om Gurave Namaha (108 times)', 'Guru Gayatri', 'Brihaspati Stotra'],
    gemstone: { primary: 'Yellow Sapphire (Pukhraj)', weight: '3-5 carats', metal: 'Gold', finger: 'Index finger', day: 'Thursday' },
    donations: ['Yellow cloth', 'Turmeric', 'Gold', 'Books', 'Saffron', 'Ghee'],
    fasting: 'Thursdays',
    deity: 'Brihaspati/Vishnu',
    rituals: ['Guru puja on Thursdays', 'Brihaspati Vrat', 'Feed Brahmins'],
    simple: ['Wear gold', 'Apply saffron tilak', 'Respect teachers and elders', 'Fill roadside pits'],
    spiritual: ['Study philosophy', 'Seek spiritual teacher', 'Practice gratitude', 'Teach dharma'],
    activation: 'Serve guru, study scriptures, practice generosity, mentor others'
  },
  5: { // Venus
    mantras: ['Om Shukraya Namaha (108 times)', 'Shukra Gayatri', 'Lakshmi Mantras'],
    gemstone: { primary: 'Diamond (Heera)', weight: '1-2 carats', metal: 'Silver/Platinum', finger: 'Middle finger', day: 'Friday' },
    donations: ['White cloth', 'Sugar', 'Rice', 'Perfume', 'Silver'],
    fasting: 'Fridays',
    deity: 'Lakshmi/Shukracharya',
    rituals: ['Lakshmi puja on Fridays', 'Offer white flowers', 'Durga worship'],
    simple: ['Use perfume on Fridays', 'Respect women', 'Maintain cleanliness', 'Donate to girls'],
    spiritual: ['Develop aesthetic sense', 'Practice bhakti yoga', 'Cultivate beauty and harmony'],
    activation: 'Appreciate art, maintain relationships, practice self-care, create beauty'
  },
  6: { // Saturn
    mantras: ['Om Shanaye Namaha (108 times)', 'Shani Stotra', 'Hanuman Chalisa (Saturdays)'],
    gemstone: { primary: 'Blue Sapphire (Neelam)', weight: '5-7 carats', metal: 'Silver/Iron', finger: 'Middle finger', day: 'Saturday' },
    donations: ['Black sesame', 'Iron', 'Black cloth', 'Mustard oil', 'Black urad dal'],
    fasting: 'Saturdays',
    deity: 'Shani/Hanuman',
    rituals: ['Shani puja on Saturdays', 'Light mustard oil lamp', 'Visit Shani temple'],
    simple: ['Feed crows and dogs', 'Serve the poor', 'Pour mustard oil on ground', 'Respect servants'],
    spiritual: ['Practice discipline', 'Serve the suffering', 'Develop patience', 'Accept karma'],
    activation: 'Hard work, discipline, serve elderly, practice detachment, face fears'
  },
  7: { // Rahu
    mantras: ['Om Rahave Namaha (108 times)', 'Rahu Gayatri', 'Durga Mantras'],
    gemstone: { primary: 'Hessonite (Gomed)', weight: '5-8 carats', metal: 'Silver', finger: 'Middle finger', day: 'Saturday' },
    donations: ['Black blanket', 'Coconut', 'Mustard', 'Blue cloth', 'Iron'],
    fasting: 'Saturdays',
    deity: 'Durga/Kali',
    rituals: ['Durga puja', 'Kali worship', 'Sarpa puja (snake worship)'],
    simple: ['Keep fennel under pillow', 'Throw coal in river', 'Feed dogs', 'Donate to sweepers'],
    spiritual: ['Practice meditation to control mind', 'Transcend illusions', 'Develop intuition'],
    activation: 'Face fears, break patterns, embrace change, develop psychic abilities'
  },
  8: { // Ketu
    mantras: ['Om Ketave Namaha (108 times)', 'Ketu Gayatri', 'Ganesha Mantras'],
    gemstone: { primary: 'Cat\'s Eye (Lehsunia)', weight: '5-7 carats', metal: 'Silver', finger: 'Middle finger', day: 'Thursday' },
    donations: ['Black/white dog', 'Sesame', 'Blanket', 'Flag', 'Spiritual books'],
    fasting: 'Thursdays',
    deity: 'Ganesha/Kartikeya',
    rituals: ['Ganesha puja', 'Sarpa puja', 'Ancestor worship'],
    simple: ['Feed dogs (especially spotted)', 'Donate 100 chapatis to dogs', 'Keep a dog'],
    spiritual: ['Practice moksha sadhana', 'Develop detachment', 'Past life regression', 'Spiritual liberation'],
    activation: 'Meditation, solitude, spiritual practices, let go of attachments, serve saints'
  }
};

// Nakshatra data
const NAKSHATRAS = [
  { name: 'Ashwini', lord: 7, start: 0 }, { name: 'Bharani', lord: 5, start: 13.333333 },
  { name: 'Krittika', lord: 0, start: 26.666667 }, { name: 'Rohini', lord: 1, start: 40 },
  { name: 'Mrigashira', lord: 2, start: 53.333333 }, { name: 'Ardra', lord: 7, start: 66.666667 },
  { name: 'Punarvasu', lord: 4, start: 80 }, { name: 'Pushya', lord: 6, start: 93.333333 },
  { name: 'Ashlesha', lord: 3, start: 106.666667 }, { name: 'Magha', lord: 7, start: 120 },
  { name: 'Purva Phalguni', lord: 5, start: 133.333333 }, { name: 'Uttara Phalguni', lord: 0, start: 146.666667 },
  { name: 'Hasta', lord: 1, start: 160 }, { name: 'Chitra', lord: 2, start: 173.333333 },
  { name: 'Swati', lord: 7, start: 186.666667 }, { name: 'Vishakha', lord: 4, start: 200 },
  { name: 'Anuradha', lord: 6, start: 213.333333 }, { name: 'Jyeshta', lord: 3, start: 226.666667 },
  { name: 'Mula', lord: 7, start: 240 }, { name: 'Purva Ashadha', lord: 5, start: 253.333333 },
  { name: 'Uttara Ashadha', lord: 0, start: 266.666667 }, { name: 'Shravana', lord: 1, start: 280 },
  { name: 'Dhanishta', lord: 2, start: 293.333333 }, { name: 'Shatabhisha', lord: 7, start: 306.666667 },
  { name: 'Purva Bhadrapada', lord: 4, start: 320 }, { name: 'Uttara Bhadrapada', lord: 6, start: 333.333333 },
  { name: 'Revati', lord: 3, start: 346.666667 }
];

const DASHA_PERIODS = [6, 10, 7, 18, 16, 20, 19, 7, 17]; // Corrected: Mercury=17, Ketu=7
const RASHI_LORDS = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4];
const NATURAL_BENEFICS = [1, 3, 4, 5];
const NATURAL_MALEFICS = [0, 2, 6];
const EXALTATION = { 0: 0, 1: 1, 2: 9, 3: 5, 4: 3, 5: 11, 6: 6 };
const DEBILITATION = { 0: 6, 1: 7, 2: 3, 3: 11, 4: 9, 5: 5, 6: 0 };
const OWN_SIGNS = { 0: [4], 1: [3], 2: [0, 7], 3: [2, 5], 4: [8, 11], 5: [1, 6], 6: [9, 10] };
const MOOLATRIKONA = { 0: 4, 1: 1, 2: 0, 3: 5, 4: 8, 5: 6, 6: 10 };
const FRIENDS = { 0: [1, 2, 4], 1: [0, 3], 2: [0, 1, 4], 3: [0, 5], 4: [0, 1, 2], 5: [3, 6], 6: [3, 5] };
const ENEMIES = { 0: [5, 6], 1: [], 2: [3], 3: [1], 4: [3, 5], 5: [0, 1], 6: [0, 1, 2] };

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

function getGrahaDignity(grahaIndex, rashi) {
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

// All 16 Vargas (Shodasha Varga) - BPHS Chapter 6
function calculateVarga(longitude, divisor, oddEven = 'standard') {
  const rashi = getRashi(longitude);
  const degree = getDegreeInRashi(longitude);
  const part = Math.floor(degree / (30 / divisor));
  const isOdd = rashi % 2 === 0;
  
  if (oddEven === 'standard') {
    return isOdd ? (rashi + part) % 12 : ((rashi + 8) + part) % 12;
  } else if (oddEven === 'movable') {
    const movable = [0, 3, 6, 9];
    if (movable.includes(rashi)) return (rashi + part) % 12;
    const fixed = [1, 4, 7, 10];
    if (fixed.includes(rashi)) return ((rashi + 4) + part) % 12;
    return ((rashi + 8) + part) % 12;
  }
  return (rashi + part) % 12;
}

function calculateAllVargas(longitude) {
  return {
    D1: getRashi(longitude),  // Rashi
    D2: calculateVarga(longitude, 2),  // Hora
    D3: calculateVarga(longitude, 3),  // Drekkana
    D4: calculateVarga(longitude, 4),  // Chaturthamsa
    D5: calculateVarga(longitude, 5),  // Panchamsa
    D6: calculateVarga(longitude, 6),  // Shashthamsa
    D7: calculateVarga(longitude, 7),  // Saptamsa
    D8: calculateVarga(longitude, 8),  // Ashtamsa
    D9: calculateVarga(longitude, 9),  // Navamsa
    D10: calculateVarga(longitude, 10), // Dashamsa
    D11: calculateVarga(longitude, 11), // Rudramsa
    D12: calculateVarga(longitude, 12), // Dwadasamsa
    D16: calculateVarga(longitude, 16), // Shodasamsa
    D20: calculateVarga(longitude, 20), // Vimsamsa
    D24: calculateVarga(longitude, 24), // Chaturvimsamsa
    D27: calculateVarga(longitude, 27), // Saptavimsamsa
    D30: calculateVarga(longitude, 30), // Trimsamsa
    D40: calculateVarga(longitude, 40), // Khavedamsa
    D45: calculateVarga(longitude, 45), // Akshavedamsa
    D60: calculateVarga(longitude, 60)  // Shashtiamsa
  };
}

// Antardasha and Pratyantardasha calculation
function calculateSubPeriods(mahadashaLord, mahadashaStart, mahadashaYears) {
  const antardashas = [];
  const pratyantardashas = [];
  let currentDate = new Date(mahadashaStart);
  
  // Antardasha (sub-periods within Mahadasha)
  for (let i = 0; i < 9; i++) {
    const antarLord = (mahadashaLord + i) % 9;
    const antarYears = (DASHA_PERIODS[mahadashaLord] * DASHA_PERIODS[antarLord]) / 120;
    
    const endDate = new Date(currentDate);
    endDate.setFullYear(endDate.getFullYear() + Math.floor(antarYears));
    endDate.setMonth(endDate.getMonth() + Math.round((antarYears % 1) * 12));
    
    // Pratyantardasha (sub-sub-periods within Antardasha)
    const pratyantars = [];
    let pratyantarDate = new Date(currentDate);
    
    for (let j = 0; j < 9; j++) {
      const pratyantarLord = (antarLord + j) % 9;
      const pratyantarYears = (DASHA_PERIODS[antarLord] * DASHA_PERIODS[pratyantarLord]) / 120;
      
      const pratyantarEnd = new Date(pratyantarDate);
      pratyantarEnd.setFullYear(pratyantarEnd.getFullYear() + Math.floor(pratyantarYears));
      pratyantarEnd.setMonth(pratyantarEnd.getMonth() + Math.round((pratyantarYears % 1) * 12));
      
      pratyantars.push({
        lord: GRAHA_NAMES[pratyantarLord],
        startDate: pratyantarDate.toISOString().split('T')[0],
        endDate: pratyantarEnd.toISOString().split('T')[0],
        years: pratyantarYears.toFixed(4)
      });
      
      pratyantarDate = pratyantarEnd;
    }
    
    antardashas.push({
      lord: GRAHA_NAMES[antarLord],
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      years: antarYears.toFixed(3),
      pratyantardashas: pratyantars
    });
    
    currentDate = endDate;
  }
  
  return antardashas;
}

function calculateVimshottariDasha(moonLongitude, birthDate) {
  const nakshatra = NAKSHATRAS.find((n, i) => {
    const nextStart = i < 26 ? NAKSHATRAS[i + 1].start : 360;
    return moonLongitude >= n.start && moonLongitude < nextStart;
  });
  
  const lordIndex = nakshatra.lord;
  const progressInNakshatra = moonLongitude - nakshatra.start;
  const balanceRatio = (13.333333 - progressInNakshatra) / 13.333333;
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
    
    // Calculate Antardashas for this Mahadasha
    const antardashas = calculateSubPeriods(planetIndex, currentDate.toISOString().split('T')[0], actualYears);
    
    dashas.push({
      planet: GRAHA_NAMES[planetIndex],
      startDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      years: actualYears.toFixed(2),
      antardashas: antardashas
    });
    
    currentDate = endDate;
  }
  
  return { nakshatra: nakshatra.name, dashas };
}

// Advanced Yogas Detection
function detectAdvancedYogas(grahas, lagnaRashi, lagnaLord) {
  const yogas = [];
  
  // DHANA YOGAS (Wealth)
  // 1. Lord of 2nd and 11th in mutual kendras
  const lord2 = RASHI_LORDS[(lagnaRashi + 1) % 12];
  const lord11 = RASHI_LORDS[(lagnaRashi + 10) % 12];
  const diff2_11 = Math.abs(grahas[lord2].bhavaIndex - grahas[lord11].bhavaIndex);
  if ([1, 4, 7, 10].includes(diff2_11)) {
    yogas.push({ name: 'Dhana Yoga (Type 1)', type: 'Wealth', description: 'Lords of 2nd and 11th in mutual Kendras - Strong wealth accumulation' });
  }
  
  // 2. Jupiter-Venus conjunction in Kendra
  const jupiterBhava = grahas[4].bhavaIndex;
  const venusBhava = grahas[5].bhavaIndex;
  if (jupiterBhava === venusBhava && [1, 4, 7, 10].includes(jupiterBhava)) {
    yogas.push({ name: 'Dhana Yoga (Jupiter-Venus)', type: 'Wealth', description: 'Jupiter and Venus conjunct in Kendra - Prosperity and luxury' });
  }
  
  // 3. Lord of 9th in 10th or vice versa
  const lord9 = RASHI_LORDS[(lagnaRashi + 8) % 12];
  const lord10 = RASHI_LORDS[(lagnaRashi + 9) % 12];
  if (grahas[lord9].bhavaIndex === 10 || grahas[lord10].bhavaIndex === 9) {
    yogas.push({ name: 'Dharma-Karma Adhipati Yoga', type: 'Wealth/Status', description: 'Lords of 9th and 10th exchange - Fortune through career' });
  }
  
  // RAJA YOGAS (Power/Status)
  // 1. Kendra-Trikona lords in conjunction
  const kendraLords = [0, 3, 6, 9].map(h => RASHI_LORDS[(lagnaRashi + h) % 12]);
  const trikonaLords = [0, 4, 8].map(h => RASHI_LORDS[(lagnaRashi + h) % 12]);
  
  kendraLords.forEach(kl => {
    trikonaLords.forEach(tl => {
      if (kl !== tl && grahas[kl].bhavaIndex === grahas[tl].bhavaIndex) {
        yogas.push({ name: 'Raja Yoga (Kendra-Trikona)', type: 'Power', description: `${GRAHA_NAMES[kl]} and ${GRAHA_NAMES[tl]} conjunct - Royal combination` });
      }
    });
  });
  
  // 2. Exalted planets in Kendras
  grahas.forEach((g, i) => {
    if (g.dignity.includes('Exalted') && [1, 4, 7, 10].includes(g.bhavaIndex)) {
      yogas.push({ name: 'Raja Yoga (Exalted in Kendra)', type: 'Power', description: `${g.name} exalted in ${g.bhava} - High status and authority` });
    }
  });
  
  // DARIDRA YOGAS (Poverty)
  // 1. Lord of Lagna in 6th, 8th, or 12th
  if ([6, 8, 12].includes(lagnaLord.bhavaIndex)) {
    yogas.push({ name: 'Daridra Yoga (Type 1)', type: 'Poverty', description: 'Lagna lord in Dusthana - Financial struggles' });
  }
  
  // 2. Lords of 2nd and 11th in 6th, 8th, or 12th
  if ([6, 8, 12].includes(grahas[lord2].bhavaIndex) && [6, 8, 12].includes(grahas[lord11].bhavaIndex)) {
    yogas.push({ name: 'Daridra Yoga (Type 2)', type: 'Poverty', description: 'Wealth lords in Dusthanas - Difficulty accumulating wealth' });
  }
  
  // ARISHTA YOGAS (Misfortune)
  // 1. Malefics in Kendras without benefic aspect
  const malefics = [0, 2, 6, 7, 8];
  malefics.forEach(mi => {
    if ([1, 4, 7, 10].includes(grahas[mi].bhavaIndex)) {
      yogas.push({ name: 'Arishta Yoga (Malefic in Kendra)', type: 'Misfortune', description: `${GRAHA_NAMES[mi]} in ${grahas[mi].bhava} - Obstacles and challenges` });
    }
  });
  
  // 2. Moon in 6th, 8th, or 12th with malefic aspect
  const moonBhava = grahas[1].bhavaIndex;
  if ([6, 8, 12].includes(moonBhava)) {
    yogas.push({ name: 'Arishta Yoga (Moon in Dusthana)', type: 'Misfortune', description: 'Moon in malefic house - Mental stress and health issues' });
  }
  
  return yogas;
}

// Transit System (Gochara)
function calculateTransits(currentJD, birthGrahas, ayanamsa) {
  const transits = [];
  
  for (let i = 0; i < 7; i++) { // Exclude Rahu/Ketu for now
    const currentPos = getPlanetPosition(currentJD, Object.values(GRAHAS)[i]);
    const siderealLong = toSidereal(currentPos.longitude, ayanamsa);
    const currentRashi = getRashi(siderealLong);
    const birthRashi = birthGrahas[i].rashiIndex;
    
    const diff = (currentRashi - birthRashi + 12) % 12 + 1;
    
    transits.push({
      planet: GRAHA_NAMES[i],
      currentRashi: RASHI_NAMES[currentRashi],
      birthRashi: RASHI_NAMES[birthRashi],
      houseFromBirth: diff,
      effect: getTransitEffect(i, diff)
    });
  }
  
  return transits;
}

function getTransitEffect(planetIndex, house) {
  const effects = {
    0: { // Sun
      1: 'Health issues, ego conflicts', 3: 'Courage, new ventures', 6: 'Victory over enemies',
      10: 'Career advancement', 11: 'Gains and recognition'
    },
    1: { // Moon
      1: 'Emotional turbulence', 3: 'Mental peace', 6: 'Health concerns',
      10: 'Professional success', 11: 'Financial gains'
    },
    4: { // Jupiter
      1: 'Wisdom, spiritual growth', 2: 'Wealth increase', 5: 'Children, creativity',
      7: 'Marriage prospects', 9: 'Fortune, travel', 11: 'Major gains'
    },
    6: { // Saturn
      1: 'Sade Sati begins - challenges', 3: 'Hard work pays off', 6: 'Victory through perseverance',
      10: 'Career responsibilities', 11: 'Delayed but sure gains'
    }
  };
  
  return effects[planetIndex]?.[house] || 'Neutral';
}

// Varshaphala (Annual Chart)
function calculateVarshaphala(birthJD, birthYear, currentYear, latitude, longitude, ayanamsa) {
  // Calculate Solar Return (when Sun returns to birth position)
  const birthSunPos = getPlanetPosition(birthJD, GRAHAS.SUN);
  const birthSunSidereal = toSidereal(birthSunPos.longitude, ayanamsa);
  
  // Approximate JD for current year's solar return
  const yearDiff = currentYear - birthYear;
  const approxJD = birthJD + (yearDiff * 365.25);
  
  // Find exact solar return
  let solarReturnJD = approxJD;
  for (let i = 0; i < 10; i++) {
    const currentSunPos = getPlanetPosition(solarReturnJD, GRAHAS.SUN);
    const currentSunSidereal = toSidereal(currentSunPos.longitude, ayanamsa);
    const diff = birthSunSidereal - currentSunSidereal;
    if (Math.abs(diff) < 0.01) break;
    solarReturnJD += diff / 1.0; // Adjust
  }
  
  const varshaphalLagna = toSidereal(getAscendant(solarReturnJD, latitude, longitude), ayanamsa);
  
  return {
    year: currentYear,
    solarReturnDate: new Date((solarReturnJD - 2440587.5) * 86400000).toISOString().split('T')[0],
    varshaphalLagna: RASHI_NAMES[getRashi(varshaphalLagna)],
    interpretation: 'Annual chart for year-specific predictions'
  };
}

// Argala (Intervention) and Arudha (Perceived Reality)
function calculateArgalaArudha(grahas, lagnaLongitude) {
  const argala = [];
  const arudha = [];
  
  // Argala: Planets in 2nd, 4th, 11th from a house cause intervention
  grahas.forEach((g, i) => {
    const interventionHouses = [2, 4, 11];
    interventionHouses.forEach(offset => {
      const targetHouse = (g.bhavaIndex + offset - 1) % 12 + 1;
      argala.push({
        planet: g.name,
        intervenes: `House ${targetHouse}`,
        type: offset === 11 ? 'Strong' : 'Moderate'
      });
    });
  });
  
  // Arudha Lagna (AL): Perceived self
  const lagnaLordIndex = RASHI_LORDS[getRashi(lagnaLongitude)];
  const lagnaLordBhava = grahas[lagnaLordIndex].bhavaIndex;
  const arudhaLagna = (lagnaLordBhava + lagnaLordBhava - 1) % 12 + 1;
  
  arudha.push({
    type: 'Arudha Lagna (AL)',
    house: arudhaLagna,
    meaning: 'How the world perceives you'
  });
  
  return { argala: argala.slice(0, 10), arudha }; // Limit argala output
}

function checkNeechaBhanga(grahaIndex, rashi, grahas, lagnaRashi) {
  if (DEBILITATION[grahaIndex] !== rashi) return null;
  
  const cancellations = [];
  const debilLord = RASHI_LORDS[rashi];
  const debilLordGraha = grahas[debilLord];
  if ([1, 4, 7, 10].includes(debilLordGraha.bhavaIndex)) {
    cancellations.push('Lord of debilitation sign in Kendra from Lagna');
  }
  
  const exaltLord = Object.keys(EXALTATION).find(k => EXALTATION[k] === rashi);
  if (exaltLord) {
    const exaltLordGraha = grahas[parseInt(exaltLord)];
    if (exaltLordGraha.dignity.includes('Exalted')) {
      cancellations.push('Exalted lord of debilitation sign');
    }
  }
  
  const moonRashi = grahas[1].rashiIndex;
  const diff = (rashi - moonRashi + 12) % 12;
  if ([0, 3, 6, 9].includes(diff)) {
    cancellations.push('Debilitated planet in Kendra from Moon');
  }
  
  return cancellations.length > 0 ? cancellations : null;
}

function detectYogas(grahas, lagnaRashi) {
  const yogas = [];
  
  const mahapurushaGrahas = [2, 3, 4, 5, 6];
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

function calculateShadbala(graha, grahaIndex, jd, latitude) {
  let total = 0;
  if (graha.dignity.includes('Exalted')) total += 60;
  else if (graha.dignity.includes('Own Sign')) total += 45;
  else if (graha.dignity.includes('Moolatrikona')) total += 50;
  else if (graha.dignity.includes('Friend')) total += 30;
  else if (graha.dignity.includes('Enemy')) total += 15;
  else total += 22.5;
  
  const dikBalaHouses = { 0: 10, 1: 4, 2: 10, 3: 1, 4: 1, 5: 4, 6: 7 };
  if (dikBalaHouses[grahaIndex] === graha.bhavaIndex) total += 60;
  
  const isDaytime = graha.bhavaIndex <= 6;
  if ([0, 2, 4].includes(grahaIndex) && isDaytime) total += 30;
  if ([1, 5, 6].includes(grahaIndex) && !isDaytime) total += 30;
  
  if (graha.speed > 0) total += 30;
  else if (graha.speed < 0) total += 60;
  
  const naisargika = [60, 51.43, 17.14, 25.70, 34.28, 42.85, 8.57];
  total += naisargika[grahaIndex] || 0;
  
  return (total / 60).toFixed(2);
}

function calculateAshtakavarga(grahas) {
  const ashtakavarga = Array(12).fill(0);
  grahas.forEach((graha, gi) => {
    if (gi >= 7) return;
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

// Generate detailed bhava analysis
function generateBhavaAnalysis(bhavaIndex, bhavaLord, grahasInBhava, lagnaLord) {
  const bhava = BHAVA_SIGNIFICATIONS[bhavaIndex];
  return {
    bhavaNumber: bhavaIndex,
    bhavaName: bhava.name,
    significations: bhava.significations,
    karaka: bhava.karaka,
    lord: bhavaLord,
    grahasPresent: grahasInBhava,
    strength: grahasInBhava.length > 0 ? 'Occupied' : 'Empty'
  };
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
      const dignity = getGrahaDignity(i, rashi);
      const drishti = getGrahaDrishti(i);
      const allVargas = calculateAllVargas(longitude);
      
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
        vargas: allVargas,
        navamsa: RASHI_NAMES[allVargas.D9],
        dashamsa: RASHI_NAMES[allVargas.D10],
        speed: speed.toFixed(4),
        isRetrograde: speed < 0,
        remedies: PLANETARY_REMEDIES[i]
      });
    }
    
    const lagnaLordIndex = RASHI_LORDS[lagnaRashi];
    const lagnaLord = grahas[lagnaLordIndex];
    
    // Bhava analysis
    const bhavaAnalysis = [];
    for (let b = 1; b <= 12; b++) {
      const lordIndex = RASHI_LORDS[(lagnaRashi + b - 1) % 12];
      const grahasInBhava = grahas.filter(g => g.bhavaIndex === b);
      bhavaAnalysis.push(generateBhavaAnalysis(b, GRAHA_NAMES[lordIndex], grahasInBhava.map(g => g.name), lagnaLord.name));
    }
    
    const shadbala = grahas.map((g, i) => ({
      planet: g.name,
      strength: calculateShadbala(g, i, jd, latitude)
    }));
    
    const moonLongitude = grahas[1].longitude;
    const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dashaSystem = calculateVimshottariDasha(parseFloat(moonLongitude), birthDate);
    
    const yogas = detectYogas(grahas, lagnaRashi);
    const advancedYogas = detectAdvancedYogas(grahas, lagnaRashi, lagnaLord);
    const ashtakavarga = calculateAshtakavarga(grahas);
    
    // Current transits
    const currentJD = getJulianDay(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate(), 12, 0);
    const transits = calculateTransits(currentJD, grahas, ayanamsa);
    
    // Varshaphala for current year
    const varshaphala = calculateVarshaphala(jd, year, new Date().getFullYear(), latitude, longitude, ayanamsa);
    
    // Argala and Arudha
    const { argala, arudha } = calculateArgalaArudha(grahas, siderealLagna);
    
    res.json({
      success: true,
      ayanamsa: ayanamsa.toFixed(4),
      lagna: {
        longitude: siderealLagna.toFixed(4),
        rashi: RASHI_NAMES[lagnaRashi],
        rashiIndex: lagnaRashi,
        degree: lagnaDegree.toFixed(2),
        lord: lagnaLord.name,
        navamsa: RASHI_NAMES[calculateAllVargas(siderealLagna).D9]
      },
      grahas: grahas,
      bhavaAnalysis: bhavaAnalysis,
      shadbala: shadbala,
      vimshottariDasha: dashaSystem,
      yogas: yogas,
      advancedYogas: advancedYogas,
      ashtakavarga: ashtakavarga.map((points, house) => ({
        house: BHAVA_NAMES[house],
        points: points
      })),
      transits: transits,
      varshaphala: varshaphala,
      argala: argala,
      arudha: arudha,
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
  console.log(`Features: 16 Vargas | Antardasha/Pratyantardasha | Advanced Yogas | Transits | Varshaphala | Argala/Arudha`);
});
