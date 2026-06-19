// VARS
const KEY = 'AAFKMLAFSFFAFSAAJJSFÖFJASFLKFLFJLÖAFSLJSFJLSAFLÖSALJKSAFJSFJL'
let gameSave = null
let currSlot = null
const images = [
    "./img/castle_loading_screeen.png",
    "./img/dark_knight.png",
    "./img/startMenu.png",
    "./img/loading_city.png",
    "./img/loading_city2.png"
];

const tips = [
    "Nutze Items strategisch!",
    "Speichere regelmäßig dein Spiel.",
    "Manche Gegner haben Schwächen.",
    "Erkunde jede Ecke!",
    "Only you can prevent V-Bucks scams"
];

let selectedCharIndex = 0;

const worldMap = [
    ["N/A", "N/A", "./img/game/waldhuete_inside.png", "./img/game/traninghall.png"],
    ["./img/game/d_castle.png", "./img/game/s_way.png", "./img/game/waldhuette.png", "./img/game/g_castle.png"], // Y=0
    ["./img/game/way_to_schloss.png", "N/A", "N/A", "N/A"],
    ["./img/game/castle_abzw.png", "./img/game/dorf.png", "./img/game/dorf_2.png", "N/A"],
]

// Tuer-/Trigger-Teleports:
// mapX/mapY = auf welcher Karte die Tuer liegt.
// x/y/w/h = Bereich, den der Spieler betreten muss.
// targetX/targetY = Zielkarte.
// spawnX/spawnY = Position nach dem Teleport auf der Zielkarte.
const teleportZones = [
    {
        name: "castle_abzw_to_dark_castle_gate",
        mapX: 1,
        mapY: 3,

        x: 850,
        y: 120,
        w: 100,
        h: 80,

        targetX: 0,
        targetY: 1,

        spawnX: 900,
        spawnY: 850
    },
    {
        name: "waldhuette_front_door_inside",
        mapX: 2,
        mapY: 1,

        xPct: 0.38,
        yPct: 0.48,
        wPct: 0.09,
        hPct: 0.10,

        targetX: 2,
        targetY: 0,

        spawnXPct: 0.48,
        spawnYPct: 0.70
    },
    {
        name: "waldhuette_inside_exit_front_door",
        mapX: 2,
        mapY: 0,

        xPct: 0.08,
        yPct: 0.77,
        wPct: 0.16,
        hPct: 0.18,

        targetX: 2,
        targetY: 1,

        spawnXPct: 0.39,
        spawnYPct: 0.58
    },
    /* 50/50 mit KI: Trainingshallen-Tuer am guten Schloss, damit der Eingang nicht ueber den Kartenrand laufen muss. */
    {
        name: "g_castle_gate_to_traininghall",
        mapX: 3,
        mapY: 1,

        xPct: 0.40,
        yPct: 0.54,
        wPct: 0.18,
        hPct: 0.18,

        targetX: 3,
        targetY: 0,

        spawnXPct: 0.48,
        spawnYPct: 0.75
    },
    {
        name: "traininghall_exit_to_g_castle_gate",
        mapX: 3,
        mapY: 0,

        xPct: 0.40,
        yPct: 0.78,
        wPct: 0.20,
        hPct: 0.16,

        targetX: 3,
        targetY: 1,

        spawnXPct: 0.48,
        spawnYPct: 0.75
    }
];

const edgeTransitions = [
    {
        name: "castle_abzw_left_to_way_to_schloss_top",
        fromX: 0,
        fromY: 3,
        direction: "left",
        targetX: 0,
        targetY: 2,
        spawnXPct: 0.72,
        spawnYPct: 0.08
    },
    {
        name: "g_castle_left_to_way_to_schloss_top",
        fromX: 3,
        fromY: 1,
        direction: "left",
        targetX: 0,
        targetY: 2,
        spawnXPct: 0.72,
        spawnYPct: 0.08
    }
];

const collisionExtensions = ["jpg", "png"];
const questNpc = {
    id: "npcAldric",
    name: "Aldric",
    mapX: 2,
    mapY: 0,
    x: 610,
    y: 560,
    range: 130
};
const questPickup = {
    id: "questPickup",
    mapX: 2,
    mapY: 1,
    xPct: 0.74,
    yPct: 0.62,
    range: 150
};
const questPickup2 = {
    id: "questPickup2",
    mapX: 2,
    mapY: 3,
    xPct: 0.62,
    yPct: 0.58,
    range: 150
};
const merchantNpc = {
    id: "npcMerchant",
    name: "Haendler",
    mapX: 1,
    mapY: 3,
    x: 1050,
    y: 610,
    range: 130
};
const trainerNpc = {
    id: "npcTrainer",
    name: "Waffenmeister Rurik",
    mapX: 3,
    mapY: 0,
    xPct: 0.34,
    yPct: 0.55,
    range: 135
};
const trainingDummy = {
    id: "trainingDummy",
    name: "Trainingspuppe",
    mapX: 3,
    mapY: 0,
    xPct: 0.62,
    yPct: 0.56,
    range: 145
};

const merchantStock = [
    { itemId: "healPotionSmall", price: 25 },
    { itemId: "healPotionBig", price: 70 },
    { itemId: "manaPotion", price: 35 },
    { itemId: "bomb", price: 85 }
];

/* 50/50 mit KI: Gegnerdaten bleiben getrennt von der Kampflogik, damit neue Trainingsgegner spaeter leicht eintragbar sind. */
const trainingEnemies = {
    dummy: {
        name: "Trainingspuppe",
        requiredLevel: 1,
        infinite: true,
        xpPerHit: 2,
        bonusEvery: 5,
        bonusXp: 8,
        description: "Endloses Klick-Training. Kein Tod, kein Gegenschlag, kleine XP-Ticks."
    },
    guard: {
        name: "Schlosswaechter",
        requiredLevel: 5,
        maxHp: 78,
        attack: 6,
        xp: 80,
        money: 18,
        description: "Ein ernstes Sparring mit echten Gegenschlaegen."
    },
    knight: {
        name: "Schlossritter",
        requiredLevel: 10,
        maxHp: 135,
        attack: 11,
        xp: 155,
        money: 34,
        description: "Schneller, haerter und deutlich weniger geduldig."
    },
    champion: {
        name: "Tor-Champion",
        requiredLevel: 25,
        maxHp: 320,
        attack: 24,
        xp: 430,
        money: 95,
        description: "Nur fuer spaete Runs. Der trifft wie ein fallendes Tor."
    }
};

/* 50/50 mit KI: Erste Quest-Struktur mit States, Zieltexten und Belohnung. */
const firstQuest = {
    id: "waldhuette_schattenkraut",
    title: "Fluestern der Waldhuette",
    rewards: {
        money: 35,
        item: "healPotionSmall",
        amount: 1
    },
    objectives: {
        none: "Betritt die Waldhuette und sprich mit Aldric.",
        started: "Finde das Schattenkraut neben der Waldhuette.",
        herbFound: "Bring das Schattenkraut zu Aldric zurueck.",
        completed: "Abgeschlossen: Aldric hat dich belohnt."
    }
};

const secondQuest = {
    id: "dorf2_relikt",
    title: "Relikt aus Dorf2",
    rewards: {
        money: 55,
        item: "bomb",
        amount: 1,
        xp: 125
    },
    objectives: {
        locked: "Hilf zuerst Aldric in der Waldhuette.",
        none: "Sprich mit dem Haendler im Dorf.",
        started: "Suche das alte Relikt in Dorf2.",
        relicFound: "Bring das Relikt zum Haendler zurueck.",
        completed: "Abgeschlossen: Der Haendler hat dich belohnt."
    }
};

let gameActive = false

let currentX = 1   // Start bei castle_abzw
let currentY = 3

let collisionCanvas = document.createElement("canvas");
let collisionCtx = collisionCanvas.getContext("2d", { willReadFrequently: true });
let collisionReady = false;
let teleportLock = false;
let activeDialogue = null;
let dialogueIndex = 0;
let toastTimer = null;
let pendingSpawn = null;
let combatState = null;

