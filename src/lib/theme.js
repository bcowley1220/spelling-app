import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const initial = browser
  ? localStorage.getItem('theme') || 'light'
  : 'light';

export const theme = writable(initial);

theme.subscribe(value => {
  if (browser) {
    document.documentElement.setAttribute('data-theme', value);
    localStorage.setItem('theme', value);
  }
});
