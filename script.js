// === GAME STATE VARIABLES ===
let kp = 0;
let kpPerClick = 1;
let kpPerSecond = 0;
let prestiges = 0;
let isMuted = false;

// === SOUND EFFECTS & MUTE TOGGLE ===
const clickSound    = new Audio('sounds/click.mp3');
const upgradeSound  = new Audio('sounds/upgrade.mp3');
const prestigeSound = new Audio('sounds/prestige.mp3');
clickSound.load();
upgradeSound.load();
prestigeSound.load();

const muteBtn = document.getElementById("mute-btn");
isMuted = localStorage.getItem("muteSetting") === "true";
updateMuteButton();

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  localStorage.setItem("muteSetting", isMuted);
  updateMuteButton();
});

function updateMuteButton() {
  muteBtn.textContent = isMuted ? "🔇 Sound: Off" : "🔊 Sound: On";
}

// === DOM REFERENCES ===
const resetOverlay     = document.getElementById("reset-overlay");
const tooltip          = document.getElementById("tooltip");
const display          = document.getElementById("kp-display");
const prestigeDisplay  = document.getElementById("prestige-display");
const clickBtn         = document.getElementById("click-btn");
const upgradeContainer = document.getElementById("upgrade-container");

// === PRESTIGE MULTIPLIER ===
function getPrestigeMultiplier() {
  return 1 + prestiges * 0.2; // +20% KP/click per prestige
}

// === DISPLAY UPDATES ===
function updatePrestigeDisplay() {
  prestigeDisplay.textContent =
    `Prestiges: ${prestiges} (x${getPrestigeMultiplier().toFixed(1)} KP/click)`;
}

function updateDisplay() {
  display.textContent = `Knowledge Points: ${Math.floor(kp)}`;
  updatePrestigeDisplay();
}

// === TOOLTIP POSITIONER ===
function positionTooltip(e) {
  const offset = 15;
  tooltip.style.left = `${e.pageX + offset}px`;
  tooltip.style.top  = `${e.pageY + offset}px`;
}

// === UPGRADE DATA ===
const upgrades = [
  {
    name: "Loops",
    baseCost: 25,
    count: 0,
    effect: () => { kpPerSecond += 1; },
    description: "Teaches repetitive tasks — +1 KP/sec",
    unlocked: false
  },
  {
    name: "Recursion",
    baseCost: 100,
    count: 0,
    effect: () => {
      kpPerClick = kpPerClick * 1.2 + 2;
    },
    description: "Modest recursive boost — +2 KP/click & +20%",
    unlocked: false
  },
  {
    name: "Fibonacci",
    baseCost: 200,
    count: 0,
    effect: () => { kpPerSecond += 5; },
    description: "Generates a recursive math sequence — +5 KP/sec",
    unlocked: false
  },
  {
    name: "Exponentiation",
    baseCost: 500,
    count: 0,
    effect: () => { kpPerClick += 10; },
    description: "Exponentially increases power — +10 KP/click",
    unlocked: false
  },
  {
    name: "Sorting Algorithms",
    baseCost: 800,
    count: 0,
    effect: () => { kpPerSecond += 10; },
    description: "Improves data organization — +10 KP/sec",
    unlocked: false
  },
  {
    name: "Binary Trees",
    baseCost: 1200,
    count: 0,
    effect: () => { kpPerClick += 20; },
    description: "Hierarchical data structure — +20 KP/click",
    unlocked: false
  },
  {
    name: "Graph Theory",
    baseCost: 2000,
    count: 0,
    effect: () => { kpPerSecond += 25; },
    description: "Analyzing networks — +25 KP/sec",
    unlocked: false
  },
  {
    name: "Big O Notation",
    baseCost: 3000,
    count: 0,
    effect: () => {
      kpPerClick    *= 1.5;
      kpPerSecond   *= 1.5;
    },
    description: "Boosts efficiency — x1.5 KP/sec & KP/click",
    unlocked: false
  },
  {
    name: "Turing Machine",
    baseCost: 5000,
    count: 0,
    effect: () => { kpPerSecond += 50; },
    description: "Simulates any algorithm — +50 KP/sec",
    unlocked: false
  },
  {
    name: "Prestige",
    baseCost: 50000,
    count: 0,
    effect: () => {
      resetOverlay.classList.add("active");
      setTimeout(() => {
        if (!isMuted) {
          prestigeSound.currentTime = 0;
          prestigeSound.play();
        }
        prestiges += 1;
        kp = 0;
        kpPerClick = 1;
        kpPerSecond = 0;
        upgrades.forEach(u => {
          u.unlocked = false;
          u.count = 0;
        });
        updateDisplay();
        renderUpgrades();
        saveGame();
        resetOverlay.classList.remove("active");
      }, 800);
    },
    description: "Reset progress for a permanent KP boost",
    unlocked: false
  }
];

// === CLICK HANDLER ===
clickBtn.addEventListener("click", () => {
  if (!isMuted) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
  kp += kpPerClick * getPrestigeMultiplier();
  updateDisplay();
  renderUpgrades();
});

// === RENDER UPGRADE BUTTONS ===
function renderUpgrades() {
  upgradeContainer.innerHTML = "";
  upgrades.forEach((u, idx) => {
    // always unlock Loops, others at 70% of their base cost
    if (idx === 0) u.unlocked = true;
    else if (!u.unlocked && kp >= u.baseCost * 0.7) u.unlocked = true;

    if (!u.unlocked) return;

    const cost = Math.floor(u.baseCost * Math.pow(1.15, u.count));
    const btn  = document.createElement("button");
    btn.className = "upgrade";
    btn.textContent = `${u.name} (${cost} KP)`;

    btn.addEventListener("mouseenter", e => {
      tooltip.textContent = u.description;
      tooltip.classList.remove("hidden");
      positionTooltip(e);
    });
    btn.addEventListener("mousemove", positionTooltip);
    btn.addEventListener("mouseleave", () => {
      tooltip.classList.add("hidden");
    });

    btn.addEventListener("click", () => {
      if (kp >= cost) {
        if (!isMuted) {
          upgradeSound.currentTime = 0;
          upgradeSound.play();
        }
        kp -= cost;
        u.effect();
        u.count += 1;
        updateDisplay();
        renderUpgrades();
      }
    });

    upgradeContainer.appendChild(btn);
  });
}

// === SAVE & LOAD ===
function saveGame() {
  const saveData = {
    kp,
    kpPerClick,
    kpPerSecond,
    prestiges,
    isMuted,
    upgradesCount: upgrades.map(u => u.count),
    upgradesUnlocked: upgrades.map(u => u.unlocked)
  };
  localStorage.setItem("mathIdleSave", JSON.stringify(saveData));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("mathIdleSave")) || {};
  kp           = data.kp            || 0;
  kpPerClick   = data.kpPerClick    || 1;
  kpPerSecond  = data.kpPerSecond   || 0;
  prestiges    = data.prestiges     || 0;
  isMuted      = data.isMuted       || false;
  if (data.upgradesCount) {
    upgrades.forEach((u, i) => {
      u.count    = data.upgradesCount[i]    || 0;
      u.unlocked = data.upgradesUnlocked[i] || false;
    });
  }
  updateMuteButton();
}

// === GAME LOOP & INIT ===
function gameLoop() {
  kp += kpPerSecond / 10;
  updateDisplay();
  saveGame();
}

loadGame();
updateDisplay();
renderUpgrades();
setInterval(gameLoop, 100);