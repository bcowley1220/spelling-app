<script>
    import { wordLists } from '$lib/stores';
    let textarea = '';
  
    function saveWeek() {
      const words = textarea.split(/[\s,]+/).filter(w => w).map(w => w.trim());
      const id    = Date.now().toString();
      wordLists.update(lists => {
        lists[id] = words;
        return lists;
      });
      textarea = '';
    }
  
    function deleteWeek(id) {
      wordLists.update(lists => {
        delete lists[id];
        return lists;
      });
    }
  </script>
  
  <h1 class="mb-4">Manage Spelling Lists</h1>
  
  <div class="mb-3">
    <textarea
      bind:value={textarea}
      class="form-control"
      rows="3"
      placeholder="Enter comma‑separated words… ex: card, bike, educate"
    ></textarea>
    <button class="btn btn-success mt-2" on:click={saveWeek}>
      Save New Week
    </button>
  </div>
  
  <ul class="list-group">
    {#each Object.entries($wordLists) as [id, words]}
      <li class="list-group-item d-flex justify-content-between align-items-center">
        {new Date(+id).toLocaleDateString()} — {words.join(', ')}
        <button class="btn btn-sm btn-danger" on:click={() => deleteWeek(id)}>
          Delete
        </button>
      </li>
    {/each}
  </ul>
  