const DEBUG_BORDERS = true
const PLAYER_SIZE = 196
const SPAWN_SEARCH_STEP = 42
const SPAWN_SEARCH_RADIUS = 8
const EDGE_TELEPORT_MARGIN = 140
const EDGE_TELEPORT_RATIO = 0.18
const START_INVENTORY = {}
const STARTER_ITEMS = {
    starterSword: {
        attack: 12,
        message: "Du legst das rostige Schwert an. +12 Angriff."
    },
    starterWand: {
        attack: 6,
        mana: 5,
        message: "Der Zauberstab knistert in deiner Hand. +6 Angriff, +5 Mana."
    },
    mysteryPotion: {
        message: "Der Trank wartet in deinem Inventar. Benutze ihn, wenn du bereit bist."
    }
}
const LEVEL_BASE_XP = 100
const LEVEL_XP_GROWTH = 50

//funcs
//LS Funcs

function getSlotKey(slot) {
    return `${KEY}_slot_${slot}`
}

function getNextSlot() {
    for (let i = 1; i < 9999; i++) {
        if (!localStorage.getItem(getSlotKey(i))) return i;
    }
    return null;
}

function getAllSlots() {
    const slots = []
    let i = 1
    while (localStorage.getItem(getSlotKey(i)) !== null) {
        slots.push({ slot: i, data: JSON.parse(localStorage.getItem(getSlotKey(i))) })
        i++
    }
    return slots
}

function loadScore() {
    let save = localStorage.getItem(KEY)

    if (save) {
        return JSON.parse(save)
    }
    let newSave = {
        level: 1,
        xp: 0,
        money: 100,
        leben: 3,
        attack: 1,
        inventory: { ...START_INVENTORY },
        selectedChar: null,
        playerName: ""
    }

    localStorage.setItem(KEY, JSON.stringify(newSave))
    return newSave
}


function checkGame() {
    return getAllSlots().length > 0
}

function saveGame() {
    if (!gameSave || currSlot === null) {
        console.log("Fehler kein Speicher!")
        return
    }
    localStorage.setItem(getSlotKey(currSlot), JSON.stringify(gameSave))
}

function getLoadingDuration(speed = 1) {
    return (100 / speed) * 100 + 600;
}

function getXpForNextLevel(level) {
    return LEVEL_BASE_XP + Math.max(0, level - 1) * LEVEL_XP_GROWTH;
}

function addXp(amount, silent = false) {
    if (!gameSave || amount <= 0) return;
    ensureSaveShape();

    gameSave.xp += amount;
    const gainedLevels = [];

    while (gameSave.xp >= getXpForNextLevel(gameSave.level)) {
        gameSave.xp -= getXpForNextLevel(gameSave.level);
        gameSave.level += 1;
        gameSave.maxLeben += 2;
        gameSave.leben = gameSave.maxLeben;
        gameSave.attack += 2;
        gameSave.money += 15;
        gainedLevels.push(gameSave.level);
    }

    saveGame();
    updateHUD();
    if (gainedLevels.length > 0) {
        showLevelUpScreen(gainedLevels[gainedLevels.length - 1], gainedLevels.length);
    } else if (!silent) {
        showToast(`+${amount} XP`);
    }
}

function clampPlayerToScreen() {
    playerX = Math.max(12, Math.min(playerX, window.innerWidth - PLAYER_SIZE - 12));
    playerY = Math.max(12, Math.min(playerY, window.innerHeight - PLAYER_SIZE - 12));
}

function getEdgeTeleportMargin(size) {
    return Math.max(EDGE_TELEPORT_MARGIN, size * EDGE_TELEPORT_RATIO);
}

function resolvePoint(data, xKey = "x", yKey = "y") {
    const xPct = data[`${xKey}Pct`];
    const yPct = data[`${yKey}Pct`];

    return {
        x: Number.isFinite(xPct) ? window.innerWidth * xPct : data[xKey],
        y: Number.isFinite(yPct) ? window.innerHeight * yPct : data[yKey]
    };
}

function resolveRect(zone) {
    const point = resolvePoint(zone);

    return {
        x: point.x,
        y: point.y,
        w: Number.isFinite(zone.wPct) ? window.innerWidth * zone.wPct : zone.w,
        h: Number.isFinite(zone.hPct) ? window.innerHeight * zone.hPct : zone.h
    };
}

function resolveSpawn(data) {
    return resolvePoint(data, "spawnX", "spawnY");
}

function getCustomEdgeTransition(direction) {
    return edgeTransitions.find(transition =>
        transition.fromX === currentX &&
        transition.fromY === currentY &&
        transition.direction === direction
    );
}

/* 50/50 mit KI: Die Kanten-Spawns sind absichtlich zentral berechnet, damit jede Map gleich reagiert. */
function getEdgeSpawn(direction) {
    const margin = 72;
    const midX = (window.innerWidth - PLAYER_SIZE) / 2;
    const midY = (window.innerHeight - PLAYER_SIZE) / 2;
    const sideY = window.innerHeight * 0.72;

    const spawns = {
        left: { x: window.innerWidth - PLAYER_SIZE - margin, y: sideY },
        right: { x: margin, y: sideY },
        top: { x: midX, y: window.innerHeight - PLAYER_SIZE - margin },
        bottom: { x: midX, y: margin }
    };

    return spawns[direction] ?? { x: midX, y: midY };
}

function isInRect(x, y, rect) {
    return x >= rect.x &&
        x <= rect.x + rect.w &&
        y >= rect.y &&
        y <= rect.y + rect.h;
}

function isWalkableOverride(x, y) {
    const overrides = [
        {
            mapX: 2,
            mapY: 1,
            x: window.innerWidth * 0.58,
            y: window.innerHeight * 0.48,
            w: window.innerWidth * 0.22,
            h: window.innerHeight * 0.28
        },
        {
            mapX: 2,
            mapY: 1,
            x: window.innerWidth * 0.33,
            y: window.innerHeight * 0.46,
            w: window.innerWidth * 0.18,
            h: window.innerHeight * 0.20
        },
        {
            mapX: 2,
            mapY: 0,
            x: window.innerWidth * 0.10,
            y: window.innerHeight * 0.66,
            w: window.innerWidth * 0.26,
            h: window.innerHeight * 0.25
        },
        {
            mapX: 0,
            mapY: 2,
            x: window.innerWidth * 0.62,
            y: window.innerHeight * 0.04,
            w: window.innerWidth * 0.28,
            h: window.innerHeight * 0.20
        },
        {
            mapX: 3,
            mapY: 1,
            x: window.innerWidth * 0.38,
            y: window.innerHeight * 0.48,
            w: window.innerWidth * 0.24,
            h: window.innerHeight * 0.26
        },
        {
            mapX: 3,
            mapY: 0,
            x: window.innerWidth * 0.26,
            y: window.innerHeight * 0.48,
            w: window.innerWidth * 0.50,
            h: window.innerHeight * 0.42
        }
    ];

    return overrides.some(rect =>
        rect.mapX === currentX &&
        rect.mapY === currentY &&
        isInRect(x, y, rect)
    );
}

function canStandAt(x, y) {
    if (!collisionReady) return true;

    return !(
        isBlocked(x + 8, y + 8) ||
        isBlocked(x + 56, y + 8) ||
        isBlocked(x + 8, y + 56) ||
        isBlocked(x + 56, y + 56)
    );
}

