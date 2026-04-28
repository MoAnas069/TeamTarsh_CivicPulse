/* ============================================
   CivicPulse — Category Definitions
   ============================================ */

export const CATEGORIES = [
  {
    id: 'road-damage',
    name: 'Road Damage',
    emoji: '🚧',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  {
    id: 'street-lighting',
    name: 'Street Lighting',
    emoji: '💡',
    color: '#FBBF24',
    bgColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  {
    id: 'waste-management',
    name: 'Waste Management',
    emoji: '🗑️',
    color: '#A78BFA',
    bgColor: 'rgba(167, 139, 250, 0.12)',
    borderColor: 'rgba(167, 139, 250, 0.25)',
  },
  {
    id: 'water-drainage',
    name: 'Water & Drainage',
    emoji: '🌊',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  {
    id: 'parks-green',
    name: 'Parks & Green Spaces',
    emoji: '🌳',
    color: '#34D399',
    bgColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  {
    id: 'building-infrastructure',
    name: 'Building & Infrastructure',
    emoji: '🏗️',
    color: '#FB923C',
    bgColor: 'rgba(251, 146, 60, 0.12)',
    borderColor: 'rgba(251, 146, 60, 0.25)',
  },
  {
    id: 'traffic-signals',
    name: 'Traffic & Signals',
    emoji: '🚦',
    color: '#F472B6',
    bgColor: 'rgba(244, 114, 182, 0.12)',
    borderColor: 'rgba(244, 114, 182, 0.25)',
  },
  {
    id: 'noise-pollution',
    name: 'Noise Pollution',
    emoji: '🔊',
    color: '#818CF8',
    bgColor: 'rgba(129, 140, 248, 0.12)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
  },
  {
    id: 'electrical-hazard',
    name: 'Electrical Hazard',
    emoji: '⚡',
    color: '#FCD34D',
    bgColor: 'rgba(252, 211, 77, 0.12)',
    borderColor: 'rgba(252, 211, 77, 0.25)',
  },
  {
    id: 'other',
    name: 'Other',
    emoji: '📋',
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
];

/**
 * Get category object by name
 */
export function getCategoryByName(name) {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
}

/**
 * Get all category names
 */
export function getCategoryNames() {
  return CATEGORIES.map(c => c.name);
}
