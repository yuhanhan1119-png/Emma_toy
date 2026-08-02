export const CHARACTERS = {
  pompompurin: {
    id: 'pompompurin',
    name: '布丁狗',
    nameEn: 'Pompompurin',
    hp: 100,
    attack: 18,
    special: 32,
    heal: 20,
    specialName: '布丁衝撞',
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
    specialName: '雲朵飛踢',
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
    specialName: '蝴蝶結旋風',
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
    specialName: '暗黑閃電',
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
    specialName: '治癒之歌',
    color: '#FF9EC8',
    emoji: '🌸',
  },
};

export function createFighter(charId) {
  const base = CHARACTERS[charId];
  return {
    ...base,
    currentHp: base.hp,
    specialUsed: false,
  };
}

export function getRandomCharacter(excludeId) {
  const ids = Object.keys(CHARACTERS).filter((id) => id !== excludeId);
  return ids[Math.floor(Math.random() * ids.length)];
}
