(() => {
  const { els, state } = window.COI;
  const { econ, ui, fx, save } = window.COI;

  function checkAchievements() {
    const list = window.COI.achievements || [];

    for (const a of list) {
      if (
        !state.achievementsDone.has(a.id) &&
        a.check({
          state,
          getCPS: econ.getCPS,
          getBuildingCount: econ.getBuildingCount
        })
      ) {
        state.achievementsDone.add(a.id);
        a.reward({
          updateAchievementBonus: econ.updateAchievementBonus
        });

        ui.msg(`Achievement: ${a.name}`);
        fx.playTone(880, 0.1, "triangle", 2);
      }
    }
  }

  function clickOrb(ev) {
    state.totalClicks += 1;

    const x = ev?.clientX ?? window.innerWidth / 2;
    const y = ev?.clientY ?? window.innerHeight / 2;

    let multiplier = 1;

    const critRoll = Math.random();

    if (critRoll < Math.min(0.99, state.critChance)) {
      state.totalCrits += 1;
      state.hotStreak += 1;

      if (state.hotStreak > state.bestHotStreak) {
        state.bestHotStreak = state.hotStreak;
      }

      multiplier = Math.max(2, Math.round(2 * state.critMult));

      fx.playCritSound();
      fx.shake();
      fx.spawnParticle(`x${multiplier}`, x, y, "#f1c04d");
      ui.msg(`Crit x${multiplier}`);
    } else {
      state.hotStreak = 0;
      fx.spawnParticle("+", x, y);
    }

    const gain = state.clickPower * state.clickMult * multiplier;

    state.candyOrbs += gain;
    state.totalEarned += gain;
    state.totalCandyEarned += gain;

    // 🔥 ONLY FIX ADDED HERE (IMPORTANT)
    if (!state.waterfallUnlocked && state.totalCandyEarned >= 1000) {
      state.waterfallUnlocked = true;
      ui.msg("🌊 Waterfall Unlocked!");
      save.saveGame(); // <-- THIS is the fix
    }

    fx.playClickSound();

    checkAchievements();
    ui.updateHUD();
  }

  function buyBuilding(id) {
    const b = econ.getBuilding(id);
    if (!b) return;

    if (econ.isBuildingLocked(b)) {
      ui.msg(`Locked - earn ${econ.formatNumber(b.unlockAt)} first`, false);
      return;
    }

    const amount = ui.getResolvedBuyCount(b);
    if (amount <= 0) {
      ui.msg("Can't buy any right now", false);
      return;
    }

    const price = econ.getBuildingTotalCost(b, amount);

    if (state.candyOrbs < price) {
      ui.msg(`Need ${econ.formatNumber(price - state.candyOrbs)} more`, false);
      return;
    }

    state.candyOrbs -= price;
    state.totalSpent += price;

    b.count += amount;

    fx.playBuySound();
    ui.msg(`${b.name} x${amount} (${b.count})`);

    ui.updateAll();
  }

  function sellBuilding(id) {
    const b = econ.getBuilding(id);
    if (!b || b.count === 0) return;

    const amount = Math.min(b.count, ui.getResolvedSellCount(b));
    const refund = econ.getBuildingSellRefund(b, amount);

    state.candyOrbs += refund;
    b.count -= amount;

    state.totalSold += amount;
    state.totalSoldValue += refund;

    fx.playBuySound();
    ui.msg(`Sold x${amount}`);

    ui.updateAll();
  }

  function buyUpgrade(id) {
    const upg = state.upgrades.find(u => u.id === id);
    if (!upg) return;

    if (state.clickUpgradesBought.has(id)) return;

    if (state.candyOrbs < upg.cost) {
      ui.msg(`Need ${econ.formatNumber(upg.cost - state.candyOrbs)} more`, false);
      return;
    }

    state.candyOrbs -= upg.cost;
    state.totalSpent += upg.cost;

    state.clickUpgradesBought.add(id);
    upg.effect();

    fx.playBuySound();
    ui.msg(`${upg.name} unlocked`);

    ui.updateAll();
  }

  function prestigeReset() {
    const gain = econ.getPrestigeGain();

    if (gain < 1) {
      ui.msg("Need 100,000 earned to prestige", false);
      return;
    }

    if (!confirm(`Prestige for ${gain} point(s)?`)) return;

    state.prestige += gain;
    state.prestigePoints += gain;
    state.lastPrestigeEarned = state.prestigePoints;

    state.totalEarned = 0;
    state.totalCandyEarned = 0;

    state.candyOrbs = 0;
    state.clickPower = 1;
    state.critChance = 0.10;
    state.critMult = 1;
    state.hotStreak = 0;

    state.clickUpgradesBought.clear();

    for (const b of state.buildings) {
      b.count = 0;
      b.bonusMult = 1;
    }

    fx.playPrestigeSound();
    fx.shake();

    ui.msg(`Prestige +${gain}`);

    ui.updateAll();
    save.saveGame();
  }

  function buyPrestigeUpgrade(id) {
    const upg = state.prestigeUpgrades.find(p => p.id === id);
    if (!upg) return;

    if (state.prestigeUpgradesBought.has(id)) return;

    if (state.prestigePoints < upg.cost) {
      ui.msg(`Need ${upg.cost - state.prestigePoints} more`, false);
      return;
    }

    state.prestigePoints -= upg.cost;
    state.prestigeUpgradesBought.add(id);

    upg.effect();

    fx.playPrestigeSound();
    ui.msg(`${upg.name} purchased`);

    ui.updateAll();
  }

  function updateWaterfall() {
    if (!state.waterfallUnlocked && state.totalCandyEarned >= 1000) {
      state.waterfallUnlocked = true;
      ui.msg("🌊 Waterfall Unlocked!");
      save.saveGame(); // 🔥 SECOND SAFE FIX (prevents refresh loss)
    }

    if (state.waterfallUnlocked) {
      fx.spawnWaterfall(state.lastTick);
    }
  }

  function attachDelegatedHandlers() {
    els.shop.addEventListener("click", (ev) => {
      const target = ev.target.closest?.("button");
      if (!target) return;

      if (target.dataset.buyBuilding) buyBuilding(target.dataset.buyBuilding);
      else if (target.dataset.sellBuilding) sellBuilding(target.dataset.sellBuilding);
    });

    els.upgrades.addEventListener("click", (ev) => {
      const target = ev.target.closest?.("button");
      if (!target) return;

      if (target.dataset.buyUpgrade) buyUpgrade(target.dataset.buyUpgrade);
    });

    els.prestige.addEventListener("click", (ev) => {
      const target = ev.target.closest?.("button");
      if (!target) return;

      if (target.id === "prestigeBtn") prestigeReset();
      else if (target.dataset.buyPrestige) buyPrestigeUpgrade(target.dataset.buyPrestige);
    });
  }

  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));

      tab.classList.add("active");

      const panel = document.getElementById(tab.dataset.tab);
      if (panel) panel.classList.add("active");
    });
  });

  const orbImg = document.getElementById("orbImg");
  const orbFallback = document.getElementById("orbFallback");

  orbImg.addEventListener("click", clickOrb);
  orbFallback.addEventListener("click", clickOrb);

  orbImg.addEventListener("error", () => {
    orbImg.style.display = "none";
    orbFallback.style.display = "block";
  });

  document.addEventListener("keydown", (ev) => {
    if (!els.shop.classList.contains("active")) return;

    if (ev.key === "1") ui.setBuyMode(1);
    else if (ev.key === "2") ui.setBuyMode(10);
    else if (ev.key === "3") ui.setBuyMode(100);
    else if (ev.key === "4") ui.setBuyMode("max");
  });

  attachDelegatedHandlers();

  setInterval(() => {
    if (!state.paused) {
      const cps = econ.getCPS();
      const gain = cps / 10;

      state.candyOrbs += gain;
      state.totalEarned += gain;
      state.totalCandyEarned += gain;

      updateWaterfall();
    }

    state.lastTick = Date.now();

    ui.updateHUD();
    ui.refreshShopUI();
    ui.refreshUpgradesUI();

    checkAchievements();
  }, 100);

  setInterval(save.saveGame, 10000);

  save.loadGame();
  ui.updateAll();
})();
