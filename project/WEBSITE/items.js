const itemList = {
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
    }
  }
};

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

function useItem(player, itemId) {
  let item = null;

  for (const category in itemList) {
    if (itemList[category][itemId]) {
      item = itemList[category][itemId];
      break;
    }
  }

  if (!item) return console.log("Item not found!");

  switch (item.type) {
    case "heal":
      player.hp = Math.min(player.maxHp, player.hp + item.heal);
      console.log(`${item.name} healed ${item.heal} HP`);
      break;

    case "mana":
      player.mana += item.mana;
      console.log(`${item.name} restored ${item.mana} mana`);
      break;

    case "damage":
      console.log(`${item.name} used! Deals ${item.damage} damage.`);
      break;

    case "cleanse":
      player.statusEffects = [];
      console.log(`${item.name} cleansed effects`);
      break;

    default:
      console.log(`${item.name} used.`);
  }
}
