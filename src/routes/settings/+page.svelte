<script>
  import { onMount } from 'svelte';
  import { users, currentUserId } from '$lib/user';
  import { voices, selectedVoiceURI, rate } from '$lib/speechSettings';
  import { speak } from '$lib/speech';
  import { get } from 'svelte/store';

  // Load voices (handles Brave/Chrome quirks)
  onMount(() => {
    function loadVoices() {
      const available = speechSynthesis.getVoices();
      if (available.length) {
        voices.set(available);
        if (!get(selectedVoiceURI)) {
          selectedVoiceURI.set(available[0].voiceURI);
        }
      }
    }
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    loadVoices();
  });

  let newName = '';
</script>

<h1>Settings</h1>

<section class="mb-5">
  <h2>User Profiles</h2>
  <ul class="list-group mb-3">
    {#each $users as u}
      <li class="list-group-item d-flex justify-content-between align-items-center">
        {u.name}
        <div>
          <!-- <button class="btn btn-sm btn-outline-primary me-2" on:click={() => currentUserId.set(u.id)}>
            Use
          </button> -->
          <button
            class="btn btn-sm me-2"
            class:btn-primary={u.id === $currentUserId}
            class:btn-outline-primary={u.id !== $currentUserId}
            on:click={() => currentUserId.set(u.id)}
          >
            Use
          </button>
          <button class="btn btn-sm btn-outline-danger" on:click={() => {
            users.update(arr => arr.filter(x => x.id !== u.id));
            if (get(currentUserId) === u.id) currentUserId.set(null);
          }}>
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>

  <div class="input-group">
    <input
      class="form-control"
      placeholder="New profile name"
      bind:value={newName}
    />
    <button class="btn btn-success" on:click={() => {
      const id = Date.now().toString();
      users.update(arr => [...arr, { id, name: newName }]);
      currentUserId.set(id);
      newName = '';
    }}>
      Add Profile
    </button>
  </div>
</section>

<hr />

<section>
  <h2>Voice & Speech</h2>
  <div class="mb-3">
    <label class="form-label">Voice</label>
    <select bind:value={$selectedVoiceURI} class="form-select">
      {#each $voices as v}
        <option value={v.voiceURI}>{v.name} ({v.lang})</option>
      {/each}
    </select>
  </div>
  <div class="mb-3">
    <label class="form-label">Rate: {$rate.toFixed(1)}×</label>
    <input
      type="range"
      min="0.5"
      max="2.0"
      step="0.1"
      bind:value={$rate}
      class="form-range"
    />
  </div>
  <button class="btn btn-secondary" on:click={() => speak('Testing your new voice settings!')}>
    Test Voice
  </button>
</section>
