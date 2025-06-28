let kp = 0;
let kpPerClick = 1;
let kpPerSecond = 0;

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
  btn.title = description;

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
  addUpgrade("Loops", 25, () => kpPerSecond += 1, "Teaches repetitive tasks—+1 KP/sec");
  addUpgrade("Recursion", 100, () => { kpPerClick *= 2; }, "A function that calls itself—doubles KP per click");
  addUpgrade("Fibonacci", 200, () => kpPerSecond += 5, "Generates a recursive math sequence—+5 KP/sec");
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

loadGame();
initUpgrades();
setInterval(gameLoop, 100);
