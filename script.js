// === GAME STATE VARIABLES ===
let kp = 0;
let kpPerClick = 1;
let kpPerSecond = 0;
let prestiges = 0;
let isMuted = false;
let gameStats = { totalClicks: 0, totalKp: 0, upgradesPurchased: 0 };

// === SOUND EFFECTS & MUTE TOGGLE ===
const clickSound = new Audio('sounds/click.mp3');
const upgradeSound = new Audio('sounds/upgrade.mp3');
const prestigeSound = new Audio('sounds/prestige.mp3');
const achievementSound = new Audio('sounds/achievement.mp3');
[clickSound, upgradeSound, prestigeSound, achievementSound].forEach(sound => sound.load());

const muteBtn = document.getElementById("mute-btn");
isMuted = localStorage.getItem("muteSetting") === "true";
updateMuteButton();
muteBtn.addEventListener("click", () => { isMuted = !isMuted; localStorage.setItem("muteSetting", isMuted); updateMuteButton(); });
function updateMuteButton() { muteBtn.textContent = isMuted ? "🔇 Sound: Off" : "🔊 Sound: On"; }

// === DOM REFERENCES ===
const resetOverlay = document.getElementById("reset-overlay");
const tooltip = document.getElementById("tooltip");
const display = document.getElementById("kp-display");
const prestigeDisplay = document.getElementById("prestige-display");
const clickBtn = document.getElementById("click-btn");
const upgradeContainer = document.getElementById("upgrade-container");
const factCard = document.getElementById("fact-card");
const factText = document.getElementById("fact-text");
const factClose = document.getElementById("fact-close");
const glossaryBtn = document.getElementById("glossary-btn");
const glossaryModal = document.getElementById("glossary-modal");
const glossaryClose = document.getElementById("glossary-close");
const glossaryList = document.getElementById("glossary-list");
const achievementsBtn = document.getElementById("achievements-btn");
const achievementsModal = document.getElementById("achievements-modal");
const achievementsClose = document.getElementById("achievements-close");
const achievementsList = document.getElementById("achievements-list");
const achievementToast = document.getElementById("achievement-toast");
const toastText = document.getElementById("toast-text");
const resetBtn = document.getElementById("reset-btn");
const resetConfirmModal = document.getElementById("reset-confirm-modal");
const resetConfirmYes = document.getElementById("reset-confirm-yes");
const resetConfirmNo = document.getElementById("reset-confirm-no");

// === ACHIEVEMENT SYSTEM ===
const achievements = [
    { id: 'click1', name: "First Step", description: "Click the 'Solve Problem' button for the first time.", unlocked: false, check: () => gameStats.totalClicks >= 1 },
    { id: 'click100', name: "Getting Started", description: "Click the 'Solve Problem' button 100 times.", unlocked: false, check: () => gameStats.totalClicks >= 100 },
    { id: 'kp1k', name: "Budding Genius", description: "Earn a total of 1,000 Knowledge Points.", unlocked: false, check: () => gameStats.totalKp >= 1000 },
    { id: 'upgrade1', name: "First Investment", description: "Purchase your first upgrade.", unlocked: false, check: () => gameStats.upgradesPurchased >= 1 },
    { id: 'prestige1', name: "Recursive Loop", description: "Prestige for the first time.", unlocked: false, check: () => prestiges >= 1 },
    { id: 'glossary5', name: "Curious Mind", description: "Unlock 5 items in the glossary.", unlocked: false, check: () => glossaryList.children.length >= 5 },
    { id: 'kp1m', name: "Mastermind", description: "Earn a total of 1,000,000 Knowledge Points.", unlocked: false, check: () => gameStats.totalKp >= 1000000 },
    { id: 'polymath', name: "Polymath", description: "Own at least one of every upgrade type (before prestige).", unlocked: false, check: () => upgrades.filter(u => u.name !== 'Prestige').every(u => u.count > 0) },
];
function showAchievementToast(name) { toastText.textContent = `Achievement Unlocked: ${name}`; achievementToast.classList.remove('hidden'); if (!isMuted) { achievementSound.currentTime = 0; achievementSound.play().catch(e => console.error("Audio play failed:", e)); } setTimeout(() => { achievementToast.classList.add('hidden'); }, 4000); }
function checkAchievements() { achievements.forEach(ach => { if (!ach.unlocked && ach.check()) { ach.unlocked = true; showAchievementToast(ach.name); if (!achievementsModal.classList.contains('hidden')) { renderAchievements(); } } }); }
function renderAchievements() { achievementsList.innerHTML = ''; achievements.forEach(ach => { const achDiv = document.createElement('div'); achDiv.className = 'achievement'; if (ach.unlocked) { achDiv.classList.add('unlocked'); } achDiv.innerHTML = `<h4>${ach.name}</h4><p>${ach.description}</p>`; achievementsList.appendChild(achDiv); }); }
achievementsBtn.addEventListener("click", () => { renderAchievements(); achievementsModal.classList.remove("hidden"); });
achievementsClose.addEventListener("click", () => { achievementsModal.classList.add("hidden"); });

