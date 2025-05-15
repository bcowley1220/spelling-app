// src/lib/persisted.js
import { writable } from 'svelte/store';
import { browser }  from '$app/environment';

// Creates a store that loads from & saves to localStorage[key]
export function persisted(key, initial) {
  const stored = browser
    ? JSON.parse(localStorage.getItem(key) || 'null')
    : null;
  const store = writable(stored ?? initial);
  if (browser) {
    store.subscribe(value => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }
  return store;
}

// For per-user stores, just include the user ID in the key:
export function perUser(keyBase, initial, currentUserId) {
  let unsubscribeUser;
  let store;

  // when the user ID changes, tear down and recreate
  unsubscribeUser = currentUserId.subscribe(id => {
    const key = id ? `${keyBase}-${id}` : null;
    // if an old store exists, unsubscribe to avoid leaks
    if (store && store.unsubscribe) store.unsubscribe();
    store = persisted(key, initial);
  });

  return {
    subscribe: (...args) => store.subscribe(...args),
    set:      (...args) => store.set(...args),
    update:   (...args) => store.update(...args),
    // you may wish to expose unsubscribeUser to clean up on destroy
  };
}
