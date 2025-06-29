let kp = 0;
let kpPerClick = 1;
let kpPerSecond = 0;
let prestiges = 0;

function getPrestigeMultiplier() {
  return 1 + prestiges * 0.2; // 20% bonus per prestige
}

const resetOverlay = document.getElementById("reset-overlay");
const tooltip = document.getElementById("tooltip");
const display = document.getElementById("kp-display");
const clickBtn = document.getElementById("click-btn");
const upgradeContainer = document.getElementById("upgrade-container");
const prestigeDisplay = document.getElementById("prestige-display");

function updatePrestigeDisplay() {
  prestigeDisplay.textContent =
    `Prestiges: ${prestiges} (x${getPrestigeMultiplier().toFixed(1)} KP/click boost)`;
}

const upgrades = [
  { name: "Loops", cost: 25,       effect: () => { kpPerSecond += 1; },
    description: "Teaches repetitive tasks — +1 KP/sec", unlocked: false },
  { name: "Recursion", cost: 100,  effect: () => { kpPerClick *= 2; },
    description: "A function that calls itself — doubles KP per click", unlocked: false },
  { name: "Fibonacci", cost: 200,  effect: () => { kpPerSecond += 5; },
    description: "Generates a recursive math sequence — +5 KP/sec", unlocked: false },
  { name: "Exponentiation", cost: 500, effect: () => { kpPerClick += 10; },
    description: "Exponentiation increases power rapidly — +10 KP per click", unlocked: false },
  { name: "Sorting Algorithms", cost: 800, effect: () => { kpPerSecond += 10; },
    description: "Improves data organization — +10 KP/sec", unlocked: false },
  { name: "Binary Trees", cost: 1200,  effect: () => { kpPerClick += 20; },
    description: "Hierarchical data structure — +20 KP per click", unlocked: false },
  { name: "Graph Theory", cost: 2000,  effect: () => { kpPerSecond += 25; },
    description: "Analyzing networks and connections — +25 KP/sec", unlocked: false },
  { name: "Big O Notation", cost: 3000,
    effect: () => { kpPerClick *= 1.5; kpPerSecond *= 1.5; },
    description: "Measures algorithm efficiency — boosts both KP/sec and KP/click", unlocked: false },
  { name: "Turing Machine", cost: 5000, effect: () => { kpPerSecond += 50; },
    description: "Abstract machine that can simulate any algorithm — +50 KP/sec", unlocked: false },
  {
    name: "Prestige", cost: 50000,
    description: "Reset your progress for a significant boost to your KP gain",
    effect: () => {
      resetOverlay.classList.add("active");
      setTimeout(() => {
        prestiges += 1;
        kp = 0;
        kpPerClick = 1;
        kpPerSecond = 0;
        upgrades.forEach(u => u.unlocked = false);
        updateDisplay();
        renderUpgrades();
        saveGame();
        resetOverlay.classList.remove("active");
      }, 800);
    },
    unlocked: false
  }
];

// Always show the first upgrade immediately
upgrades[0].unlocked = true;

clickBtn.addEventListener("click", () => {
  kp += kpPerClick * getPrestigeMultiplier();
  updateDisplay();
  renderUpgrades();
});

function updateDisplay() {
  display.textContent = `Knowledge Points: ${Math.floor(kp)}`;
  updatePrestigeDisplay();
}

function positionTooltip(e) {
  const offset = 15;
  tooltip.style.left = `${e.pageX + offset}px`;
  tooltip.style.top = `${e.pageY + offset}px`;
}

function renderUpgrades() {
  upgradeContainer.innerHTML = "";
  upgrades.forEach((upgrade, idx) => {
    // Force first upgrade visible; others at 70% cost
    if (idx === 0) upgrade.unlocked = true;
    else if (!upgrade.unlocked && kp >= upgrade.cost * 0.7)
      upgrade.unlocked = true;

    if (upgrade.unlocked) {
      const btn = document.createElement("button");
      btn.className = "upgrade";
      btn.textContent = `${upgrade.name} (${upgrade.cost} KP)`;

      btn.addEventListener("mouseenter", e => {
        tooltip.textContent = upgrade.description;
        tooltip.classList.remove("hidden");
        positionTooltip(e);
      });
      btn.addEventListener("mousemove", positionTooltip);
      btn.addEventListener("mouseleave", () => tooltip.classList.add("hidden"));

      btn.addEventListener("click", () => {
        if (kp >= upgrade.cost) {
          kp -= upgrade.cost;
          upgrade.effect();
          upgrade.unlocked = false;   // hide it after purchase
          updateDisplay();
          renderUpgrades();
        }
      });

      upgradeContainer.appendChild(btn);
    }
  });
}

function saveGame() {
  const saveData = {
    kp, kpPerClick, kpPerSecond, prestiges,
    upgradesUnlocked: upgrades.map(u => u.unlocked)
  };
  localStorage.setItem("mathIdleSave", JSON.stringify(saveData));
}

function loadGame() {
  const saveData = JSON.parse(localStorage.getItem("mathIdleSave")) || {};
  kp = saveData.kp || 0;
  kpPerClick = saveData.kpPerClick || 1;
  kpPerSecond = saveData.kpPerSecond || 0;
  prestiges = saveData.prestiges || 0;
  if (saveData.upgradesUnlocked) {
    upgrades.forEach((u, i) => { u.unlocked = saveData.upgradesUnlocked[i]; });
  }
}

function gameLoop() {
  kp += kpPerSecond / 10;
  updateDisplay();
  saveGame();
}

loadGame();
updateDisplay();
renderUpgrades();
setInterval(gameLoop, 100);