// === RESET PROGRESS ===
resetBtn.addEventListener('click', () => {
    resetConfirmModal.classList.remove('hidden');
});
resetConfirmNo.addEventListener('click', () => {
    resetConfirmModal.classList.add('hidden');
});
resetConfirmYes.addEventListener('click', () => {
    // Clear all save data from local storage
    localStorage.removeItem("mathIdleSave");
    // Reload the page to start from scratch
    window.location.reload();
});

// === PRESTIGE & DISPLAY ===
function getPrestigeMultiplier() { return 1 + prestiges * 0.2; }
function updatePrestigeDisplay() { prestigeDisplay.textContent = `Prestiges: ${prestiges} (x${getPrestigeMultiplier().toFixed(1)} KP/click)`; }
function updateDisplay() { display.textContent = `Knowledge Points: ${Math.floor(kp)}`; updatePrestigeDisplay(); }

// === TOOLTIP POSITIONER ===
function positionTooltip(e) { const offset = 12; const { width, height } = tooltip.getBoundingClientRect(); let x = e.clientX + offset; let y = e.clientY + offset; if (x + width > window.innerWidth) x = e.clientX - width - offset; if (y + height > window.innerHeight) y = e.clientY - height - offset; tooltip.style.left = `${x}px`; tooltip.style.top = `${y}px`; }

// === FACTS & modals ===
const facts = {
  "Loops": "Loops run code repeatedly—common in animations and data processing.",
  "Recursion": "Recursion solves problems by breaking them into smaller, identical ones.",
  "Fibonacci": "Fibonacci numbers appear in nature: pinecones, sunflowers, and seashells.",
  "Exponentiation": "Exponentiation is repeated multiplication—a key in compound interest.",
  "Sorting Algorithms": "Sorting data efficiently is vital for search and storage systems.",
  "Binary Trees": "Binary trees are used in databases and file systems to store sorted data.",
  "Graph Theory": "Graphs model relationships—from social networks to computer networks.",
  "Big O Notation": "Big O describes how an algorithm’s runtime scales with input size.",
  "Turing Machine": "A Turing Machine is a theoretical model that defines what’s computable.",
  "Data Structures": "Ways to organize data, like arrays or trees, for efficient use.",
  "Cryptography": "The art of writing or solving codes for secure communication.",
  "Machine Learning": "Teaching computers to learn from data without being explicitly programmed."
};
factClose.addEventListener("click", () => factCard.classList.add("hidden"));
glossaryBtn.addEventListener("click", () => glossaryModal.classList.remove("hidden"));
glossaryClose.addEventListener("click", () => glossaryModal.classList.add("hidden"));

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
  { name: "Data Structures", baseCost: 8000, count: 0, effect: () => { kpPerSecond += 80; }, description: "Organize information for faster access — +80 KP/sec", unlocked: false },
  { name: "Cryptography", baseCost: 12000, count: 0, effect: () => { kpPerClick *= 2; }, description: "Secure your knowledge, doubling its impact — x2 KP/click", unlocked: false },
  { name: "Machine Learning", baseCost: 20000, count: 0, effect: () => { kpPerSecond *= 2; }, description: "Let the knowledge generate itself — x2 KP/sec", unlocked: false },
  { name: "Prestige", baseCost: 100000, count: 0, effect: () => { resetOverlay.classList.add("active"); setTimeout(() => { if (!isMuted) { prestigeSound.currentTime = 0; prestigeSound.play(); } prestiges += 1; kp = 0; kpPerClick = 1; kpPerSecond = 0; upgrades.forEach(u => { if (u.name !== 'Prestige') { u.unlocked = false; u.count = 0; } }); upgradeContainer.innerHTML = ''; updateDisplay(); renderUpgrades(); saveGame(); resetOverlay.classList.remove("active"); }, 800); }, description: "Reset progress for a permanent KP boost", unlocked: false }
];

