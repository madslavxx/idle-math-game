// === INITIALIZE BOOTSTRAP COMPONENTS ===
const glossaryModal = new bootstrap.Modal(document.getElementById('glossary-modal'));
const achievementsModal = new bootstrap.Modal(document.getElementById('achievements-modal'));
const resetConfirmModal = new bootstrap.Modal(document.getElementById('reset-confirm-modal'));
const achievementToast = new bootstrap.Toast(document.getElementById('achievement-toast'));
const quizModal = new bootstrap.Modal(document.getElementById('quiz-modal'));

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
const tooltip = document.getElementById("tooltip");
const display = document.getElementById("kp-display");
const prestigeDisplay = document.getElementById("prestige-display");
const clickBtn = document.getElementById("click-btn");
const upgradeContainer = document.getElementById("upgrade-container");
const factCard = document.getElementById("fact-card");
const factText = document.getElementById("fact-text");
const factClose = document.getElementById("fact-close");
const glossaryBtn = document.getElementById("glossary-btn");
const glossaryList = document.getElementById("glossary-list");
const achievementsBtn = document.getElementById("achievements-btn");
const achievementsList = document.getElementById("achievements-list");
const toastText = document.getElementById("toast-text");
const resetBtn = document.getElementById("reset-btn");
const resetConfirmYes = document.getElementById("reset-confirm-yes");

// === QUIZ DATA ===
const quizData = [
    {
        id: "Loops",
        question: "Which of the following best describes a 'for' loop?",
        options: [
            "A way to store a single value.",
            "A method to run a block of code a specific number of times.",
            "A conditional statement that runs code once if true.",
            "A function that calls itself."
        ],
        correctAnswer: "A method to run a block of code a specific number of times.",
        asked: false,
    },
    {
        id: "Recursion",
        question: "What is the primary characteristic of a recursive function?",
        options: [
            "It uses a loop to iterate.",
            "It must return a number.",
            "It calls itself to solve a smaller version of the problem.",
            "It can only be written in Python."
        ],
        correctAnswer: "It calls itself to solve a smaller version of the problem.",
        asked: false,
    },
    {
        id: "Fibonacci",
        question: "The Fibonacci sequence is defined by F(n) = F(n-1) + F(n-2). What are the first three numbers in the sequence (starting from 1)?",
        options: [
            "1, 2, 3",
            "0, 1, 2",
            "1, 1, 2",
            "1, 3, 5"
        ],
        correctAnswer: "1, 1, 2",
        asked: false,
    },
    {
        id: "Exponentiation",
        question: "What does the expression 2^4 (2 to the power of 4) mean?",
        options: [
            "2 * 4",
            "2 + 2 + 2 + 2",
            "2 * 2 * 2 * 2",
            "4 * 4"
        ],
        correctAnswer: "2 * 2 * 2 * 2",
        asked: false,
    },
    {
        id: "Sorting Algorithms",
        question: "What is the main purpose of a sorting algorithm?",
        options: [
            "To make data random.",
            "To arrange data into a specific order (e.g., numerical or alphabetical).",
            "To delete unnecessary data from a collection.",
            "To find the average value in a set of numbers."
        ],
        correctAnswer: "To arrange data into a specific order (e.g., numerical or alphabetical).",
        asked: false,
    },
    {
        id: "Binary Trees",
        question: "In a binary tree data structure, what is the maximum number of children a single node can have?",
        options: ["1", "2", "4", "Unlimited"],
        correctAnswer: "2",
        asked: false,
    },
    {
        id: "Graph Theory",
        question: "In graph theory, what is a 'vertex'?",
        options: [
            "The connection or line between two points.",
            "A node or a point in the graph.",
            "The direction of a connection.",
            "The total length of all connections."
        ],
        correctAnswer: "A node or a point in the graph.",
        asked: false,
    },
    {
        id: "Big O Notation",
        question: "What does Big O Notation describe about an algorithm?",
        options: [
            "How many lines of code it has.",
            "How fast it runs on a specific computer.",
            "How its performance scales as the input size grows.",
            "The exact number of operations it performs."
        ],
        correctAnswer: "How its performance scales as the input size grows.",
        asked: false,
    },
    {
        id: "Turing Machine",
        question: "A Turing Machine is a foundational concept in computer science. What is it a theoretical model of?",
        options: [
            "A physical computer hard drive.",
            "Human consciousness.",
            "A machine capable of universal computation.",
            "A graphics rendering pipeline."
        ],
        correctAnswer: "A machine capable of universal computation.",
        asked: false,
    },
    {
        id: "Data Structures",
        question: "Which of the following is a fundamental example of a data structure?",
        options: [
            "An 'if' statement",
            "A 'for' loop",
            "An array",
            "A function"
        ],
        correctAnswer: "An array",
        asked: false,
    },
    {
        id: "Cryptography",
        question: "What is the primary goal of cryptography?",
        options: [
            "To make text longer and more complex.",
            "To secure communication and information.",
            "To create interesting visual patterns.",
            "To speed up data transfer over a network."
        ],
        correctAnswer: "To secure communication and information.",
        asked: false,
    },
    {
        id: "Machine Learning",
        question: "What is the core concept behind machine learning?",
        options: [
            "Building computers that can physically move.",
            "Writing programs with explicit, hard-coded rules for every situation.",
            "Allowing computers to learn patterns and make predictions from data.",
            "Designing faster and more efficient microchips."
        ],
        correctAnswer: "Allowing computers to learn patterns and make predictions from data.",
        asked: false,
    },
    {
        id: "Prestige",
        question: "In the context of idle/incremental games, what does 'prestiging' typically involve?",
        options: [
            "Unlocking a new story chapter.",
            "Resetting your progress in exchange for a permanent boost.",
            "Deleting your save file permanently.",
            "Changing the game's color scheme."
        ],
        correctAnswer: "Resetting your progress in exchange for a permanent boost.",
        asked: false,
    }
];
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

