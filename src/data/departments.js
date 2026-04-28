/* ============================================
   CivicPulse — Departments
   Mapping categories to responsible departments
   ============================================ */

export const DEPARTMENT_MAP = {
  'Road Damage': 'Dept of Transportation',
  'Street Lighting': 'Dept of Transportation',
  'Traffic & Signals': 'Dept of Transportation',
  
  'Waste Management': 'Sanitation Dept',
  
  'Water & Drainage': 'Water Authority',
  
  'Parks & Green Spaces': 'Parks & Recreation',
  
  'Building & Infrastructure': 'Public Works',
  
  'Noise Pollution': 'Environmental Dept',
  
  'Electrical Hazard': 'Public Utilities',
  
  'Other': 'General Services'
};

export function getDepartmentForCategory(categoryName) {
  return DEPARTMENT_MAP[categoryName] || 'General Services';
}
