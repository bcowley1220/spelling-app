<script>
    import { onMount } from 'svelte';
    import { voices, selectedVoiceURI, rate } from '$lib/speechSettings';
    import { speak } from '$lib/speech';
    import { get } from 'svelte/store';
  
    // Load voices once the browser is ready
    onMount(() => {
      function load() {
        const available = speechSynthesis.getVoices();
        voices.set(available);
  
        // pick a default if none selected yet
        if (!get(selectedVoiceURI) && available.length) {
          selectedVoiceURI.set(available[0].voiceURI);
        }
      }
  
      // Some browsers load voices asynchronously
      speechSynthesis.addEventListener('voiceschanged', load);
      load();
    });
  </script>
  
  <h1 class="mb-4">Voice Settings</h1>
  
  <div class="mb-3">
    <label class="form-label">Choose a voice:</label>
    <select bind:value={$selectedVoiceURI} class="form-select">
      {#each $voices as v}
        <option value={v.voiceURI}>
          {v.name} ({v.lang})
        </option>
      {/each}
    </select>
  </div>
  
  <div class="mb-3">
    <label class="form-label">
      Speaking rate: <strong>{$rate.toFixed(1)}×</strong>
    </label>
    <input
      type="range"
      min="0.5"
      max="2.0"
      step="0.1"
      bind:value={$rate}
      class="form-range"
    />
  </div>
  
  <button
    type="button"
    class="btn btn-secondary"
    on:click={() => speak('Testing the new voice settings!')}
  >
    ▶️ Test Voice
  </button>
  