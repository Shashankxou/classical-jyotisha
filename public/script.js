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
  
  // Grahas Table with All Vargas
  displayGrahasWithVargas(data.grahas);
  
  // Bhava Analysis
  displayBhavaAnalysis(data.bhavaAnalysis);
  
  // Vimshottari Dasha with Antardasha/Pratyantardasha
  displayDashaSystem(data.vimshottariDasha);
  
  // Classical Yogas
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
  
  // Advanced Yogas
  displayAdvancedYogas(data.advancedYogas);
  
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
  
  // Transits
  displayTransits(data.transits);
  
  // Varshaphala
  displayVarshaphala(data.varshaphala);
  
  // Argala & Arudha
  displayArgalaArudha(data.argala, data.arudha);
  
  // Remedies Section
  displayRemedies(data.grahas, data.shadbala);
  
  // Classical Analysis
  generateAnalysis(data);
}

function displayGrahasWithVargas(grahas) {
  const grahasTable = document.getElementById('grahasTable');
  let tableHTML = '<table><thead><tr><th>Graha</th><th>Rashi (D1)</th><th>Degree</th><th>D9</th><th>D10</th><th>Bhava</th><th>Dignity</th><th>R</th><th>All Vargas</th></tr></thead><tbody>';
  
  grahas.forEach(graha => {
    let dignityClass = '';
    if (graha.dignity.includes('Exalted')) dignityClass = 'dignity-exalted';
    if (graha.dignity.includes('Debilitated')) dignityClass = 'dignity-debilitated';
    if (graha.dignity.includes('Own Sign')) dignityClass = 'dignity-own';
    
    const retrograde = graha.isRetrograde ? '(R)' : '';
    
    const vargasList = Object.entries(graha.vargas)
      .map(([div, rashi]) => `${div}: ${['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'][rashi]}`)
      .join(', ');
    
    tableHTML += `<tr>
      <td><strong>${graha.name}</strong></td>
      <td>${graha.rashi}</td>
      <td>${graha.degree}°</td>
      <td>${graha.navamsa}</td>
      <td>${graha.dashamsa}</td>
      <td>${graha.bhava}</td>
      <td class="${dignityClass}">${graha.dignity}</td>
      <td>${retrograde}</td>
      <td class="vargas-cell"><button onclick="showVargas('${graha.name}', '${vargasList}')">View 16 Vargas</button></td>
    </tr>`;
  });
  
  tableHTML += '</tbody></table>';
  grahasTable.innerHTML = tableHTML;
}

function showVargas(planetName, vargasList) {
  alert(`${planetName} - All 16 Vargas (Shodasha Varga):\n\n${vargasList.replace(/,/g, '\n')}`);
}

