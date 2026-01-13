# Classical Jyotisha - Parashari Astrology System

A **brutally serious** Vedic astrology application based strictly on **Brihat Parashara Hora Shastra** and **Brihat Jataka**.

## 🔥 Core Principles

- **Sidereal Zodiac** with **Lahiri Ayanamsa** only
- **No Western astrology**
- **No modern pop spirituality**
- **No motivational language**
- **Deterministic where the shastra is deterministic**
- **Conditional where combinations modify results**

## 📚 Textual Authority

This system operates strictly within the framework of:
- **Brihat Parashara Hora Shastra (BPHS)** - Primary text
- **Brihat Jataka** by Varahamihira - Secondary reference

If a concept is not explicitly supported in these texts, the system states so clearly.

## 🎯 Methodology

### Chart Analysis Order (NO SKIPPING)
1. Lagna strength and dignity
2. Lagna lord condition
3. Kendras → Trikonas → Dusthanas
4. Natural vs functional benefics
5. Yogas (only classical, no Instagram yogas)
6. Dasha logic (Vimshottari primary)
7. Karma indications (Purva punya, rinanubandha)

### Calculation Engine
- **Swiss Ephemeris** for astronomical accuracy
- **Lahiri Ayanamsa** (Sidereal correction)
- **Graha Drishti** (planetary aspects) per classical rules
- **Shadbala** logic (conceptual, not fake precision)
- **Functional benefic/malefic** logic per lagna

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/Shashankxou/classical-jyotisha.git
cd classical-jyotisha

# Install dependencies
npm install

# Start the server
npm start
```

The app will run on `http://localhost:3000`

## 📋 Requirements

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Usage

1. Enter birth data:
   - Date of birth
   - Time of birth (24-hour format)
   - Latitude and Longitude
   - Timezone offset from UTC

2. Click "Calculate Chart (Kundali)"

3. Review the analysis:
   - Lagna (Ascendant) details
   - Graha (Planet) positions with dignity
   - Bhava (House) placements
   - Classical interpretation based on BPHS

## ⚠️ Interpretation Rules

- **Be deterministic where the shastra is deterministic**
- **Be conditional where combinations modify results**
- **No sugarcoating**: If a placement is weak, it's stated as weak
- **Explain WHY** a result occurs, citing the principle
- **No therapy talk, no spiritual bypassing, no vague optimism**

## 🛠️ Technical Stack

- **Backend**: Node.js + Express
- **Ephemeris**: Swiss Ephemeris (swisseph)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Calculation**: Pure Parashari methodology

## 📊 Features

### Current Implementation
- ✅ Sidereal zodiac with Lahiri Ayanamsa
- ✅ Lagna calculation
- ✅ All 9 Grahas (including Rahu/Ketu)
- ✅ Graha dignity (Exaltation, Debilitation, Own Sign, Moolatrikona)
- ✅ Bhava (House) positions
- ✅ Graha Drishti (aspects)
- ✅ Kendra/Trikona/Dusthana analysis
- ✅ Classical interpretation engine

### Future Upgrades
- [ ] Vimshottari Dasha calculation
- [ ] Navamsa (D9) chart
- [ ] Dashamsa (D10) chart
- [ ] Yoga validation filter (to kill fake yogas)
- [ ] Karma ledger mode (past-life indicators)
- [ ] Shadbala detailed calculation
- [ ] Ashtakavarga system

## 🎓 Educational Value

This app is designed for:
- **Serious students of Jyotisha**
- **Practitioners who respect textual authority**
- **Anyone tired of pop astrology nonsense**

## ⚖️ License

MIT License - Use freely, but maintain the classical integrity.

## 🙏 Acknowledgments

- **Maharishi Parashara** - Author of BPHS
- **Varahamihira** - Author of Brihat Jataka
- **Swiss Ephemeris** team for astronomical calculations

## 📞 Support

For issues or questions, open a GitHub issue. No hand-holding, no motivational coaching.

---

**Remember**: This is not therapy. This is not manifestation. This is classical Jyotisha as Parashara taught it.