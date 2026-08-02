export const CHARACTERS = {
  pompompurin: {
    id: 'pompompurin',
    name: '布丁狗',
    nameEn: 'Pompompurin',
    hp: 100,
    attack: 18,
    special: 32,
    heal: 20,
    specialName: '布丁狗丟便便攻擊',
    attackDesc: '布丁狗丟出便便攻擊敵人！',
    ultimateName: '布丁狗晃肚肚攻擊',
    ultimateDamage: 10,
    basicDamage: 1,
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
    specialName: '大耳狗飛天拳攻擊',
    attackDesc: '大耳狗揮出強力飛天拳！',
    ultimateName: '甩甩大耳朵攻擊',
    ultimateDamage: 8,
    basicDamage: 1,
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
    specialName: 'Hello Kitty 話術（Hello Hello 攻擊）',
    attackDesc: 'Hello Kitty 用可愛話術迷惑敵人！',
    ultimateName: '震耳欲聾尖叫',
    ultimateDamage: 8,
    basicDamage: 1,
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
    specialName: '酷洛米夢幻術攻擊',
    attackDesc: '酷洛米施展夢幻魔法攻擊！',
    ultimateName: '丟丟骷嚕頭攻擊',
    ultimateDamage: 8,
    basicDamage: 1,
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
    specialName: '美樂蒂扭屁屁攻擊',
    attackDesc: '美樂蒂扭動屁屁可愛攻擊！',
    ultimateName: '放屁攻擊',
    ultimateDamage: 8,
    basicDamage: 1,
    color: '#FF9EC8',
    emoji: '🌸',
  },
};

export const BATTLE_MAX_HP = 500;
export const ENERGY_TO_ULTIMATE = 5;

export function createFighter(charId, chosenAttack = null) {
  const base = CHARACTERS[charId];
  return {
    ...base,
    chosenAttack: chosenAttack || base.ultimateName,
    currentHp: base.hp,
    energy: 0,
    specialUsed: false,
  };
}

export function getRandomCharacter(excludeId) {
  const ids = Object.keys(CHARACTERS).filter((id) => id !== excludeId);
  return ids[Math.floor(Math.random() * ids.length)];
}
