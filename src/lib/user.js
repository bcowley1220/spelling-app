// src/lib/user.js
import { derived } from 'svelte/store';
import { persisted } from './persisted';

// Persisted list of user profiles
export const users = persisted('users', []);

// Persisted current user ID
export const currentUserId = persisted('currentUserId', null);

// Derived full user object for convenience
export const currentUser = derived(
  [users, currentUserId],
  ([$users, $currentUserId]) =>
    $users.find(u => u.id === $currentUserId) || null
);
