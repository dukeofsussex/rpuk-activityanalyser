<script lang="ts">
  import '../styles/main.scss';
  import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
  import FaIcon from 'svelte-fa';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import report from '$lib/report';
  import { input } from '$lib/storage';
  import ImportTextarea from './ImportTextarea.svelte';
  import Octocat from './Octocat.svelte';
  import Sidebar from './Sidebar.svelte';
  import Table from './Table.svelte';

  afterNavigate(() => {
    const reportId = $page.url.searchParams.get('report');

    if (reportId && reportId === report.hash) {
      return;
    }

    if (reportId) {
      try {
        const csvs = report.extract(reportId);

        $input.open = false;
        $input.valid = true;
        $input.value = csvs.join('\n');

        report.generate(csvs);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Invalid report hash');
      }
    } else {
      $input.open = true;
      $input.valid = true;
      $input.value = '';
      report.generate([]);
    }
  });
</script>

<svelte:head>
  <title>RPUK Activityanalyser</title>
</svelte:head>

<main>
  <Octocat />
  <section class="columns is-hidden-touch m-0">
    <div class="column">
      <Sidebar />
    </div>
    <div class="column is-three-quarters is-flex is-flex-direction-column">
      <ImportTextarea />
      <Table />
    </div>
  </section>
  <section class="columns is-hidden-desktop">
    <div class="column is-flex is-flex-direction-column
                is-align-items-center is-justify-content-center">
      <span class="icon is-large has-text-warning">
        <FaIcon icon={faExclamationTriangle}
            size="3x" />
      </span>
      <h4 class="is-size-4 has-text-centered">
        Going to need a larger screen for this one, bossman!
      </h4>
    </div>
  </section>
</main>

<style lang="scss">
  .is-hidden-desktop {
    height: 100vh;
  }
</style>
