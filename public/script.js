document.getElementById('birthForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const dateValue = document.getElementById('date').value;
  const [year, month, day] = dateValue.split('-').map(Number);
  const hour = parseInt(document.getElementById('hour').value);
  const minute = parseInt(document.getElementById('minute').value);
  const latitude = parseFloat(document.getElementById('latitude').value);
  const longitude = parseFloat(document.getElementById('longitude').value);
  const timezone = parseFloat(document.getElementById('timezone').value);
  
  if (!year || !month || !day || hour === undefined || minute === undefined || !latitude || !longitude || timezone === undefined) {
    alert('All fields are required.');
    return;
  }
  
  try {
    const response = await fetch('/api/calculate-chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month, day, hour, minute, latitude, longitude, timezone })
    });
    
    const data = await response.json();
    
    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }
    
    displayResults(data);
  } catch (error) {
    alert('Calculation failed: ' + error.message);
  }
});

function displayResults(data) {
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
  
  // Lagna Info
  const lagnaInfo = document.getElementById('lagnaInfo');
  lagnaInfo.innerHTML = `
    <div class="info-item"><span class="info-label">Rashi:</span><span class="info-value">${data.lagna.rashi}</span></div>
    <div class="info-item"><span class="info-label">Degree:</span><span class="info-value">${data.lagna.degree}°</span></div>
    <div class="info-item"><span class="info-label">Navamsa:</span><span class="info-value">${data.lagna.navamsa}</span></div>
    <div class="info-item"><span class="info-label">Lagna Lord:</span><span class="info-value">${data.lagna.lord}</span></div>
  `;
  
  // Metadata
  const metadataInfo = document.getElementById('metadataInfo');
  metadataInfo.innerHTML = `
    <div class="info-item"><span class="info-label">Date:</span><span class="info-value">${data.metadata.date}</span></div>
    <div class="info-item"><span class="info-label">Time:</span><span class="info-value">${data.metadata.time}</span></div>
    <div class="info-item"><span class="info-label">Location:</span><span class="info-value">${data.metadata.location}</span></div>
    <div class="info-item"><span class="info-label">Ayanamsa:</span><span class="info-value">${data.ayanamsa}°</span></div>
  `;
  
  // Grahas Table
  const grahasTable = document.getElementById('grahasTable');
  let tableHTML = '<table><thead><tr><th>Graha</th><th>Rashi (D1)</th><th>Degree</th><th>Navamsa (D9)</th><th>Dashamsa (D10)</th><th>Bhava</th><th>Dignity</th><th>Retrograde</th></tr></thead><tbody>';
  
  data.grahas.forEach(graha => {
    let dignityClass = '';
    if (graha.dignity.includes('Exalted')) dignityClass = 'dignity-exalted';
    if (graha.dignity.includes('Debilitated')) dignityClass = 'dignity-debilitated';
    if (graha.dignity.includes('Own Sign')) dignityClass = 'dignity-own';
    
    const retrograde = graha.isRetrograde ? '(R)' : '';
    
    tableHTML += `<tr>
      <td><strong>${graha.name}</strong></td>
      <td>${graha.rashi}</td>
      <td>${graha.degree}°</td>
      <td>${graha.navamsa}</td>
      <td>${graha.dashamsa}</td>
      <td>${graha.bhava}</td>
      <td class="${dignityClass}">${graha.dignity}</td>
      <td>${retrograde}</td>
    </tr>`;
  });
  
  tableHTML += '</tbody></table>';
  grahasTable.innerHTML = tableHTML;
  
  // Bhava Analysis
  displayBhavaAnalysis(data.bhavaAnalysis);
  
  // Vimshottari Dasha
  const dashaSection = document.getElementById('dashaSection');
  let dashaHTML = `<h4>Birth Nakshatra: ${data.vimshottariDasha.nakshatra}</h4>`;
  dashaHTML += '<table><thead><tr><th>Planet</th><th>Start Date</th><th>End Date</th><th>Years</th></tr></thead><tbody>';
  
  data.vimshottariDasha.dashas.forEach(dasha => {
    dashaHTML += `<tr>
      <td><strong>${dasha.planet}</strong></td>
      <td>${dasha.startDate}</td>
      <td>${dasha.endDate}</td>
      <td>${dasha.years}</td>
    </tr>`;
  });
  
  dashaHTML += '</tbody></table>';
  dashaSection.innerHTML = dashaHTML;
  
  // Yogas
  const yogasSection = document.getElementById('yogasSection');
  if (data.yogas.length > 0) {
    let yogasHTML = '<ul>';
    data.yogas.forEach(yoga => {
      yogasHTML += `<li><strong>${yoga.name}</strong> (${yoga.planet}): ${yoga.description}</li>`;
    });
    yogasHTML += '</ul>';
    yogasSection.innerHTML = yogasHTML;
  } else {
    yogasSection.innerHTML = '<p>No major classical yogas detected in this chart.</p>';
  }
  
  // Shadbala
  const shadbalSection = document.getElementById('shadbalSection');
  let shadbalHTML = '<table><thead><tr><th>Planet</th><th>Strength (Rupas)</th><th>Status</th></tr></thead><tbody>';
  
  data.shadbala.forEach(sb => {
    const strength = parseFloat(sb.strength);
    const status = strength > 5 ? 'Strong' : strength > 3 ? 'Moderate' : 'Weak';
    const statusClass = strength > 5 ? 'dignity-exalted' : strength > 3 ? 'dignity-own' : 'dignity-debilitated';
    
    shadbalHTML += `<tr>
      <td><strong>${sb.planet}</strong></td>
      <td>${sb.strength}</td>
      <td class="${statusClass}">${status}</td>
    </tr>`;
  });
  
  shadbalHTML += '</tbody></table>';
  shadbalSection.innerHTML = shadbalHTML;
  
  // Ashtakavarga
  const ashtakavargaSection = document.getElementById('ashtakavargaSection');
  let ashtakavargaHTML = '<table><thead><tr><th>House</th><th>Bindus (Points)</th><th>Strength</th></tr></thead><tbody>';
  
  data.ashtakavarga.forEach(av => {
    const strength = av.points > 28 ? 'Strong' : av.points > 20 ? 'Moderate' : 'Weak';
    const strengthClass = av.points > 28 ? 'dignity-exalted' : av.points > 20 ? 'dignity-own' : 'dignity-debilitated';
    
    ashtakavargaHTML += `<tr>
      <td><strong>${av.house}</strong></td>
      <td>${av.points}</td>
      <td class="${strengthClass}">${strength}</td>
    </tr>`;
  });
  
  ashtakavargaHTML += '</tbody></table>';
  ashtakavargaSection.innerHTML = ashtakavargaHTML;
  
  // Remedies Section
  displayRemedies(data.grahas, data.shadbala);
  
  // Classical Analysis
  generateAnalysis(data);
}

