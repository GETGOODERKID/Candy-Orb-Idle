(() => {
  const { els, state } = window.COI;
  const cfg = window.COI_CONFIG;

  const candyColors = [
    { grad1: "#ec4899", grad2: "#c73b8e", grad3: "#7a1f4f" },
    { grad1: "#a78bfa", grad2: "#8b5cf6", grad3: "#5b21b6" },
    { grad1: "#06b6d4", grad2: "#0891b2", grad3: "#0e7490" },
    { grad1: "#fbbf24", grad2: "#f59e0b", grad3: "#b45309" },
    { grad1: "#10b981", grad2: "#059669", grad3: "#065f46" },
    { grad1: "#f43f5e", grad2: "#be185d", grad3: "#831843" },
    { grad1: "#3b82f6", grad2: "#1d4ed8", grad3: "#1e3a8a" },
  ];

  let audioCtx = null;

  function ensureAudio() {
    if (!state.sound || state.soundVolume <= 0) return null;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq=330, duration=0.05, type="square", gainAmount=1, soundType="click") {
    const ctx = ensureAudio();
    if (!ctx) return;

    let soundVol = state.soundVolume;

    if (soundType === "click") soundVol *= state.clickSoundVol;
    else if (soundType === "buy") soundVol *= state.buySoundVol;
    else if (soundType === "crit") soundVol *= state.critSoundVol;
    else if (soundType === "prestige") soundVol *= state.prestigeSoundVol;

    const finalGain = gainAmount * soundVol * 0.15;

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = type;
    o.frequency.value = freq;

    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(finalGain, now + duration * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    o.start(now);
    o.stop(now + duration + 0.01);
  }

  function playClickSound() { playTone(420, 0.04, "square", 3, "click"); }
  function playBuySound() { playTone(580, 0.08, "triangle", 1.2, "buy"); }
  function playCritSound() { playTone(780, 0.1, "sawtooth", 1.5, "crit"); }
  function playPrestigeSound() { playTone(220, 0.15, "sine", 1.2, "prestige"); }

  function shake() {
    if (state.reduceMotion) return;
    els.game.classList.remove("shake");
    void els.game.offsetWidth;
    els.game.classList.add("shake");
  }

  function spawnParticle(text, x, y, color="white") {
    if (!state.particles || state.reduceMotion) return;

    const p = document.createElement("div");
    p.className = "particle";
    p.textContent = text;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.color = color;

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }

  let lastWaterfallSpawnAt = 0;

  // 🌊 FIXED WATERFALL SYSTEM
  function spawnWaterfall(nowMs) {

    // ❌ HARD FIX: must be unlocked first
    if (!state.waterfallUnlocked) return;

    if (!state.particles || state.reduceMotion) return;

    const minDelayMs = 1000 / Math.max(1, cfg.waterfallMaxDropsPerSecond);

    if (nowMs - lastWaterfallSpawnAt < minDelayMs) return;
    lastWaterfallSpawnAt = nowMs;

    // 🔥 No longer depends on current candy (THIS FIXES YOUR BUG)
    const intensity = 25;

    const drops = 1 + (Math.random() < 0.4 ? 1 : 0);

    for (let i = 0; i < drops; i++) {
      const x = window.innerWidth * (0.6 + Math.random() * 0.35);
      const y = -80;

      const duration = 2.5 + Math.random() * 3;
      const size = 44 + Math.random() * 28;

      const colors = candyColors[Math.floor(Math.random() * candyColors.length)];

      const drop = document.createElement("div");
      drop.className = "raindrop";
      drop.style.left = x + "px";
      drop.style.top = y + "px";
      drop.style.width = size + "px";
      drop.style.height = size + "px";
      drop.style.animation = `fall ${duration}s linear`;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");

      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const grad = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");

      const gradId = `candy-grad-${nowMs}-${Math.random()}`;
      grad.setAttribute("id", gradId);
      grad.setAttribute("cx", "35%");
      grad.setAttribute("cy", "35%");

      const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("style", `stop-color:${colors.grad1};stop-opacity:1`);

      const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "70%");
      stop2.setAttribute("style", `stop-color:${colors.grad2};stop-opacity:1`);

      const stop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop3.setAttribute("offset", "100%");
      stop3.setAttribute("style", `stop-color:${colors.grad3};stop-opacity:1`);

      grad.appendChild(stop1);
      grad.appendChild(stop2);
      grad.appendChild(stop3);

      defs.appendChild(grad);
      svg.appendChild(defs);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "50");
      circle.setAttribute("cy", "50");
      circle.setAttribute("r", "45");
      circle.setAttribute("fill", `url(#${gradId})`);

      svg.appendChild(circle);

      const highlight = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      highlight.setAttribute("cx", "35");
      highlight.setAttribute("cy", "35");
      highlight.setAttribute("r", "15");
      highlight.setAttribute("fill", "rgba(255,255,255,0.3)");

      svg.appendChild(highlight);

      drop.appendChild(svg);
      els.rainContainer.appendChild(drop);

      setTimeout(() => drop.remove(), duration * 1000);
    }
  }

  window.COI.fx = {
    playTone,
    playClickSound,
    playBuySound,
    playCritSound,
    playPrestigeSound,
    shake,
    spawnParticle,
    spawnWaterfall,
  };
})();
