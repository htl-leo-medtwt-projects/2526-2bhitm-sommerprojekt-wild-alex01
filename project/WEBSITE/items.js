const itemList = {
  weapons: {
    starterSword: {
      name: "Rostiges Schwert",
      desc: "Ein schweres altes Schwert. Nicht schoen, aber verlaesslich.",
      attack: 12,
      type: "weapon",
      rarity: "common"
    },

    starterWand: {
      name: "Zauberstab",
      desc: "Ein knisternder Stab fuer dunkle Funken und alte Worte.",
      attack: 6,
      mana: 5,
      type: "weapon",
      rarity: "uncommon"
    }
  },

  potions: {
    healPotionSmall: {
      name: "Small Heal Potion",
      desc: "Heals 1 heart. Useless if you're at full HP.",
      heal: 1,
      type: "heal",
      rarity: "common"
    },

    healPotionBig: {
      name: "Big Heal Potion",
      desc: "Heals 3 hearts instantly.",
      heal: 3,
      type: "heal",
      rarity: "uncommon"
    },

    manaPotion: {
      name: "Mana Potion",
      desc: "Restores 2 mana points.",
      mana: 2,
      type: "mana",
      rarity: "common"
    },

    mysteryPotion: {
      name: "Geheimnisvoller Trank",
      desc: "Schimmert seltsam. Staerkt dich, aber niemand weiss genau warum.",
      heal: 2,
      attack: 4,
      type: "mystery",
      rarity: "rare"
    }
  },

  consumables: {
    bomb: {
      name: "Bomb",
      desc: "Deals damage to all enemies.",
      damage: 5,
      type: "damage",
      rarity: "rare"
    },

    antidote: {
      name: "Antidote",
      desc: "Removes poison effect.",
      type: "cleanse",
      rarity: "common"
    }
  },

  misc: {
    coin: {
      name: "Gold Coin",
      desc: "Basic currency.",
      value: 1
    },

    shadowHerb: {
      name: "Schattenkraut",
      desc: "Ein kaltes Kraut aus dem Moos der Waldhuette.",
      type: "quest",
      rarity: "quest"
    }
  }
};

const chars = {
  chars: [
     {
      name: "Shado",
      img: './img/nightfighter.png',
      heal: '20',
      attack: '100',
    },
     {
      name: "Wizardo",
      img: './img/wizard.png',
      heal: '100',
      attack: '20',
    },
    {
      name: "Oman",
      img: './img/oman.png',
      heal: '60',
      attack: '60',

    },
    {
      name: "Sesman",
      img: './img/Sesman.png',
      heal: '40',
      attack: '92',

    },
    {
      name: "Aldin",
      img: './img/aldin.png',
      heal: '50',
      attack: '80',

    }
  ]
}

const recipes = {
    healPotionBig: {
        requires: {
            healPotionSmall: 2,
            coin: 1
        },
        result: "healPotionBig"
    },

    bomb: {
        requires: {
            coin: 3
        },
        result: "bomb"
    }
};

// KI 
function useItem(player, itemId) {
  let item = null;

  for (const category in itemList) {
    if (itemList[category][itemId]) {
      item = itemList[category][itemId];
      break;
    }
  }

  if (!item) {
    console.log("Item not found!");
    return { used: false, message: "Item nicht gefunden." };
  }

  switch (item.type) {
    case "heal":
      if (Number(player.leben ?? 0) >= Number(player.maxLeben ?? player.leben ?? 0)) {
        return { used: false, message: "Deine Leben sind schon voll." };
      }
      player.leben = Math.min(player.maxLeben ?? player.leben, Number(player.leben ?? 0) + item.heal);
      console.log(`${item.name} healed ${item.heal} HP`);
      return { used: true, message: `${item.name} benutzt.` };

    case "mana":
      player.mana = Number(player.mana ?? 0) + item.mana;
      console.log(`${item.name} restored ${item.mana} mana`);
      return { used: true, message: `${item.name} benutzt.` };

    case "weapon":
      return { used: false, message: `${item.name} ist bereits ausgeruestet.` };

    case "mystery":
      player.leben = Math.min(player.maxLeben ?? player.leben, Number(player.leben ?? 0) + item.heal);
      player.attack = Number(player.attack ?? 0) + item.attack;
      return { used: true, message: `${item.name}: +${item.heal} Leben, +${item.attack} Angriff.` };

    case "damage":
      console.log(`${item.name} used! Deals ${item.damage} damage.`);
      return { used: true, message: `${item.name} bereit.` };

    case "cleanse":
      player.statusEffects = [];
      console.log(`${item.name} cleansed effects`);
      return { used: true, message: `${item.name} benutzt.` };

    case "quest":
      console.log(`${item.name} ist ein Quest-Item.`);
      return { used: false, message: "Dieses Item brauchst du fuer eine Quest." };

    default:
      console.log(`${item.name} used.`);
      return { used: false, message: `${item.name} kann gerade nicht benutzt werden.` };
  }
}