function displayBhavaAnalysis(bhavaAnalysis) {
  const bhavaSection = document.getElementById('bhavaAnalysisSection');
  let bhavaHTML = '<div class="bhava-grid">';
  
  bhavaAnalysis.forEach(bhava => {
    bhavaHTML += `
      <div class="bhava-card">
        <h4>${bhava.bhavaNumber}. ${bhava.bhavaName}</h4>
        <p><strong>Lord:</strong> ${bhava.lord}</p>
        <p><strong>Karaka:</strong> ${bhava.karaka}</p>
        <p><strong>Planets:</strong> ${bhava.grahasPresent.length > 0 ? bhava.grahasPresent.join(', ') : 'None'}</p>
        <p><strong>Significations:</strong></p>
        <ul class="significations-list">
          ${bhava.significations.slice(0, 4).map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    `;
  });
  
  bhavaHTML += '</div>';
  bhavaSection.innerHTML = bhavaHTML;
}

function displayRemedies(grahas, shadbala) {
  const remediesSection = document.getElementById('remediesSection');
  let remediesHTML = '';
  
  // Identify weak planets
  const weakPlanets = shadbala.filter(s => parseFloat(s.strength) < 3);
  const afflictedPlanets = grahas.filter(g => g.dignity.includes('Debilitated') || g.dignity.includes('Enemy'));
  
  const planetsNeedingRemedies = [...new Set([...weakPlanets.map(w => w.planet), ...afflictedPlanets.map(a => a.name)])];
  
  if (planetsNeedingRemedies.length === 0) {
    remediesHTML = '<p class="dignity-exalted">All planets are well-placed. Continue general spiritual practices for maintenance.</p>';
  } else {
    remediesHTML += '<p class="warning-text">The following planets require remedial measures:</p>';
    
    planetsNeedingRemedies.forEach(planetName => {
      const graha = grahas.find(g => g.name === planetName);
      if (!graha || !graha.remedies) return;
      
      const r = graha.remedies;
      
      remediesHTML += `
        <div class="remedy-card">
          <h4>${planetName} Remedies</h4>
          
          <div class="remedy-section">
            <h5>🕉️ Mantras (Daily Practice)</h5>
            <ul>${r.mantras.map(m => `<li>${m}</li>`).join('')}</ul>
          </div>
          
          <div class="remedy-section">
            <h5>💎 Gemstone Therapy</h5>
            <p><strong>Stone:</strong> ${r.gemstone.primary}</p>
            <p><strong>Weight:</strong> ${r.gemstone.weight}</p>
            <p><strong>Metal:</strong> ${r.gemstone.metal}</p>
            <p><strong>Finger:</strong> ${r.gemstone.finger}</p>
            <p><strong>Day to wear:</strong> ${r.gemstone.day}</p>
            <p class="warning-text">⚠️ Consult astrologer before wearing. Test for 7 days first.</p>
          </div>
          
          <div class="remedy-section">
            <h5>🎁 Donations (Daana)</h5>
            <ul>${r.donations.map(d => `<li>${d}</li>`).join('')}</ul>
            <p><em>Donate on ${r.fasting} to maximize effect</em></p>
          </div>
          
          <div class="remedy-section">
            <h5>🙏 Rituals & Worship</h5>
            <p><strong>Deity:</strong> ${r.deity}</p>
            <p><strong>Fasting:</strong> ${r.fasting}</p>
            <ul>${r.rituals.map(rit => `<li>${rit}</li>`).join('')}</ul>
          </div>
          
          <div class="remedy-section">
            <h5>✨ Simple Remedies (Lal Kitab Style)</h5>
            <ul>${r.simple.map(s => `<li>${s}</li>`).join('')}</ul>
          </div>
          
          <div class="remedy-section">
            <h5>🧘 Spiritual Practices</h5>
            <ul>${r.spiritual.map(sp => `<li>${sp}</li>`).join('')}</ul>
          </div>
          
          <div class="remedy-section activation">
            <h5>⚡ Activation Methods</h5>
            <p>${r.activation}</p>
          </div>
        </div>
      `;
    });
  }
  
  // Universal remedies
  remediesHTML += `
    <div class="remedy-card universal">
      <h4>🌟 Universal Spiritual Practices (For All)</h4>
      
      <div class="remedy-section">
        <h5>Daily Sadhana</h5>
        <ul>
          <li>Gayatri Mantra (108 times at sunrise)</li>
          <li>Navagraha Stotra (for all 9 planets)</li>
          <li>Meditation (20-30 minutes)</li>
          <li>Pranayama (Anulom Vilom, Kapalbhati)</li>
        </ul>
      </div>
      
      <div class="remedy-section">
        <h5>Weekly Practices</h5>
        <ul>
          <li>Visit temple/sacred place</li>
          <li>Feed animals (cows, dogs, birds)</li>
          <li>Charity to the needy</li>
          <li>Study sacred texts (Bhagavad Gita, Upanishads)</li>
        </ul>
      </div>
      
      <div class="remedy-section">
        <h5>Lifestyle Dharma</h5>
        <ul>
          <li>Respect parents, teachers, elders</li>
          <li>Practice truthfulness (Satya)</li>
          <li>Non-violence (Ahimsa)</li>
          <li>Selfless service (Seva)</li>
          <li>Gratitude practice</li>
        </ul>
      </div>
      
      <div class="remedy-section">
        <h5>Karmic Cleansing</h5>
        <ul>
          <li>Ancestor worship (Shraddha, Tarpan)</li>
          <li>Pilgrimage to sacred sites</li>
          <li>Ganga snan (holy bath)</li>
          <li>Forgiveness practice</li>
        </ul>
      </div>
    </div>
  `;
  
  remediesSection.innerHTML = remediesHTML;
}