function showAchievementToast(name) {
    toastText.textContent = `You've unlocked: ${name}`;
    if (!isMuted) { achievementSound.currentTime = 0; achievementSound.play().catch(e => console.error("Audio play failed:", e)); }
    achievementToast.show();
}

function checkAchievements() {
    achievements.forEach(ach => {
        if (!ach.unlocked && ach.check()) {
            ach.unlocked = true;
            showAchievementToast(ach.name);
            // If the modal is open, re-render it to show the unlocked achievement
            const modalElement = document.getElementById('achievements-modal');
            if (modalElement.classList.contains('show')) {
                renderAchievements();
            }
        }
    });
}
function renderAchievements() {
    achievementsList.innerHTML = '';
    achievements.forEach(ach => {
        const achCol = document.createElement('div');
        achCol.className = 'col';

        const achDiv = document.createElement('div');
        achDiv.className = 'achievement-card h-100 p-3 rounded';
        if (ach.unlocked) {
            achDiv.classList.add('unlocked');
        }
        achDiv.innerHTML = `<h5 class="card-title">${ach.name}</h5><p class="card-text">${ach.description}</p>`;
        achCol.appendChild(achDiv);
        achievementsList.appendChild(achCol);
    });
}
achievementsBtn.addEventListener("click", () => {
    renderAchievements();
    achievementsModal.show();
});

// === RESET PROGRESS ===
resetBtn.addEventListener('click', () => {
    resetConfirmModal.show();
});

resetConfirmYes.addEventListener('click', () => {
    localStorage.removeItem("mathIdleSave");
    window.location.reload();
});

function showQuiz(upgradeId) {
    const questionData = quizData.find(q => q.id === upgradeId);
    // Only show the quiz if a question exists and it hasn't been asked yet
    if (!questionData || questionData.asked) {
        return;
    }
    questionData.asked = true; // Mark as asked immediately

    const questionTextEl = document.getElementById('quiz-question-text');
    const optionsContainerEl = document.getElementById('quiz-options-container');
    const feedbackTextEl = document.getElementById('quiz-feedback-text');
    const modalFooter = document.querySelector('#quiz-modal .modal-footer');

    // Reset modal state
    questionTextEl.textContent = questionData.question;
    optionsContainerEl.innerHTML = '';
    feedbackTextEl.style.display = 'none';
    modalFooter.style.display = 'none';
    optionsContainerEl.style.display = 'block';

    // Create a button for each answer option
    questionData.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-light';
        button.textContent = option;
        button.onclick = () => handleAnswer(option);
        optionsContainerEl.appendChild(button);
    });

    // Function to handle the user's answer
    const handleAnswer = (selectedAnswer) => {
        const allAnswerButtons = optionsContainerEl.querySelectorAll('button');
        allAnswerButtons.forEach(button => {
            button.disabled = true;
        });

        feedbackTextEl.style.display = 'block';   // Show feedback area
        modalFooter.style.display = 'block';      // Show the 'Continue' button

        if (selectedAnswer === questionData.correctAnswer) {
            const reward = Math.floor(kp * 0.1) + 100; // Reward: 10% of current KP + 100
            kp += reward;
            gameStats.totalKp += reward;
            feedbackTextEl.innerHTML = `<strong class="text-success">Correct!</strong><br>You earned a bonus of ${reward} KP!`;
            if (!isMuted) { upgradeSound.play(); }
        } else {
            feedbackTextEl.innerHTML = `<strong class="text-danger">Not quite.</strong><br>The correct answer was: "${questionData.correctAnswer}"`;
        }
        updateDisplay();
    };

    quizModal.show();
}
// === PRESTIGE & DISPLAY ===
function getPrestigeMultiplier() { return 1 + prestiges * 0.2; }
function updatePrestigeDisplay() { prestigeDisplay.textContent = `Prestiges: ${prestiges} (x${getPrestigeMultiplier().toFixed(1)} KP/click)`; }
function updateDisplay() { display.textContent = `Knowledge Points: ${Math.floor(kp)}`; updatePrestigeDisplay(); }

