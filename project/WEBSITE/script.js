// VARS
const KEY = 'ADVENTURE_GAME_LSKEY'
let gameSave = null
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



//funcs
//LS Funcs

function loadScore() {
    let save = localStorage.getItem(KEY)

    if (save) {
        return JSON.parse(save)
    }
    let newSave = {
        level: 1,
        money: 100,
        leben: 3,
        inventory: [],
        selectedChar: null,
        playerName: ""
    }

    localStorage.setItem(KEY, JSON.stringify(newSave))
    return newSave
}


function checkGame() {
    return localStorage.getItem(KEY) !== null
}

function saveGame() {
    if (!gameSave) {
        console.log("Fehler kein Speicher!")
    }
    localStorage.setItem(KEY, JSON.stringify(gameSave))
}



function gotoMainMenu() {
    document.getElementById("headerText").style.display = "none"
    document.getElementById("MainMenu").style.display = "flex"
    document.getElementById("loadGame").style.display = "none"
}

function loadGame() {
    document.getElementById("MainMenu").style.display = "none"
    document.getElementById("loadGame").style.display = "flex"
    if (checkGame()) {
        gameSave = loadScore()
        console.log(gameSave)
        document.getElementById("loadGame").innerHTML += `
        <div class="loadBox" id="loadBox2">
        <p class="start-btn" onclick="startGame()"> ▶ START</p>
        <p class="level label">${gameSave.level}</p>
        <p class="money label">${gameSave.money}</p>
        </div>
        `
    }
    document.getElementById("loadBox").style.display = "flex"
    document.getElementById("loadBox2").style.display = "flex"
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
    if(game != 'new') {
    startLoadingScreen(0.5)
    document.getElementById("game").style.display = "block"
    document.body.style.backgroundImage = "url('')"
    return
    }
    document.getElementById("createChar").style.display = "block"
    document.body.style.backgroundImage = "none"
    document.getElementById("loadGame").style.display = "none"
    for(let i = 0; i < chars.chars.length; i++) {
        if(i == 0) {
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
}


function confirmChar() {

}