<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { wordLists, attempts, troubleWords } from '$lib/stores';
  import { users, currentUserId, currentUser } from '$lib/user';
  import { voices, selectedVoiceURI, rate } from '$lib/speechSettings';
  import { speak } from '$lib/speech';

  // Redirect if no profile selected
  onMount(() => {
    if (!get(currentUserId)) {
      goto('/users');
    }
  });

  // Load TTS voices with fallback
  function loadVoices() {
    const available = speechSynthesis.getVoices();
    if (available.length) {
      voices.set(available);
      if (!get(selectedVoiceURI)) {
        selectedVoiceURI.set(available[0].voiceURI);
      }
    }
  }
  onMount(() => {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    const interval = setInterval(loadVoices, 200);
    setTimeout(() => clearInterval(interval), 5000);
  });

  // User profile management
  let newName = '';
  function addUser() {
    const name = newName.trim();
    if (!name) return;
    const id = Date.now().toString();
    users.update(arr => [...arr, { id, name }]);
    currentUserId.set(id);
    newName = '';
  }
  function deleteUser(id) {
    users.update(arr => arr.filter(u => u.id !== id));
    if (get(currentUserId) === id) currentUserId.set(null);
  }

  // Compute stats for each week
  $: stats = Object.entries($wordLists).map(([id, words]) => {
    const recs = $attempts[id] || [];
    const totalAttempts = recs.length;
    const correctCount = recs.filter(r => r.correct).length;

    const passed = new Set(recs.filter(r => r.correct).map(r => r.word));
    const accuracy = totalAttempts ? Math.round(100 * correctCount / totalAttempts) : 0;
    const complete = passed.size === words.length;
    const issues = $troubleWords[id] || [];

    return { id, words, totalAttempts, correctCount, accuracy, complete, issues };
  });

  // Repeat workflow
  function repeatWeek(id) {
    if (!confirm('This will reset your progress for this week. Continue?')) return;
    attempts.update(a => { delete a[id]; return a; });
    troubleWords.update(t => { delete t[id]; return t; });
    goto(`/practice/${id}`);
  }
</script>

<main class="container my-4">
  {#if $currentUser}
    <h1 class="mb-4">Hello, {$currentUser.name}!</h1>
  {/if}
  <!-- Row 1: Settings Cards -->
  <div class="row g-4 mb-4">
    <!-- Profile Card -->
    <div class="col-md-6">
      <div class="card p-3">
        <h5>User Profiles</h5>
        <ul class="list-group mb-3">
          {#each $users as u}
            <li class="list-group-item d-flex justify-content-between align-items-center">
              {u.name}
              <div>
                <button
                  class="btn btn-sm me-2"
                  class:btn-primary={u.id === $currentUserId}
                  class:btn-outline-primary={u.id !== $currentUserId}
                  on:click={() => currentUserId.set(u.id)}
                >
                  Use
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  on:click={() => deleteUser(u.id)}
                >
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
          <button class="btn btn-success" on:click={addUser}>
            Add Profile
          </button>
        </div>
      </div>
    </div>

    <!-- Voice Settings Card -->
    <div class="col-md-6">
      <div class="card p-3">
        <h5>Voice &amp; Speech</h5>
        {#if $voices.length === 0}
          <div class="alert alert-warning d-flex align-items-center" role="alert">
            <div>No TTS voices detected. Voice features will not work.</div>
            <button class="btn btn-sm btn-outline-secondary ms-auto" on:click={loadVoices}>
              Reload Voices
            </button>
          </div>
        {/if}
        <div class="mb-3">
          <label class="form-label">Voice</label>
          <select bind:value={$selectedVoiceURI} class="form-select">
            {#each $voices as v}
              <option value={v.voiceURI}>{v.name} ({v.lang})</option>
            {/each}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Rate: {$rate.toFixed(1)}&times;</label>
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
      </div>
    </div>
  </div>

  <!-- Dashboard Header -->


  <!-- Row 2: Spelling Weeks -->
   <div class="card p-3">
    <h5 class="mb-3">Your Spelling Lists</h5>
    <ul class="list-group">
      {#each stats as stat}
        <li class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>{new Date(+stat.id).toLocaleDateString()}</strong>
              &mdash; {stat.correctCount}/{stat.totalAttempts} correct ({stat.accuracy}%)
            </div>
            <div class="text-end">
              {#if stat.complete}
                <span class="badge bg-success me-2">Complete</span>
              {:else}
                <span class="badge bg-warning text-dark me-2">In Progress</span>
              {/if}
              {#if !stat.complete}
                <a
                  href={`/practice/${stat.id}`}
                  class="btn btn-sm btn-primary me-2"
                >Practice</a>
              {/if}
              {#if stat.complete}
                <button
                  class="btn btn-sm btn-warning"
                  on:click={() => repeatWeek(stat.id)}
                >
                  Repeat
                </button>
              {/if}
            </div>
          </div>
  
          {#if stat.issues.length}
            <div class="mt-2 text-danger small">
              ⚠️ Trouble words: {stat.issues.join(', ')}
            </div>
          {/if}
  
          {#if stat.words.length}
            <div class="mt-2 small">
              <span class="fw-bold me-2">Words:</span>
              {#each stat.words as w}
                <span class="badge bg-secondary me-1">{w}</span>
              {/each}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
   </div>
  
</main>
