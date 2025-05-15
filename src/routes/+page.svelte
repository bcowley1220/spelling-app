<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import Chart from 'chart.js/auto';
    import { wordLists, attempts } from '$lib/stores';
    import { gamify } from '$lib/gamification';
  
    let chart;
    let chartCanvas;
  
    // Compute stats for each week
    $: stats = Object.entries($wordLists).map(([id, words]) => {
      const recs    = $attempts[id]  || [];
      const total   = recs.length;
      const correct = recs.filter(r => r.correct).length;
      const accuracy = total ? Math.round(100 * correct / total) : 0;
  
      return { id, total, correct, accuracy };
    });
  
    // Labels and data arrays for Chart.js
    $: labels      = stats.map(s => new Date(+s.id).toLocaleDateString());
    $: accuracies  = stats.map(s => s.accuracy);
  
    onMount(() => {
      console.log($wordLists)
      // if (browser && stats.length) {
      //   chart = new Chart(chartCanvas, {
      //     type: 'line',
      //     data: {
      //       labels,
      //       datasets: [{
      //         label: 'Accuracy (%)',
      //         data: accuracies,
      //         fill: false,
      //         tension: 0.3
      //       }]
      //     },
      //     options: {
      //       scales: {
      //         y: {
      //           min: 0,
      //           max: 100,
      //           title: { display: true, text: 'Accuracy (%)' }
      //         },
      //         x: {
      //           title: { display: true, text: 'Week' }
      //         }
      //       },
      //       plugins: {
      //         legend: { display: false },
      //         tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}%` } }
      //       }
      //     }
      //   });
      // }
  
      // return () => {
      //   if (chart) chart.destroy();
      // };
    });
  </script>
  
  <!-- <h1 class="mb-4">Weekly Progress</h1>
  <div class="mb-4 p-3 rounded">
    <h2>🏆 Your Progress</h2>
    <p>XP: <strong>{$gamify.xp}</strong></p>
    <p>Streak: <strong>{$gamify.streak}</strong> days</p>
    {#if $gamify.badges.length}
      <p>Badges:</p>
      <ul>
        {#each $gamify.badges as badge}
          <li>🎖️ {badge}</li>
        {/each}
      </ul>
    {/if}
  </div> -->
  
  <!-- Chart Card -->
  <!-- <div class="card mb-4">
    <div class="card-body">
      <canvas bind:this={chartCanvas}></canvas>
    </div>
  </div> -->
  
  <!-- Stats List -->
  <!-- <ul class="list-group">
    {#each stats as s}
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>{new Date(+s.id).toLocaleDateString()}</strong>
          — {s.correct}/{s.total} correct ({s.accuracy}%)
        </div>
        <a href={`/practice/${s.id}`} class="btn btn-sm btn-primary">
          Practice
        </a>
      </li>
    {/each}
  </ul> -->
  {#if Object.keys($wordLists).length === 0}
  <!-- this will actually be caught by your redirect, but you could show a CTA here -->
  <div class="alert alert-info">
    <h4>Welcome!</h4>
    <p>To get started:</p>
    <ol>
      <li>Create a new spelling list under Manage Lists.”</li>
      <li>Then come back here and click “Practice.”</li>
    </ol>
    <a class="btn btn-primary" href="/admin">Go to Spelling Lists</a>
  </div>
{:else}
  <div class="row g-3">
    {#each Object.entries($wordLists) as [id, words]}
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">
              Week of {new Date(+id).toLocaleDateString()}
            </h5>
            <p class="card-text mt-auto">
              {words.length} words<br>
              <!-- Accuracy: {accuracy}% -->
            </p>
            <a href={`/practice/${id}`} class="btn btn-primary mt-2">
              Practice Now
            </a>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}