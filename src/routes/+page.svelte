<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { wordLists, attempts, troubleWords } from '$lib/stores';
  import { currentUser } from '$lib/user';

  // Redirect if no profile
  onMount(() => {
    if (!$currentUser) {
      goto('/users');
    }
  });

  // Compute stats for each week
  $: stats = Object.entries($wordLists).map(([id, words]) => {
    const recs          = $attempts[id]    || [];
    const totalAttempts = recs.length;
    const correctCount  = recs.filter(r => r.correct).length;
    const accuracy      = totalAttempts
      ? Math.round((100 * correctCount) / totalAttempts)
      : 0;

    const passed        = new Set(recs.filter(r => r.correct).map(r => r.word));
    const complete      = passed.size === words.length;
    const issues        = $troubleWords[id] || [];

    return { id, words, totalAttempts, correctCount, accuracy, complete, issues };
  });

  // Repeat a week by clearing attempts & issues
  function repeatWeek(id) {
    if (!confirm('This will reset your progress for this week. Continue?')) return;
    attempts.update(a => { delete a[id]; return a; });
    troubleWords.update(t => { delete t[id]; return t; });
    goto(`/practice/${id}`);
  }
</script>

{#if Object.keys($wordLists).length === 0}
  <div class="alert alert-info">
    <h4>Welcome{#if $currentUser}, {$currentUser.name}{/if}!</h4>
    <p>Let's set up your first spelling list:</p>
    <ol>
      <li>Go to <a href="/admin">Spelling Lists</a> and add a new list.</li>
      <li>Return here and click Practice to start.</li>
    </ol>
    <a href="/admin" class="btn btn-primary">Create Spelling List</a>
  </div>
{:else}
  {#if $currentUser}
    <h1 class="mb-4">Hello, {$currentUser.name}!</h1>
  {/if}

  <!-- Week List with Completion, Issues, Words & Actions -->
  <ul class="list-group">
    {#each stats as stat}
      <li class="list-group-item">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>{new Date(+stat.id).toLocaleDateString()}</strong>
            — {stat.correctCount}/{stat.totalAttempts} correct ({stat.accuracy}%)
          </div>
          <div class="text-end">
            {#if stat.complete}
              <span class="badge bg-success me-2">Complete</span>
            {:else}
              <span class="badge bg-warning text-dark me-2">In Progress</span>
            {/if}

            {#if !stat.complete}
              <a href={`/practice/${stat.id}`} class="btn btn-sm btn-primary me-2">
                Practice
              </a>
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
            <span class="fw-bold">Words:</span>
            {#each stat.words as w}
              <span class="badge bg-secondary me-1">{w}</span>
            {/each}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