/* 50/50 mit KI: Spawn-Suche verhindert, dass Spieler auf weißen Collision-Flaechen landen. */
function findNearestWalkableSpawn(x, y) {
    const startX = Math.max(12, Math.min(x, window.innerWidth - PLAYER_SIZE - 12));
    const startY = Math.max(12, Math.min(y, window.innerHeight - PLAYER_SIZE - 12));

    if (canStandAt(startX, startY)) return { x: startX, y: startY };

    for (let radius = 1; radius <= SPAWN_SEARCH_RADIUS; radius++) {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

                const candidateX = Math.max(
                    12,
                    Math.min(startX + dx * SPAWN_SEARCH_STEP, window.innerWidth - PLAYER_SIZE - 12)
                );
                const candidateY = Math.max(
                    12,
                    Math.min(startY + dy * SPAWN_SEARCH_STEP, window.innerHeight - PLAYER_SIZE - 12)
                );

                if (canStandAt(candidateX, candidateY)) {
                    return { x: candidateX, y: candidateY };
                }
            }
        }
    }

    return { x: startX, y: startY };
}

function setPlayerSpawn(x, y) {
    playerX = Math.max(12, Math.min(x, window.innerWidth - PLAYER_SIZE - 12));
    playerY = Math.max(12, Math.min(y, window.innerHeight - PLAYER_SIZE - 12));
    moveChar();

    pendingSpawn = { x: playerX, y: playerY };
    if (!collisionReady) return;

    const spawn = findNearestWalkableSpawn(x, y);
    playerX = spawn.x;
    playerY = spawn.y;
    pendingSpawn = null;
    moveChar();
    saveGame();
}

/* 50/50 mit KI: Der Load-Flow migriert alte Saves und setzt UI, Zone und Position in einer Reihenfolge. */
function prepareLoadedGame() {
    ensureSaveShape();
    const zx = Number(gameSave.zoneX);
    const zy = Number(gameSave.zoneY);

    document.getElementById("game").style.display = "block";

    if (
        Number.isInteger(zx) &&
        Number.isInteger(zy) &&
        worldMap?.[zy]?.[zx] &&
        worldMap[zy][zx] !== "N/A"
    ) {
        setZone(zx, zy);
    } else {
        setZone(1, 3);
    }

    const savedPlayerX = Number(gameSave.playerX);
    const savedPlayerY = Number(gameSave.playerY);
    setPlayerSpawn(
        Number.isFinite(savedPlayerX) ? savedPlayerX : window.innerWidth / 2,
        Number.isFinite(savedPlayerY) ? savedPlayerY : window.innerHeight / 2
    );
    renderInventory();
    updateHUD();
    renderWorldObjects();
    saveGame();
    if (gameSave.starterChosen) {
        hideStarterChoice();
        gameActive = true;
    } else {
        showStarterChoice();
    }
}

function ensureSaveShape() {
    if (!gameSave) return;
    gameSave.inventory ??= {};
    gameSave.level = Number(gameSave.level ?? 1);
    gameSave.xp = Number(gameSave.xp ?? 0);
    gameSave.money = Number(gameSave.money ?? 0);
    gameSave.leben = Number(gameSave.leben ?? 1);
    gameSave.maxLeben = Number(gameSave.maxLeben ?? gameSave.leben);
    gameSave.attack = Number(gameSave.attack ?? 1);
    gameSave.mana = Number(gameSave.mana ?? 0);
    gameSave.starterChosen = Boolean(gameSave.starterChosen);
    gameSave.training ??= {};
    gameSave.training.dummyWins = Number(gameSave.training.dummyWins ?? 0);
    gameSave.training.guardWins = Number(gameSave.training.guardWins ?? 0);
    gameSave.training.knightWins = Number(gameSave.training.knightWins ?? 0);
    gameSave.training.championWins = Number(gameSave.training.championWins ?? 0);
    gameSave.training.dummyHits = Number(gameSave.training.dummyHits ?? 0);
    gameSave.zoneX = Number.isInteger(Number(gameSave.zoneX)) ? Number(gameSave.zoneX) : currentX;
    gameSave.zoneY = Number.isInteger(Number(gameSave.zoneY)) ? Number(gameSave.zoneY) : currentY;
    gameSave.quests ??= {};
    gameSave.quests[firstQuest.id] ??= { state: "none" };
    gameSave.quests[secondQuest.id] ??= { state: "none" };
}

function findItem(itemId) {
    for (const category in itemList) {
        if (itemList[category][itemId]) return itemList[category][itemId];
    }
    return null;
}

function getQuestState() {
    ensureSaveShape();
    return gameSave.quests[firstQuest.id].state;
}

function getSecondQuestState() {
    ensureSaveShape();
    return gameSave.quests[secondQuest.id].state;
}

function setQuestState(state) {
    ensureSaveShape();
    gameSave.quests[firstQuest.id].state = state;
    saveGame();
    updateHUD();
}

function setSecondQuestState(state) {
    ensureSaveShape();
    gameSave.quests[secondQuest.id].state = state;
    saveGame();
    updateHUD();
}

function getDisplayedQuest() {
    const firstState = getQuestState();
    const secondState = getSecondQuestState();

    if (firstState !== "completed") {
        return {
            title: firstState === "none" ? "Keine aktive Quest" : firstQuest.title,
            objective: firstQuest.objectives[firstState]
        };
    }

    if (secondState !== "completed") {
        return {
            title: secondState === "none" ? "Neue Quest verfuegbar" : secondQuest.title,
            objective: secondQuest.objectives[secondState]
        };
    }

    return {
        title: "Alle Quests erledigt",
        objective: "Erkunde die Welt und sammle mehr Erfahrung."
    };
}

