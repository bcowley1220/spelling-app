<!-- src/routes/practice/[id]/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { onDestroy } from 'svelte';
  import { wordLists, attempts, troubleWords } from '$lib/stores';
  import { gamify } from '$lib/gamification';
  import { speak } from '$lib/speech';
  import confetti from 'canvas-confetti';
  import { onMount } from 'svelte';

  let listId = '';
  let originalWords = [];
  let wordsToPractice = [];
  let current = '';
  let answer = '';

  // Track completed words
  let passedWords = [];

  // Toast state
  let showToast = false;
  let toastMessage = '';
  let toastType = 'success';
  let toastTimeout;

  // Track confetti delay
  let delayTimeout;

  // Watch route param
  $: listId = $page.params.id;

  // Load initial pool on mount
  onMount(() => {
    originalWords = $wordLists[listId] || [];
    refreshPool();
    pickNext();
  });

  function refreshPool() {
    const session = $attempts[listId] || [];
    const passed = new Set(
      session.filter(a => a.correct).map(a => a.word)
    );
    wordsToPractice = originalWords.filter(w => !passed.has(w));
    passedWords = originalWords.filter(w => passed.has(w));
  }

  function pickNext() {
    refreshPool();
    if (wordsToPractice.length === 0) {
      current = '';
      return;
    }
    current = wordsToPractice[Math.floor(Math.random() * wordsToPractice.length)];
    answer = '';
    speak(current);
  }

  function celebrate() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }

  function check() {
    const ok = answer.trim().toLowerCase() === current.toLowerCase();

    // record the attempt
    attempts.update(a => {
      a[listId] = a[listId] || [];
      a[listId].push({ word: current, correct: ok, ts: Date.now() });
      return a;
    });

    // confetti + delay next pick
    if (ok) {
      celebrate();
      clearTimeout(delayTimeout);
      delayTimeout = setTimeout(() => pickNext(), 1200);
    } else {
      pickNext();
    }

    // 3-strike troubleWords tracking
    if (browser && ok) {
      // XP logic omitted for brevity
    }
    if (browser) {
      const allRecs = get(attempts)[listId] || [];
      const fails = allRecs.filter(r => r.word === current && !r.correct).length;
      if (fails >= 3) {
        troubleWords.update(t => {
          t[listId] = t[listId] || [];
          if (!t[listId].includes(current)) t[listId].push(current);
          return t;
        });
      }
    }

    // show feedback toast
    toastType = ok ? 'success' : 'danger';
    toastMessage = ok ? 'Correct!' : 'Try again!';
    showToast = true;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => (showToast = false), 2000);
  }

  function hideToast() {
    showToast = false;
  }

  onDestroy(() => {
    clearTimeout(toastTimeout);
    clearTimeout(delayTimeout);
  });
</script>

{#if wordsToPractice.length > 0}
  {#if showToast}
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:1050;">
      <div class="toast show align-items-center text-white bg-{toastType} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">{toastMessage}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" on:click={hideToast} aria-label="Close"></button>
        </div>
      </div>
    </div>
  {/if}

  <div class="card mx-auto" style="max-width:400px;">
    <div class="card-body text-center">
      <h5 class="card-title">Spell this word</h5>
      <p class="mb-3">Words left: <strong>{wordsToPractice.length}</strong></p>

      <form on:submit|preventDefault={check}>
        <button type="button" class="btn btn-outline-secondary mb-3" on:click={() => speak(current)} aria-label="Repeat word aloud">
          🔊 Repeat
        </button>

        <input bind:value={answer} class="form-control mb-3" placeholder="Type here…" autofocus />

        <button type="submit" class="btn btn-primary">Check</button>
      </form>

      {#if passedWords.length}
        <div class="mt-4 text-start">
          <h6>Completed words:</h6>
          <ul class="list-inline">
            {#each passedWords as w}
              <li class="list-inline-item badge bg-secondary me-1">{w}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="alert alert-success text-center">
    🎉 You’ve mastered all the words for this week!
    <a href="/" class="btn btn-success mt-3">Try Another Week</a>
  </div>
{/if}
