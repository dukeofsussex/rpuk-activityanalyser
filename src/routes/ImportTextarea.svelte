<script lang="ts">
  import { faWarning } from '@fortawesome/free-solid-svg-icons';
  import { fly } from 'svelte/transition';
  import FaIcon from 'svelte-fa';
  import { input } from '$lib/storage';

  $: $input.valid = $input.value.length === 0 || $input.value.split('\n').every((csv) => /https?:\/\/.*\d{4}-\d{2}-\d{2}/.test(csv));
</script>

{#if $input.open}
  <div class="panel is-flex is-flex-direction-column"
      in:fly="{{ duration: 500, y: -500 }}"
      out:fly="{{ duration: 250, y: -500 }}">
    <p class="panel-heading">
      CSVs
    </p>
    <div class="panel-block is-flex-direction-column">
      <textarea class="textarea"
          class:is-danger={!$input.valid}
          placeholder="https://cdn.discordapp.com/attachments/XXXXXXXXXXXXXXXXXXX/YYYYYYYYYYYYYYYYYYY/results_<group>_hours_<date>_<time>.csv
https://cdn.discordapp.com/attachments/XXXXXXXXXXXXXXXXXXX/ZZZZZZZZZZZZZZZZZZ/results_<group>_hours_<date>_<time>.csv"
          rows="10"
          bind:value={$input.value} />
        {#if !$input.valid}
          <p class="help is-danger">
            <FaIcon icon={faWarning} />
            CSV links must contain the date formatted as
            <code class="has-background-danger has-text-dark has-text-weight-bold">YYYY-MM-DD</code>
          </p>
        {/if}
    </div>
  </div>
{/if}