// === TOOLTIP POSITIONER ===
function positionTooltip(e) {
    const offset = 12; 
    const { width, height } = tooltip.getBoundingClientRect(); 
    let x = e.clientX + offset; 
    let y = e.clientY + offset; 
    if (x + width > window.innerWidth) x = e.clientX - width - offset; 
    if (y + height > window.innerHeight) y = e.clientY - height - offset; 
    tooltip.style.left = `${x}px`; 
    tooltip.style.top = `${y}px`; 
}

// === FACTS & GLOSSARY ===
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
glossaryBtn.addEventListener("click", () => glossaryModal.show());


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
    {
    name: "Prestige",
    baseCost: 100000,
    count: 0,
    effect: () => {
        resetOverlay.classList.add("active");

        // --- Add screen shake ---
        document.body.classList.add("screen-shake");

        setTimeout(() => {
            if (!isMuted) { prestigeSound.currentTime = 0; prestigeSound.play(); }
            prestiges += 1;
            kp = 0;
            kpPerClick = 1;
            kpPerSecond = 0;
            upgrades.forEach(u => { if (u.name !== 'Prestige') { u.unlocked = false; u.count = 0; } });
            upgradeContainer.innerHTML = '';
            updateDisplay();
            renderUpgrades();
            saveGame();
            resetOverlay.classList.remove("active");
            
            // --- Remove screen shake after it finishes ---
            document.body.classList.remove("screen-shake");
        }, 800);
    },
    description: "Reset progress for a permanent KP boost",
    unlocked: false
    }
];

// === CORE GAME ACTIONS ===
clickBtn.addEventListener("click", (e) => { // 'e' is the click event
    if (!isMuted) { clickSound.currentTime = 0; clickSound.play().catch(err => console.error("Audio play failed:", err)); }
    const pointsGained = kpPerClick * getPrestigeMultiplier();
    kp += pointsGained;
    gameStats.totalKp += pointsGained;
    gameStats.totalClicks++;
    updateDisplay();

    // --- Create the floating number ---
    const number = document.createElement("div");
    number.className = "floating-number";
    number.textContent = `+${Math.floor(pointsGained)}`;
    // Position it at the cursor
    number.style.left = `${e.clientX}px`;
    number.style.top = `${e.clientY}px`;
    document.body.appendChild(number);

    // Clean up the element after the animation finishes
    setTimeout(() => {
        number.remove();
    }, 1500); // Must match the animation duration
});

function applyUpgrade(u, cost) {
    kp -= cost; 
    u.effect(); 
    u.count += 1; 
    gameStats.upgradesPurchased++; 
    updateDisplay(); 
    if (![...glossaryList.children].some(li => li.dataset.name === u.name)) { 
        const li = document.createElement("li");
        li.className = "list-group-item"; 
        li.dataset.name = u.name; li.innerHTML = `<strong>${u.name}</strong><p class="mb-0">${facts[u.name] || u.description}</p>`; 
        glossaryList.appendChild(li); 
    } 
    showQuiz(u.name); 
}

