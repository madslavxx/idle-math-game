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
const factCard         = document.getElementById("fact-card");
const factText         = document.getElementById("fact-text");
const factClose        = document.getElementById("fact-close");
const glossaryBtn      = document.getElementById("glossary-btn");
const glossaryModal    = document.getElementById("glossary-modal");
const glossaryClose    = document.getElementById("glossary-close");
const glossaryList     = document.getElementById("glossary-list");

// === PRESTIGE MULTIPLIER ===
function getPrestigeMultiplier() {
  return 1 + prestiges * 0.2; // +20% KP/click per prestige
}

// === DISPLAY UPDATES ===
function updatePrestigeDisplay() {
  prestigeDisplay.textContent = `Prestiges: ${prestiges} (x${getPrestigeMultiplier().toFixed(1)} KP/click)`;
}

function updateDisplay() {
  display.textContent = `Knowledge Points: ${Math.floor(kp)}`;
  updatePrestigeDisplay();
}

// === TOOLTIP POSITIONER ===
function positionTooltip(e) {
  const offset = 12;
  const { width, height } = tooltip.getBoundingClientRect();
  let x = e.clientX + offset;
  let y = e.clientY + offset;

  // Adjust position to prevent going off-screen
  if (x + width > window.innerWidth) {
    x = e.clientX - width - offset;
  }
  if (y + height > window.innerHeight) {
    y = e.clientY - height - offset;
  }

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

// === FACTS ===
const facts = {
  "Loops": "Loops run code repeatedly—common in animations and data processing.",
  "Recursion": "Recursion solves problems by breaking them into smaller, identical ones.",
  "Fibonacci": "Fibonacci numbers appear in nature: pinecones, sunflowers, and seashells.",
  "Exponentiation": "Exponentiation is repeated multiplication—a key in compound interest.",
  "Sorting Algorithms": "Sorting data efficiently is vital for search and storage systems.",
  "Binary Trees": "Binary trees are used in databases and file systems to store sorted data.",
  "Graph Theory": "Graphs model relationships—from social networks to computer networks.",
  "Big O Notation": "Big O describes how an algorithm’s runtime scales with input size.",
  "Turing Machine": "A Turing Machine is a theoretical model that defines what’s computable."
};

// --- Event Listeners for Cards and Modals ---
factClose.addEventListener("click", () => {
  factCard.classList.add("hidden");
});

glossaryBtn.addEventListener("click", () => {
  glossaryModal.classList.remove("hidden");
});

glossaryClose.addEventListener("click", () => {
  glossaryModal.classList.add("hidden");
});


// === UPGRADE DATA ===
const upgrades = [
  { name: "Loops", baseCost: 25, count: 0, effect: () => { kpPerSecond += 1; }, description: "Teaches repetitive tasks — +1 KP/sec", unlocked: false },
  { name: "Recursion", baseCost: 100, count: 0, effect: () => { kpPerClick = kpPerClick * 1.2 + 2; }, description: "Modest recursive boost — +2 KP/click & +20%", unlocked: false },
  { name: "Fibonacci", baseCost: 200, count: 0, effect: () => { kpPerSecond += 5; }, description: "Generates a recursive math sequence — +5 KP/sec", unlocked: false },
  { name: "Exponentiation", baseCost: 500, count: 0, effect: () => { kpPerClick += 10; }, description: "Exponentially increases power — +10 KP/click", unlocked: false },
  { name: "Sorting Algorithms", baseCost: 800, count: 0, effect: () => { kpPerSecond += 10; }, description: "Improves data organization — +10 KP/sec", unlocked: false },
  { name: "Binary Trees", baseCost: 1200, count: 0, effect: () => { kpPerClick += 20; }, description: "Hierarchical data structure — +20 KP/click", unlocked: false },
  { name: "Graph Theory", baseCost: 2000, count: 0, effect: () => { kpPerSecond += 25; }, description: "Analyzing networks — +25 KP/sec", unlocked: false },
  { name: "Big O Notation", baseCost: 3000, count: 0, effect: () => { kpPerClick *= 1.5; kpPerSecond *= 1.5; }, description: "Boosts efficiency — x1.5 KP/sec & KP/click", unlocked: false },
  { name: "Turing Machine", baseCost: 5000, count: 0, effect: () => { kpPerSecond += 50; }, description: "Simulates any algorithm — +50 KP/sec", unlocked: false },
  { name: "Prestige", baseCost: 50000, count: 0, effect: () => {
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
            if (u.name !== 'Prestige') {
                u.unlocked = false;
                u.count = 0;
            }
        });
        upgradeContainer.innerHTML = '';
        updateDisplay();
        renderUpgrades();
        saveGame();
        resetOverlay.classList.remove("active");
      }, 800);
    }, description: "Reset progress for a permanent KP boost", unlocked: false
  }
];

