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

        xPct: 0.33,
        yPct: 0.44,
        wPct: 0.20,
        hPct: 0.20,

        targetX: 2,
        targetY: 0,

        spawnXPct: 0.48,
        spawnYPct: 0.72
    },
    {
        name: "waldhuette_inside_exit_front_door",
        mapX: 2,
        mapY: 0,

        xPct: 0.12,
        yPct: 0.68,
        wPct: 0.22,
        hPct: 0.24,

        targetX: 2,
        targetY: 1,

        spawnXPct: 0.38,
        spawnYPct: 0.52
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
    x: 1180,
    y: 620,
    range: 100
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

const merchantStock = [
    { itemId: "healPotionSmall", price: 25 },
    { itemId: "healPotionBig", price: 70 },
    { itemId: "manaPotion", price: 35 },
    { itemId: "bomb", price: 85 }
];

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
    gameSave.money = Number(gameSave.money ?? 0);
    gameSave.leben = Number(gameSave.leben ?? 1);
    gameSave.maxLeben = Number(gameSave.maxLeben ?? gameSave.leben);
    gameSave.attack = Number(gameSave.attack ?? 1);
    gameSave.mana = Number(gameSave.mana ?? 0);
    gameSave.starterChosen = Boolean(gameSave.starterChosen);
    gameSave.zoneX = Number.isInteger(Number(gameSave.zoneX)) ? Number(gameSave.zoneX) : currentX;
    gameSave.zoneY = Number.isInteger(Number(gameSave.zoneY)) ? Number(gameSave.zoneY) : currentY;
    gameSave.quests ??= {};
    gameSave.quests[firstQuest.id] ??= { state: "none" };
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

function setQuestState(state) {
    ensureSaveShape();
    gameSave.quests[firstQuest.id].state = state;
    saveGame();
    updateHUD();
}

function showToast(text) {
    const toast = document.getElementById("questToast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateHUD() {
    if (!gameSave) return;
    ensureSaveShape();

    document.getElementById("monAnz").textContent = gameSave.money.toLocaleString("de-DE");
    document.getElementById("manAnz").textContent = `${gameSave.leben}/${gameSave.maxLeben}`;

    const questState = getQuestState();
    document.getElementById("questTitle").textContent =
        questState === "none" ? "Keine aktive Quest" : firstQuest.title;
    document.getElementById("questObjective").textContent = firstQuest.objectives[questState];
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
    if (document.getElementById("starterChoice")?.style.display !== "flex") {
        gameActive = true;
    }
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
            [firstQuest.id]: { state: "none" }
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
    return Math.hypot(playerX - object.x, playerY - object.y);
}

function positionWorldElement(element, object, visible) {
    if (!element) return;
    element.style.display = visible ? "flex" : "none";
    if (!visible) return;
    element.style.left = `${object.x}px`;
    element.style.top = `${object.y}px`;
}

/* 50/50 mit KI: NPC, Quest-Item und E-Hinweis werden pro Zone dynamisch ein-/ausgeblendet. */
function renderWorldObjects() {
    const npcEl = document.getElementById(questNpc.id);
    const merchantEl = document.getElementById(merchantNpc.id);
    const pickupEl = document.getElementById(questPickup.id);
    const hint = document.getElementById("interactionHint");
    const questState = getQuestState();

    const showNpc = isInCurrentZone(questNpc);
    const showMerchant = isInCurrentZone(merchantNpc);
    const showPickup = isInCurrentZone(questPickup) && questState === "started";

    positionWorldElement(npcEl, questNpc, showNpc);
    positionWorldElement(merchantEl, merchantNpc, showMerchant);
    positionWorldElement(pickupEl, questPickup, showPickup);

    const nearNpc = showNpc && distanceTo(questNpc) <= questNpc.range;
    const nearMerchant = showMerchant && distanceTo(merchantNpc) <= merchantNpc.range;
    const nearPickup = showPickup && distanceTo(questPickup) <= questPickup.range;

    if (hint && (nearNpc || nearMerchant || nearPickup) && !activeDialogue) {
        const target = nearNpc ? questNpc : nearMerchant ? merchantNpc : questPickup;
        hint.style.display = "block";
        hint.style.left = `${target.x + 38}px`;
        hint.style.top = `${target.y - 46}px`;
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
    if (isInCurrentZone(questNpc) && distanceTo(questNpc) <= questNpc.range) {
        talkToAldric(questState);
        return;
    }

    if (isInCurrentZone(merchantNpc) && distanceTo(merchantNpc) <= merchantNpc.range) {
        openShop();
        return;
    }

    if (questState === "started" && isInCurrentZone(questPickup) && distanceTo(questPickup) <= questPickup.range) {
        addItem("shadowHerb", 1);
        setQuestState("herbFound");
        showToast("Schattenkraut gefunden");
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
            saveGame();
            updateHUD();
            showToast("Quest abgeschlossen: +35 Gold, +1 Heiltrank");
        });
        return;
    }

    startDialogue(questNpc.name, [
        "Die Schatten bleiben nicht fort, aber heute hast du uns Zeit gekauft."
    ]);
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
