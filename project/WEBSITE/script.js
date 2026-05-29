// VARS
const KEY = 'AAFKMLAFSFFAFSAAJJSFÖFJASFLKFLFJLÖAFSLJSFJLSAFLÖSALJKSAFJSFJL'
let gameSave = null
let currSlot = null
const images = [
    "./img/castle_loading_screeen.png",
    "./img/dark_knight.png",
    "./img/startMenu.png"
];

const tips = [
    "Nutze Items strategisch!",
    "Speichere regelmäßig dein Spiel.",
    "Manche Gegner haben Schwächen.",
    "Erkunde jede Ecke!",
    "Only you can prevent V-Bucks scams"
];

let selectedCharIndex = 0;

const DEBUG_BORDERS = true

//funcs
//LS Funcs

function getSlotKey(slot) {
    return `${KEY}_slot_${slot}`
}

function getNextSlot() {
    let i = 1
    while (localStorage.getItem(getSlotKey(i)) !== null) {
        i++
    }
    return i;
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
        inventory: [],
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

function startGameFromSlot(slot) {currSlot = slot
    gameSave = JSON.parse(localStorage.getItem(getSlotKey(slot)))

    const charData = chars.chars.find(c => c.name === gameSave.selectedChar)
    if (charData) {
        document.getElementById("playerChar").src = charData.img
    }

    startLoadingScreen(0.5)
    document.getElementById("overlay").style.display = "none"
    document.body.style.backgroundImage = "url('')"
    setTimeout(() => {
        document.getElementById("game").style.display = "block"
        setZone(gameSave.zoneX ?? 1, gameSave.zoneY ?? 1)
        playerX = window.innerWidth / 2
        playerY = window.innerHeight / 2
        moveChar()
    }, (100 / (0.5 || 1)) * 100 + 600)
}

// Item funcs

function addItem(itemId, amount) {
    if (!gameSave.inventory[itemId]) {
        gameSave.inventory[itemId] = 0;
    }

    gameSave.inventory[itemId] += amount;
    saveGame();
    renderInventory();
}

function removeItem(itemId, amount) {
    if (!gameSave.inventory[itemId]) return;

    gameSave.inventory[itemId] -= amount;

    if (gameSave.inventory[itemId] <= 0) {
        delete gameSave.inventory[itemId];
    }

    saveGame();
    renderInventory();
}

function hasItem(itemId, amount = 1) {
    return gameSave.inventory[itemId] >= amount;
}


function renderInventory() {
    const container = document.getElementById("inventoryUI");
    container.innerHTML = "";

    for (const itemId in gameSave.inventory) {
        const count = gameSave.inventory[itemId];

        const itemData = findItem(itemId);
        if (!itemData) continue;

        const div = document.createElement("div");
        div.className = "invItem";

        div.innerHTML = `
            <strong>${itemData.name}</strong>
            <span>x${count}</span>
        `;

        div.onclick = () => {
            useItem(gameSave, itemId);
            removeItem(itemId, 1);
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
    let char = {
        level: 1,
        money: 100,
        leben: selectedChar.heal,
        attack: selectedChar.attack,
        inventory: [],
        selectedChar: selectedChar.name,
        playerName: document.getElementById("charNameInput").value,
        zoneX: 1,
        zoneY: 1
    }
    currSlot = getNextSlot()
    localStorage.setItem(getSlotKey(currSlot), JSON.stringify(char))
    gameSave = char

    document.getElementById("playerChar").src = selectedChar.img

    startLoadingScreen()

    setTimeout(() => {
        document.getElementById("game").style.display = "block"
        setZone(1, 1)
        playerX = window.innerWidth / 2
        playerY = window.innerHeight / 2
        moveChar()
    }, (100 / 1) * 100 + 600)
}

/* Game Logik*/
/* Game Logik*/
/* Game Logik*/
/* Game Logik*/
/* Game Logik*/
/* Game Logik*/

const worldMap = [
    ["./img/game/d_castle.png", "./img/game/forest.png", "N/A"],
    ["./img/game/castle_abzw.png","./img/game/dorf.png",  "./img/game/game.png"],
]

const zoneBorders = {
    // castle_abzw (X=1, Y=1) — Häuser links und rechts blockieren
    "1_1": [
        { x: 0,   y: 0, w: 120, h: 620 },   // linkes Haus
        { x: 880, y: 0, w: 120, h: 620 },   // rechtes Haus
        { x: 0,   y: 620, w: 1000, h: 200 },// Boden unten (Abgrund)
    ],
    // dorf (X=2, Y=1) — Häuser links und rechts
    "2_1": [
        { x: 0,   y: 0, w: 150, h: 600 },   // linkes Haus
        { x: 850, y: 0, w: 150, h: 600 },   // rechtes Haus
        { x: 0,   y: 620, w: 1000, h: 200 },
    ],
    // g_castle (X=1, Y=2) — Weg zur Burg, Seiten blockiert
    "1_2": [
        { x: 0,   y: 0, w: 200, h: 800 },   // linke Seite
        { x: 800, y: 0, w: 200, h: 800 },   // rechte Seite
        { x: 0,   y: 620, w: 1000, h: 200 },
    ],
    // d_castle (X=0, Y=1)
    "0_1": [
        { x: 0,   y: 620, w: 1000, h: 200 },
    ],
    // forest (X=1, Y=0)
    "1_0": [
        { x: 0,   y: 0, w: 1000, h: 50 },   // oberer Rand
        { x: 0,   y: 620, w: 1000, h: 200 },
    ],
}

/*debugdebugdebug kikikiki aup aup aup*/
function drawDebugBorders() {
    document.querySelectorAll('.debug-border').forEach(el => el.remove())
    if (!DEBUG_BORDERS) return

    const key = `${currentX}_${currentY}`
    const borders = zoneBorders[key] || []
    const scaleX = window.innerWidth / 1000   // <- skaliert auf Fenstergröße
    const scaleY = window.innerHeight / 800

    borders.forEach(b => {
        const div = document.createElement('div')
        div.className = 'debug-border'
        div.style.cssText = `
            position: absolute;
            left: ${b.x * scaleX}px;
            top: ${b.y * scaleY}px;
            width: ${b.w * scaleX}px;
            height: ${b.h * scaleY}px;
            background: rgba(255, 0, 0, 0.3);
            border: 2px solid red;
            z-index: 999;
            pointer-events: none;
        `
        document.getElementById('game').appendChild(div)
    })
}

function isColliding(x, y) {
    const key = `${currentX}_${currentY}`
    const borders = zoneBorders[key] || []
    const scaleX = window.innerWidth / 1000
    const scaleY = window.innerHeight / 800
    const charW = 64
    const charH = 64

    return borders.some(b => {
        const bx = b.x * scaleX
        const by = b.y * scaleY
        const bw = b.w * scaleX
        const bh = b.h * scaleY
        return x < bx + bw && x + charW > bx && y < by + bh && y + charH > by
    })
}

let currentX = 1
let currentY = 1

function setZone(x, y) {
    if (y < 0 || y >= worldMap.length) return
    if (x < 0 || x >= worldMap[y].length) return
    currentX = x
    currentY = y
    document.getElementById("g-bg").style.backgroundImage = `url('${worldMap[y][x]}')`
    drawDebugBorders()
}

/* check edge ki */
function checkEdge(playerX, playerY, mapWidth, mapHeight) {
    if (playerX >= mapWidth - 10)  { setZone(currentX + 1, currentY); return { x: 0, y: playerY } }
    if (playerX <= 10)             { setZone(currentX - 1, currentY); return { x: mapWidth - 15, y: playerY } }
    if (playerY <= 10)             { setZone(currentX, currentY - 1); return { x: playerX, y: mapHeight - 15 } }
    if (playerY >= mapHeight - 10) { setZone(currentX, currentY + 1); return { x: playerX, y: 0 } }
    return null
}
/* keyboard movement ist ki generiert */

let playerX = window.innerWidth / 2
let playerY = window.innerHeight / 2
const SPEED = 5

const keys = {}

document.addEventListener("keydown", (e) => { keys[e.key] = true })
document.addEventListener("keyup",   (e) => { keys[e.key] = false })
function gameLoop() {
    if (!gameSave) { requestAnimationFrame(gameLoop); return }

    let newX = playerX
    let newY = playerY

    if (keys["ArrowRight"] || keys["d"]) newX += SPEED
    if (keys["ArrowLeft"]  || keys["a"]) newX -= SPEED
    if (keys["ArrowUp"]    || keys["w"]) newY -= SPEED
    if (keys["ArrowDown"]  || keys["s"]) newY += SPEED

    const collides = isColliding(newX, newY)
    console.log(`pos: ${newX.toFixed(0)}, ${newY.toFixed(0)} | collides: ${collides} | zone: ${currentX}_${currentY}`)

    if (!collides) {
        playerX = newX
        playerY = newY
    }

    const edge = checkEdge(playerX, playerY, window.innerWidth, window.innerHeight)
    if (edge) {
        playerX = edge.x
        playerY = edge.y
    }

    moveChar()
    requestAnimationFrame(gameLoop)
}

function moveChar() {
    const char = document.getElementById("playerChar")
    if (!char) return
    char.style.left = playerX + "px"
    char.style.top  = playerY + "px"
}

gameLoop()