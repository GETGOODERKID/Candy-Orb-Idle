// Central tuning knobs (balance + performance)
window.COI_CONFIG = {
  buildingGrowth: 1.15,

  // Refund must always be less than what you paid.
  sellRefundRate: 0.45,

  // Achievements: +5% per completed achievement.
  achievementPow: 1.05,

  // Prestige
  prestigeRequiredEarned: 100000,
  prestigePointsFormula: "sqrt", // keep readable for future tweaks
  prestigeExponent: 0.5,

  // Offline progress
  offlineCapSeconds: 2 * 60 * 60,

  // Waterfall
  waterfallMinOnHand: 1000,
  waterfallMaxDropsPerSecond: 20,
};
