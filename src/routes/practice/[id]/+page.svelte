<!-- src/routes/practice/[id]/+page.svelte -->
<script>
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { get } from 'svelte/store';
    import { onDestroy } from 'svelte';
    import { wordLists, attempts } from '$lib/stores';
    import { gamify } from '$lib/gamification';
    import { speak } from '$lib/speech';
    import confetti from 'canvas-confetti';
  
    let listId = '';
    let originalWords = [];
    let wordsToPractice = [];
    let current = '';
    let answer = '';
  
    // Toast state
    let showToast = false;
    let toastMessage = '';
    let toastType = 'success';
    let toastTimeout;
  
    // Watch route param
    $: listId = $page.params.id;
  
    // Recompute practice pool whenever list or attempts change
    $: {
      originalWords = $wordLists[listId] || [];
      const session = $attempts[listId] || [];
      const passed = new Set(session.filter(a => a.correct).map(a => a.word));
      wordsToPractice = originalWords.filter(w => !passed.has(w));
      if (!wordsToPractice.includes(current)) {
        pickNext();
      }
    }
  
    function pickNext() {
      if (wordsToPractice.length === 0) {
        current = '';
        return;
      }
      current = wordsToPractice[
        Math.floor(Math.random() * wordsToPractice.length)
      ];
      speak(current);
      answer = '';
    }
  
    function celebrate() {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  
    function check() {
      const ok = answer.trim().toLowerCase() === current.toLowerCase();
  
      if (ok) {
        celebrate();
      }
  
      // 1) record the attempt
      attempts.update(a => {
        a[listId] = a[listId] || [];
        a[listId].push({ word: current, correct: ok, ts: Date.now() });
        return a;
      });
  
      // 2) XP & streak logic
      if (browser && ok) {
        gamify.update(g => {
          // award XP
          g.xp += 10;
  
          // update streak
          const today = new Date().toISOString().slice(0, 10);
          const yesterday = new Date(Date.now() - 864e5)
            .toISOString()
            .slice(0, 10);
  
          if (g.lastPractice === yesterday) {
            g.streak += 1;
          } else if (g.lastPractice !== today) {
            g.streak = 1;
          }
          g.lastPractice = today;
  
          // grant badges
          const b = new Set(g.badges);
          if (g.streak === 7) b.add('7‑Day Streak');
          if (g.xp >= 100) b.add('100 XP Earned');
          g.badges = [...b];
  
          return g;
        });
      }
  
      // 3) trouble-words tracking (3+ fails)
      if (browser) {
        const allRecs = get(attempts)[listId] || [];
        const fails = allRecs.filter(r => r.word === current && !r.correct).length;
        if (fails >= 3) {
          const stored = JSON.parse(localStorage.getItem('troubleWords') || '{}');
          stored[listId] = stored[listId] || [];
          if (!stored[listId].includes(current)) {
            stored[listId].push(current);
            localStorage.setItem('troubleWords', JSON.stringify(stored));
          }
        }
      }
  
      // 4) show feedback toast
      toastType = ok ? 'success' : 'danger';
      toastMessage = ok ? 'Correct!' : 'Try again!';
      showToast = true;
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => (showToast = false), 2000);
    }
  
    function hideToast() {
      showToast = false;
    }
  
    onDestroy(() => clearTimeout(toastTimeout));
  </script>
  
  {#if wordsToPractice.length > 0}
    {#if showToast}
      <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:1050;">
        <div
          class="toast show align-items-center text-white bg-{toastType} border-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="d-flex">
            <div class="toast-body">{toastMessage}</div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              on:click={hideToast}
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>
    {/if}
  
    <div class="card mx-auto" style="max-width:400px;">
      <div class="card-body text-center">
        <h5 class="card-title">Spell this word</h5>
        <p class="mb-3">
          Words left: <strong>{wordsToPractice.length}</strong>
        </p>
  
        <form on:submit|preventDefault={check}>
          <button
            type="button"
            class="btn btn-outline-secondary mb-3"
            on:click={() => speak(current)}
          >
            🔊 Repeat
          </button>
  
          <input
            bind:value={answer}
            class="form-control mb-3"
            placeholder="Type here…"
            autofocus
          />
  
          <button type="submit" class="btn btn-primary">Check</button>
        </form>
      </div>
    </div>
  {:else}
    <div class="alert alert-success text-center">
      🎉 You’ve mastered all the words for this week!
    </div>
  {/if}
  