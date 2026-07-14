// Tire pressure calculation engine
// This is designed to be improved over time with real-world data

const basePressures = {
  'LeCont': {
    'LH03': { base: 0.85 },
    'LH14': { base: 0.82 },
    'LH16': { base: 0.80 }
  },
  'MG': {
    'Yellow': { base: 0.88 },
    'Red': { base: 0.85 },
    'White': { base: 0.82 }
  },
  'Vega': {
    'Standard': { base: 0.83 },
    'Sport': { base: 0.80 },
    'Competition': { base: 0.78 }
  },
  'Maxxis': {
    'M8005': { base: 0.86 },
    'M8006': { base: 0.83 },
    'M8008': { base: 0.81 }
  },
  'Other': {
    'Generic': { base: 0.82 }
  }
};

const calculateTirePressure = (input) => {
  const { tireBrand, tireModel, asphaltCondition, tireWear, trackCharacteristics, airTemp, tempUnit, gripLevel } = input;

  // Get base pressure (in bar)
  let basePressure = 0.85;
  if (basePressures[tireBrand] && basePressures[tireBrand][tireModel]) {
    basePressure = basePressures[tireBrand][tireModel].base;
  }

  // Asphalt condition adjustment
  const asphaltAdjustments = {
    'New (Black)': 0.03,
    'Fresh (Dark Grey)': 0.02,
    'Basic (Grey)': 0.00,
    'Old (Light Grey)': -0.02
  };
  const asphaltAdj = asphaltAdjustments[asphaltCondition] || 0;

  // Tire wear adjustment
  const wearAdjustments = {
    'Less than usual': -0.01,
    'Normal': 0.00,
    'More than usual': 0.02
  };
  const wearAdj = wearAdjustments[tireWear] || 0;

  // Track characteristics adjustment
  const trackAdjustments = {
    'Slow track': -0.01,
    'Fast track': 0.02,
    'Long corners dominant': 0.01
  };
  const trackAdj = trackAdjustments[trackCharacteristics] || 0;

  // Grip level adjustment
  const gripAdjustments = {
    'Dusty / dry line': -0.02,
    'Developing grip': -0.01,
    'Single dry day': 0.00,
    'High rubber': 0.03
  };
  const gripAdj = gripAdjustments[gripLevel] || 0;

  // Temperature adjustment (convert to Celsius if needed)
  let tempCelsius = airTemp;
  if (tempUnit === 'Fahrenheit') {
    tempCelsius = (airTemp - 32) * (5 / 9);
  }
  const tempAdj = (tempCelsius - 20) * 0.005; // 0.5% adjustment per degree

  // Calculate starting pressure
  let startingPressure = basePressure + asphaltAdj + wearAdj + trackAdj + gripAdj + tempAdj;
  startingPressure = Math.round(startingPressure * 100) / 100; // Round to 2 decimals

  // Hot pressure range (typically 0.15-0.25 bar increase)
  const hotPressureIncrease = 0.20;
  const hotPressureMin = Math.round((startingPressure + hotPressureIncrease - 0.05) * 100) / 100;
  const hotPressureMax = Math.round((startingPressure + hotPressureIncrease + 0.05) * 100) / 100;

  // Generate explanation
  const explanation = generateExplanation({
    basePressure,
    asphaltCondition,
    tireWear,
    trackCharacteristics,
    gripLevel,
    tempCelsius
  });

  return {
    startingPressure,
    hotPressureRange: {
      min: hotPressureMin,
      max: hotPressureMax
    },
    explanation,
    details: {
      basePressure,
      adjustments: {
        asphalt: asphaltAdj,
        wear: wearAdj,
        track: trackAdj,
        grip: gripAdj,
        temperature: tempAdj
      }
    }
  };
};

const generateExplanation = (details) => {
  let explanation = `Based on your inputs:\n\n`;
  explanation += `• Base pressure for your tire: ${details.basePressure.toFixed(2)} bar\n`;
  explanation += `• Asphalt condition: ${details.asphaltCondition}\n`;
  explanation += `• Tire wear: ${details.tireWear}\n`;
  explanation += `• Track characteristics: ${details.trackCharacteristics}\n`;
  explanation += `• Grip level: ${details.gripLevel}\n`;
  explanation += `• Air temperature: ${Math.round(details.tempCelsius)}°C\n\n`;
  explanation += `The hot pressure range assumes a typical 0.20 bar increase from tire friction during racing.`;

  return explanation;
};

export { calculateTirePressure };