// === CORE GAME ACTIONS ===
clickBtn.addEventListener("click", () => { if (!isMuted) { clickSound.currentTime = 0; clickSound.play().catch(e => console.error("Audio play failed:", e)); } const pointsGained = kpPerClick * getPrestigeMultiplier(); kp += pointsGained; gameStats.totalKp += pointsGained; gameStats.totalClicks++; updateDisplay(); });
function applyUpgrade(u, cost) { kp -= cost; u.effect(); u.count += 1; gameStats.upgradesPurchased++; updateDisplay(); if (![...glossaryList.children].some(li => li.dataset.name === u.name)) { const li = document.createElement("li"); li.dataset.name = u.name; li.innerHTML = `<strong>${u.name}:</strong> ${facts[u.name] || u.description}`; glossaryList.appendChild(li); } }

// === RENDER UPGRADES ===
function renderUpgrades() { upgrades.forEach((u, idx) => { if (idx === 0) u.unlocked = true; else if (!u.unlocked && kp >= u.baseCost * 0.7) u.unlocked = true; let btn = document.getElementById(`upgrade-${idx}`); if (u.unlocked && !btn) { btn = document.createElement("button"); btn.id = `upgrade-${idx}`; btn.className = "upgrade"; btn.addEventListener("mouseenter", (e) => { tooltip.textContent = u.description; tooltip.classList.remove("hidden"); positionTooltip(e); tooltip.classList.add("visible"); }); btn.addEventListener("mousemove", positionTooltip); btn.addEventListener("mouseleave", () => { tooltip.classList.remove("visible"); setTimeout(() => tooltip.classList.add("hidden"), 200); }); btn.addEventListener("click", () => { const currentCost = Math.floor(u.baseCost * Math.pow(1.15, u.count)); if (kp >= currentCost) { if (!isMuted) { upgradeSound.currentTime = 0; upgradeSound.play().catch(e => console.error("Audio play failed:", e)); } applyUpgrade(u, currentCost); } }); upgradeContainer.appendChild(btn); if (u.unlocked && !u._factShown && facts[u.name]) { factText.textContent = facts[u.name]; factCard.classList.remove("hidden"); u._factShown = true; } } if (btn) { const cost = Math.floor(u.baseCost * Math.pow(1.15, u.count)); btn.disabled = kp < cost; btn.textContent = `${u.name} (${cost} KP)`; } }); }

// === SAVE & LOAD ===
function saveGame() { const saveData = { kp, kpPerClick, kpPerSecond, prestiges, isMuted, upgrades: upgrades.map(u => ({ count: u.count, unlocked: u.unlocked, _factShown: u._factShown })), achievements: achievements.map(a => a.unlocked), gameStats, glossary: glossaryList.innerHTML }; localStorage.setItem("mathIdleSave", JSON.stringify(saveData)); }
function loadGame() { const data = JSON.parse(localStorage.getItem("mathIdleSave")); if (!data) return; kp = data.kp || 0; kpPerClick = data.kpPerClick || 1; kpPerSecond = data.kpPerSecond || 0; prestiges = data.prestiges || 0; isMuted = data.isMuted || false; gameStats = data.gameStats || { totalClicks: 0, totalKp: 0, upgradesPurchased: 0 }; if (data.upgrades) { upgrades.forEach((u, i) => { const savedUpgrade = data.upgrades[i]; if (savedUpgrade) { u.count = savedUpgrade.count || 0; u.unlocked = savedUpgrade.unlocked || false; u._factShown = savedUpgrade._factShown || false; } }); } if (data.achievements) { achievements.forEach((a, i) => { a.unlocked = data.achievements[i] || false; }); } if (data.glossary) { glossaryList.innerHTML = data.glossary; } updateMuteButton(); }

// === GAME LOOP ===
function gameLoop() { const passiveKp = kpPerSecond / 10; kp += passiveKp; gameStats.totalKp += passiveKp; updateDisplay(); renderUpgrades(); checkAchievements(); }

// --- INITIALIZE GAME ---
loadGame(); updateDisplay(); renderUpgrades(); setInterval(gameLoop, 100); setInterval(saveGame, 5000);