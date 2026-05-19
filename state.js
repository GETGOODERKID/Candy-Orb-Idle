(() => {
  const els = {
    game: document.getElementById("game"),
    rainContainer: document.getElementById("rainContainer"),

    candyOrbs: document.getElementById("candyOrbs"),
    cps: document.getElementById("cps"),
    clickPower: document.getElementById("clickPower"),
    critChance: document.getElementById("critChance"),
    prestigeLevel: document.getElementById("prestigeLevel"),
    prestigeTop: document.getElementById("prestigeTop"),
    msg: document.getElementById("msg"),

    shop: document.getElementById("shop"),
    upgrades: document.getElementById("upgrades"),
    stats: document.getElementById("stats"),
    prestige: document.getElementById("prestige"),
    achievements: document.getElementById("achievements"),
    settings: document.getElementById("settings"),
  };

  const state = {
    // 💰 CURRENT CURRENCY (changes up/down)
    candyOrbs: 0,

    // ⭐ LIFETIME CURRENCY (NEVER decreases)
    totalCandyEarned: 0,

    clickPower: 1,
    critChance: 0.10,
    critMult: 1,

    prestige: 0,
    prestigePoints: 0,

    buildingMult: 1,
    clickMult: 1,
    costMult: 1,
    prestigeGainMult: 1,
    cpsFromUpgrades: 1,
    achievementBonus: 1,

    useShortFormat: true,
    sound: true,
    soundVolume: 0.4,
    clickSoundVol: 1.0,
    buySoundVol: 0.5,
    critSoundVol: 0.5,
    prestigeSoundVol: 0.5,
    particles: true,
    autoSave: true,

    clickUpgradesBought: new Set(),
    prestigeUpgradesBought: new Set(),
    achievementsDone: new Set(),

    totalClicks: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalCrits: 0,
    totalSold: 0,
    totalSoldValue: 0,

    hotStreak: 0,
    bestHotStreak: 0,

    lastPrestigeEarned: 0,

    buildings: [],
    upgrades: [],
    prestigeUpgrades: [],

    waterfallUnlocked: false, // ✅ IMPORTANT FIX

    paused: false,
    reduceMotion: false,

    startedAt: Date.now(),
    lastTick: Date.now(),

    buyMode: 1, // 1 | 10 | 100 | "max"

    _audioCtx: null,
  };

  window.COI = window.COI || {};
  window.COI.els = els;
  window.COI.state = state;
})();
