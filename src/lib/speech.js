import { get } from 'svelte/store';
import { selectedVoiceURI, rate } from './speechSettings';

export function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);

  // Apply chosen voice
  const uri = get(selectedVoiceURI);
  if (uri) {
    const v = speechSynthesis
      .getVoices()
      .find(voice => voice.voiceURI === uri);
    if (v) utter.voice = v;
  }

  // Apply chosen rate
  utter.rate = get(rate);
  speechSynthesis.speak(utter);
}