function showToast(text) {
    const toast = document.getElementById("questToast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function showLevelUpScreen(level, gainedLevels = 1) {
    const screen = document.getElementById("levelUpScreen");
    if (!screen) return;

    document.getElementById("levelUpTitle").textContent = `Level ${level}`;
    document.getElementById("levelUpText").textContent =
        gainedLevels > 1
            ? `Du bist ${gainedLevels} Level aufgestiegen. +${gainedLevels * 2} Leben, +${gainedLevels * 2} Angriff, +${gainedLevels * 15} Gold.`
            : "+2 Leben, +2 Angriff, +15 Gold. Deine Leben wurden aufgefuellt.";

    screen.style.display = "flex";
    gameActive = false;
}

function closeLevelUpScreen() {
    const screen = document.getElementById("levelUpScreen");
    if (!screen) return;
    screen.style.display = "none";
    resumeGameIfNoOverlay();
}

function updateHUD() {
    if (!gameSave) return;
    ensureSaveShape();

    document.getElementById("monAnz").textContent = gameSave.money.toLocaleString("de-DE");
    document.getElementById("manAnz").textContent = `${gameSave.leben}/${gameSave.maxLeben}`;

    const xpNeeded = getXpForNextLevel(gameSave.level);
    const xpPercent = Math.min(100, (gameSave.xp / xpNeeded) * 100);
    document.getElementById("levelAnz").textContent = gameSave.level;
    document.getElementById("xpAnz").textContent = `${gameSave.xp} / ${xpNeeded} XP`;
    document.getElementById("xpFill").style.width = `${xpPercent}%`;

    const displayedQuest = getDisplayedQuest();
    document.getElementById("questTitle").textContent = displayedQuest.title;
    document.getElementById("questObjective").textContent = displayedQuest.objective;
}

function toggleInventory() {
    const inventory = document.getElementById("inventoryUI");
    if (!inventory || !gameSave) return;
    inventory.classList.toggle("open");
}

function setInventoryOpen(open) {
    const inventory = document.getElementById("inventoryUI");
    if (!inventory) return;
    inventory.classList.toggle("open", open);
}

function showStarterChoice() {
    const starterChoice = document.getElementById("starterChoice");
    if (!starterChoice) return;
    setInventoryOpen(false);
    starterChoice.style.display = "flex";
    gameActive = false;
}

function hideStarterChoice() {
    const starterChoice = document.getElementById("starterChoice");
    if (!starterChoice) return;
    starterChoice.style.display = "none";
}

function openShop() {
    const panel = document.getElementById("shopPanel");
    const list = document.getElementById("shopItems");
    if (!panel || !list || !gameSave) return;

    list.innerHTML = merchantStock.map(({ itemId, price }) => {
        const item = findItem(itemId);
        if (!item) return "";

        return `
            <div class="shop-item">
                <div>
                    <strong>${item.name}</strong>
                    <p>${item.desc || ""}</p>
                </div>
                <button type="button" onclick="buyItem('${itemId}', ${price})">${price} Gold</button>
            </div>
        `;
    }).join("");

    panel.style.display = "flex";
    gameActive = false;
}

function closeShop() {
    const panel = document.getElementById("shopPanel");
    if (!panel) return;
    panel.style.display = "none";
    resumeGameIfNoOverlay();
}

function buyItem(itemId, price) {
    if (!gameSave || !findItem(itemId)) return;
    ensureSaveShape();

    if (gameSave.money < price) {
        showToast("Nicht genug Gold.");
        return;
    }

    gameSave.money -= price;
    addItem(itemId, 1);
    updateHUD();
    showToast(`${findItem(itemId).name} gekauft.`);
    openShop();
}

function isUiOverlayOpen() {
    return document.getElementById("starterChoice")?.style.display === "flex" ||
        document.getElementById("shopPanel")?.style.display === "flex" ||
        document.getElementById("levelUpScreen")?.style.display === "flex" ||
        document.getElementById("combatPanel")?.style.display === "flex";
}

function resumeGameIfNoOverlay() {
    if (!isUiOverlayOpen() && !activeDialogue && gameSave?.starterChosen) {
        gameActive = true;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getScaledTrainingEnemy(enemyId) {
    const enemy = trainingEnemies[enemyId];
    if (!enemy) return null;

    if (enemy.infinite) return { ...enemy };

    const level = Number(gameSave?.level ?? 1);
    const levelAboveRequirement = Math.max(0, level - enemy.requiredLevel);
    return {
        ...enemy,
        maxHp: enemy.maxHp + levelAboveRequirement * 14,
        attack: enemy.attack + Math.floor(levelAboveRequirement * 0.8),
        xp: enemy.xp + levelAboveRequirement * 6,
        money: enemy.money + Math.floor(levelAboveRequirement * 1.5)
    };
}

function openTrainingMenu() {
    const panel = document.getElementById("combatPanel");
    const title = document.getElementById("combatTitle");
    const content = document.getElementById("combatContent");
    if (!panel || !title || !content || !gameSave) return;

    ensureSaveShape();
    combatState = null;
    title.textContent = "Trainingshalle";
    content.innerHTML = `
        <div class="training-intro">
            <strong>Waffenmeister Rurik</strong>
            <p>Waehle ein Training. Du bekommst XP und etwas Gold, verlierst aber echte Leben bei Treffern.</p>
        </div>
        <div class="training-stats">
            <span>Puppen-Treffer: ${gameSave.training.dummyHits}</span>
            <span>Siege Waechter: ${gameSave.training.guardWins}</span>
            <span>Siege Ritter: ${gameSave.training.knightWins}</span>
            <span>Siege Champion: ${gameSave.training.championWins}</span>
            <span>Bomben: ${gameSave.inventory.bomb || 0}</span>
            <span>HP: ${gameSave.leben}/${gameSave.maxLeben}</span>
        </div>
        <div class="training-options">
            ${Object.entries(trainingEnemies).map(([enemyId, enemy]) => {
                const locked = gameSave.level < enemy.requiredLevel;
                const scaledEnemy = getScaledTrainingEnemy(enemyId);
                const rewardText = enemy.infinite
                    ? `+${enemy.xpPerHit} XP pro Treffer / Bonus alle ${enemy.bonusEvery}`
                    : `Lv. ${enemy.requiredLevel}+ | ${scaledEnemy.maxHp} HP | +${scaledEnemy.xp} XP`;

                return `
                <button type="button" class="${locked ? "locked" : ""}" onclick="startTrainingCombat('${enemyId}')" ${locked ? "disabled" : ""}>
                    <strong>${enemy.name}</strong>
                    <small>${enemy.description}</small>
                    <span>${locked ? `Benoetigt Level ${enemy.requiredLevel}` : rewardText}</span>
                </button>
            `;
            }).join("")}
        </div>
    `;

    panel.style.display = "flex";
    gameActive = false;
}

function closeCombatPanel() {
    const panel = document.getElementById("combatPanel");
    if (!panel) return;

    if (combatState) {
        showToast("Training abgebrochen.");
    }

    combatState = null;
    panel.style.display = "none";
    resumeGameIfNoOverlay();
}

function startTrainingCombat(enemyId) {
    const enemy = getScaledTrainingEnemy(enemyId);
    if (!enemy || !gameSave) return;
    ensureSaveShape();

    if (gameSave.level < enemy.requiredLevel) {
        showToast(`${enemy.name} braucht Level ${enemy.requiredLevel}.`);
        return;
    }

    combatState = {
        enemyId,
        enemyHp: enemy.infinite ? Infinity : enemy.maxHp,
        dummySessionHits: 0,
        log: `${enemy.name} stellt sich dir entgegen.`
    };
    renderCombatPanel();
}

function renderCombatPanel() {
    const panel = document.getElementById("combatPanel");
    const title = document.getElementById("combatTitle");
    const content = document.getElementById("combatContent");
    if (!panel || !title || !content || !combatState || !gameSave) return;

    const enemy = getScaledTrainingEnemy(combatState.enemyId);
    const enemyHpPercent = enemy.infinite ? 100 : Math.max(0, (combatState.enemyHp / enemy.maxHp) * 100);
    const playerHpPercent = Math.max(0, (gameSave.leben / gameSave.maxLeben) * 100);
    const bombCount = gameSave.inventory.bomb || 0;

    title.textContent = enemy.name;
    content.innerHTML = `
        <div class="combat-bars">
            <div>
                <span>${enemy.name}</span>
                <div class="combat-bar"><i style="width:${enemyHpPercent}%"></i></div>
                <small>${enemy.infinite ? `Unendlich HP | Session-Treffer: ${combatState.dummySessionHits}` : `${Math.max(0, combatState.enemyHp)} / ${enemy.maxHp} HP`}</small>
            </div>
            <div>
                <span>Du</span>
                <div class="combat-bar player-hp"><i style="width:${playerHpPercent}%"></i></div>
                <small>${gameSave.leben} / ${gameSave.maxLeben} HP | Mana ${gameSave.mana}</small>
            </div>
        </div>
        <p class="combat-log">${combatState.log}</p>
        <div class="combat-actions">
            <button type="button" onclick="playerCombatAction('attack')">${enemy.infinite ? "Trainieren" : "Angriff"}</button>
            <button type="button" onclick="playerCombatAction('focus')" ${gameSave.mana < 2 ? "disabled" : ""}>Fokus -2 Mana</button>
            <button type="button" onclick="playerCombatAction('bomb')" ${bombCount <= 0 ? "disabled" : ""}>Bombe x${bombCount}</button>
            <button type="button" onclick="closeCombatPanel()">Flucht</button>
        </div>
    `;

    panel.style.display = "flex";
    gameActive = false;
}

/* 50/50 mit KI: Kleiner rundenbasierter Kampf mit Player-Schlag, Gegner-Schlag, Sieg/Defeat und XP-Anbindung. */
function playerCombatAction(action) {
    if (!combatState || !gameSave) return;
    const enemy = getScaledTrainingEnemy(combatState.enemyId);
    const logs = [];

    if (action === "bomb") {
        if (!hasItem("bomb")) {
            combatState.log = "Du hast keine Bombe im Inventar.";
            renderCombatPanel();
            return;
        }
        removeItem("bomb", 1);
    }

    if (action === "focus") {
        if (gameSave.mana < 2) {
            combatState.log = "Nicht genug Mana fuer Fokus.";
            renderCombatPanel();
            return;
        }
        gameSave.mana -= 2;
    }

    if (enemy.infinite) {
        const hitValue = action === "bomb" ? 8 : action === "focus" ? 3 : 1;
        const xpGain = action === "bomb" ? enemy.xpPerHit * 8 + enemy.bonusXp : action === "focus" ? enemy.xpPerHit * 3 : enemy.xpPerHit;
        const hitsBefore = gameSave.training.dummyHits;
        combatState.dummySessionHits += hitValue;
        gameSave.training.dummyHits += hitValue;
        addXp(xpGain, true);

        const bonusesCrossed = Math.floor(gameSave.training.dummyHits / enemy.bonusEvery) - Math.floor(hitsBefore / enemy.bonusEvery);
        if (bonusesCrossed > 0) {
            gameSave.money += bonusesCrossed;
            logs.push(`Bonus: +${bonusesCrossed} Gold.`);
        }

        logs.unshift(action === "bomb"
            ? `Die Bombe zerlegt die Puppe in ${hitValue} Trainings-Treffer.`
            : action === "focus"
                ? `Fokus-Kombo: ${hitValue} saubere Treffer.`
                : "Du landest einen Trainings-Treffer.");
        combatState.log = `${logs.join(" ")} +${xpGain} XP.`;
        saveGame();
        updateHUD();
        renderCombatPanel();
        return;
    }

    const baseDamage = action === "bomb"
        ? 42 + Math.ceil(gameSave.level * 3.5)
        : action === "focus"
            ? Math.ceil(gameSave.attack * 0.24) + getRandomInt(5, 10)
            : Math.ceil(gameSave.attack * 0.16) + getRandomInt(2, 7);
    const playerDamage = Math.max(action === "bomb" ? 45 : action === "focus" ? 8 : 4, baseDamage);
    combatState.enemyHp -= playerDamage;
    logs.push(action === "bomb"
        ? `Die Bombe explodiert fuer ${playerDamage} Schaden.`
        : action === "focus"
            ? `Dein Fokusschlag trifft fuer ${playerDamage} Schaden.`
            : `Du triffst fuer ${playerDamage} Schaden.`);

    if (combatState.enemyHp <= 0) {
        finishTrainingCombat(true, logs);
        return;
    }

    const enemyDamage = Math.max(1, enemy.attack + getRandomInt(-1, 2));
    gameSave.leben = Math.max(0, gameSave.leben - enemyDamage);
    logs.push(`${enemy.name} kontert fuer ${enemyDamage} Schaden.`);

    if (gameSave.leben <= 0) {
        finishTrainingCombat(false, logs);
        return;
    }

    combatState.log = logs.join(" ");
    saveGame();
    updateHUD();
    renderCombatPanel();
}

function finishTrainingCombat(won, logs) {
    const enemy = getScaledTrainingEnemy(combatState.enemyId);
    const enemyId = combatState.enemyId;

    if (won) {
        gameSave.money += enemy.money;
        gameSave.training[`${enemyId}Wins`] = Number(gameSave.training[`${enemyId}Wins`] ?? 0) + 1;
        combatState = null;
        document.getElementById("combatPanel").style.display = "none";
        addXp(enemy.xp);
        saveGame();
        updateHUD();
        showToast(`${enemy.name} besiegt: +${enemy.xp} XP, +${enemy.money} Gold`);
        resumeGameIfNoOverlay();
        return;
    }

    gameSave.leben = 1;
    combatState = null;
    document.getElementById("combatPanel").style.display = "none";
    saveGame();
    updateHUD();
    showToast(`${logs.join(" ")} Du gehst zu Boden. Rurik rettet dich mit 1 HP.`);
    resumeGameIfNoOverlay();
}

function chooseStarterItem(itemId) {
    if (!gameSave || gameSave.starterChosen) return;

    const itemData = findItem(itemId);
    const starterData = STARTER_ITEMS[itemId];
    if (!itemData || !starterData) return;

    addItem(itemId, 1);
    gameSave.attack = Number(gameSave.attack ?? 0) + Number(starterData.attack ?? 0);
    gameSave.mana = Number(gameSave.mana ?? 0) + Number(starterData.mana ?? 0);
    gameSave.starterChosen = true;

    saveGame();
    renderInventory();
    updateHUD();
    hideStarterChoice();
    setInventoryOpen(true);
    showToast(starterData.message);
    gameActive = true;
}



function gotoMainMenu() {
    document.getElementById("overlay").style.display = "block"
    document.getElementById("headerText").style.display = "none"
    document.getElementById("MainMenu").style.display = "flex"
    document.getElementById("loadGame").style.display = "none"
    document.getElementById("leaderboard").style.display = "none"
}

function showLeaderBoard() {
    document.getElementById("overlay").style.display = "none"
    document.getElementById("headerText").style.display = "none"
    document.getElementById("MainMenu").style.display = "none"
    document.getElementById("loadGame").style.display = "none"
    document.getElementById("leaderboard").style.display = "block"
    renderLeaderboard()
}
/* ki hat beim renderLeaderboard() bisschen beigetragen */
function renderLeaderboard() {
    const body = document.getElementById("lb-body")
    const slots = getAllSlots()

    if (slots.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#555; padding: 2rem;">Noch kein Spielstand vorhanden.</td></tr>`
        return
    }
    slots.sort((a, b) => b.data.level - a.data.level)

    body.innerHTML = slots.map(({ data }, i) => {
        const name = data.playerName || "Unbekannt"
        const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || "??"
        const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''
        const rankStyle = i === 0
            ? 'color: #f5c842; text-shadow: 0 0 8px #f5c84288;'
            : i === 1
                ? 'color: #b0b8d0; text-shadow: 0 0 8px #b0b8d044;'
                : i === 2
                    ? 'color: #cd7f3a; text-shadow: 0 0 8px #cd7f3a66;'
                    : ''

        return `
    <tr>
        <td class="rank ${rankClass}">${i + 1}</td>
        <td style="${rankStyle}">
            <div class="player">
                <div class="avatar">${initials}</div>
                ${name}
            </div>
        </td>
        <td><span class="level-pill">Lv. ${data.level ?? 1}</span></td>
        <td class="money">${Number(data.money ?? 0).toLocaleString('de-DE')}</td>
        <td>${Number(data.leben ?? 0)}</td>
    </tr>
`
    }).join('')
}

function loadGame() {
    document.getElementById("MainMenu").style.display = "none"
    document.getElementById("loadGame").style.display = "flex"

    document.querySelectorAll('[id^="loadBox_"]').forEach(el => el.remove())

    const slots = getAllSlots()
    slots.forEach(({ slot, data }) => {
        const div = document.createElement("div")
        div.className = "loadBox"
        div.id = `loadBox_${slot}`
        div.innerHTML = `
            <p class="start-btn" onclick="startGameFromSlot(${slot})"> ▶ START</p>
            <p class="level label">${data.level}</p>
            <p class="money label">${data.money}</p>
            <p style="font-size:1rem; text-align:center; margin-top:0.5rem; color:#aaa;">${data.playerName || 'Unbekannt'}</p>
        `
        div.style.display = "flex"
        document.getElementById("loadGame").appendChild(div)
    })

    document.getElementById("loadBox").style.display = "flex"
}

function startGameFromSlot(slot) {
    currSlot = slot
    const savedGame = localStorage.getItem(getSlotKey(slot));
    if (!savedGame) return;
    gameSave = JSON.parse(savedGame)
    ensureSaveShape();
    gameActive = false;
    activeDialogue = null;
    Object.keys(keys).forEach(key => keys[key] = false);

    const charData = chars.chars.find(c => c.name === gameSave.selectedChar) ?? chars.chars[0];
    gameSave.selectedChar = charData.name;
    document.getElementById("playerChar").src = charData.img

    startLoadingScreen(2) // geschwindigkeit beim reinladen von einem SPielstand
    document.getElementById("overlay").style.display = "none"
    document.body.style.backgroundImage = "url('')"
    setTimeout(() => {
        prepareLoadedGame();
    }, getLoadingDuration(2))
}

// Item funcs

function addItem(itemId, amount) {
    ensureSaveShape();
    if (!findItem(itemId)) return;
    if (!gameSave.inventory[itemId]) {
        gameSave.inventory[itemId] = 0;
    }

    gameSave.inventory[itemId] += amount;
    saveGame();
    renderInventory();
    updateHUD();
}

function removeItem(itemId, amount) {
    ensureSaveShape();
    if (!gameSave.inventory[itemId]) return;

    gameSave.inventory[itemId] -= amount;

    if (gameSave.inventory[itemId] <= 0) {
        delete gameSave.inventory[itemId];
    }

    saveGame();
    renderInventory();
    updateHUD();
}

function hasItem(itemId, amount = 1) {
    return (gameSave?.inventory?.[itemId] || 0) >= amount;
}


function renderInventory() {
    const container = document.getElementById("inventoryUI");
    if (!container || !gameSave) return;
    container.innerHTML = "";

    const entries = Object.entries(gameSave.inventory);

    if (entries.length === 0) {
        container.innerHTML = `<div class="invEmpty">Inventar leer</div>`;
        return;
    }

    for (const [itemId, count] of entries) {
        const itemData = findItem(itemId);
        if (!itemData) continue;

        const div = document.createElement("div");
        div.className = `invItem rarity-${itemData.rarity || "common"}`;
        div.title = itemData.desc || itemData.name;

        div.innerHTML = `
            <strong>${itemData.name}</strong>
            <span>x${count}</span>
            <small>${itemData.type || "item"}</small>
        `;

        div.onclick = () => {
            const result = useItem(gameSave, itemId);
            showToast(result?.message || `${itemData.name} benutzt.`);
            if (result?.used) {
                removeItem(itemId, 1);
            }
            saveGame();
            renderInventory();
            updateHUD();
        };

        container.appendChild(div);
    }
}

function startGame(game) {
    if (game != 'new') {
        startLoadingScreen(0.5)
        document.getElementById("game").style.display = "block"
        document.body.style.backgroundImage = "url('')"
        return
    }
    document.getElementById("createChar").style.display = "block"
    document.body.style.backgroundImage = "none"
    document.getElementById("loadGame").style.display = "none"
    document.getElementById("overlay").style.display = "none"
    document.getElementById("charBox").innerHTML = "";

    for (let i = 0; i < chars.chars.length; i++) {
        if (i == 0) {
            document.getElementById("charBox").innerHTML += `
        <div class="char selected" onclick="showChar(this, ${i})">
            <div class="charName">${chars.chars[i].name}</div>
            <div class="charStats">
            <p>❤️</p>
            <div class="statBar">
                <div class="statFill" style="width: ${chars.chars[i].heal}%"></div>
            </div>
      
            <p>⚔️</p>
            <div class="statBar">
            <div class="statFill" style="width: ${chars.chars[i].attack}%"></div>
            </div>
    </div>
        `

            document.getElementById("charPreview").innerHTML = `<img src="${chars.chars[0].img}">`
        } else {
            document.getElementById("charBox").innerHTML += `
        <div class="char" onclick="showChar(this, ${i})">
            <div class="charName">${chars.chars[i].name}</div>
            <div class="charStats">
            <p>❤️</p>
            <div class="statBar">
                <div class="statFill" style="width: ${chars.chars[i].heal}%"></div>
            </div>
      
            <p>⚔️</p>
            <div class="statBar">
            <div class="statFill" style="width: ${chars.chars[i].attack}%"></div>
            </div>
    </div>
        `
        }
    }
}

function showChar(elem, index) {
    selectedCharIndex = index
    let allChars = document.querySelectorAll('#charBox .char');
    allChars.forEach(c => c.classList.remove("selected"));

    elem.classList.add("selected");

    const preview = document.getElementById("charPreview");
    preview.innerHTML = `<img src="${chars.chars[index].img}">`;
}

function startLoadingScreen(speed) {
    const screen = document.getElementById("loadingScreen");
    const tipEl = document.getElementById("tip");
    const progress = document.getElementById("progress");

    screen.style.display = "block";
    document.body.classList.add("loading");

    let progressValue = 0;
    let tipIndex = 0;

    progress.style.width = "0%";
    let currentBG = 1;

    function updateBG() {
        const bg1 = document.querySelector(".bg1");
        const bg2 = document.querySelector(".bg2");

        const nextImg = images[Math.floor(Math.random() * images.length)];

        if (currentBG === 1) {
            bg2.style.backgroundImage = `url(${nextImg})`;

            bg2.classList.add("active");
            bg1.classList.remove("active");

            currentBG = 2;
        } else {
            bg1.style.backgroundImage = `url(${nextImg})`;

            bg1.classList.add("active");
            bg2.classList.remove("active");

            currentBG = 1;
        }
    }

    function updateTip() {
        tipEl.classList.remove("show");

        setTimeout(() => {
            tipEl.textContent = tips[tipIndex];
            tipEl.classList.add("show");
            tipIndex = (tipIndex + 1) % tips.length;
        }, 200);
    }

    updateBG();
    updateTip();

    const interval = setInterval(() => {
        progressValue += speed || 1;

        if (progressValue % 30 === 0) updateBG();
        if (progressValue % 40 === 0) updateTip();

        progress.style.width = progressValue + "%";

        if (progressValue >= 100) {
            clearInterval(interval);

            setTimeout(() => {
                screen.style.display = "none";
                document.body.classList.remove("loading");
            }, 500);
        }

    }, 100);

    document.getElementById("overlay").style.display = "none"
    document.getElementById("headerText").style.display = "none"
    document.getElementById("MainMenu").style.display = "none"
    document.getElementById("loadGame").style.display = "none"
    document.getElementById("leaderboard").style.display = "none"
    document.getElementById("createChar").style.display = "none"
}

function confirmChar() {
    let selectedChar = chars.chars[selectedCharIndex]
    const charName = document.getElementById("charNameInput").value.trim() || "Namenloser Wanderer";
    const startLeben = Number(selectedChar.heal);
    let char = {
        level: 1,
        money: 100,
        leben: startLeben,
        maxLeben: startLeben,
        attack: Number(selectedChar.attack),
        mana: 0,
        inventory: {},
        starterChosen: false,
        selectedChar: selectedChar.name,
        playerName: charName,
        zoneX: 1,
        zoneY: 3,
        playerX: window.innerWidth / 2,
        playerY: window.innerHeight / 2,
        quests: {
            [firstQuest.id]: { state: "none" },
            [secondQuest.id]: { state: "none" }
        }
    }
    currSlot = getNextSlot()
    localStorage.setItem(getSlotKey(currSlot), JSON.stringify(char))
    gameSave = char
    gameActive = false;
    activeDialogue = null;
    Object.keys(keys).forEach(key => keys[key] = false);

    startLoadingScreen()

    setTimeout(() => {
        document.getElementById("playerChar").src = selectedChar.img  // <- setTimeout
        document.getElementById("game").style.display = "block"
        setZone(1, 3)
        setPlayerSpawn(window.innerWidth / 2, window.innerHeight / 2)
        renderInventory()
        updateHUD()
        showStarterChoice()
    }, getLoadingDuration(1))
}


/* Game Logik*/
/* Game Logik*/
/* Game Logik*/
/* Game Logik*/
/* Game Logik*/
/* Game Logik*/

function loadCollisionMap(baseSrc, extensionIndex = 0) {
    collisionReady = false;

    const img = new Image();
    const src = `${baseSrc}.${collisionExtensions[extensionIndex]}`;

    img.onload = () => {
        collisionCanvas.width = window.innerWidth;
        collisionCanvas.height = window.innerHeight;

        collisionCtx.clearRect(
            0,
            0,
            collisionCanvas.width,
            collisionCanvas.height
        );

        collisionCtx.drawImage(
            img,
            0,
            0,
            collisionCanvas.width,
            collisionCanvas.height
        );

        collisionReady = true;

        if (pendingSpawn) {
            setPlayerSpawn(pendingSpawn.x, pendingSpawn.y);
        }

        console.log("COLLISION GELADEN:", src);
    };

    img.onerror = () => {
        if (extensionIndex < collisionExtensions.length - 1) {
            loadCollisionMap(baseSrc, extensionIndex + 1);
            return;
        }
        console.warn("COLLISION NICHT GEFUNDEN:", baseSrc);
    };

    img.src = src;
}

/* set zone selber gemacht mit ki überarbeitet */
function setZone(x, y) {
    if (y < 0 || y >= worldMap.length) return;
    if (x < 0 || x >= worldMap[y].length) return;
    if (worldMap[y][x] === "N/A") return;

    currentX = x;
    currentY = y;
    if (gameSave) {
        ensureSaveShape();
        gameSave.zoneX = currentX;
        gameSave.zoneY = currentY;
    }

    document.getElementById("g-bg").style.backgroundImage =
        `url('${worldMap[y][x]}')`;

    loadCollisionMap(
        `./img/collision/${currentX}_${currentY}`
    );

    updateHUD();
    renderWorldObjects();
    saveGame();
}

function isBlocked(x, y) {
    if (!collisionReady) return false;
    if (x < 0 || y < 0 || x >= collisionCanvas.width || y >= collisionCanvas.height) return true;
    if (isWalkableOverride(x, y)) return false;

    const pixel = collisionCtx.getImageData(
        Math.floor(x),
        Math.floor(y),
        1,
        1
    ).data;

    const brightness =
        (pixel[0] + pixel[1] + pixel[2]) / 3;

    return brightness > 150;
}

/* check edge ki */

function checkEdge(px, py, mapWidth, mapHeight, direction) {

    if (teleportLock) return false;
    const edgeX = getEdgeTeleportMargin(mapWidth);
    const edgeY = getEdgeTeleportMargin(mapHeight);

    // RIGHT
    if (direction.x > 0 && px >= mapWidth - edgeX) {
        const customTransition = getCustomEdgeTransition("right");
        const nx = customTransition?.targetX ?? currentX + 1;
        const ny = customTransition?.targetY ?? currentY;
        if (!worldMap[ny]?.[nx] || worldMap[ny][nx] === "N/A") return false;

        teleportLock = true;
        setTimeout(() => teleportLock = false, 300);

        teleportToZone(nx, ny, "right", customTransition);
        return true;
    }

    // LEFT
    if (direction.x < 0 && px <= edgeX) {
        const customTransition = getCustomEdgeTransition("left");
        const nx = customTransition?.targetX ?? currentX - 1;
        const ny = customTransition?.targetY ?? currentY;
        if (!worldMap[ny]?.[nx] || worldMap[ny][nx] === "N/A") return false;

        teleportLock = true;
        setTimeout(() => teleportLock = false, 300);

        teleportToZone(nx, ny, "left", customTransition);
        return true;
    }

    // TOP
    if (direction.y < 0 && py <= edgeY) {
        const customTransition = getCustomEdgeTransition("top");
        const nx = customTransition?.targetX ?? currentX;
        const ny = customTransition?.targetY ?? currentY - 1;
        if (!worldMap[ny]?.[nx] || worldMap[ny][nx] === "N/A") return false;

        teleportLock = true;
        setTimeout(() => teleportLock = false, 300);

        teleportToZone(nx, ny, "top", customTransition);
        return true;
    }

    // BOTTOM
    if (direction.y > 0 && py >= mapHeight - edgeY) {
        const customTransition = getCustomEdgeTransition("bottom");
        const nx = customTransition?.targetX ?? currentX;
        const ny = customTransition?.targetY ?? currentY + 1;
        if (!worldMap[ny]?.[nx] || worldMap[ny][nx] === "N/A") return false;

        teleportLock = true;
        setTimeout(() => teleportLock = false, 300);

        teleportToZone(nx, ny, "bottom", customTransition);
        return true;
    }

    return false;
}

/* keyboard movement ist ki generiert */

let playerX = window.innerWidth / 2
let playerY = window.innerHeight / 2
const SPEED = 5

const keys = {}

document.addEventListener("keydown", (e) => { keys[e.key] = true })
document.addEventListener("keyup", (e) => { keys[e.key] = false })
document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "e" && !e.repeat) {
        handleInteraction();
    }
    if (key === "i" && !e.repeat && e.target.tagName !== "INPUT") {
        toggleInventory();
    }
    if (key === "escape" && !e.repeat) {
        closeCombatPanel();
        closeLevelUpScreen();
        closeShop();
    }
});

