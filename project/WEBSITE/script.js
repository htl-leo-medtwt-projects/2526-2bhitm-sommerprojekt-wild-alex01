// VARS
const KEY = 'ADVENTURE_GAME_LSKEY'
let gameSave = null




//funcs

//LS Funcs

function loadScore() {
    let save = localStorage.getItem(KEY)

    if(save) {
        return JSON.parse(save)
    } 
        let newSave = {
            level: 1,
            money: 100,
            leben: 3,
            inventory: []
        }

        localStorage.setItem(KEY, JSON.stringify(newSave))
        return newSave
}


function checkGame() {
    return localStorage.getItem(KEY) !== null
}

function saveGame() {
    if(!gameSave) {
        console.log("Fehler kein Speicher!")
    }
    localStorage.setItem(KEY, JSON.stringify(gameSave))
}



function gotoMainMenu() {
    document.getElementById("headerText").style.display = "none"
    document.getElementById("MainMenu").style.display = "flex"
    document.getElementById("loadGame").style.display = "none"
    document.getElementById("overlay").classList.add("active") 
}

function loadGame() {
    document.getElementById("MainMenu").style.display = "none"
    document.getElementById("loadGame").style.display = "flex"
    if(checkGame()) {    
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
function startGame() {
    
}

// KI generiert und noch nicht ausgeweiter
/*
function craft(itemId) {
    const recipe = recipes[itemId];
    if (!recipe) return console.log("Kein Rezept!");

    // check materials
    for (const req in recipe.requires) {
        if (!hasItem(req, recipe.requires[req])) {
            return console.log("Nicht genug Materialien!");
        }
    }

    // remove materials
    for (const req in recipe.requires) {
        removeItem(req, recipe.requires[req]);
    }

    // give item
    addItem(recipe.result, 1);

    console.log(`${itemId} gecraftet!`);
}

function renderCrafting() {
    const container = document.getElementById("craftingUI");
    container.innerHTML = "";

    for (const recipeId in recipes) {
        const recipe = recipes[recipeId];

        const div = document.createElement("div");
        div.className = "invItem";

        div.innerHTML = `
            <strong>${recipeId}</strong>
            <small>Craft</small>
        `;

        div.onclick = () => craft(recipeId);

        container.appendChild(div);
    }
} */