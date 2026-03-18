export const AVATAR_PRESETS = [
  { id: 'robot',      emoji: '🤖', name: 'Robot',    bgColor: '#6c63ff' },
  { id: 'woman',      emoji: '👩', name: 'Anna',     bgColor: '#ff6b9d' },
  { id: 'man',        emoji: '👨', name: 'James',    bgColor: '#4facfe' },
  { id: 'alien',      emoji: '👽', name: 'Nova',     bgColor: '#43e97b' },
  { id: 'wizard',     emoji: '🧙', name: 'Merlin',   bgColor: '#9c27b0' },
  { id: 'scientist',  emoji: '👩‍🔬', name: 'Dr. Kim',  bgColor: '#00b4d8' },
  { id: 'astronaut',  emoji: '👨‍🚀', name: 'Buzz',     bgColor: '#1e3a5f' },
  { id: 'ninja',      emoji: '🥷', name: 'Shadow',   bgColor: '#2d2d2d' },
  { id: 'fox',        emoji: '🦊', name: 'Finn',     bgColor: '#e65c00' },
  { id: 'owl',        emoji: '🦉', name: 'Sage',     bgColor: '#4a3728' },
  { id: 'angel',      emoji: '😇', name: 'Grace',    bgColor: '#ffe082' },
  { id: 'cat',        emoji: '🐱', name: 'Luna',     bgColor: '#e91e63' },
];

// Vietnamese speaker (left side)
export const DEFAULT_AVATAR1 = {
  id: 'man',
  name: 'Nam',
  emoji: '👨',
  imageUrl: null,
  bgColor: '#4facfe',
  voiceURI: null,
  lang: 'vi-VN',
};

// English speaker (right side)
export const DEFAULT_AVATAR2 = {
  id: 'woman',
  name: 'Emma',
  emoji: '👩',
  imageUrl: null,
  bgColor: '#ff6b9d',
  voiceURI: null,
  lang: 'en-US',
};

// Keep for backwards-compat
export const DEFAULT_AVATAR = DEFAULT_AVATAR1;
