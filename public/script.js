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
    alert('All fields are required. Do not leave any field empty.');
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
  
  const lagnaInfo = document.getElementById('lagnaInfo');
  lagnaInfo.innerHTML = `
    <div class="info-item"><span class="info-label">Rashi:</span><span class="info-value">${data.lagna.rashi}</span></div>
    <div class="info-item"><span class="info-label">Degree:</span><span class="info-value">${data.lagna.degree}°</span></div>
    <div class="info-item"><span class="info-label">Lagna Lord:</span><span class="info-value">${data.lagna.lord}</span></div>
    <div class="info-item"><span class="info-label">Longitude:</span><span class="info-value">${data.lagna.longitude}°</span></div>
  `;
  
  const metadataInfo = document.getElementById('metadataInfo');
  metadataInfo.innerHTML = `
    <div class="info-item"><span class="info-label">Date:</span><span class="info-value">${data.metadata.date}</span></div>
    <div class="info-item"><span class="info-label">Time:</span><span class="info-value">${data.metadata.time}</span></div>
    <div class="info-item"><span class="info-label">Location:</span><span class="info-value">${data.metadata.location}</span></div>
    <div class="info-item"><span class="info-label">Ayanamsa:</span><span class="info-value">${data.ayanamsa}°</span></div>
    <div class="info-item"><span class="info-label">Julian Day:</span><span class="info-value">${data.metadata.julianDay}</span></div>
  `;
  
  const grahasTable = document.getElementById('grahasTable');
  let tableHTML = '<table><thead><tr><th>Graha</th><th>Rashi</th><th>Degree</th><th>Bhava</th><th>Dignity</th><th>Functional Nature</th><th>Drishti</th></tr></thead><tbody>';
  
  data.grahas.forEach(graha => {
    let dignityClass = '';
    if (graha.dignity.includes('Exalted')) dignityClass = 'dignity-exalted';
    if (graha.dignity.includes('Debilitated')) dignityClass = 'dignity-debilitated';
    if (graha.dignity.includes('Own Sign')) dignityClass = 'dignity-own';
    
    tableHTML += `<tr><td><strong>${graha.name}</strong></td><td>${graha.rashi}</td><td>${graha.degree}°</td><td>${graha.bhava}</td><td class="${dignityClass}">${graha.dignity}</td><td>${graha.functionalNature}</td><td>${graha.drishti.join(', ')}</td></tr>`;
  });
  
  tableHTML += '</tbody></table>';
  grahasTable.innerHTML = tableHTML;
  
  generateAnalysis(data);
}

function generateAnalysis(data) {
  const analysisText = document.getElementById('analysisText');
  let analysis = '<div class="analysis-text">';
  
  analysis += `<p><strong>Lagna Analysis:</strong> The native is born with ${data.lagna.rashi} Lagna at ${data.lagna.degree}° within the sign. The Lagna lord is ${data.lagna.lord}.</p>`;
  
  const lagnaLord = data.grahas.find(g => g.name === data.lagna.lord);
  if (lagnaLord) {
    analysis += `<p><strong>Lagna Lord Condition:</strong> ${lagnaLord.name} is placed in ${lagnaLord.rashi} in the ${lagnaLord.bhava}, with dignity status: ${lagnaLord.dignity}. `;
    
    if (lagnaLord.dignity.includes('Exalted')) {
      analysis += 'This is a strong placement. The Lagna lord in exaltation (Uccha) indicates vitality, strength of character, and favorable life outcomes according to BPHS.';
    } else if (lagnaLord.dignity.includes('Debilitated')) {
      analysis += 'This is a weak placement. The Lagna lord in debilitation (Neecha) indicates challenges to vitality and self-expression. Cancellation factors (Neecha Bhanga) must be examined.';
    } else if (lagnaLord.dignity.includes('Own Sign')) {
      analysis += 'The Lagna lord in its own sign (Sva-kshetra) provides stability and strength to the native.';
    }
    analysis += '</p>';
  }
  
  analysis += '<p><strong>Kendra (Angular Houses) Analysis:</strong> ';
  const kendraGrahas = data.grahas.filter(g => g.bhavaIndex === 1 || g.bhavaIndex === 4 || g.bhavaIndex === 7 || g.bhavaIndex === 10);
  if (kendraGrahas.length > 0) {
    analysis += `Grahas in Kendras: ${kendraGrahas.map(g => g.name).join(', ')}. Kendras are pillars of the chart (Vishnu Sthanas). Benefics here strengthen the chart; malefics require careful assessment.`;
  } else {
    analysis += 'No grahas occupy Kendra houses. This reduces immediate strength but does not negate potential.';
  }
  analysis += '</p>';
  
  analysis += '<p><strong>Trikona (Trinal Houses) Analysis:</strong> ';
  const trikonaGrahas = data.grahas.filter(g => g.bhavaIndex === 1 || g.bhavaIndex === 5 || g.bhavaIndex === 9);
  if (trikonaGrahas.length > 0) {
    analysis += `Grahas in Trikonas: ${trikonaGrahas.map(g => g.name).join(', ')}. Trikonas are houses of dharma and fortune (Lakshmi Sthanas). Benefics here are highly auspicious.`;
  } else {
    analysis += 'No grahas occupy Trikona houses beyond Lagna.';
  }
  analysis += '</p>';
  
  analysis += '<p><strong>Dusthana (Malefic Houses) Analysis:</strong> ';
  const dusthanaGrahas = data.grahas.filter(g => g.bhavaIndex === 6 || g.bhavaIndex === 8 || g.bhavaIndex === 12);
  if (dusthanaGrahas.length > 0) {
    analysis += `Grahas in Dusthanas: ${dusthanaGrahas.map(g => g.name).join(', ')}. Houses 6, 8, and 12 are challenging. Natural malefics here can give strength to overcome obstacles; benefics may suffer unless well-placed by dignity.`;
  } else {
    analysis += 'No grahas occupy Dusthana houses. This reduces immediate obstacles but does not guarantee ease.';
  }
  analysis += '</p>';
  
  const exaltedGrahas = data.grahas.filter(g => g.dignity.includes('Exalted'));
  const debilitatedGrahas = data.grahas.filter(g => g.dignity.includes('Debilitated'));
  
  if (exaltedGrahas.length > 0) {
    analysis += `<p><strong>Exalted Grahas:</strong> ${exaltedGrahas.map(g => g.name).join(', ')} are exalted. These grahas operate at peak strength and deliver favorable results in their dashas and bhavas.</p>`;
  }
  
  if (debilitatedGrahas.length > 0) {
    analysis += `<p><strong>Debilitated Grahas:</strong> ${debilitatedGrahas.map(g => g.name).join(', ')} are debilitated. These grahas are weakened. Check for Neecha Bhanga (cancellation) conditions: exalted lord of debilitation sign, or debilitated graha in kendra from Lagna/Moon.</p>`;
  }
  
  analysis += '<p><strong>Note:</strong> This analysis is based on Rashi chart only. Full interpretation requires Navamsa (D9), Dashamsa (D10), and other Vargas as prescribed in BPHS. Dasha analysis (Vimshottari) is essential for timing of events. Functional benefic/malefic logic shown is tentative and requires full Lagna-specific analysis.</p>';
  
  analysis += '<p><strong>Methodology:</strong> Sidereal zodiac with Lahiri Ayanamsa. No Western aspects. No modern psychological interpretations. Strictly classical Parashari principles.</p>';
  
  analysis += '</div>';
  analysisText.innerHTML = analysis;
}