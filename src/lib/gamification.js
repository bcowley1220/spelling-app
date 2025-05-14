// src/lib/gamification.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUserId } from './user';

// Very similar to createPerUserStore from stores.js:
function createPerUserStore(keyBase, defaultValue) {
  let currentKey = null;
  const { subscribe, set, update } = writable(defaultValue);

  subscribe(value => {
    if (browser && currentKey) {
      localStorage.setItem(currentKey, JSON.stringify(value));
    }
  });

  currentUserId.subscribe(id => {
    currentKey = id ? `${keyBase}-${id}` : null;
    if (browser && currentKey) {
      const stored = localStorage.getItem(currentKey);
      set(stored ? JSON.parse(stored) : defaultValue);
    } else {
      set(defaultValue);
    }
  });

  return { subscribe, set, update };
}

export const gamify = createPerUserStore('gamify', {
  xp: 0,
  streak: 0,
  lastPractice: null, // ISO date string
  badges: []          // e.g. ['7-day streak', 'No-mistake week']
});
