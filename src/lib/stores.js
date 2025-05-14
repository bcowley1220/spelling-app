// src/lib/stores.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUserId } from './user';

// Helper to create a store that automatically keys its localStorage by user
function createPerUserStore(keyBase, defaultValue) {
  let currentKey = null;
  const { subscribe, set, update } = writable(defaultValue);

  // Persist on changes
  subscribe(value => {
    if (browser && currentKey) {
      localStorage.setItem(currentKey, JSON.stringify(value));
    }
  });

  // When user changes, load that user’s data (or reset to default)
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

// Now use it for your three main stores:
export const wordLists   = createPerUserStore('wordLists',   {});
export const attempts    = createPerUserStore('attempts',    {});
export const troubleWords= createPerUserStore('troubleWords',{});
