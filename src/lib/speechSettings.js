import { writable } from 'svelte/store';

// List of available voices
export const voices = writable([]);

// The URI of the selected voice
export const selectedVoiceURI = writable('');

// Speaking rate (0.5–2.0)
export const rate = writable(1);