function clearMovementKeys() {
    ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "w", "a", "s", "d", "W", "A", "S", "D"]
        .forEach(key => keys[key] = false);
}

function gameLoop() {
    if (!gameSave || !gameActive) { requestAnimationFrame(gameLoop); return }

    let newX = playerX
    let newY = playerY
    const direction = { x: 0, y: 0 }

    if (!activeDialogue) {
        if (keys["ArrowRight"] || keys["d"] || keys["D"]) direction.x += 1
        if (keys["ArrowLeft"] || keys["a"] || keys["A"]) direction.x -= 1
        if (keys["ArrowUp"] || keys["w"] || keys["W"]) direction.y -= 1
        if (keys["ArrowDown"] || keys["s"] || keys["S"]) direction.y += 1
    }

    newX += direction.x * SPEED
    newY += direction.y * SPEED

    if (checkEdge(newX, newY, window.innerWidth, window.innerHeight, direction)) {
        requestAnimationFrame(gameLoop);
        return;
    }
    if (canStandAt(newX, newY)) {
        playerX = newX;
        playerY = newY;
    }

    checkTeleportZones();
    moveChar()
    renderWorldObjects()
    requestAnimationFrame(gameLoop)
}

function moveChar() {
    const char = document.getElementById("playerChar")
    if (!char) return
    char.style.left = playerX + "px"
    char.style.top = playerY + "px"
    if (gameSave) {
        gameSave.playerX = Math.round(playerX);
        gameSave.playerY = Math.round(playerY);
    }
}

