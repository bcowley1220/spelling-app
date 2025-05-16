<script>
    import 'bootstrap/dist/css/bootstrap.min.css';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import { currentUser } from '$lib/user';
    import { theme } from '$lib/theme';
    import '../app.css';
    import { onMount } from 'svelte';
    import { goto }    from '$app/navigation';

    onMount(() => {
      console.log($currentUser);
        if (!$currentUser) {
        goto('/users');
        }
    });

  </script>
  
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">Spelling App</a>
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <!-- <a class="nav-link" href="/users">
            {#if $currentUser}
              User: {$currentUser?.name}
            {:else}
              Select User
            {/if}
          </a> -->
        </li>
        <li class="nav-item"><a class="nav-link" href="/">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="/admin">Manage Lists</a></li>
        <!-- <li class="nav-item"><a class="nav-link" href="/settings">Settings</a></li> -->
      </ul>
      <button
    class="btn btn-sm btn-outline-light ms-3"
    aria-label="Toggle dark mode"
    on:click={() => theme.update(t => t === 'light' ? 'dark' : 'light')}
  >
    {#if $theme === 'light'}🌙 Dark{:else}☀️ Light{/if}
  </button>
    </div>
  </nav>
  
  
  <main class="container my-4">
    <slot />
  </main>

  <style>
    
  </style>