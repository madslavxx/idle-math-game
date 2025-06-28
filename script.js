let kp = 0;
let kpPerClick = 1;
let kpPerSecond = 0;

const tooltip = document.getElementById("tooltip");
const display = document.getElementById("kp-display");
const clickBtn = document.getElementById("click-btn");
const upgradeContainer = document.getElementById("upgrade-container");

const upgrades = [
  {
    name: "Loops",
    cost: 25,
    effect: () => { kpPerSecond += 1; },
    description: "Teaches repetitive tasks — +1 KP/sec",
    unlocked: false,
    bought: false,
  },
  {
    name: "Recursion",
    cost: 100,
    effect: () => { kpPerClick *= 2; },
    description: "A function that calls itself — doubles KP per click",
    unlocked: false,
    bought: false,
  },
  {
    name: "Fibonacci",
    cost: 200,
    effect: () => { kpPerSecond += 5; },
    description: "Generates a recursive math sequence — +5 KP/sec",
    unlocked: false,
    bought: false,
  },
  {
    name: "Exponentiation",
    cost: 500,
    effect: () => { kpPerClick += 10; },
    description: "Exponentiation increases power rapidly — +10 KP per click",
    unlocked: false,
    bought: false,
  },
  {
    name: "Sorting Algorithms",
    cost: 800,
    effect: () => { kpPerSecond += 10; },
    description: "Improves data organization — +10 KP/sec",
    unlocked: false,
    bought: false,
  },
  {
    name: "Binary Trees",
    cost: 1200,
    effect: () => { kpPerClick += 20; },
    description: "Hierarchical data structure — +20 KP per click",
    unlocked: false,
    bought: false,
  },
  {
    name: "Graph Theory",
    cost: 2000,
    effect: () => { kpPerSecond += 25; },
    description: "Analyzing networks and connections — +25 KP/sec",
    unlocked: false,
    bought: false,
  },
  {
    name: "Big O Notation",
    cost: 3000,
    effect: () => {
      kpPerClick *= 1.5;
      kpPerSecond *= 1.5;
    },
    description: "Measures algorithm efficiency — boosts both KP/sec and KP/click",
    unlocked: false,
    bought: false,
  },
  {
    name: "Turing Machine",
    cost: 5000,
    effect: () => { kpPerSecond += 50; },
    description: "Abstract machine that can simulate any algorithm — +50 KP/sec",
    unlocked: false,
    bought: false,
  }
];

clickBtn.addEventListener("click", () => {
  kp += kpPerClick;
  updateDisplay();
  renderUpgrades();
});

function updateDisplay() {
  display.textContent = `Knowledge Points: ${Math.floor(kp)}`;
}

function positionTooltip(e) {
  const offset = 15;
  tooltip.style.left = `${e.pageX + offset}px`;
  tooltip.style.top = `${e.pageY + offset}px`;
}

function renderUpgrades() {
  upgradeContainer.innerHTML = ""; // Clear old buttons

  upgrades.forEach(upgrade => {
    // Unlock if player has at least 70% of cost or already unlocked
    if (!upgrade.unlocked && kp >= upgrade.cost * 0.7) {
      upgrade.unlocked = true;
    }

    if (upgrade.unlocked && !upgrade.bought) {
      const btn = document.createElement("button");
      btn.className = "upgrade";
      btn.textContent = `${upgrade.name} (${upgrade.cost} KP)`;

      btn.addEventListener("mouseenter", (e) => {
        tooltip.textContent = upgrade.description;
        tooltip.classList.remove("hidden");
        positionTooltip(e);
      });

      btn.addEventListener("mousemove", (e) => {
        positionTooltip(e);
      });

      btn.addEventListener("mouseleave", () => {
        tooltip.classList.add("hidden");
      });

      btn.addEventListener("click", () => {
        if (kp >= upgrade.cost) {
          kp -= upgrade.cost;
          upgrade.effect();
          upgrade.bought = true;
          updateDisplay();
          renderUpgrades(); // Re-render to update visible upgrades
        }
      });

      upgradeContainer.appendChild(btn);
    }
  });
}

function saveGame() {
  const saveData = {
    kp,
    kpPerClick,
    kpPerSecond,
    upgradesState: upgrades.map(u => ({ unlocked: u.unlocked, bought: u.bought }))
  };
  localStorage.setItem("mathIdleSave", JSON.stringify(saveData));
}

function loadGame() {
  const saveData = JSON.parse(localStorage.getItem("mathIdleSave"));
  if (saveData) {
    kp = saveData.kp;
    kpPerClick = saveData.kpPerClick;
    kpPerSecond = saveData.kpPerSecond;

    if (saveData.upgradesState) {
      saveData.upgradesState.forEach((state, i) => {
        upgrades[i].unlocked = state.unlocked;
        upgrades[i].bought = state.bought;
        // If bought, apply effect again to keep state consistent
        if (upgrades[i].bought) {
          upgrades[i].effect();
        }
      });
    }
  }
}

function gameLoop() {
  kp += kpPerSecond / 10;
  updateDisplay();
  saveGame();
}

loadGame();
renderUpgrades();
setInterval(gameLoop, 100);