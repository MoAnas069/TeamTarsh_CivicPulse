/* ============================================
   CivicPulse — Category Definitions
   Government Portal Theme — No Emojis
   ============================================ */

export const CATEGORIES = [
  {
    id: 'road-damage',
    name: 'Road Damage',
    icon: 'construction',
    color: '#B91C1C',
    bgColor: '#FEF2F2',
    borderColor: 'rgba(185, 28, 28, 0.2)',
  },
  {
    id: 'street-lighting',
    name: 'Street Lighting',
    icon: 'lightbulb',
    color: '#B45309',
    bgColor: '#FFFBEB',
    borderColor: 'rgba(180, 83, 9, 0.2)',
  },
  {
    id: 'waste-management',
    name: 'Waste Management',
    icon: 'trash-2',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  {
    id: 'water-drainage',
    name: 'Water & Drainage',
    icon: 'droplets',
    color: '#0369A1',
    bgColor: '#F0F9FF',
    borderColor: 'rgba(3, 105, 161, 0.2)',
  },
  {
    id: 'parks-green',
    name: 'Parks & Green Spaces',
    icon: 'trees',
    color: '#15803D',
    bgColor: '#F0FDF4',
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  {
    id: 'building-infrastructure',
    name: 'Building & Infrastructure',
    icon: 'building-2',
    color: '#C2410C',
    bgColor: '#FFF7ED',
    borderColor: 'rgba(194, 65, 12, 0.2)',
  },
  {
    id: 'traffic-signals',
    name: 'Traffic & Signals',
    icon: 'traffic-cone',
    color: '#BE185D',
    bgColor: '#FDF2F8',
    borderColor: 'rgba(190, 24, 93, 0.2)',
  },
  {
    id: 'noise-pollution',
    name: 'Noise Pollution',
    icon: 'volume-2',
    color: '#4338CA',
    bgColor: '#EEF2FF',
    borderColor: 'rgba(67, 56, 202, 0.2)',
  },
  {
    id: 'electrical-hazard',
    name: 'Electrical Hazard',
    icon: 'zap',
    color: '#A16207',
    bgColor: '#FEFCE8',
    borderColor: 'rgba(161, 98, 7, 0.2)',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'clipboard-list',
    color: '#475569',
    bgColor: '#F8FAFC',
    borderColor: 'rgba(71, 85, 105, 0.2)',
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