// === RENDER UPGRADES ===
function renderUpgrades() {
    // Loop through each upgrade object in the 'upgrades' array.
    // 'u' is the upgrade object, and 'idx' is its index.
    upgrades.forEach((u, idx) => {

        // --- Unlock Logic ---
        // The first upgrade is always unlocked.
        if (idx === 0) {
            u.unlocked = true;
        } 
        // Unlock other upgrades if the player has at least 70% of the base cost.
        else if (!u.unlocked && kp >= u.baseCost * 0.7) {
            u.unlocked = true;
        }

        // Try to find an existing button for this upgrade in the DOM.
        let btn = document.getElementById(`upgrade-${idx}`);

        // --- Button Creation ---
        // If the upgrade is unlocked but its button doesn't exist yet, create it.
        if (u.unlocked && !btn) {
            // Create a new button element.
            btn = document.createElement("button");
            btn.id = `upgrade-${idx}`;
            btn.className = "list-group-item list-group-item-action";
            btn.type = "button";

            // --- Event Listeners for Tooltip ---
            btn.addEventListener("mouseenter", (e) => {
                tooltip.textContent = u.description;
                tooltip.classList.remove("hidden");
                positionTooltip(e); // Position the tooltip near the cursor.
            });

            btn.addEventListener("mousemove", positionTooltip);

            btn.addEventListener("mouseleave", () => {
                tooltip.classList.remove("visible");
                tooltip.classList.add("hidden");
            });

            // --- Event Listener for Purchasing ---
            btn.addEventListener("click", () => {
                // Calculate the current cost of the upgrade, which increases with each purchase.
                const currentCost = Math.floor(u.baseCost * Math.pow(1.15, u.count));

                // Check if the player has enough Knowledge Points (kp) to afford it.
                if (kp >= currentCost) {
                    // Play a sound effect if audio is not muted.
                    if (!isMuted) {
                        upgradeSound.currentTime = 0; // Rewind the sound to the start.
                        upgradeSound.play().catch(e => console.error("Audio play failed:", e));
                    }
                    // Apply the upgrade's effects.
                    applyUpgrade(u, currentCost);
                }
            });

            // Add the newly created button to the upgrade container in the DOM.
            upgradeContainer.appendChild(btn);

            // --- Show Associated Fact ---
            // If a fact for this upgrade exists and hasn't been shown, display it.
            if (u.unlocked && !u._factShown && facts[u.name]) {
                factText.textContent = facts[u.name];
                factCard.classList.remove("hidden");
                u._factShown = true; // Mark the fact as shown.
            }
        }

        // --- Button State Update ---
        // If the button exists (either newly created or pre-existing), update its state.
        if (btn) {
            // Recalculate the cost for display purposes.
            const cost = Math.floor(u.baseCost * Math.pow(1.15, u.count));
            
            // Disable the button if the player can't afford the upgrade.
            btn.disabled = kp < cost;
            
            // Update the button's text to show the upgrade name and its current cost.
            btn.innerHTML = `${u.name} <span class="badge bg-primary float-end">${cost} KP</span>`;
        }
    });
}

// === SAVE & LOAD ===
function saveGame() {
    // Note: We don't save glossaryList.innerHTML anymore since it has Bootstrap classes. We rebuild it on load.
    const saveData = { kp, kpPerClick, kpPerSecond, prestiges, isMuted, upgrades: upgrades.map(u => ({ count: u.count, unlocked: u.unlocked, _factShown: u._factShown })), achievements: achievements.map(a => a.unlocked), gameStats };
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
    gameStats = data.gameStats || { totalClicks: 0, totalKp: 0, upgradesPurchased: 0 };
    if (data.upgrades) {
        upgrades.forEach((u, i) => {
            const savedUpgrade = data.upgrades[i];
            if (savedUpgrade) {
                u.count = savedUpgrade.count || 0;
                u.unlocked = savedUpgrade.unlocked || false;
                u._factShown = savedUpgrade._factShown || false;
            }
        });
    }
    if (data.achievements) {
        achievements.forEach((a, i) => {
            a.unlocked = data.achievements[i] || false;
        });
    }
    // Rebuild glossary
    glossaryList.innerHTML = ''; // Clear default
    upgrades.forEach(u => {
        if(u.count > 0 || (u.name === "Algorithm" || u.name === "Binary")) { // Add purchased items to glossary
            if (![...glossaryList.children].some(li => li.dataset.name === u.name)) {
                 const li = document.createElement("li");
                 li.className = "list-group-item";
                 li.dataset.name = u.name;
                 li.innerHTML = `<strong>${u.name}</strong><p class="mb-0">${facts[u.name] || u.description}</p>`;
                 glossaryList.appendChild(li);
            }
        }
    });

    updateMuteButton();
}


// === GAME LOOP ===
function gameLoop() {
    const passiveKp = kpPerSecond / 10;
    kp += passiveKp;
    gameStats.totalKp += passiveKp;
    updateDisplay(); 
    renderUpgrades(); 
    checkAchievements(); 
}

// --- INITIALIZE GAME ---
loadGame();
updateDisplay();
renderUpgrades();
setInterval(gameLoop, 100);
setInterval(saveGame, 5000);