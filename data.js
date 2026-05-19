(() => {
  const { state } = window.COI;

  function building(def) {
    return {
      id: def.id, name: def.name, desc: def.desc,
      baseCost: def.baseCost, baseCps: def.cps,
      count: 0, bonusMult: 1,
      tier: def.tier || 0,
      unlockAt: def.unlockAt || 0,
    };
  }

  // Keep your original first 10 buildings (rest can be re-added later if you want).
  state.buildings = [
    building({ id:"candyMaker",        name:"Candy Maker",          baseCost:15,            cps:0.1,        desc:"Basic candy", tier:1  }),
    building({ id:"sugarPlant",        name:"Sugar Plant",          baseCost:100,           cps:1,          desc:"Grows candy",                   tier:2,  unlockAt:50 }),
    building({ id:"candyFactory",      name:"Candy Factory",        baseCost:1100,          cps:10,         desc:"Industrial production",           tier:3,  unlockAt:500 }),
    building({ id:"chocolateVault",    name:"Chocolate Vault",      baseCost:12000,         cps:100,        desc:"Stores chocolate",               tier:4,  unlockAt:5000 }),
    building({ id:"candyCore",         name:"Candy Core",           baseCost:130000,        cps:1000,       desc:"Essence of candy",                tier:5,  unlockAt:50000 }),
    building({ id:"dimensionRift",     name:"Dimension Rift",       baseCost:1400000,       cps:10000,      desc:"Interdimensional source",         tier:6,  unlockAt:500000 }),
    building({ id:"infinityMachine",   name:"Infinity Machine",     baseCost:20000000,      cps:100000,     desc:"Infinite loop",                  tier:7,  unlockAt:5000000 }),
    building({ id:"universeEngine",    name:"Universe Engine",      baseCost:330000000,     cps:1000000,    desc:"All realities produce",          tier:8,  unlockAt:50000000 }),
    building({ id:"omniFactory",       name:"Omni-Factory",         baseCost:5200000000,    cps:10000000,   desc:"Every dimension",                tier:9,  unlockAt:500000000 }),
    building({ id:"candyGod",          name:"Candy Deity",          baseCost:84000000000,   cps:100000000,  desc:"Divine creation",                tier:10, unlockAt:5000000000 }),
    building({ id:"realityWarp",       name:"Reality Warp",         baseCost:1.4e12,        cps:1000000000, desc:"Bend reality",                   tier:11, unlockAt:50000000000 }),
    building({ id:"timeWeaver",        name:"Time Weaver",          baseCost:2.3e13,        cps:10000000000,desc:"Control time",                   tier:12, unlockAt:500000000000 }),
    building({ id:"quantumForge",      name:"Quantum Forge",        baseCost:3.8e14,        cps:100000000000, desc:"Subatomic candy",                tier:13, unlockAt:5000000000000 }),
    building({ id:"cosmicLoom",        name:"Cosmic Loom",          baseCost:6.2e15,        cps:1000000000000, desc:"Weave existence",                tier:14, unlockAt:50000000000000 }),
    building({ id:"singularityCore",   name:"Singularity Core",     baseCost:1.02e17,       cps:10000000000000, desc:"Black hole candy",               tier:15, unlockAt:500000000000000 }),
    building({ id:"paracosm",          name:"Paracosm",             baseCost:1.66e18,       cps:100000000000000, desc:"Pocket dimension",               tier:16, unlockAt:5000000000000000 }),
    building({ id:"omegaPoint",        name:"Omega Point",          baseCost:2.73e19,       cps:1000000000000000, desc:"End of time",                    tier:17, unlockAt:50000000000000000 }),
    building({ id:"platonia",          name:"Platonia",             baseCost:4.46e20,       cps:10000000000000000, desc:"Pure mathematics",               tier:18, unlockAt:500000000000000000 }),
    building({ id:"nexus",             name:"Nexus",                baseCost:7.3e21,        cps:100000000000000000, desc:"Center of all",                 tier:19, unlockAt:5e18 }),
    building({ id:"absolute",          name:"Absolute",             baseCost:1.2e23,        cps:1000000000000000000, desc:"Void itself",                   tier:20, unlockAt:5e19 }),
    building({ id:"primordial",        name:"Primordial",           baseCost:2e24,          cps:1e21, desc:"First existence",                 tier:21, unlockAt:5e20 }),
    building({ id:"eternity",          name:"Eternity",             baseCost:3.3e25,        cps:1e22, desc:"Infinite time",                  tier:22, unlockAt:5e21 }),
    building({ id:"infinity",          name:"Infinity",             baseCost:5.4e26,        cps:1e23, desc:"Boundless",                       tier:23, unlockAt:5e22 }),
    building({ id:"transcendence",     name:"Transcendence",        baseCost:8.8e27,        cps:1e24, desc:"Beyond all",                     tier:24, unlockAt:5e23 }),
    building({ id:"omniscience",       name:"Omniscience",          baseCost:1.44e29,       cps:1e25, desc:"All knowledge",                  tier:25, unlockAt:5e24 }),
    building({ id:"omnipotence",       name:"Omnipotence",          baseCost:2.35e30,       cps:1e26, desc:"All power",                      tier:26, unlockAt:5e25 }),
    building({ id:"divinity",          name:"Divinity",             baseCost:3.84e31,       cps:1e27, desc:"God-like force",                tier:27, unlockAt:5e26 }),
    building({ id:"apotheosis",        name:"Apotheosis",           baseCost:6.27e32,       cps:1e28, desc:"Ultimate form",                 tier:28, unlockAt:5e27 }),
    building({ id:"hyperdimension",    name:"Hyperdimension",       baseCost:1.02e34,       cps:1e29, desc:"Beyond dimensions",              tier:29, unlockAt:5e28 }),
    building({ id:"metaverse",         name:"Metaverse",            baseCost:1.67e35,       cps:1e30, desc:"All universes",                 tier:30, unlockAt:5e29 }),
  ];

  state.upgrades = [
    { id:"u_click1", name:"Sharper Tap",          cost:25,         type:"click",    desc:"+1 click power",                      effect:()=>{ state.clickPower+=1; },              requires:[] },
    { id:"u_click2", name:"Double Tap",           cost:150,        type:"click",    desc:"+2 click power",                      effect:()=>{ state.clickPower+=2; },            requires:[] },
    { id:"u_click3", name:"Finger Boost",         cost:800,        type:"click",    desc:"+5 click power",                      effect:()=>{ state.clickPower+=5; },             requires:[] },
    { id:"u_click4", name:"Rapid Fire",           cost:4500,       type:"click",    desc:"+15 click power",                     effect:()=>{ state.clickPower+=15; },            requires:[] },
    { id:"u_click5", name:"Supersonic Tap",       cost:28000,      type:"click",    desc:"+40 click power",                     effect:()=>{ state.clickPower+=40; },            requires:[] },
    { id:"u_click6", name:"Hyper Click",          cost:200000,     type:"click",    desc:"Click power x2",                      effect:()=>{ state.clickPower*=2; },             requires:[] },
    { id:"u_click7", name:"Phantom Strike",       cost:2000000,    type:"click",    desc:"Click power x2",                      effect:()=>{ state.clickPower*=2; },             requires:[] },
    { id:"u_click8", name:"Reality Punch",        cost:50000000,   type:"click",    desc:"Click power x3",                      effect:()=>{ state.clickPower*=3; },             requires:[] },
    { id:"u_click9", name:"Cosmic Tap",           cost:800000000,  type:"click",    desc:"Click power x2",                      effect:()=>{ state.clickPower*=2; },             requires:[] },
    { id:"u_click10", name:"Infinity Snap",       cost:15000000000, type:"click",   desc:"Click power x2",                      effect:()=>{ state.clickPower*=2; },             requires:[] },
    { id:"u_click11", name:"Omnipotent Touch",    cost:3.5e14,     type:"click",    desc:"Click power x3",                      effect:()=>{ state.clickPower*=3; },             requires:[] },

    { id:"u_crit6",  name:"Chaos Theory",         cost:12000000,   type:"crit",     desc:"+30% crit chance, x1.5 multiplier",   effect:()=>{ state.critChance+=0.30; state.critMult*=1.5; },  requires:[] },
    { id:"u_crit7",  name:"Paradox Engine",       cost:200000000,  type:"crit",     desc:"+35% crit chance",                    effect:()=>{ state.critChance+=0.35; },          requires:[] },
    { id:"u_crit8",  name:"Singularity Strike",   cost:4000000000, type:"crit",     desc:"+40% crit chance",                    effect:()=>{ state.critChance+=0.40; },          requires:[] },
    { id:"u_crit9",  name:"Quantum Entanglement", cost:8.5e13,     type:"crit",     desc:"+45% crit chance, x2 multiplier",     effect:()=>{ state.critChance+=0.45; state.critMult*=2; },  requires:[] },

    { id:"u_build6",  name:"Quantum Leap",        cost:80000000,   type:"building", desc:"All buildings x2",                    effect:()=>{ state.buildingMult*=2; },           requires:[] },
    { id:"u_build7",  name:"Dimensional Mastery", cost:2000000000, type:"building", desc:"All buildings x3",                    effect:()=>{ state.buildingMult*=3; },           requires:[] },
    { id:"u_build8",  name:"Cosmic Convergence",  cost:5e13,       type:"building", desc:"All buildings x5",                    effect:()=>{ state.buildingMult*=5; },           requires:[] },
    { id:"u_build9",  name:"Reality Engine",      cost:1.2e15,     type:"building", desc:"All buildings x7",                    effect:()=>{ state.buildingMult*=7; },           requires:[] },

    { id:"u_cm1", name:"Better Mixers",           cost:500,        type:"building", desc:"Candy Makers x2",                     effect:()=>{ window.COI.econ.getBuilding("candyMaker").bonusMult*=2; }, requires:[] },
    { id:"u_cm2", name:"Super Makers",            cost:8000,       type:"building", desc:"Candy Makers x4",                     effect:()=>{ window.COI.econ.getBuilding("candyMaker").bonusMult*=4; }, requires:[] },
    { id:"u_sp1",  name:"Fertilizer",             cost:2500,       type:"building", desc:"Sugar Plants x2",                     effect:()=>{ window.COI.econ.getBuilding("sugarPlant").bonusMult*=2; }, requires:[] },
    { id:"u_sp2",  name:"Super Soil",             cost:40000,      type:"building", desc:"Sugar Plants x4",                     effect:()=>{ window.COI.econ.getBuilding("sugarPlant").bonusMult*=4; }, requires:[] },
    { id:"u_cf1",  name:"Better Conveyor",        cost:15000,      type:"building", desc:"Candy Factories x2",                  effect:()=>{ window.COI.econ.getBuilding("candyFactory").bonusMult*=2; }, requires:[] },
    { id:"u_cf2",  name:"Turbo Machines",         cost:200000,     type:"building", desc:"Candy Factories x4",                  effect:()=>{ window.COI.econ.getBuilding("candyFactory").bonusMult*=4; }, requires:[] },
    { id:"u_cv1",  name:"Reinforced Vault",       cost:150000,     type:"building", desc:"Chocolate Vaults x2",                 effect:()=>{ window.COI.econ.getBuilding("chocolateVault").bonusMult*=2; }, requires:[] },
    { id:"u_cv2",  name:"Infinite Storage",       cost:3000000,    type:"building", desc:"Chocolate Vaults x4",                 effect:()=>{ window.COI.econ.getBuilding("chocolateVault").bonusMult*=4; }, requires:[] },
    { id:"u_cc1",  name:"Stabilized Core",        cost:2000000,    type:"building", desc:"Candy Cores x2",                      effect:()=>{ window.COI.econ.getBuilding("candyCore").bonusMult*=2; }, requires:[] },
    { id:"u_dr1",  name:"Dimensional Anchor",     cost:30000000,   type:"building", desc:"Dimension Rifts x2",                  effect:()=>{ window.COI.econ.getBuilding("dimensionRift").bonusMult*=2; }, requires:[] },
    { id:"u_im1",  name:"Loop Amplifier",         cost:500000000,  type:"building", desc:"Infinity Machines x2",                effect:()=>{ window.COI.econ.getBuilding("infinityMachine").bonusMult*=2; }, requires:[] },
    { id:"u_ue1",  name:"Universal Harmony",      cost:1e10,       type:"building", desc:"Universe Engines x2",                 effect:()=>{ window.COI.econ.getBuilding("universeEngine").bonusMult*=2; }, requires:[] },
    { id:"u_cost6",  name:"Financial Collapse",   cost:1000000000, type:"cost",     desc:"Buildings cost -35%",                 effect:()=>{ state.costMult*=0.65; },            requires:[] },
    { id:"u_cost7",  name:"Infinite Wealth",      cost:2.5e13,     type:"cost",     desc:"Buildings cost -40%",                 effect:()=>{ state.costMult*=0.60; },            requires:[] },
    { id:"u_cost8",  name:"Economic Singularity", cost:6e15,       type:"cost",     desc:"Buildings cost -45%",                 effect:()=>{ state.costMult*=0.55; },            requires:[] },
  ];

  state.prestigeUpgrades = [
    { id:"p1",  name:"Ascended Fingers",    cost:1,   desc:"Click power +25% permanently",            effect:()=>{ state.clickMult*=1.25; },                                        requires:[] },
    { id:"p2",  name:"Sticky Legacy",       cost:2,   desc:"All buildings +15% permanently",          effect:()=>{ state.buildingMult*=1.15; },                                     requires:[] },
    { id:"p3",  name:"Lucky Bloodline",     cost:2,   desc:"+8% crit chance permanently",             effect:()=>{ state.critChance+=0.08; },                                       requires:[] },
    { id:"p4",  name:"Cheap Rebuild",       cost:3,   desc:"Buildings cost -12% permanently",         effect:()=>{ state.costMult*=0.88; },                                      requires:[] },
    { id:"p5",  name:"Legacy Printer",      cost:4,   desc:"Prestige gain +60% permanently",          effect:()=>{ state.prestigeGainMult*=1.60; },                              requires:[] },

    { id:"p6",  name:"Double Ascension",    cost:5,   desc:"Click power +50% permanently",            effect:()=>{ state.clickMult*=1.50; },                                        requires:[] },
    { id:"p7",  name:"Eternal Growth",      cost:6,   desc:"All buildings +35% permanently",          effect:()=>{ state.buildingMult*=1.35; },                                     requires:[] },
    { id:"p8",  name:"Fate Weaver",         cost:7,   desc:"+20% crit chance permanently",            effect:()=>{ state.critChance+=0.20; },                                       requires:[] },
    { id:"p9",  name:"Prestige Rush",       cost:6,   desc:"Prestige gain +100% permanently",         effect:()=>{ state.prestigeGainMult*=2.0; },                                 requires:[] },
    { id:"p10", name:"Candy Hoard",         cost:8,   desc:"Buildings cost -20% permanently",         effect:()=>{ state.costMult*=0.80; },                                       requires:[] },
    { id:"p11", name:"Transcendence",       cost:10,  desc:"Click power +100% permanently",           effect:()=>{ state.clickMult*=2; },                                        requires:[] },
    { id:"p12", name:"Infinite Potential",  cost:12,  desc:"All buildings x2 permanently",            effect:()=>{ state.buildingMult*=2; },                                     requires:[] },
    { id:"p13", name:"Critical Destiny",    cost:11,  desc:"+50% crit chance permanently",            effect:()=>{ state.critChance+=0.50; },                                     requires:[] },
    { id:"p14", name:"Prestige Apotheosis", cost:15,  desc:"Prestige gain +300% permanently",         effect:()=>{ state.prestigeGainMult*=4; },                                requires:[] },
    { id:"p15", name:"Eternal Essence",     cost:20,  desc:"All permanent bonuses x1.5",              effect:()=>{ state.clickMult*=1.5; state.buildingMult*=1.5; state.costMult*=0.9; },  requires:[] },
  ];

  window.COI.achievements = [
    { id:"a1",  name:"First Click",        desc:"Click once",                           check:({state})=>state.totalClicks>=1 },
    { id:"a2",  name:"Sweet Tooth",        desc:"Earn 100 candy orbs",                  check:({state})=>state.totalEarned>=100 },
    { id:"a3",  name:"Candy Maker Master", desc:"Own 5 Candy Makers",                   check:({getBuildingCount})=>getBuildingCount("candyMaker")>=5 },
    { id:"a4",  name:"Click Maniac",       desc:"Click 500 times",                      check:({state})=>state.totalClicks>=500 },
    { id:"a5",  name:"Millionaire",        desc:"Earn 1 million candy orbs",            check:({state})=>state.totalEarned>=1e6 },
    { id:"a6",  name:"Billionaire",        desc:"Earn 1 billion candy orbs",            check:({state})=>state.totalEarned>=1e9 },
    { id:"a7",  name:"Prestige Master",    desc:"Reach prestige 10",                    check:({state})=>state.prestige>=10 },
    { id:"a8",  name:"Crit Champion",      desc:"Get 1000 crits",                       check:({state})=>state.totalCrits>=1000 },
    { id:"a9",  name:"Hot Streak",         desc:"Get a 10x best streak",                check:({state})=>state.bestHotStreak>=10 },
    { id:"a10", name:"Factory Owner",      desc:"Own 10 Candy Factories",               check:({getBuildingCount})=>getBuildingCount("candyFactory")>=10 },
    { id:"a11", name:"Late Game",          desc:"Own a Dimension Rift",                 check:({getBuildingCount})=>getBuildingCount("dimensionRift")>=1 },
    { id:"a12", name:"Endgame",            desc:"Own a Candy Deity",                    check:({getBuildingCount})=>getBuildingCount("candyGod")>=1 },
    { id:"a13", name:"Time Lord",          desc:"Own a Time Weaver",                    check:({getBuildingCount})=>getBuildingCount("timeWeaver")>=1 },
    { id:"a14", name:"Rain Dance",         desc:"Have 10,000 candy orbs at once",       check:({state})=>state.candyOrbs>=10000 },
    { id:"a15", name:"Click God",          desc:"Click 10,000 times",                   check:({state})=>state.totalClicks>=10000 },

    { id:"a25", name:"Steady Flow",        desc:"Reach 1,000 candy/sec",                check:({getCPS})=>getCPS()>=1000 },
    { id:"a26", name:"Firehose",           desc:"Reach 1,000,000 candy/sec",            check:({getCPS})=>getCPS()>=1e6 },
    { id:"a27", name:"Galaxy Printer",     desc:"Reach 1,000,000,000 candy/sec",        check:({getCPS})=>getCPS()>=1e9 },

    { id:"a28", name:"Big Spender",        desc:"Spend 1 million candy orbs",           check:({state})=>state.totalSpent>=1e6 },
    { id:"a29", name:"Whale",              desc:"Spend 1 billion candy orbs",           check:({state})=>state.totalSpent>=1e9 },

    { id:"a30", name:"Lucky Run",          desc:"Get a 25x best streak",                check:({state})=>state.bestHotStreak>=25 },

    { id:"a31", name:"First Sale",         desc:"Sell 1 building",                      check:({state})=>state.totalSold>=1 },
    { id:"a32", name:"Moving Stock",       desc:"Sell 10 buildings",                    check:({state})=>state.totalSold>=10 },
    { id:"a33", name:"Liquidation",        desc:"Sell 100 buildings",                   check:({state})=>state.totalSold>=100 },
    { id:"a34", name:"Fire Sale",          desc:"Sell 1,000 buildings",                 check:({state})=>state.totalSold>=1000 },
    { id:"a35", name:"Market Maker",       desc:"Sell 10,000 buildings",                check:({state})=>state.totalSold>=10000 },

    { id:"a36", name:"Pocket Change",      desc:"Earn 1,000 from selling",              check:({state})=>state.totalSoldValue>=1000 },
    { id:"a37", name:"Reseller",           desc:"Earn 1,000,000 from selling",          check:({state})=>state.totalSoldValue>=1e6 },
    { id:"a38", name:"Liquid Wealth",      desc:"Earn 1,000,000,000 from selling",      check:({state})=>state.totalSoldValue>=1e9 },

    { id:"a39", name:"Cleanup Crew",       desc:"Sell 100,000 buildings",               check:({state})=>state.totalSold>=100000 },
    { id:"a40", name:"Global Liquidation", desc:"Sell 1,000,000 buildings",             check:({state})=>state.totalSold>=1000000 },
    { id:"a41", name:"Auction House",      desc:"Earn 1,000,000,000,000 from selling",  check:({state})=>state.totalSoldValue>=1e12 },
  ].map(a => ({
    ...a,
    reward: ({updateAchievementBonus}) => updateAchievementBonus(),
  }));
})();
