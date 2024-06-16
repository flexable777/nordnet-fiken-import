<script lang="ts">
  import AppContainer from "@app/components/app-container.svelte";
  import Heading from "@app/components/heading.svelte";
  import Button from "@app/components/button.svelte";
  import Row from "@app/components/row.svelte";
  import CSV from "@app/components/csv.svelte";
  import UploadButton from "@app/components/upload-button.svelte";
  import { toNordnetLines } from "@app/lib/nordnet/csv-to-nordnet-lines";
  import { toFikenLines, type FikenFile } from "@app/lib/fiken";
  import { downloadFikenMapMultipleCsv, downloadFikenMapSingleCsv } from "@app/lib/download";
  import DownloadIcon from "virtual:icons/mdi/download";
  import DownloadMultipleIcon from "virtual:icons/mdi/download-multiple";
  import type { CsvFile } from "@app/lib/csv";
  import Input from "@app/components/input.svelte";
  import FikenSection from "@app/components/fiken-section.svelte";
  import { SvelteMap } from 'svelte/reactivity';

  let error = $state<string | null>(null);

  let fromAccount = $state(window.localStorage.getItem("fromAccount") ?? "");

  const onFromAccountChange = (value: string) => {
    fromAccount = value;
    localStorage.setItem("fromAccount", value);
  };

  let csvFileMap = $state<SvelteMap<string, CsvFile>>(new SvelteMap());
  let fikenFiles = $state<FikenFile[]>([]);

  const setFiles = (files: CsvFile[]) => {
    for (const file of files) {
      csvFileMap.set(file.fileName, file);
    }
  };

  $effect(() => {
    const sortedCsvFiles = [...csvFileMap.values()].sort((a, b) => a.fileName.localeCompare(b.fileName));
    try {
      const nordnetLines = toNordnetLines(sortedCsvFiles);
      fikenFiles = toFikenLines(nordnetLines, fromAccount.length === 0 ? '<mangler>' : fromAccount);
    } catch (error) {
      if (error instanceof Error) {
        error = error.message;
      } else {
        error = "Ukjent feil";
      }
    }
  });
</script>

<AppContainer onFiles={setFiles}>
  <header class="header">
    <Heading level={1} size="large" centered>Nordnet til Fiken</Heading>
    <p class="description">Konverter CSV eksportert fra Nordnet til et format Fiken forstår.</p>
  </header>
  
  <section>
    <Heading level={1} size="small" spacing>Nordnet</Heading>
  
    <Row>
      <UploadButton onFiles={setFiles} />
    </Row>
  
    {#if csvFileMap.size === 0}
      <p>
        <em>
          Dra og slipp CSV-filer fra Nordnet hvor som helst for å få de oversatt
          til et format Fiken forstår.
        </em>
      </p>
    {:else}
      {#each csvFileMap as [fileName, { data }]}
        <CSV {fileName} {data} />
      {/each}
    {/if}
  </section>

  {#if error !== null}
    <section>
      <Heading level={1} size="small" spacing>Feil</Heading>
      <p>{error}</p>
    </section>
  {/if}

  <section>
    {#if fikenFiles.length !== 0}
      <Heading level={1} size="small" spacing>Fiken</Heading>

      <Input onchange={onFromAccountChange} value={fromAccount} label="Fra konto (kontonummer)" placeholder="Kontonummer" />
  
      {#each fikenFiles as { fileName, rows }}
        <FikenSection {fileName} fikenLines={rows} />
      {/each}

      <Row>
        <Button onclick={() => downloadFikenMapSingleCsv(fikenFiles.flatMap((f) => f.rows))} variant="primary" size="large" icon={downloadIcon}>
          Last ned alle - én fil
        </Button>
        <Button onclick={() => downloadFikenMapMultipleCsv(fikenFiles)} variant="primary" size="large" icon={downloadMultipleIcon}>
          Last ned alle - én fil per måned
        </Button>
      </Row>
    {/if}
  </section>

</AppContainer>

{#snippet downloadIcon()}
  <DownloadIcon  />
{/snippet}

{#snippet downloadMultipleIcon()}
  <DownloadMultipleIcon  />
{/snippet}

<style>
  .header {
    display: flex;
    flex-direction: column;
    margin-bottom: 2em;
  }

  .description {
    margin: 0;
    font-style: italic;
    text-align: center;
  }
</style>