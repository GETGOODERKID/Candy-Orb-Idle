(() => {
  const { els, state } = window.COI;
  const { econ, fx } = window.COI;

  function msg(text, good=true) {
    els.msg.textContent = text;
    els.msg.style.color = good ? "var(--accent)" : "var(--bad)";
  }

  function setBuyMode(mode) {
    state.buyMode = mode;
    renderShop();
  }

  function getResolvedBuyCount(b) {
    if (state.buyMode === "max") return econ.getMaxAffordableCount(b);
    return Math.max(1, Math.floor(Number(state.buyMode) || 1));
  }

  function getResolvedSellCount(b) {
    if (state.buyMode === "max") return b.count;
    return Math.max(1, Math.floor(Number(state.buyMode) || 1));
  }

  function updateHUD() {
    els.candyOrbs.textContent = econ.formatNumber(state.candyOrbs);
    els.cps.textContent = econ.formatNumber(econ.getCPS(), 2);
    els.clickPower.textContent = econ.formatNumber(state.clickPower);
    els.critChance.textContent = (Math.min(99, state.critChance * 100)).toFixed(1) + "%";
    els.prestigeLevel.textContent = state.prestige;
    els.prestigeTop.textContent = state.prestige;
  }

  function renderShop() {
    const scrollTop = els.shop.scrollTop;
    const mode = state.buyMode;
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
      const isLocked = econ.isBuildingLocked(b);
      const buyCount = getResolvedBuyCount(b);
      const sellCount = getResolvedSellCount(b);

      const buyTotal = isLocked ? 0 : econ.getBuildingTotalCost(b, buyCount);
      const canBuy = !isLocked && buyCount > 0 && state.candyOrbs >= buyTotal;

      const sellAmount = Math.min(b.count, sellCount);
      const refund = sellAmount > 0 ? econ.getBuildingSellRefund(b, sellAmount) : 0;
      const canSell = b.count > 0 && sellAmount > 0;

      const totalFromThis = b.count * b.baseCps * b.bonusMult * state.buildingMult * state.achievementBonus * econ.getPrestigeMultiplier();
      const cps = econ.getCPS();
      const pct = cps > 0 ? (totalFromThis / cps * 100) : 0;
      const lockInfo = isLocked ? ` (Unlock at ${econ.formatNumber(b.unlockAt)})` : "";

      html += `
        <div class="building-card${isLocked ? " locked" : ""}">
          <div class="building-header">
            <span class="building-name">${b.name}</span>
            <span class="building-count" data-building-count="${b.id}">${b.count}</span>
          </div>
          <div class="building-stats">${b.desc} - ${econ.formatNumber(b.baseCps, 2)}/sec</div>
          <div style="display:flex;gap:6px;">
            <button class="main-btn ${canBuy ? "" : "cant-afford"}" style="flex:1;" type="button" data-buy-building="${b.id}"${canBuy ? "" : " disabled"}>
              Buy - <span class="pill" data-buy-cost="${b.id}">${econ.formatNumber(buyTotal)}</span>
            </button>
            <button class="main-btn" style="flex:1;" type="button" data-sell-building="${b.id}"${canSell ? "" : " disabled"}>
              Sell - <span class="pill" data-sell-refund="${b.id}">${econ.formatNumber(refund)}</span>
            </button>
          </div>
          <small style="color:var(--muted);margin-top:6px;">Own: ${b.count} - Output: ${econ.formatNumber(totalFromThis, 2)} (${pct.toFixed(1)}%)${lockInfo}</small>
        </div>`;
    }
    els.shop.innerHTML = html;
    els.shop.scrollTop = scrollTop;
  }

  function refreshShopUI() {
    if (!els.shop.classList.contains("active")) return;
    for (const b of state.buildings) {
      const isLocked = econ.isBuildingLocked(b);
      const buyCount = getResolvedBuyCount(b);
      const sellCount = getResolvedSellCount(b);

      const buyTotal = isLocked ? 0 : econ.getBuildingTotalCost(b, buyCount);
      const canBuy = !isLocked && buyCount > 0 && state.candyOrbs >= buyTotal;

      const sellAmount = Math.min(b.count, sellCount);
      const refund = sellAmount > 0 ? econ.getBuildingSellRefund(b, sellAmount) : 0;
      const canSell = b.count > 0 && sellAmount > 0;

      const buyBtn = els.shop.querySelector(`[data-buy-building="${b.id}"]`);
      if (buyBtn) {
        buyBtn.disabled = !canBuy;
        buyBtn.classList.toggle("cant-afford", !canBuy);
        const pill = buyBtn.querySelector(`[data-buy-cost="${b.id}"]`);
        if (pill) pill.textContent = econ.formatNumber(buyTotal);
      }

      const sellBtn = els.shop.querySelector(`[data-sell-building="${b.id}"]`);
      if (sellBtn) {
        sellBtn.disabled = !canSell;
        const pill = sellBtn.querySelector(`[data-sell-refund="${b.id}"]`);
        if (pill) pill.textContent = econ.formatNumber(refund);
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
      const statusText = affordable ? "Affordable" : `Need ${econ.formatNumber(upg.cost - state.candyOrbs)}`;
      html += `
        <button class="main-btn ${enabled ? "unlocked" : ""}" type="button" data-buy-upgrade="${upg.id}"${enabled ? "" : " disabled"}>
          ${upg.name} <span class="pill${enabled ? "" : " locked"}">${econ.formatNumber(upg.cost)}</span>
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
      if (status) status.textContent = affordable ? "Affordable" : `Need ${econ.formatNumber(upg.cost - state.candyOrbs)}`;
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
    const cps = econ.getCPS();
    const playedSeconds = (Date.now() - state.startedAt) / 1000;
    let html = `
      <div class="card">
        <div class="section-title">Game Statistics</div>
        <div class="stats">
          <div class="stat-row"><span class="stat-label">Time Played:</span><span class="stat-value">${econ.formatDurationSeconds(playedSeconds)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Earned:</span><span class="stat-value">${econ.formatNumber(state.totalEarned)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Clicks:</span><span class="stat-value">${econ.formatNumber(state.totalClicks)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Crits:</span><span class="stat-value">${econ.formatNumber(state.totalCrits)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Spent:</span><span class="stat-value">${econ.formatNumber(state.totalSpent)}</span></div>
          <div class="stat-row"><span class="stat-label">Total Sold:</span><span class="stat-value">${econ.formatNumber(state.totalSold)}</span></div>
          <div class="stat-row"><span class="stat-label">Sell Earnings:</span><span class="stat-value">${econ.formatNumber(state.totalSoldValue)}</span></div>
          <div class="stat-row"><span class="stat-label">Best Streak:</span><span class="stat-value">${state.bestHotStreak}</span></div>
          <div class="stat-row"><span class="stat-label">Current Candy/sec:</span><span class="stat-value">${econ.formatNumber(cps, 2)}</span></div>
          <div class="stat-row"><span class="stat-label">Achievement Bonus:</span><span class="stat-value">+${((state.achievementBonus - 1) * 100).toFixed(1)}%</span></div>
        </div>
      </div>
    `;
    els.stats.innerHTML = html;
    els.stats.scrollTop = scrollTop;
  }

  function renderPrestige() {
    const scrollTop = els.prestige.scrollTop;
    const gain = econ.getPrestigeGain();
    const canPrestige = gain >= 1;
    let html = `
      <div class="card">
        <div class="section-title">Prestige System</div>
        <div class="stats">
          <div class="stat-row"><span class="stat-label">Earned (this run):</span><span class="stat-value">${econ.formatNumber(state.totalEarned)}</span></div>
          <div class="stat-row"><span class="stat-label">Required:</span><span class="stat-value">100,000</span></div>
          <div class="stat-row"><span class="stat-label">Available Points:</span><span class="stat-value">${gain}</span></div>
          <div class="stat-row"><span class="stat-label">Total Prestige:</span><span class="stat-value">${state.prestige}</span></div>
          <div class="stat-row"><span class="stat-label">Multiplier:</span><span class="stat-value">x${econ.getPrestigeMultiplier().toFixed(2)}</span></div>
        </div>
        <button class="main-btn${canPrestige ? " available-prestige" : " cant-afford"}" type="button" id="prestigeBtn"${canPrestige ? "" : " disabled"}>
          ${canPrestige ? `Prestige (+${gain} point${gain !== 1 ? 's' : ''})` : "Need 100,000 earned"}
        </button>
      </div>

      <div class="card">
        <div class="section-title">Prestige Upgrades (${state.prestigeUpgradesBought.size}/${state.prestigeUpgrades.length})</div>
    `;

    for (const upg of state.prestigeUpgrades) {
      const bought = state.prestigeUpgradesBought.has(upg.id);
      const affordable = state.prestigePoints >= upg.cost;
      const enabled = !bought && affordable;
      const status = bought ? "Purchased" : affordable ? "Affordable" : `Need ${upg.cost - state.prestigePoints}`;
      html += `
        <button class="main-btn ${enabled ? "unlocked" : ""}" type="button" data-buy-prestige="${upg.id}"${enabled ? "" : " disabled"}>
          ${upg.name} <span class="pill${enabled ? "" : " locked"}">${econ.formatNumber(upg.cost)}</span>
          <small>${upg.desc}</small>
          <div class="upg-status ${enabled ? "available" : !affordable ? "locked" : ""}">${status}</div>
        </button>`;
    }

    html += `</div>`;
    els.prestige.innerHTML = html;
    els.prestige.scrollTop = scrollTop;
  }

  function renderAchievements() {
    const scrollTop = els.achievements.scrollTop;
    const list = window.COI.achievements || [];
    let html = `<div class="section-title">Achievements (${state.achievementsDone.size}/${list.length})</div>`;
    for (const a of list) {
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
        <textarea class="savebox" id="saveData" readonly>${JSON.stringify(window.COI.save.exportState())}</textarea>
      </div>
    `;
    els.settings.innerHTML = html;
    els.settings.scrollTop = scrollTop;
    attachSettingsHandlers();
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
        window.COI.save.importState(JSON.parse(data));
        msg("Save imported.");
        updateAll();
        window.COI.save.saveGame();
      } catch {
        msg("Invalid save data", false);
      }
    });
    document.getElementById("restartBtn").addEventListener("click", ()=>{ window.COI.save.restartGame(); });
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

  window.COI.ui = {
    msg,
    setBuyMode,
    getResolvedBuyCount,
    getResolvedSellCount,
    updateHUD,
    renderShop,
    refreshShopUI,
    renderUpgrades,
    refreshUpgradesUI,
    renderStats,
    renderPrestige,
    renderAchievements,
    renderSettings,
    updateAll,
  };

  window.setBuyMode = setBuyMode;
  window.switchUpgradeTab = switchUpgradeTab;
})();
