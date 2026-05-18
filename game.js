(() => {
  const game = document.getElementById("game");
  const rainContainer = document.getElementById("rainContainer");

  const els = {
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

  const BUILDING_GROWTH = 1.15;
  const BUILDING_GROWTH_DELTA = BUILDING_GROWTH - 1;

  let buyMode = 1; // 1 | 10 | 100 | "max"

  const state = {
    candyOrbs: 0,
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
    rainActive: false,
    waterfall: true,
    paused: false,
    reduceMotion: false,
    startedAt: Date.now(),
    lastTick: Date.now()
  };

  function building(def) {
    return {
      id: def.id, name: def.name, desc: def.desc,
      baseCost: def.baseCost, cost: def.baseCost, baseCps: def.cps, cps: def.cps,
      count: 0, bonusMult: 1, tier: def.tier || 0, unlockAt: def.unlockAt || 0
    };
  }

  state.buildings = [
    building({ id:"candyMaker",        name:"Candy Maker",          baseCost:15,            cps:0.1,        desc:"Basic candy", tier:1  }),
    building({ id:"sugarPlant",        name:"Sugar Plant",          baseCost:100,           cps:1,          desc:"Grows candy", tier:2,  unlockAt:50 }),
    building({ id:"candyFactory",      name:"Candy Factory",        baseCost:1100,          cps:10,         desc:"Industrial production", tier:3,  unlockAt:500 }),
    building({ id:"chocolateVault",    name:"Chocolate Vault",      baseCost:12000,         cps:100,        desc:"Stores chocolate", tier:4,  unlockAt:5000 }),
    building({ id:"candyCore",         name:"Candy Core",           baseCost:130000,        cps:1000,       desc:"Essence of candy", tier:5,  unlockAt:50000 }),
    building({ id:"dimensionRift",     name:"Dimension Rift",       baseCost:1400000,       cps:10000,      desc:"Interdimensional source", tier:6,  unlockAt:500000 }),
    building({ id:"infinityMachine",   name:"Infinity Machine",     baseCost:20000000,      cps:100000,     desc:"Infinite loop", tier:7,  unlockAt:5000000 }),
    building({ id:"universeEngine",    name:"Universe Engine",      baseCost:330000000,     cps:1000000,    desc:"All realities produce", tier:8,  unlockAt:50000000 }),
    building({ id:"omniFactory",       name:"Omni-Factory",         baseCost:5200000000,    cps:10000000,   desc:"Every dimension", tier:9,  unlockAt:500000000 }),
    building({ id:"candyGod",          name:"Candy Deity",          baseCost:84000000000,   cps:100000000,  desc:"Divine creation", tier:10, unlockAt:5000000000 }),
  ];

  state.upgrades = [
    { id:"u_click1", name:"Sharper Tap", cost:25, type:"click", desc:"+1 click power", effect:()=>{ state.clickPower+=1; }, requires:[] },
    { id:"u_click2", name:"Double Tap",  cost:150, type:"click", desc:"+2 click power", effect:()=>{ state.clickPower+=2; }, requires:[] },
    { id:"u_crit6",  name:"Chaos Theory", cost:12000000, type:"crit", desc:"+30% crit chance, x1.5 multiplier", effect:()=>{ state.critChance+=0.30; state.critMult*=1.5; }, requires:[] },
    { id:"u_build6", name:"Quantum Leap", cost:80000000, type:"building", desc:"All buildings x2", effect:()=>{ state.buildingMult*=2; }, requires:[] },
    { id:"u_cost6",  name:"Financial Collapse", cost:1000000000, type:"cost", desc:"Buildings cost -35%", effect:()=>{ state.costMult*=0.65; }, requires:[] },
  ];

  state.prestigeUpgrades = [
    { id:"p1",  name:"Ascended Fingers", cost:1, desc:"Click power +25% permanently", effect:()=>{ state.clickMult*=1.25; }, requires:[] },
    { id:"p2",  name:"Sticky Legacy", cost:2, desc:"All buildings +15% permanently", effect:()=>{ state.buildingMult*=1.15; }, requires:[] },
  ];

  const achievements = [
    { id:"a1", name:"First Click", desc:"Click once", check:()=>state.totalClicks>=1, reward:()=>{ updateAchievementBonus(); } },
    { id:"a2", name:"Sweet Tooth", desc:"Earn 100 candy orbs", check:()=>state.totalEarned>=100, reward:()=>{ updateAchievementBonus(); } },
    { id:"a31", name:"First Sale", desc:"Sell 1 building", check:()=>state.totalSold>=1, reward:()=>{ updateAchievementBonus(); } },
    { id:"a32", name:"Moving Stock", desc:"Sell 10 buildings", check:()=>state.totalSold>=10, reward:()=>{ updateAchievementBonus(); } },
    { id:"a33", name:"Liquidation", desc:"Sell 100 buildings", check:()=>state.totalSold>=100, reward:()=>{ updateAchievementBonus(); } },
    { id:"a36", name:"Pocket Change", desc:"Earn 1,000 from selling", check:()=>state.totalSoldValue>=1000, reward:()=>{ updateAchievementBonus(); } },
    { id:"a25", name:"Steady Flow", desc:"Reach 1,000 candy/sec", check:()=>getCPS()>=1000, reward:()=>{ updateAchievementBonus(); } },
    { id:"a29", name:"Whale", desc:"Spend 1 billion candy orbs", check:()=>state.totalSpent>=1e9, reward:()=>{ updateAchievementBonus(); } },
  ];

  function getBuilding(id) { return state.buildings.find(b=>b.id===id); }
  function getBuildingCount(id) { const b=getBuilding(id); return b?b.count:0; }

  function updateAchievementBonus() {
    state.achievementBonus = Math.pow(1.05, state.achievementsDone.size);
  }

  function formatNumber(n, decimals=0) {
    n = Number(n);
    if (!isFinite(n)) return "inf";
    if (!state.useShortFormat) {
      if (decimals > 0 && n < 1000000) return n.toFixed(decimals);
      return Math.floor(n).toLocaleString();
    }
    const units = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","De","Ud","Dd","Td","Qad","Qid","Sxd","Spd","Ocd","Nod","Vg"];
    let value = Math.abs(n), u = 0;
    while (value >= 1000 && u < units.length - 1) { value /= 1000; u++; }
    if (u === 0) return value.toFixed(decimals);
    return value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2) + units[u];
  }

  function formatDurationSeconds(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds || 0));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function getPrestigeGain() {
    const requiredEarned = 100000;
    const earned = Math.floor(state.totalEarned + 1e-9);
    if (earned < requiredEarned) return 0;
    const newPoints = Math.max(0, Math.floor(Math.sqrt(earned / requiredEarned) * state.prestigeGainMult));
    return newPoints - (state.prestigePoints - state.lastPrestigeEarned);
  }

  function getPrestigeMultiplier() { return Math.pow(1.10, state.prestige); }

  function getCPS() {
    let total = 0;
    for (const b of state.buildings) total += b.count * b.baseCps * b.bonusMult;
    return total * state.buildingMult * state.achievementBonus * getPrestigeMultiplier() * state.cpsFromUpgrades;
  }

  function getBuildingTotalCost(b, amount) {
    amount = Math.max(0, Math.floor(Number(amount) || 0));
    if (amount <= 0) return 0;
    const startFactor = Math.pow(BUILDING_GROWTH, b.count);
    const series = (Math.pow(BUILDING_GROWTH, amount) - 1) / BUILDING_GROWTH_DELTA;
    return Math.ceil(b.baseCost * state.costMult * startFactor * series);
  }

  function getBuildingSellRefund(b, amount) {
    amount = Math.max(0, Math.min(b.count, Math.floor(Number(amount) || 0)));
    if (amount <= 0) return 0;
    const startCount = b.count - amount;
    const startFactor = Math.pow(BUILDING_GROWTH, startCount);
    const series = (Math.pow(BUILDING_GROWTH, amount) - 1) / BUILDING_GROWTH_DELTA;
    const totalPaid = b.baseCost * state.costMult * startFactor * series;
    return Math.floor(totalPaid * 0.45);
  }

  function getMaxAffordableCount(b) {
    const funds = state.candyOrbs;
    if (!isFinite(funds) || funds <= 0) return 0;
    const startFactor = Math.pow(BUILDING_GROWTH, b.count);
    const a = (b.baseCost * state.costMult * startFactor) / BUILDING_GROWTH_DELTA;
    if (!isFinite(a) || a <= 0) return 0;
    const rhs = funds / a + 1;
    if (!isFinite(rhs) || rhs <= 1) return 0;
    let n = Math.floor(Math.log(rhs) / Math.log(BUILDING_GROWTH));
    n = Math.max(0, n);
    while (n > 0 && getBuildingTotalCost(b, n) > funds) n -= 1;
    while (getBuildingTotalCost(b, n + 1) <= funds) n += 1;
    return n;
  }

  function isBuildingLocked(b) { return b.unlockAt > 0 && state.totalEarned < b.unlockAt; }

  function msg(text, good=true) {
    els.msg.textContent = text;
    els.msg.style.color = good ? "var(--accent)" : "var(--bad)";
  }

  function ensureAudio() {
    if (!state.sound || state.soundVolume <= 0) return null;
    if (!state._audioCtx) state._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (state._audioCtx.state === "suspended") state._audioCtx.resume();
    return state._audioCtx;
  }

  function playTone(freq=330, duration=0.05, type="square", gainAmount=1, soundType="click") {
    const ctx = ensureAudio();
    if (!ctx) return;
    let soundVol = state.soundVolume;
    if (soundType==="click") soundVol *= state.clickSoundVol;
    else if (soundType==="buy") soundVol *= state.buySoundVol;
    else if (soundType==="crit") soundVol *= state.critSoundVol;
    else if (soundType==="prestige") soundVol *= state.prestigeSoundVol;
    const finalGain = gainAmount * soundVol * 0.15;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = 0;
    o.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(finalGain, now + duration * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    o.start(now); o.stop(now + duration + 0.01);
  }

  function playClickSound() { playTone(420, 0.04, "square", 3, "click"); }
  function playBuySound() { playTone(580, 0.08, "triangle", 1.2, "buy"); }
  function playCritSound() { playTone(780, 0.1, "sawtooth", 1.5, "crit"); }
  function playPrestigeSound(){ playTone(220,0.15,"sine",1.2,"prestige"); }

  function shake() {
    if (state.reduceMotion) return;
    game.classList.remove("shake"); void game.offsetWidth; game.classList.add("shake");
  }

  function spawnParticle(text, x, y, color="white") {
    if (!state.particles || state.reduceMotion) return;
    const p = document.createElement("div");
    p.className = "particle"; p.textContent = text;
    p.style.left = `${x}px`; p.style.top = `${y}px`; p.style.color = color;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 750);
  }

  function clickOrb(ev) {
    state.totalClicks += 1;
    const x = ev?.clientX ?? window.innerWidth / 2;
    const y = ev?.clientY ?? window.innerHeight / 2;

    let multiplier = 1, critText = "";
    const critRoll = Math.random();
    if (critRoll < Math.min(0.99, state.critChance)) {
      state.totalCrits += 1;
      state.hotStreak += 1;
      if (state.hotStreak > state.bestHotStreak) state.bestHotStreak = state.hotStreak;
      multiplier = Math.max(2, Math.round(2 * state.critMult));
      critText = `Crit x${multiplier}`;
    } else {
      state.hotStreak = 0;
    }

    const gain = state.clickPower * state.clickMult * multiplier;
    state.candyOrbs += gain;
    state.totalEarned += gain;

    playClickSound();
    if (multiplier > 1) {
      playCritSound(); shake();
      spawnParticle(`x${multiplier}`, x, y, "#f1c04d");
      if (critText) msg(critText);
    } else {
      spawnParticle("+", x, y);
    }

    checkAchievements();
    updateHUD();
  }

  function getResolvedBuyCount(b, mode) {
    if (mode === "max") return getMaxAffordableCount(b);
    return Math.max(1, Math.floor(Number(mode) || 1));
  }

  function getResolvedSellCount(b, mode) {
    if (mode === "max") return b.count;
    return Math.max(1, Math.floor(Number(mode) || 1));
  }

  function getModeForEvent() { return buyMode; }

  function setBuyMode(mode) {
    buyMode = mode;
    renderShop();
  }

  function buyBuilding(id) {
    const b = getBuilding(id);
    if (!b) return;
    if (isBuildingLocked(b)) { msg(`Locked - earn ${formatNumber(b.unlockAt)} first`, false); return; }

    const amount = getResolvedBuyCount(b, getModeForEvent());
    if (amount <= 0) { msg("Can't buy any right now", false); return; }

    const price = getBuildingTotalCost(b, amount);
    if (state.candyOrbs < price) { msg(`Need ${formatNumber(price - state.candyOrbs)} more`, false); return; }

    state.candyOrbs -= price;
    state.totalSpent += price;
    b.count += amount;
    playBuySound();
    msg(`${b.name} x${amount} (${b.count} total)`);
    updateAll();
  }

  function sellBuilding(id) {
    const b = getBuilding(id);
    if (!b || b.count === 0) return;

    const amount = Math.min(b.count, getResolvedSellCount(b, getModeForEvent()));
    if (amount <= 0) return;

    const refund = getBuildingSellRefund(b, amount);
    state.candyOrbs += refund;
    b.count -= amount;
    state.totalSold += amount;
    state.totalSoldValue += refund;
    playBuySound();
    msg(`Sold x${amount} for ${formatNumber(refund)}`);
    updateAll();
  }

  function buyUpgrade(id) {
    const upg = state.upgrades.find(u=>u.id===id);
    if (!upg) return;
    if (state.clickUpgradesBought.has(id)) return;
    if (state.candyOrbs < upg.cost) { msg(`Need ${formatNumber(upg.cost - state.candyOrbs)} more`, false); return; }
    state.candyOrbs -= upg.cost;
    state.totalSpent += upg.cost;
    state.clickUpgradesBought.add(id);
    upg.effect();
    playBuySound();
    msg(`${upg.name} unlocked!`);
    updateAll();
  }

  function buyPrestigeUpgrade(id) {
    const upg = state.prestigeUpgrades.find(p=>p.id===id);
    if (!upg) return;
    if (state.prestigeUpgradesBought.has(id)) return;
    if (state.prestigePoints < upg.cost) { msg(`Need ${upg.cost - state.prestigePoints} more`, false); return; }
    state.prestigePoints -= upg.cost;
    state.prestigeUpgradesBought.add(id);
    upg.effect();
    playPrestigeSound();
    msg(`${upg.name} purchased!`);
    updateAll();
  }

  function prestigeReset() {
    const gain = getPrestigeGain();
    if (gain < 1) { msg("Need 100,000 earned to prestige", false); return; }
    if (!confirm(`Prestige and gain ${gain} point(s)? All progress resets.`)) return;

    state.prestige += gain;
    state.prestigePoints += gain;
    state.lastPrestigeEarned = state.prestigePoints;
    state.totalEarned = 0;
    state.candyOrbs = 0;
    state.clickPower = 1;
    state.critChance = 0.10;
    state.critMult = 1;
    state.hotStreak = 0;
    state.buildingMult = 1;
    state.clickMult = 1;
    state.costMult = 1;
    state.cpsFromUpgrades = 1;
    state.clickUpgradesBought.clear();

    for (const b of state.buildings) { b.count = 0; b.bonusMult = 1; }
    for (const upg of state.prestigeUpgrades) if (state.prestigeUpgradesBought.has(upg.id)) upg.effect();

    playPrestigeSound(); shake();
    msg(`Prestige +${gain}! Total: ${state.prestige}`);
    updateAll(); saveGame();
  }

  function checkAchievements() {
    for (const a of achievements) {
      if (!state.achievementsDone.has(a.id) && a.check()) {
        state.achievementsDone.add(a.id);
        a.reward();
        msg(`Achievement: ${a.name}`);
        playTone(880, 0.1, "triangle", 2);
      }
    }
  }

  function renderShop() {
    const scrollTop = els.shop.scrollTop;
    const mode = buyMode;
    const isActive = (m) => (mode === m);
    const modeLabel = (m) => (m === "max" ? "Max" : `${m}x`);

    let html = `
      <div class="card">
        <div class="section-title">Buy / Sell Amount</div>
        <div class="qty-toggle">
          <button class="main-btn ${isActive(1) ? "active" : ""}" type="button" onclick="setBuyMode(1)">${modeLabel(1)}</button>
          <button class="main-btn ${isActive(10) ? "active" : ""}" type="button" onclick="setBuyMode(10)">${modeLabel(10)}</button>
          <button class="main-btn ${isActive(100) ? "active" : ""}" type="button" onclick="setBuyMode(100)">${modeLabel(100)}</button>
          <button class="main-btn ${isActive("max") ? "active" : ""}" type="button" onclick="setBuyMode('max')">${modeLabel("max")}</button>
        </div>
        <div class="qty-hint">Default is 1x. Press 1/2/3/4 to set 1x/10x/100x/Max.</div>
      </div>
    `;

    for (const b of state.buildings) {
      const isLocked = isBuildingLocked(b);
      const buyCount = getResolvedBuyCount(b, buyMode);
      const sellCount = getResolvedSellCount(b, buyMode);

      const buyTotal = isLocked ? 0 : getBuildingTotalCost(b, buyCount);
      const canBuy = !isLocked && buyCount > 0 && state.candyOrbs >= buyTotal;

      const refund = b.count > 0 ? getBuildingSellRefund(b, Math.min(b.count, sellCount)) : 0;
      const canSell = b.count > 0;

      const totalFromThis = b.count * b.baseCps * b.bonusMult * state.buildingMult * state.achievementBonus * getPrestigeMultiplier();
      const cps = getCPS();
      const pct = cps > 0 ? (totalFromThis / cps * 100) : 0;
      const lockInfo = isLocked ? ` (Unlock at ${formatNumber(b.unlockAt)})` : "";

      html += `
        <div class="building-card${isLocked ? " locked" : ""}">
          <div class="building-header">
            <span class="building-name">${b.name}</span>
            <span class="building-count" data-building-count="${b.id}">${b.count}</span>
          </div>
          <div class="building-stats">${b.desc} - ${formatNumber(b.baseCps, 2)}/sec</div>
          <div style="display:flex;gap:6px;">
            <button class="main-btn ${canBuy ? "" : "cant-afford"}" style="flex:1;" type="button" data-buy-building="${b.id}"${canBuy ? "" : " disabled"}>
              Buy - <span class="pill" data-buy-cost="${b.id}">${formatNumber(buyTotal)}</span>
            </button>
            <button class="main-btn" style="flex:1;" type="button" data-sell-building="${b.id}"${canSell ? "" : " disabled"}>
              Sell - <span class="pill" data-sell-refund="${b.id}">${formatNumber(refund)}</span>
            </button>
          </div>
          <small style="color:var(--muted);margin-top:6px;">Own: ${b.count} - Output: ${formatNumber(totalFromThis, 2)} (${pct.toFixed(1)}%)${lockInfo}</small>
        </div>`;
    }
    els.shop.innerHTML = html;
    els.shop.scrollTop = scrollTop;
  }

  function refreshShopUI() {
    if (!els.shop.classList.contains("active")) return;
    for (const b of state.buildings) {
      const isLocked = isBuildingLocked(b);
      const buyCount = getResolvedBuyCount(b, buyMode);
      const sellCount = getResolvedSellCount(b, buyMode);

      const buyTotal = isLocked ? 0 : getBuildingTotalCost(b, buyCount);
      const canBuy = !isLocked && buyCount > 0 && state.candyOrbs >= buyTotal;

      const sellAmount = Math.min(b.count, sellCount);
      const refund = sellAmount > 0 ? getBuildingSellRefund(b, sellAmount) : 0;
      const canSell = b.count > 0 && sellAmount > 0;

      const buyBtn = els.shop.querySelector(`[data-buy-building="${b.id}"]`);
      if (buyBtn) {
        buyBtn.disabled = !canBuy;
        buyBtn.classList.toggle("cant-afford", !canBuy);
        const pill = buyBtn.querySelector(`[data-buy-cost="${b.id}"]`);
        if (pill) pill.textContent = formatNumber(buyTotal);
      }

      const sellBtn = els.shop.querySelector(`[data-sell-building="${b.id}"]`);
      if (sellBtn) {
        sellBtn.disabled = !canSell;
        const pill = sellBtn.querySelector(`[data-sell-refund="${b.id}"]`);
        if (pill) pill.textContent = formatNumber(refund);
      }

      const countEl = els.shop.querySelector(`[data-building-count="${b.id}"]`);
      if (countEl) countEl.textContent = b.count;
    }
  }

  function renderUpgrades() {
    const scrollTop = els.upgrades.scrollTop;
    const bought = state.upgrades.filter(u=>state.clickUpgradesBought.has(u.id));
    const available = state.upgrades.filter(u=>!state.clickUpgradesBought.has(u.id));

    let html = `
      <div class="upgrades-tabs">
        <button class="main-btn" style="padding:8px;" onclick="switchUpgradeTab('available')" id="tab-available">Available (${available.length})</button>
        <button class="main-btn" style="padding:8px;" onclick="switchUpgradeTab('bought')" id="tab-bought">Purchased (${bought.length})</button>
      </div>
      <div id="upgrades-available">
    `;

    for (const upg of available) {
      const affordable = state.candyOrbs >= upg.cost;
      const enabled = affordable;
      const statusText = affordable ? "Affordable" : `Need ${formatNumber(upg.cost - state.candyOrbs)}`;
      html += `
        <button class="main-btn ${enabled ? "unlocked" : ""}" type="button" data-buy-upgrade="${upg.id}"${enabled ? "" : " disabled"}>
          ${upg.name} <span class="pill${enabled ? "" : " locked"}">${formatNumber(upg.cost)}</span>
          <small>${upg.desc}</small>
          <div class="upg-status ${enabled ? "available" : ""}">${statusText}</div>
        </button>`;
    }

    html += `</div><div id="upgrades-bought" style="display:none;">`;
    for (const upg of bought) {
      html += `
        <button class="main-btn" style="opacity:0.6;" disabled>
          ✓ ${upg.name}
          <small>${upg.desc}</small>
        </button>`;
    }
    html += `</div>`;

    els.upgrades.innerHTML = html;
    els.upgrades.scrollTop = scrollTop;
  }

  function refreshUpgradesUI() {
    if (!els.upgrades.classList.contains("active")) return;
    for (const btn of els.upgrades.querySelectorAll("[data-buy-upgrade]")) {
      const id = btn.dataset.buyUpgrade;
      const upg = state.upgrades.find(u => u.id === id);
      if (!upg) continue;
      const affordable = state.candyOrbs >= upg.cost;
      btn.disabled = !affordable;
      const status = btn.querySelector(".upg-status");
      if (status) status.textContent = affordable ? "Affordable" : `Need ${formatNumber(upg.cost - state.candyOrbs)}`;
    }
  }

  function switchUpgradeTab(tab) {
    document.getElementById("upgrades-available").style.display = tab === "available" ? "block" : "none";
    document.getElementById("upgrades-bought").style.display = tab === "bought" ? "block" : "none";
    document.getElementById("tab-available").style.opacity = tab === "available" ? "1" : "0.6";
    document.getElementById("tab-bought").style.opacity = tab === "bought" ? "1" : "0.6";
  }

  function renderStats() {
    const scrollTop = els.stats.scrollTop;
    const cps = getCPS();
    const playedSeconds = (Date.now() - state.startedAt) / 1000;
    let html = `
      <div class="card">
        <div class="section-title">Game Statistics</div>
        <div class="stats">
          <div class="stat-row"><span class="stat-label">Time Played:</span><span class="stat-value">${formatDurationSeconds(playedSeconds)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Earned:</span><span class="stat-value">${formatNumber(state.totalEarned)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Clicks:</span><span class="stat-value">${formatNumber(state.totalClicks)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Crits:</span><span class="stat-value">${formatNumber(state.totalCrits)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Spent:</span><span class="stat-value">${formatNumber(state.totalSpent)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Sold:</span><span class="stat-value">${formatNumber(state.totalSold)}</span></div>
          <div class="stat-row"><span class="stat-label">Sell Earnings:</span><span class="stat-value">${formatNumber(state.totalSoldValue)}</span></div>
          <div class="stat-row"><span class="stat-label">Best Streak:</span><span class="stat-value">${state.bestHotStreak}</span></div>
          <div class="stat-row"><span class="stat-label">Current Candy/sec:</span><span class="stat-value">${formatNumber(cps, 2)}</span></div>
          <div class="stat-row"><span class="stat-label">Achievement Bonus:</span><span class="stat-value">+${((state.achievementBonus - 1) * 100).toFixed(1)}%</span></div>
        </div>
      </div>
    `;
    els.stats.innerHTML = html;
    els.stats.scrollTop = scrollTop;
  }

  function renderPrestige() {
    const scrollTop = els.prestige.scrollTop;
    const gain = getPrestigeGain();
    const canPrestige = gain >= 1;
    let html = `
      <div class="card">
        <div class="section-title">Prestige System</div>
        <div class="stats">
          <div class="stat-row"><span class="stat-label">Earned (this run):</span><span class="stat-value">${formatNumber(state.totalEarned)}</span></div>
          <div class="stat-row"><span class="stat-label">Required:</span><span class="stat-value">100,000</span></div>
          <div class="stat-row"><span class="stat-label">Available Points:</span><span class="stat-value">${gain}</span></div>
          <div class="stat-row"><span class="stat-label">Total Prestige:</span><span class="stat-value">${state.prestige}</span></div>
          <div class="stat-row"><span class="stat-label">Multiplier:</span><span class="stat-value">x${getPrestigeMultiplier().toFixed(2)}</span></div>
        </div>
        <button class="main-btn${canPrestige ? " available-prestige" : " cant-afford"}" type="button" id="prestigeBtn"${canPrestige ? "" : " disabled"}>
          ${canPrestige ? `Prestige (+${gain} point${gain !== 1 ? 's' : ''})` : "Need 100,000 earned"}
        </button>
      </div>
    `;
    els.prestige.innerHTML = html;
    els.prestige.scrollTop = scrollTop;
  }

  function renderAchievements() {
    const scrollTop = els.achievements.scrollTop;
    let html = `<div class="section-title">Achievements (${state.achievementsDone.size}/${achievements.length})</div>`;
    for (const a of achievements) {
      const done = state.achievementsDone.has(a.id);
      html += `
        <div class="achievement${done ? " done" : ""}">
          <div>
            <strong>${a.name}</strong>
            <small>${a.desc}</small>
          </div>
          <div style="text-align:right;font-size:1.2em;">${done ? "✓" : "◇"}</div>
        </div>`;
    }
    els.achievements.innerHTML = html;
    els.achievements.scrollTop = scrollTop;
  }

  function renderSettings() {
    const scrollTop = els.settings.scrollTop;
    let html = `
      <div class="card">
        <div class="section-title">Audio</div>
        <div class="vol-control">
          <label class="vol-label" id="lblMasterVol">Master: ${Math.round(state.soundVolume * 100)}%</label>
          <input type="range" min="0" max="100" value="${state.soundVolume * 100}" id="masterVol">
        </div>
        <div class="vol-control">
          <label class="vol-label" id="lblClickVol">Click: ${Math.round(state.clickSoundVol * 100)}%</label>
          <input type="range" min="0" max="100" value="${state.clickSoundVol * 100}" id="clickVol">
        </div>
        <div class="vol-control">
          <label class="vol-label" id="lblBuyVol">Buy: ${Math.round(state.buySoundVol * 100)}%</label>
          <input type="range" min="0" max="100" value="${state.buySoundVol * 100}" id="buyVol">
        </div>
        <div class="vol-control">
          <label class="vol-label" id="lblCritVol">Crit: ${Math.round(state.critSoundVol * 100)}%</label>
          <input type="range" min="0" max="100" value="${state.critSoundVol * 100}" id="critVol">
        </div>
      </div>
      <div class="card">
        <div class="section-title">Game</div>
        <div class="setting-line">
          <button class="main-btn" id="toggleShortFormat">${state.useShortFormat ? "Long Numbers" : "Short Format"}</button>
          <button class="main-btn" id="toggleParticles">${state.particles ? "No Particles" : "Particles"}</button>
        </div>
        <div class="setting-line">
          <button class="main-btn" id="toggleSound">${state.sound ? "Mute" : "Unmute"}</button>
          <button class="main-btn" id="toggleAutoSave">${state.autoSave ? "Pause Auto-Save" : "Resume Auto-Save"}</button>
        </div>
        <div class="setting-line">
          <button class="main-btn" id="toggleWaterfall">${state.waterfall ? "Waterfall: On" : "Waterfall: Off"}</button>
          <button class="main-btn" id="restartBtn">Restart Game</button>
        </div>
        <div class="setting-line">
          <button class="main-btn" id="togglePause">${state.paused ? "Resume Game" : "Pause Game"}</button>
          <button class="main-btn" id="toggleReduceMotion">${state.reduceMotion ? "Motion: Reduced" : "Motion: Full"}</button>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Save / Load</div>
        <div class="setting-line">
          <button class="main-btn" id="exportBtn">Export Save</button>
          <button class="main-btn" id="importBtn">Import Save</button>
        </div>
        <textarea class="savebox" id="saveData" readonly>${JSON.stringify(exportState())}</textarea>
      </div>
    `;
    els.settings.innerHTML = html;
    els.settings.scrollTop = scrollTop;
    attachSettingsHandlers();
  }

  function attachDelegatedHandlers() {
    els.shop.addEventListener("click", (ev) => {
      const target = ev.target.closest?.("button");
      if (!target || target.disabled) return;
      if (target.dataset.buyBuilding) buyBuilding(target.dataset.buyBuilding);
      else if (target.dataset.sellBuilding) sellBuilding(target.dataset.sellBuilding);
    });

    els.upgrades.addEventListener("click", (ev) => {
      const target = ev.target.closest?.("button");
      if (!target || target.disabled) return;
      if (target.dataset.buyUpgrade) buyUpgrade(target.dataset.buyUpgrade);
    });

    els.prestige.addEventListener("click", (ev) => {
      const target = ev.target.closest?.("button");
      if (!target || target.disabled) return;
      if (target.id === "prestigeBtn") prestigeReset();
      else if (target.dataset.buyPrestige) buyPrestigeUpgrade(target.dataset.buyPrestige);
    });
  }

  function attachSettingsHandlers() {
    const masterVol = document.getElementById("masterVol");
    const clickVol = document.getElementById("clickVol");
    const buyVol = document.getElementById("buyVol");
    const critVol = document.getElementById("critVol");

    const lblMaster = document.getElementById("lblMasterVol");
    const lblClick = document.getElementById("lblClickVol");
    const lblBuy = document.getElementById("lblBuyVol");
    const lblCrit = document.getElementById("lblCritVol");

    masterVol.addEventListener("input", (e)=>{ state.soundVolume = e.target.value / 100; if (lblMaster) lblMaster.textContent = `Master: ${e.target.value}%`; });
    clickVol.addEventListener("input", (e)=>{ state.clickSoundVol = e.target.value / 100; if (lblClick) lblClick.textContent = `Click: ${e.target.value}%`; });
    buyVol.addEventListener("input", (e)=>{ state.buySoundVol = e.target.value / 100; if (lblBuy) lblBuy.textContent = `Buy: ${e.target.value}%`; });
    critVol.addEventListener("input", (e)=>{ state.critSoundVol = e.target.value / 100; if (lblCrit) lblCrit.textContent = `Crit: ${e.target.value}%`; });

    document.getElementById("toggleShortFormat").addEventListener("click", ()=>{ state.useShortFormat=!state.useShortFormat; updateAll(); });
    document.getElementById("toggleParticles").addEventListener("click", ()=>{ state.particles=!state.particles; updateAll(); });
    document.getElementById("toggleSound").addEventListener("click", ()=>{ state.sound=!state.sound; updateAll(); });
    document.getElementById("toggleAutoSave").addEventListener("click", ()=>{ state.autoSave=!state.autoSave; updateAll(); });
    document.getElementById("toggleWaterfall").addEventListener("click", ()=>{ state.waterfall=!state.waterfall; updateAll(); });
    document.getElementById("togglePause").addEventListener("click", ()=>{ state.paused=!state.paused; updateAll(); });
    document.getElementById("toggleReduceMotion").addEventListener("click", ()=>{ state.reduceMotion=!state.reduceMotion; updateAll(); });
    document.getElementById("exportBtn").addEventListener("click", ()=>{ document.getElementById("saveData").select(); });
    document.getElementById("importBtn").addEventListener("click", ()=>{
      const data = prompt("Paste save data:");
      if (!data) return;
      try {
        importState(JSON.parse(data));
        msg("Save imported.");
        updateAll();
        saveGame();
      } catch {
        msg("Invalid save data", false);
      }
    });
    document.getElementById("restartBtn").addEventListener("click", ()=>{ restartGame(); });
  }

  function updateHUD() {
    els.candyOrbs.textContent = formatNumber(state.candyOrbs);
    els.cps.textContent = formatNumber(getCPS(), 2);
    els.clickPower.textContent = formatNumber(state.clickPower);
    els.critChance.textContent = (Math.min(99, state.critChance * 100)).toFixed(1) + "%";
    els.prestigeLevel.textContent = state.prestige;
    els.prestigeTop.textContent = state.prestige;
  }

  function updateAll() {
    updateHUD();
    renderShop();
    renderUpgrades();
    renderStats();
    renderPrestige();
    renderAchievements();
    renderSettings();
  }

  function exportState() {
    return {
      candyOrbs: state.candyOrbs,
      clickPower: state.clickPower,
      critChance: state.critChance,
      critMult: state.critMult,
      prestige: state.prestige,
      prestigePoints: state.prestigePoints,
      buildingMult: state.buildingMult,
      clickMult: state.clickMult,
      costMult: state.costMult,
      prestigeGainMult: state.prestigeGainMult,
      totalClicks: state.totalClicks,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      totalCrits: state.totalCrits,
      totalSold: state.totalSold,
      totalSoldValue: state.totalSoldValue,
      hotStreak: state.hotStreak,
      bestHotStreak: state.bestHotStreak,
      lastPrestigeEarned: state.lastPrestigeEarned,
      buildings: state.buildings.map(b=>({ id:b.id, count:b.count, bonusMult:b.bonusMult })),
      clickUpgradesBought: Array.from(state.clickUpgradesBought),
      prestigeUpgradesBought: Array.from(state.prestigeUpgradesBought),
      achievementsDone: Array.from(state.achievementsDone),
      waterfall: state.waterfall,
      paused: state.paused,
      reduceMotion: state.reduceMotion,
      startedAt: state.startedAt,
      lastTick: Date.now()
    };
  }

  function importState(data) {
    state.candyOrbs = data.candyOrbs || 0;
    state.clickPower = data.clickPower || 1;
    state.critChance = data.critChance || 0.10;
    state.critMult = data.critMult || 1;
    state.prestige = data.prestige || 0;
    state.prestigePoints = data.prestigePoints || 0;
    state.buildingMult = data.buildingMult || 1;
    state.clickMult = data.clickMult || 1;
    state.costMult = data.costMult || 1;
    state.prestigeGainMult = data.prestigeGainMult || 1;
    state.totalClicks = data.totalClicks || 0;
    state.totalEarned = data.totalEarned || 0;
    state.totalSpent = data.totalSpent || 0;
    state.totalCrits = data.totalCrits || 0;
    state.totalSold = data.totalSold || 0;
    state.totalSoldValue = data.totalSoldValue || 0;
    state.hotStreak = data.hotStreak || 0;
    state.bestHotStreak = data.bestHotStreak || 0;
    state.lastPrestigeEarned = data.lastPrestigeEarned || 0;
    for (const b of data.buildings || []) {
      const bld = getBuilding(b.id);
      if (bld) { bld.count = b.count; bld.bonusMult = b.bonusMult; }
    }
    state.clickUpgradesBought = new Set(data.clickUpgradesBought || []);
    state.prestigeUpgradesBought = new Set(data.prestigeUpgradesBought || []);
    state.achievementsDone = new Set(data.achievementsDone || []);
    state.waterfall = data.waterfall ?? true;
    state.paused = data.paused ?? false;
    state.reduceMotion = data.reduceMotion ?? false;
    state.startedAt = data.startedAt || Date.now();
    state.lastTick = data.lastTick || Date.now();
    updateAchievementBonus();
  }

  function resetToDefaults() {
    state.candyOrbs = 0;
    state.clickPower = 1;
    state.critChance = 0.10;
    state.critMult = 1;
    state.prestige = 0;
    state.prestigePoints = 0;
    state.buildingMult = 1;
    state.clickMult = 1;
    state.costMult = 1;
    state.prestigeGainMult = 1;
    state.cpsFromUpgrades = 1;
    state.achievementBonus = 1;
    state.clickUpgradesBought = new Set();
    state.prestigeUpgradesBought = new Set();
    state.achievementsDone = new Set();
    state.totalClicks = 0;
    state.totalEarned = 0;
    state.totalSpent = 0;
    state.totalCrits = 0;
    state.totalSold = 0;
    state.totalSoldValue = 0;
    state.hotStreak = 0;
    state.bestHotStreak = 0;
    state.lastPrestigeEarned = 0;
    state.waterfall = true;
    state.paused = false;
    state.reduceMotion = false;
    state.startedAt = Date.now();
    state.lastTick = Date.now();
    for (const b of state.buildings) { b.count = 0; b.bonusMult = 1; }
    updateAchievementBonus();
  }

  function restartGame() {
    if (!confirm("Restart? This deletes your save and resets everything.")) return;
    resetToDefaults();
    localStorage.removeItem("candyOrbIdleSave");
    msg("Restarted.");
    updateAll();
  }

  function saveGame() {
    state.lastTick = Date.now();
    if (state.autoSave) localStorage.setItem("candyOrbIdleSave", JSON.stringify(exportState()));
  }

  function loadGame() {
    const saved = localStorage.getItem("candyOrbIdleSave");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      const last = Number(data.lastTick || Date.now());
      importState(data);

      const now = Date.now();
      const offlineSeconds = Math.max(0, Math.min(7200, (now - last) / 1000));
      if (offlineSeconds >= 1 && !state.paused) {
        const cps = getCPS();
        const gained = cps * offlineSeconds;
        if (gained > 0) {
          state.candyOrbs += gained;
          state.totalEarned += gained;
          msg(`Offline +${formatNumber(gained)} (${Math.floor(offlineSeconds)}s)`);
        }
      }
      state.lastTick = now;
    } catch (e) {
      console.error("Failed to load save:", e);
    }
  }

  function spawnWaterfall() {
    if (!state.waterfall || state.reduceMotion) return;
    if (state.candyOrbs < 1000) return;
    const x = window.innerWidth * 0.6 + Math.random() * (window.innerWidth * 0.4 - 80);
    const y = -80;
    const duration = 2.5 + Math.random() * 3;
    const size = 48 + Math.random() * 32;

    const drop = document.createElement("div");
    drop.className = "raindrop";
    drop.style.left = x + "px";
    drop.style.top = y + "px";
    drop.style.width = size + "px";
    drop.style.height = size + "px";
    drop.style.animation = `fall ${duration}s linear`;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "45");
    circle.setAttribute("fill", "#a78bfa");
    svg.appendChild(circle);
    drop.appendChild(svg);
    rainContainer.appendChild(drop);
    setTimeout(() => drop.remove(), duration * 1000);
  }

  window.setBuyMode = setBuyMode;
  window.switchUpgradeTab = switchUpgradeTab;

  const orbImg = document.getElementById("orbImg");
  const orbFallback = document.getElementById("orbFallback");
  orbImg.addEventListener("click", clickOrb);
  orbFallback.addEventListener("click", clickOrb);

  orbImg.addEventListener("error", () => {
    orbImg.style.display = "none";
    orbFallback.style.display = "block";
  });

  for (const tab of document.querySelectorAll(".tab")) {
    tab.addEventListener("click", ()=> {
      document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
      tab.classList.add("active");
      const panelId = tab.dataset.tab;
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.add("active");
    });
  }

  attachDelegatedHandlers();

  document.addEventListener("keydown", (ev) => {
    if (!els.shop.classList.contains("active")) return;
    if (ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA")) return;
    const code = ev.code;
    if (ev.key === "1" || code === "Digit1" || code === "Numpad1") { ev.preventDefault(); setBuyMode(1); }
    else if (ev.key === "2" || code === "Digit2" || code === "Numpad2") { ev.preventDefault(); setBuyMode(10); }
    else if (ev.key === "3" || code === "Digit3" || code === "Numpad3") { ev.preventDefault(); setBuyMode(100); }
    else if (ev.key === "4" || code === "Digit4" || code === "Numpad4") { ev.preventDefault(); setBuyMode("max"); }
  });

  setInterval(() => {
    if (!state.paused) {
      const cps = getCPS();
      state.candyOrbs += cps / 10;
      state.totalEarned += cps / 10;
    }
    state.lastTick = Date.now();
    updateHUD();
    refreshShopUI();
    refreshUpgradesUI();
    checkAchievements();
    spawnWaterfall();
  }, 100);

  setInterval(saveGame, 10000);

  loadGame();
  updateAll();
})();