function isInCurrentZone(object) {
    return object.mapX === currentX && object.mapY === currentY;
}

function distanceTo(object) {
    const point = resolvePoint(object);
    return Math.hypot(playerX - point.x, playerY - point.y);
}

function positionWorldElement(element, object, visible) {
    if (!element) return;
    element.style.display = visible ? "flex" : "none";
    if (!visible) return;
    const point = resolvePoint(object);
    element.style.left = `${point.x}px`;
    element.style.top = `${point.y}px`;
}

/* 50/50 mit KI: NPC, Quest-Item und E-Hinweis werden pro Zone dynamisch ein-/ausgeblendet. */
function renderWorldObjects() {
    const npcEl = document.getElementById(questNpc.id);
    const merchantEl = document.getElementById(merchantNpc.id);
    const trainerEl = document.getElementById(trainerNpc.id);
    const dummyEl = document.getElementById(trainingDummy.id);
    const pickupEl = document.getElementById(questPickup.id);
    const pickup2El = document.getElementById(questPickup2.id);
    const hint = document.getElementById("interactionHint");
    const questState = getQuestState();
    const secondQuestState = getSecondQuestState();

    const showNpc = isInCurrentZone(questNpc);
    const showMerchant = isInCurrentZone(merchantNpc);
    const showTrainer = isInCurrentZone(trainerNpc);
    const showDummy = isInCurrentZone(trainingDummy);
    const showPickup = isInCurrentZone(questPickup) && questState === "started";
    const showPickup2 = isInCurrentZone(questPickup2) && secondQuestState === "started";

    positionWorldElement(npcEl, questNpc, showNpc);
    positionWorldElement(merchantEl, merchantNpc, showMerchant);
    positionWorldElement(trainerEl, trainerNpc, showTrainer);
    positionWorldElement(dummyEl, trainingDummy, showDummy);
    positionWorldElement(pickupEl, questPickup, showPickup);
    positionWorldElement(pickup2El, questPickup2, showPickup2);

    const nearNpc = showNpc && distanceTo(questNpc) <= questNpc.range;
    const nearMerchant = showMerchant && distanceTo(merchantNpc) <= merchantNpc.range;
    const nearTrainer = showTrainer && distanceTo(trainerNpc) <= trainerNpc.range;
    const nearDummy = showDummy && distanceTo(trainingDummy) <= trainingDummy.range;
    const nearPickup = showPickup && distanceTo(questPickup) <= questPickup.range;
    const nearPickup2 = showPickup2 && distanceTo(questPickup2) <= questPickup2.range;

    if (hint && (nearNpc || nearMerchant || nearTrainer || nearDummy || nearPickup || nearPickup2) && !activeDialogue) {
        const target = nearNpc
            ? questNpc
            : nearMerchant
                ? merchantNpc
                : nearTrainer
                    ? trainerNpc
                    : nearDummy
                        ? trainingDummy
                        : nearPickup
                            ? questPickup
                            : questPickup2;
        const targetPoint = resolvePoint(target);
        hint.style.display = "block";
        hint.style.left = `${targetPoint.x + 38}px`;
        hint.style.top = `${targetPoint.y - 46}px`;
    } else if (hint) {
        hint.style.display = "none";
    }
}

