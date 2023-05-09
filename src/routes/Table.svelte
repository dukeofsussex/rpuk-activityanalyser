<script lang="ts">
  import { format } from 'date-fns';
  import { flip } from 'svelte/animate';
  import report from '$lib/report';
  import { filter } from '$lib/storage';

  $: months = $report.length
    ? Object.keys($report[0].months).sort((a, b) => a.localeCompare(b))
    : [];
  $: monthHideAbove = months[months.length - 1];
  $: table = $report.filter((row) => (!$filter.query.length
        || (row.discordId === $filter.query)
        || (row.id.toString() === $filter.query)
        || row.name.toLowerCase().includes($filter.query.toLowerCase())
        || (row.rank.toString() === $filter.query))
      && ($filter.threshold.value === null
        || ($filter.threshold.above && row.months[monthHideAbove] > $filter.threshold.value)
        || ($filter.threshold.below && row.months[monthHideAbove] <= $filter.threshold.value)))
    .sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name));

  function getColour(hours?: number) {
    if (hours === 0) {
      return 'has-background-danger';
    }

    if ($filter.threshold.value !== null && hours && hours <= $filter.threshold.value) {
      return 'has-background-warning';
    }

    return null;
  }
</script>
<table class="table is-striped is-hoverable">
  <thead>
    <tr>
      <th>ID</th>
      <th>[Rank] Name</th>
      {#each months as month}
        <th>{format(new Date(month), 'MMM yyyy')}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each table as row (row.id)}
      <tr animate:flip="{{ duration: 250 }}">
        <td>{row.id}</td>
        <td>
          [ {row.rank} ]
          {#if row.discordId}
            <a href={`discord://-/users/${row.discordId}`}
                class="has-text-primary"
                target="_blank"
                rel="noopener noreferrer">
              {row.name}
            </a>
          {:else}
            {row.name}
          {/if}
        </td>
        {#each months as month}
          <td class={getColour(row.months[month])}>
            {(Object.hasOwn(row.months, month) ? row.months[month] : '-')}
          </td>
        {/each}
      </tr>
    {/each}
    {#if !table.length}
      <tr>
        <td colspan={2 + months.length}
            class="has-text-centered">
          Nothing to display
        </td>
      </tr>
    {/if}
  </tbody>
</table>
<style lang="scss">
  @import '../styles/variables';

  tr:hover {
    .has-background-danger {
      background-color: darken($red, 5%) !important;
    }

    .has-background-warning {
      background-color: darken($yellow, 5%) !important;
    }
  }

  .has-background-danger {
    background-color: darken($red, 10%) !important;
  }

  .has-background-warning {
    background-color: darken($yellow, 10%) !important;
    color: $black;
  }
</style>
