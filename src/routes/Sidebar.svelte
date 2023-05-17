<script lang="ts">
  import {
    faClipboardUser,
    faFileCsv,
    faSquareMinus,
    faSquarePlus,
  } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import report from '$lib/report';
  import { filter, input, type Filter } from '$lib/storage';

  function onClickInputOpen() {
    $input.open = !$input.open;

    if (!$input.open) {
      report.generate($input.value.split('\n').map((csv) => csv.trim()));

      // Don't pollute history
      if (report.hash !== $page.url.searchParams.get('report')) {
        $page.url.searchParams.set('report', report.hash);
        goto(`?${$page.url.searchParams.toString()}`);
      }
    }
  }

  function onClickToggle(toggle: keyof Pick<Filter['threshold'], 'above' | 'below'>) {
    $filter.threshold[toggle] = !$filter.threshold[toggle];
  }
</script>
<aside class="panel is-flex is-flex-direction-column">
  <p class="panel-heading">
    RPUK Activity Analyser
  </p>
  <div class="panel-block">
    <button class="button is-primary is-outlined is-fullwidth"
        disabled={$input.open && (!$input.value.length || !$input.valid)}
        on:click={onClickInputOpen}>
      {#if $input.open}
      <span class="icon is-small">
        <FaIcon icon={faClipboardUser} />
      </span>
      <span>Generate Report</span>
      {:else}
      <span class="icon is-small">
        <FaIcon icon={faFileCsv} />
      </span>
      <span>Import CSV</span>
      {/if}
    </button>
  </div>
  <!-- svelte-ignore a11y-missing-attribute -->
  <div class="panel-block is-flex-direction-column is-align-items-stretch is-unselectable"
      class:is-active={false}
      on:click
      on:dblclick
      role="presentation">
    <div class="field has-addons is-flex-grow-1">
      <p class="control">
        <a class="button is-static">
          Threshold
        </a>
      </p>
      <p class="control is-expanded">
        <input class="input"
            type="number"
            min="0"
            placeholder="Hours per month"
            bind:value={$filter.threshold.value}>
      </p>
      {#if $filter.threshold.value !== null}
        <p class="control">
          <button class="button {$filter.threshold.above ? 'is-primary is-outlined' : ''}"
              on:click={() => onClickToggle('above')}>
            <FaIcon icon={$filter.threshold.above ? faSquareMinus : faSquarePlus}
                class="mr-1" />
            Above
          </button>
        </p>
        <p class="control">
          <button class="button {$filter.threshold.below ? 'is-primary is-outlined' : ''}"
            on:click={() => onClickToggle('below')}>
            <FaIcon icon={$filter.threshold.below ? faSquareMinus : faSquarePlus}
                class="mr-1" />
            Below
          </button>
        </p>
      {/if}
    </div>
    <div class="field has-addons is-flex-grow-1">
      <p class="control">
        <a class="button is-static">
          Filter
        </a>
      </p>
      <p class="control is-expanded">
        <input class="input"
            type="text"
            placeholder="Discord/Char ID, Rank or Name"
            bind:value="{$filter.query}">
      </p>
    </div>
  </div>
</aside>
<style lang="scss">
  .panel {
    position: sticky;
    max-height: 100vh;
    top: 0.75rem;
    bottom: 0.75rem;
    animation: .5s ease-in-out 0s 1 slideInFromLeft;
  }

  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-200%);
    }
    100% {
      transform: translateX(0);
    }
  }
</style>