function handleInteraction() {
    if (!gameSave || !gameActive) return;

    if (activeDialogue) {
        advanceDialogue();
        return;
    }

    const questState = getQuestState();
    const secondQuestState = getSecondQuestState();
    if (isInCurrentZone(questNpc) && distanceTo(questNpc) <= questNpc.range) {
        talkToAldric(questState);
        return;
    }

    if (isInCurrentZone(merchantNpc) && distanceTo(merchantNpc) <= merchantNpc.range) {
        talkToMerchant(secondQuestState);
        return;
    }

    if (isInCurrentZone(trainerNpc) && distanceTo(trainerNpc) <= trainerNpc.range) {
        openTrainingMenu();
        return;
    }

    if (isInCurrentZone(trainingDummy) && distanceTo(trainingDummy) <= trainingDummy.range) {
        startTrainingCombat("dummy");
        return;
    }

    if (questState === "started" && isInCurrentZone(questPickup) && distanceTo(questPickup) <= questPickup.range) {
        addItem("shadowHerb", 1);
        setQuestState("herbFound");
        showToast("Schattenkraut gefunden");
        renderWorldObjects();
    }

    if (secondQuestState === "started" && isInCurrentZone(questPickup2) && distanceTo(questPickup2) <= questPickup2.range) {
        addItem("oldRelic", 1);
        setSecondQuestState("relicFound");
        showToast("Altes Relikt gefunden");
        renderWorldObjects();
    }
}

