/* ============================================
   CivicPulse — AI Categorization Engine
   Keyword-matching with weighted scores
   ============================================ */

const KEYWORD_MAP = {
  'Road Damage': {
    weight: 1,
    keywords: {
      'pothole': 10, 'potholes': 10, 'crack': 7, 'cracked': 7, 'cracks': 7,
      'road': 5, 'street': 3, 'pavement': 8, 'asphalt': 8, 'concrete': 4,
      'broken road': 10, 'damaged road': 10, 'sinkhole': 9, 'bumpy': 6,
      'uneven': 6, 'surface': 3, 'erosion': 6, 'collapse': 7,
      'gravel': 5, 'manhole': 6, 'curb': 4, 'sidewalk damage': 8,
    },
  },
  'Street Lighting': {
    weight: 1,
    keywords: {
      'light': 7, 'lights': 7, 'lighting': 8, 'lamp': 8, 'lamppost': 9,
      'streetlight': 10, 'street light': 10, 'dark': 6, 'darkness': 6,
      'dim': 5, 'bulb': 7, 'flickering': 8, 'broken light': 10,
      'no light': 9, 'illumination': 7, 'visibility': 4, 'night': 4,
      'not working': 4, 'out': 3,
    },
  },
  'Waste Management': {
    weight: 1,
    keywords: {
      'trash': 9, 'garbage': 9, 'waste': 8, 'litter': 8, 'littering': 8,
      'dumpster': 9, 'bin': 7, 'bins': 7, 'overflowing': 8, 'overflow': 8,
      'dump': 7, 'rubbish': 8, 'junk': 6, 'debris': 5, 'cleanup': 6,
      'recycle': 6, 'recycling': 6, 'smell': 5, 'stink': 5, 'rodent': 6,
      'rats': 6, 'flies': 5, 'sanitation': 7, 'filthy': 6, 'dirty': 4,
    },
  },
  'Water & Drainage': {
    weight: 1,
    keywords: {
      'water': 6, 'flood': 9, 'flooding': 9, 'drain': 9, 'drainage': 9,
      'sewer': 8, 'sewage': 9, 'clogged': 7, 'blocked': 5, 'overflow': 5,
      'pipe': 7, 'leak': 8, 'leaking': 8, 'burst': 7, 'puddle': 6,
      'standing water': 9, 'waterlogged': 8, 'gutter': 6, 'stormwater': 8,
      'hydrant': 7, 'contaminated': 6,
    },
  },
  'Parks & Green Spaces': {
    weight: 1,
    keywords: {
      'park': 8, 'parks': 8, 'tree': 7, 'trees': 7, 'garden': 7,
      'playground': 9, 'bench': 6, 'grass': 5, 'lawn': 5, 'green': 4,
      'swing': 7, 'slide': 5, 'overgrown': 7, 'weeds': 6, 'fallen tree': 9,
      'branch': 5, 'trimming': 6, 'vandalism': 4, 'graffiti': 4,
      'fountain': 6, 'trail': 5, 'path': 3,
    },
  },
  'Building & Infrastructure': {
    weight: 1,
    keywords: {
      'building': 7, 'structure': 6, 'wall': 5, 'fence': 5, 'bridge': 8,
      'overpass': 7, 'underpass': 7, 'railing': 6, 'stairs': 6, 'step': 4,
      'construction': 6, 'abandoned': 7, 'derelict': 7, 'unsafe': 5,
      'crumbling': 7, 'collapse': 6, 'scaffolding': 5, 'roof': 5,
      'foundation': 6, 'condemned': 8,
    },
  },
  'Traffic & Signals': {
    weight: 1,
    keywords: {
      'traffic': 8, 'signal': 8, 'signals': 8, 'traffic light': 10,
      'stop sign': 9, 'sign': 5, 'signs': 5, 'crosswalk': 7, 'crossing': 6,
      'intersection': 6, 'speed': 4, 'speeding': 5, 'congestion': 6,
      'jam': 4, 'accident': 5, 'road marking': 7, 'lane': 4,
      'pedestrian': 5, 'zebra crossing': 8, 'roundabout': 5,
    },
  },
  'Noise Pollution': {
    weight: 1,
    keywords: {
      'noise': 10, 'noisy': 9, 'loud': 8, 'sound': 5, 'construction noise': 10,
      'music': 5, 'honking': 7, 'horn': 5, 'barking': 5, 'disturbance': 6,
      'disruptive': 6, 'vibration': 5, 'blasting': 7, 'drilling': 6,
      'party': 4, 'nighttime': 4, 'quiet': 3, 'decibel': 8,
    },
  },
  'Electrical Hazard': {
    weight: 1,
    keywords: {
      'electric': 8, 'electrical': 9, 'wire': 8, 'wires': 8, 'cable': 7,
      'cables': 7, 'exposed wire': 10, 'power line': 9, 'transformer': 8,
      'spark': 7, 'sparking': 8, 'shock': 7, 'voltage': 6, 'outage': 6,
      'power outage': 8, 'blackout': 7, 'short circuit': 9, 'electrocution': 10,
      'danger': 4, 'hazard': 4,
    },
  },
};

/**
 * Categorize a description using keyword matching
 * Returns { category: string, confidence: number (0-1) }
 */
export function categorize(description) {
  if (!description || description.trim().length === 0) {
    return { category: 'Other', confidence: 0 };
  }

  const text = description.toLowerCase();
  const scores = {};
  let maxScore = 0;

  for (const [category, data] of Object.entries(KEYWORD_MAP)) {
    let score = 0;

    for (const [keyword, weight] of Object.entries(data.keywords)) {
      // Check for multi-word keywords first
      if (keyword.includes(' ')) {
        if (text.includes(keyword)) {
          score += weight * data.weight;
        }
      } else {
        // Word boundary matching for single words
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += weight * data.weight * matches.length;
        }
      }
    }

    scores[category] = score;
    if (score > maxScore) maxScore = score;
  }

  // Find the best category
  let bestCategory = 'Other';
  let bestScore = 0;

  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Calculate confidence (normalize to 0-1 range, cap at 0.98)
  const confidence = bestScore === 0 ? 0 : Math.min(0.98, bestScore / (bestScore + 8));

  if (confidence < 0.2) {
    return { category: 'Other', confidence: 0 };
  }

  return {
    category: bestCategory,
    confidence: Math.round(confidence * 100) / 100,
  };
}
