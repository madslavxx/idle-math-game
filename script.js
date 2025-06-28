let kp = 0;
let kpPerClick = 1;
let kpPerSecond = 0;

const tooltip = document.getElementById("tooltip");
const display = document.getElementById("kp-display");
const clickBtn = document.getElementById("click-btn");
const upgradeContainer = document.getElementById("upgrade-container");

clickBtn.addEventListener("click", () => {
  kp += kpPerClick;
  updateDisplay();
});

function updateDisplay() {
  display.textContent = `Knowledge Points: ${Math.floor(kp)}`;
}

function addUpgrade(name, cost, effect, description) {
  const btn = document.createElement("button");
  btn.className = "upgrade";
  btn.textContent = `${name} (${cost} KP)`;

  // Show tooltip on hover
  btn.addEventListener("mouseenter", (e) => {
    tooltip.textContent = description;
    tooltip.classList.remove("hidden");
    positionTooltip(e);
  });

  btn.addEventListener("mousemove", (e) => {
    positionTooltip(e);
  });

  btn.addEventListener("mouseleave", () => {
    tooltip.classList.add("hidden");
  });

  // On click
  btn.addEventListener("click", () => {
    if (kp >= cost) {
      kp -= cost;
      effect();
      btn.disabled = true;
      updateDisplay();
    }
  });

  upgradeContainer.appendChild(btn);
}


function initUpgrades() {
  addUpgrade("Loops", 25,
    () => kpPerSecond += 1,
    "Teaches repetitive tasks — +1 KP/sec");

  addUpgrade("Recursion", 100,
    () => { kpPerClick *= 2; },
    "A function that calls itself — doubles KP per click");

  addUpgrade("Fibonacci", 200,
    () => kpPerSecond += 5,
    "Generates a recursive math sequence — +5 KP/sec");

  addUpgrade("Exponentiation", 500,
    () => kpPerClick += 10,
    "Exponentiation increases power rapidly — +10 KP per click");

  addUpgrade("Sorting Algorithms", 800,
    () => kpPerSecond += 10,
    "Improves data organization — +10 KP/sec");

  addUpgrade("Binary Trees", 1200,
    () => kpPerClick += 20,
    "Hierarchical data structure — +20 KP per click");

  addUpgrade("Graph Theory", 2000,
    () => kpPerSecond += 25,
    "Analyzing networks and connections — +25 KP/sec");

  addUpgrade("Big O Notation", 3000,
    () => {
      kpPerClick *= 1.5;
      kpPerSecond *= 1.5;
    },
    "Measures algorithm efficiency — boosts both KP/sec and KP/click");

  addUpgrade("Turing Machine", 5000,
    () => kpPerSecond += 50,
    "Abstract machine that can simulate any algorithm — +50 KP/sec");
}

function saveGame() {
  const saveData = {
    kp,
    kpPerClick,
    kpPerSecond
  };
  localStorage.setItem("mathIdleSave", JSON.stringify(saveData));
}

function loadGame() {
  const saveData = JSON.parse(localStorage.getItem("mathIdleSave"));
  if (saveData) {
    kp = saveData.kp;
    kpPerClick = saveData.kpPerClick;
    kpPerSecond = saveData.kpPerSecond;
  }
}

function gameLoop() {
  kp += kpPerSecond / 10;
  updateDisplay();
  saveGame();
}

function positionTooltip(e) {
  const offset = 15;
  tooltip.style.left = `${e.pageX + offset}px`;
  tooltip.style.top = `${e.pageY + offset}px`;
}

loadGame();
initUpgrades();
setInterval(gameLoop, 100);
