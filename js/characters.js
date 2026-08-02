export const CHARACTERS = {
  pompompurin: {
    id: 'pompompurin',
    name: '布丁狗',
    nameEn: 'Pompompurin',
    hp: 100,
    attack: 18,
    special: 32,
    heal: 20,
    specialName: 'Shielding Big Poo-Poo',
    attackDesc: '布丁狗用大便盾牌防禦並反擊！',
    color: '#F5D76E',
    emoji: '🍮',
  },
  cinnamoroll: {
    id: 'cinnamoroll',
    name: '大耳狗',
    nameEn: 'Cinnamoroll',
    hp: 90,
    attack: 16,
    special: 28,
    heal: 25,
    specialName: 'Flying Fist',
    attackDesc: '大耳狗揮出強力飛天拳！',
    color: '#A8D8EA',
    emoji: '☁️',
  },
  hellokitty: {
    id: 'hellokitty',
    name: 'Hello Kitty',
    nameEn: 'Hello Kitty',
    hp: 95,
    attack: 17,
    special: 30,
    heal: 22,
    specialName: "Hello Kitty's Scream",
    attackDesc: 'Hello Kitty 發出震耳欲聾的尖叫！',
    color: '#FFB6C1',
    emoji: '🎀',
  },
  kuromi: {
    id: 'kuromi',
    name: '酷洛米',
    nameEn: 'Kuromi',
    hp: 85,
    attack: 22,
    special: 38,
    heal: 15,
    specialName: 'Dream Tree',
    attackDesc: '酷洛米召喚夢幻之樹攻擊敵人！',
    color: '#9B59B6',
    emoji: '💜',
  },
  mymelody: {
    id: 'mymelody',
    name: '美樂蒂',
    nameEn: 'My Melody',
    hp: 88,
    attack: 15,
    special: 26,
    heal: 30,
    specialName: 'Pee-Pee-Tree',
    attackDesc: '美樂蒂的 Pee-Pee-Tree 特殊攻擊！',
    color: '#FF9EC8',
    emoji: '🌸',
  },
};

export function createFighter(charId, chosenAttack = null) {
  const base = CHARACTERS[charId];
  return {
    ...base,
    chosenAttack: chosenAttack || base.specialName,
    currentHp: base.hp,
    specialUsed: false,
  };
}

export function getRandomCharacter(excludeId) {
  const ids = Object.keys(CHARACTERS).filter((id) => id !== excludeId);
  return ids[Math.floor(Math.random() * ids.length)];
}