function generateAnalysis(data) {
  const analysisText = document.getElementById('analysisText');
  let analysis = '<div class="analysis-text">';
  
  analysis += `<p><strong>Lagna Analysis:</strong> The native is born with ${data.lagna.rashi} Lagna at ${data.lagna.degree}° within the sign. Navamsa placement is ${data.lagna.navamsa}. The Lagna lord is ${data.lagna.lord}.</p>`;
  
  const lagnaLord = data.grahas.find(g => g.name === data.lagna.lord);
  if (lagnaLord) {
    analysis += `<p><strong>Lagna Lord Condition:</strong> ${lagnaLord.name} is placed in ${lagnaLord.rashi} (D1) and ${lagnaLord.navamsa} (D9) in the ${lagnaLord.bhava}, with dignity: ${lagnaLord.dignity}. `;
    
    if (lagnaLord.dignity.includes('Exalted')) {
      analysis += 'Strong placement. Lagna lord in Uccha indicates vitality and favorable outcomes per BPHS.';
    } else if (lagnaLord.dignity.includes('Debilitated')) {
      analysis += 'Weak placement. Lagna lord in Neecha indicates challenges. Check for Neecha Bhanga conditions.';
    } else if (lagnaLord.dignity.includes('Own Sign')) {
      analysis += 'Stable placement. Lagna lord in Sva-kshetra provides strength.';
    }
    
    if (lagnaLord.isRetrograde) {
      analysis += ' Planet is retrograde, indicating intensified results and karmic revisitation.';
    }
    
    analysis += '</p>';
  }
  
  // Kendra Analysis
  analysis += '<p><strong>Kendra Analysis:</strong> ';
  const kendraGrahas = data.grahas.filter(g => [1, 4, 7, 10].includes(g.bhavaIndex));
  if (kendraGrahas.length > 0) {
    analysis += `Grahas in Kendras: ${kendraGrahas.map(g => g.name).join(', ')}. Kendras are Vishnu Sthanas (pillars). Benefics strengthen; malefics require assessment.`;
  } else {
    analysis += 'No grahas in Kendras. Reduces immediate strength.';
  }
  analysis += '</p>';
  
  // Trikona Analysis
  analysis += '<p><strong>Trikona Analysis:</strong> ';
  const trikonaGrahas = data.grahas.filter(g => [1, 5, 9].includes(g.bhavaIndex));
  if (trikonaGrahas.length > 0) {
    analysis += `Grahas in Trikonas: ${trikonaGrahas.map(g => g.name).join(', ')}. Trikonas are Lakshmi Sthanas (fortune houses). Highly auspicious for benefics.`;
  } else {
    analysis += 'No grahas in Trikonas beyond Lagna.';
  }
  analysis += '</p>';
  
  // Dusthana Analysis
  analysis += '<p><strong>Dusthana Analysis (6th, 8th, 12th):</strong> ';
  const dusthanaGrahas = data.grahas.filter(g => [6, 8, 12].includes(g.bhavaIndex));
  if (dusthanaGrahas.length > 0) {
    analysis += `Grahas in Dusthanas: ${dusthanaGrahas.map(g => g.name).join(', ')}. These houses represent obstacles, transformation, and loss. Natural malefics here can give strength to overcome; benefics may suffer unless well-dignified.`;
  } else {
    analysis += 'No grahas in Dusthanas. Reduces immediate obstacles.';
  }
  analysis += '</p>';
  
  // Yogas
  if (data.yogas.length > 0) {
    analysis += '<p><strong>Classical Yogas Detected:</strong></p><ul>';
    data.yogas.forEach(yoga => {
      analysis += `<li><strong>${yoga.name}</strong>: ${yoga.description}</li>`;
    });
    analysis += '</ul>';
  }
  
  // Vimshottari Dasha
  const currentDasha = data.vimshottariDasha.dashas[0];
  const currentDashaGraha = data.grahas.find(g => g.name === currentDasha.planet);
  analysis += `<p><strong>Current Mahadasha:</strong> ${currentDasha.planet} Dasha running from ${currentDasha.startDate} to ${currentDasha.endDate} (${currentDasha.years} years). Birth Nakshatra: ${data.vimshottariDasha.nakshatra}. `;
  if (currentDashaGraha) {
    analysis += `${currentDasha.planet} is placed in ${currentDashaGraha.bhava} with ${currentDashaGraha.dignity} dignity. This period will activate the significations of the ${currentDashaGraha.bhava}.`;
  }
  analysis += '</p>';
  
  // Shadbala Summary
  const strongPlanets = data.shadbala.filter(s => parseFloat(s.strength) > 5);
  const weakPlanets = data.shadbala.filter(s => parseFloat(s.strength) < 3);
  
  if (strongPlanets.length > 0) {
    analysis += `<p><strong>Strong Planets (Shadbala > 5 Rupas):</strong> ${strongPlanets.map(s => s.planet).join(', ')}. These planets deliver strong results and should be activated through their significations.`;
  }
  
  if (weakPlanets.length > 0) {
    analysis += `<p><strong>Weak Planets (Shadbala < 3 Rupas):</strong> ${weakPlanets.map(s => s.planet).join(', ')}. These planets struggle to deliver results and require remedial measures (see Remedies section).`;
  }
  
  // Ashtakavarga Summary
  const strongHouses = data.ashtakavarga.filter(a => a.points > 28);
  if (strongHouses.length > 0) {
    analysis += `<p><strong>Strong Houses (Ashtakavarga > 28 points):</strong> ${strongHouses.map(a => a.house).join(', ')}. Transits through these houses yield favorable results. Focus efforts on these life areas.`;
  }
  
  // Retrograde Planets
  const retrogradePlanets = data.grahas.filter(g => g.isRetrograde);
  if (retrogradePlanets.length > 0) {
    analysis += `<p><strong>Retrograde Planets:</strong> ${retrogradePlanets.map(g => g.name).join(', ')}. Retrograde motion indicates karmic revisitation, intensified results, and need to complete unfinished business from past lives in their significations.`;
  }
  
  analysis += '<p><strong>Spiritual Path Indicators:</strong> ';
  const ninthHouseGrahas = data.grahas.filter(g => g.bhavaIndex === 9);
  const twelfthHouseGrahas = data.grahas.filter(g => g.bhavaIndex === 12);
  if (ninthHouseGrahas.length > 0 || twelfthHouseGrahas.length > 0) {
    analysis += `Planets in 9th house (Dharma): ${ninthHouseGrahas.map(g => g.name).join(', ') || 'None'}. Planets in 12th house (Moksha): ${twelfthHouseGrahas.map(g => g.name).join(', ') || 'None'}. These placements indicate spiritual inclinations and the path to liberation.`;
  } else {
    analysis += 'Spiritual path requires conscious cultivation through sadhana.';
  }
  analysis += '</p>';
  
  analysis += '<p><strong>Methodology Note:</strong> Analysis based on Rashi (D1), Navamsa (D9), and Dashamsa (D10) charts. Vimshottari Dasha system per BPHS Chapter 46. Shadbala and Ashtakavarga calculations follow classical principles. Yogas detected per Parashari and Jataka Parijata standards. Remedies from BPHS, Lal Kitab, and traditional Vedic sources.</p>';
  
  analysis += '<p><strong>Limitations:</strong> Full interpretation requires deeper Varga analysis (all 16 divisions), Antardasha/Pratyantardasha periods, transit analysis, and Argala/Arudha considerations. This is a foundational analysis. Consult a qualified Jyotishi for personalized guidance.</p>';
  
  analysis += '</div>';
  analysisText.innerHTML = analysis;
}