function displayDashaSystem(dashaSystem) {
  const dashaSection = document.getElementById('dashaSection');
  let dashaHTML = `<h4>Birth Nakshatra: ${dashaSystem.nakshatra}</h4>`;
  
  dashaSystem.dashas.forEach((dasha, index) => {
    const isExpanded = index === 0; // Expand first Mahadasha by default
    
    dashaHTML += `
      <div class="dasha-card">
        <div class="dasha-header" onclick="toggleDasha('dasha-${index}')">
          <strong>${dasha.planet} Mahadasha</strong>
          <span>${dasha.startDate} to ${dasha.endDate} (${dasha.years} years)</span>
        </div>
        <div id="dasha-${index}" class="dasha-content" style="display: ${isExpanded ? 'block' : 'none'}">
          <h5>Antardashas:</h5>
          ${dasha.antardashas.map((antar, ai) => `
            <div class="antar-card">
              <div class="antar-header" onclick="toggleAntar('antar-${index}-${ai}')">
                <strong>${antar.lord} Antardasha</strong>
                <span>${antar.startDate} to ${antar.endDate} (${antar.years} years)</span>
              </div>
              <div id="antar-${index}-${ai}" class="antar-content" style="display: none">
                <h6>Pratyantardashas:</h6>
                <table class="pratyantar-table">
                  <thead><tr><th>Lord</th><th>Start</th><th>End</th><th>Years</th></tr></thead>
                  <tbody>
                    ${antar.pratyantardashas.map(prat => `
                      <tr>
                        <td>${prat.lord}</td>
                        <td>${prat.startDate}</td>
                        <td>${prat.endDate}</td>
                        <td>${prat.years}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  dashaSection.innerHTML = dashaHTML;
}

function toggleDasha(id) {
  const element = document.getElementById(id);
  element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function toggleAntar(id) {
  const element = document.getElementById(id);
  element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function displayAdvancedYogas(yogas) {
  const section = document.getElementById('advancedYogasSection');
  if (!yogas || yogas.length === 0) {
    section.innerHTML = '<p>No advanced yogas detected.</p>';
    return;
  }
  
  const categories = {
    'Wealth': [],
    'Power': [],
    'Poverty': [],
    'Misfortune': []
  };
  
  yogas.forEach(yoga => {
    if (categories[yoga.type]) {
      categories[yoga.type].push(yoga);
    }
  });
  
  let html = '';
  Object.entries(categories).forEach(([type, yogaList]) => {
    if (yogaList.length > 0) {
      const typeClass = type === 'Wealth' || type === 'Power' ? 'yoga-positive' : 'yoga-negative';
      html += `<div class="yoga-category ${typeClass}">`;
      html += `<h5>${type} Yogas</h5><ul>`;
      yogaList.forEach(yoga => {
        html += `<li><strong>${yoga.name}</strong>: ${yoga.description}</li>`;
      });
      html += `</ul></div>`;
    }
  });
  
  section.innerHTML = html;
}

function displayTransits(transits) {
  const section = document.getElementById('transitsSection');
  let html = '<table><thead><tr><th>Planet</th><th>Current Rashi</th><th>Birth Rashi</th><th>House from Birth</th><th>Effect</th></tr></thead><tbody>';
  
  transits.forEach(t => {
    html += `<tr>
      <td><strong>${t.planet}</strong></td>
      <td>${t.currentRashi}</td>
      <td>${t.birthRashi}</td>
      <td>${t.houseFromBirth}</td>
      <td>${t.effect}</td>
    </tr>`;
  });
  
  html += '</tbody></table>';
  section.innerHTML = html;
}

function displayVarshaphala(varshaphala) {
  const section = document.getElementById('varshaphalaSection');
  section.innerHTML = `
    <div class="info-item"><span class="info-label">Year:</span><span class="info-value">${varshaphala.year}</span></div>
    <div class="info-item"><span class="info-label">Solar Return Date:</span><span class="info-value">${varshaphala.solarReturnDate}</span></div>
    <div class="info-item"><span class="info-label">Varshaphala Lagna:</span><span class="info-value">${varshaphala.varshaphalLagna}</span></div>
    <p>${varshaphala.interpretation}</p>
  `;
}

function displayArgalaArudha(argala, arudha) {
  const section = document.getElementById('argalaArudhaSection');
  let html = '<h5>Arudha (Perceived Reality)</h5><ul>';
  arudha.forEach(a => {
    html += `<li><strong>${a.type}</strong>: House ${a.house} - ${a.meaning}</li>`;
  });
  html += '</ul>';
  
  html += '<h5>Argala (Intervention) - Sample</h5>';
  html += '<p class="info-text">Showing first 10 interventions. Argala indicates how planets intervene in house matters.</p>';
  html += '<ul>';
  argala.slice(0, 10).forEach(a => {
    html += `<li>${a.planet} intervenes in ${a.intervenes} (${a.type})</li>`;
  });
  html += '</ul>';
  
  section.innerHTML = html;
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
  
  // Advanced Yogas Summary
  if (data.advancedYogas && data.advancedYogas.length > 0) {
    analysis += '<p><strong>Advanced Yogas:</strong> ';
    const wealthYogas = data.advancedYogas.filter(y => y.type === 'Wealth').length;
    const powerYogas = data.advancedYogas.filter(y => y.type === 'Power').length;
    const povertyYogas = data.advancedYogas.filter(y => y.type === 'Poverty').length;
    const misfortuneYogas = data.advancedYogas.filter(y => y.type === 'Misfortune').length;
    
    analysis += `Detected ${wealthYogas} Dhana (Wealth), ${powerYogas} Raja (Power), ${povertyYogas} Daridra (Poverty), ${misfortuneYogas} Arishta (Misfortune) yogas. See Advanced Yogas section for details.`;
    analysis += '</p>';
  }
  
  // Transit Summary
  if (data.transits) {
    analysis += '<p><strong>Current Transits:</strong> ';
    const significantTransits = data.transits.filter(t => t.effect !== 'Neutral');
    if (significantTransits.length > 0) {
      analysis += `${significantTransits.length} planets in significant transit positions. See Transits section for current planetary movements and their effects.`;
    } else {
      analysis += 'No major transit effects at present.';
    }
    analysis += '</p>';
  }
  
  // Varshaphala
  if (data.varshaphala) {
    analysis += `<p><strong>Annual Chart (Varshaphala):</strong> Solar return for year ${data.varshaphala.year} occurs on ${data.varshaphala.solarReturnDate} with Varshaphala Lagna in ${data.varshaphala.varshaphalLagna}. This provides year-specific predictions.</p>`;
  }
  
  // Arudha
  if (data.arudha && data.arudha.length > 0) {
    analysis += `<p><strong>Arudha Lagna:</strong> ${data.arudha[0].type} is in House ${data.arudha[0].house}. This represents how the world perceives you, distinct from your actual self (Lagna).</p>`;
  }
  
  analysis += '<p><strong>Methodology Note:</strong> Analysis based on complete Shodasha Varga (16 divisional charts), Vimshottari Dasha with Antardasha/Pratyantardasha, Advanced Yogas (Dhana/Raja/Daridra/Arishta), Current Transits (Gochara), Varshaphala (Annual Chart), and Argala/Arudha techniques. All calculations follow BPHS and classical Jataka texts.</p>';
  
  analysis += '<p><strong>Limitations:</strong> This is a comprehensive analysis but still requires personalized interpretation by a qualified Jyotishi for life-specific guidance, timing of events, and remedial prioritization.</p>';
  
  analysis += '</div>';
  analysisText.innerHTML = analysis;
}
