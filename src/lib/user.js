// src/lib/user.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// 1) Persisted list of user profiles: [{id, name}, …]
const initUsers = browser
  ? JSON.parse(localStorage.getItem('users') || '[]')
  : [];
export const users = writable(initUsers);
users.subscribe(u => {
  if (browser) localStorage.setItem('users', JSON.stringify(u));
});

// 2) The currently selected user’s ID
const initCurrent = browser ? localStorage.getItem('currentUserId') : null;
export const currentUserId = writable(initCurrent);
currentUserId.subscribe(id => {
  if (browser) localStorage.setItem('currentUserId', id);
});

// 3) Derive the full profile object for convenience
export const currentUser = derived(
  [users, currentUserId],
  ([$users, $currentUserId]) =>
    $users.find(u => u.id === $currentUserId) || null
);
