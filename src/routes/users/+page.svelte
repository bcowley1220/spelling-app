<script>
    import { users, currentUserId } from '$lib/user';
    import { goto }                 from '$app/navigation';
  
    let newName = '';
  
    function addUser() {
      const name = newName.trim();
      if (!name) return;
      const id = Date.now().toString();
      users.update(u => [...u, { id, name }]);
      currentUserId.set(id);
      newName = '';
      goto('/');
    }
  
    function selectUser(id) {
      currentUserId.set(id);
      goto('/');
    }
  
    function deleteUser(id) {
      users.update(u => u.filter(x => x.id !== id));
      currentUserId.update(cur => (cur === id ? null : cur));
    }
  </script>
  
  <h1 class="mb-4">Who’s Practicing?</h1>
  
  <ul class="list-group mb-4">
    {#each $users as u}
      <li class="list-group-item d-flex justify-content-between align-items-center">
        {u.name}
        <div>
          <button class="btn btn-sm btn-primary me-2" on:click={() => selectUser(u.id)}>
            Use
          </button>
          <button class="btn btn-sm btn-danger" on:click={() => deleteUser(u.id)}>
            Delete
          </button>
        </div>
      </li>
    {/each}
  </ul>
  
  <div class="d-flex">
    <input
      bind:value={newName}
      class="form-control me-2"
      placeholder="New profile name"
    />
    <button class="btn btn-success" on:click={addUser}>
      Add Profile
    </button>
  </div>
  