clickBtn.addEventListener("click", () => {
  if (!isMuted) {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.error("Audio play failed:", e));
  }
  kp += kpPerClick * getPrestigeMultiplier();
  updateDisplay();
});

function applyUpgrade(u, cost) {
  kp -= cost;
  u.effect();
  u.count += 1;
  updateDisplay();
  // Add purchased concept to the glossary if not already there
  if (![...glossaryList.children].some(li => li.dataset.name === u.name)) {
    const li = document.createElement("li");
    li.dataset.name = u.name;
    li.innerHTML = `<strong>${u.name}:</strong> ${facts[u.name] || u.description}`;
    glossaryList.appendChild(li);
  }
}

function renderUpgrades() {
  upgrades.forEach((u, idx) => {
    // Unlock logic: an upgrade becomes visible when you have 70% of its base cost
    if (idx === 0) u.unlocked = true;
    else if (!u.unlocked && kp >= u.baseCost * 0.7) u.unlocked = true;

    let btn = document.getElementById(`upgrade-${idx}`);

    // If the upgrade is unlocked but its button doesn't exist yet, create it.
    if (u.unlocked && !btn) {
      btn = document.createElement("button");
      btn.id = `upgrade-${idx}`;
      btn.className = "upgrade";
      
      // Add event listeners ONLY when the button is first created.
      btn.addEventListener("mouseenter", (e) => {
        tooltip.textContent = u.description;
        tooltip.classList.remove("hidden");
        positionTooltip(e);
        tooltip.classList.add("visible");
      });
      btn.addEventListener("mousemove", positionTooltip);
      btn.addEventListener("mouseleave", () => {
        tooltip.classList.remove("visible");
        setTimeout(() => tooltip.classList.add("hidden"), 200);
      });
      btn.addEventListener("click", () => {
        // Recalculate cost on click to ensure it's current
        const currentCost = Math.floor(u.baseCost * Math.pow(1.15, u.count));
        if (kp >= currentCost) {
          if (!isMuted) {
            upgradeSound.currentTime = 0;
            upgradeSound.play().catch(e => console.error("Audio play failed:", e));
          }
          applyUpgrade(u, currentCost);
        }
      });
      
      upgradeContainer.appendChild(btn);

      // Show fact card only when an upgrade is first unlocked
      if (u.unlocked && !u._factShown && facts[u.name]) {
        factText.textContent = facts[u.name];
        factCard.classList.remove("hidden");
        u._factShown = true;
      }
    }

    // If the button exists (either just created or already there), update its state.
    if (btn) {
      const cost = Math.floor(u.baseCost * Math.pow(1.15, u.count));
      btn.disabled = kp < cost;
      btn.textContent = `${u.name} (${cost} KP)`;
    }
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
    upgrades: upgrades.map(u => ({ count: u.count, unlocked: u.unlocked, _factShown: u._factShown }))
  };
  localStorage.setItem("mathIdleSave", JSON.stringify(saveData));
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem("mathIdleSave"));
  if (!data) return;

  kp = data.kp || 0;
  kpPerClick = data.kpPerClick || 1;
  kpPerSecond = data.kpPerSecond || 0;
  prestiges = data.prestiges || 0;
  isMuted = data.isMuted || false;
  if (data.upgrades) {
    upgrades.forEach((u, i) => {
      u.count = data.upgrades[i]?.count || 0;
      u.unlocked = data.upgrades[i]?.unlocked || false;
      u._factShown = data.upgrades[i]?._factShown || false;
    });
  }
  updateMuteButton();
}


// === GAME LOOP ===
function gameLoop() {
  kp += kpPerSecond / 10; // Grant passive KP 10 times per second
  updateDisplay();
  renderUpgrades(); // Continuously check button states (affordable/not) and unlock new ones
}

// --- INITIALIZE GAME ---
loadGame();
updateDisplay();
// Initial render of any buttons from a saved state
renderUpgrades();
setInterval(gameLoop, 100);
setInterval(saveGame, 5000); // Save every 5 seconds