/* 50/50 mit KI: Dialog- und Quest-State-Flow fuer Aldrics Waldhuetten-Quest. */
function talkToAldric(questState) {
    if (questState === "none") {
        startDialogue(questNpc.name, [
            "Die Huette knarrt nicht ohne Grund. Etwas Dunkles liegt im Moos.",
            "Bring mir das Schattenkraut neben der Waldhuette. Dann schulde ich dir Gold und einen Heiltrank."
        ], () => {
            setQuestState("started");
            showToast("Quest gestartet: Fluestern der Waldhuette");
        });
        return;
    }

    if (questState === "started") {
        startDialogue(questNpc.name, [
            "Das Kraut waechst nahe der Huette. Es leuchtet schwach, wenn du nah genug bist."
        ]);
        return;
    }

    if (questState === "herbFound") {
        startDialogue(questNpc.name, [
            "Du hast es wirklich gefunden. Gut. Dann atmet der Wald heute Nacht leichter.",
            `Nimm ${firstQuest.rewards.money} Gold und diesen Heiltrank. Du wirst beides brauchen.`
        ], () => {
            removeItem("shadowHerb", 1);
            gameSave.money += firstQuest.rewards.money;
            addItem(firstQuest.rewards.item, firstQuest.rewards.amount);
            setQuestState("completed");
            addXp(85);
            saveGame();
            updateHUD();
            showToast("Quest abgeschlossen: +35 Gold, +1 Heiltrank, +85 XP");
        });
        return;
    }

    startDialogue(questNpc.name, [
        "Die Schatten bleiben nicht fort, aber heute hast du uns Zeit gekauft."
    ]);
}

function talkToMerchant(secondQuestState) {
    const firstQuestDone = getQuestState() === "completed";

    if (!firstQuestDone) {
        startDialogue(merchantNpc.name, [
            "Erst muss Aldrics Huette ruhig sein. Danach reden wir ueber echte Ware."
        ], openShop);
        return;
    }

    if (secondQuestState === "none") {
        startDialogue(merchantNpc.name, [
            "Du siehst aus, als koenntest du mehr als Kraeuter tragen.",
            "In Dorf2 liegt ein altes Relikt zwischen den verlassenen Wegen. Bring es mir, und ich zahle gut."
        ], () => {
            setSecondQuestState("started");
            showToast("Quest gestartet: Relikt aus Dorf2");
        });
        return;
    }

    if (secondQuestState === "started") {
        startDialogue(merchantNpc.name, [
            "Dorf2 liegt rechts vom Dorf. Das Relikt sollte dort noch leuchten."
        ]);
        return;
    }

    if (secondQuestState === "relicFound") {
        startDialogue(merchantNpc.name, [
            "Das ist es. Alt, kalt und wahrscheinlich verflucht. Perfekt.",
            `Hier: ${secondQuest.rewards.money} Gold, eine Bombe und Erfahrung fuer deine Muehe.`
        ], () => {
            removeItem("oldRelic", 1);
            gameSave.money += secondQuest.rewards.money;
            addItem(secondQuest.rewards.item, secondQuest.rewards.amount);
            setSecondQuestState("completed");
            addXp(secondQuest.rewards.xp);
            saveGame();
            updateHUD();
            showToast(`Quest abgeschlossen: +${secondQuest.rewards.money} Gold, +1 Bombe, +${secondQuest.rewards.xp} XP`);
        });
        return;
    }

    openShop();
}

function startDialogue(name, lines, onDone = null) {
    activeDialogue = { name, lines, onDone };
    dialogueIndex = 0;
    document.getElementById("dialogueName").textContent = name;
    document.getElementById("dialogueBox").style.display = "block";
    showDialogueLine();
}

function showDialogueLine() {
    document.getElementById("dialogueText").textContent = activeDialogue.lines[dialogueIndex];
    document.getElementById("dialogueButton").textContent =
        dialogueIndex >= activeDialogue.lines.length - 1 ? "Schliessen" : "Weiter";
}

function advanceDialogue() {
    if (!activeDialogue) return;
    dialogueIndex++;
    if (dialogueIndex < activeDialogue.lines.length) {
        showDialogueLine();
        return;
    }

    const done = activeDialogue.onDone;
    activeDialogue = null;
    document.getElementById("dialogueBox").style.display = "none";
    if (done) done();
}


function checkTeleportZones() {
    if (teleportLock) return;

    for (const zone of teleportZones) {
        const rect = resolveRect(zone);

        if (
            zone.mapX === currentX &&
            zone.mapY === currentY &&

            playerX >= rect.x &&
            playerX <= rect.x + rect.w &&

            playerY >= rect.y &&
            playerY <= rect.y + rect.h
        ) {
            teleportLock = true;
            setTimeout(() => teleportLock = false, 350);

            setZone(
                zone.targetX,
                zone.targetY
            );

            clearMovementKeys();
            const spawn = resolveSpawn(zone);
            setPlayerSpawn(spawn.x, spawn.y);
            renderWorldObjects();
            saveGame();

            return;
        }
    }
}
function teleportToZone(x, y, direction = null, customTransition = null) {
    setZone(x, y);

    const spawn = customTransition ? resolveSpawn(customTransition) : getEdgeSpawn(direction);

    clearMovementKeys();
    setPlayerSpawn(spawn.x, spawn.y);
    renderWorldObjects();
    saveGame();
}

document.getElementById("dialogueButton").addEventListener("click", advanceDialogue);

gameLoop()
