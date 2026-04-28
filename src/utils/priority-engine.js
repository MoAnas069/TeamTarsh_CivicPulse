/* ============================================
   CivicPulse — AI Priority Engine
   ============================================ */

export function calculatePriorityScore(issue) {
  let score = 0;
  
  // 1. Base category risk
  const BASE_SCORES = {
    'Electrical Hazard': 80,
    'Water & Drainage': 70,
    'Traffic & Signals': 60,
    'Road Damage': 50,
    'Waste Management': 40,
    'Building & Infrastructure': 30,
    'Parks & Green Spaces': 20,
    'Street Lighting': 20,
    'Noise Pollution': 10,
    'Other': 10,
  };
  score += BASE_SCORES[issue.category] || 10;
  
  // 2. Community Upvote Signal (max +30 points)
  const upvotes = issue.upvotes || 0;
  score += Math.min(30, upvotes * 1.5);
  
  // 3. Time Delta (Stagnation) (+1 per day unresolved, max +20)
  const daysOld = (new Date() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24);
  score += Math.min(20, Math.max(0, Math.floor(daysOld)));
  
  // Normalize score
  score = Math.min(100, Math.round(score));
  
  // Severity Label mapping
  let label = 'Low';
  if (score >= 80) label = 'Critical';
  else if (score >= 60) label = 'High';
  else if (score >= 35) label = 'Medium';
  
  return { score, label };
}
