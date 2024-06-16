<script lang="ts">
  import { format, parse } from "date-fns";
  import { nb } from "date-fns/locale/nb";
  import Section from "./section.svelte";
  import Header from "./header.svelte";
  import Heading from "./heading.svelte";
  import Button from "./button.svelte";
  import Modal from "./modal.svelte";
  import Table from "./table.svelte";
  import { prettyFormatMoney } from "@app/lib/money";
  import { FIKEN_TABLE_HEADERS } from "@app/lib/fiken";
  import { downloadFikenLinesCsv } from "@app/lib/download";
  import type { FikenLine } from "@app/lib/fiken";
  import DownloadIcon from "virtual:icons/mdi/download";
  import HelpIcon from "virtual:icons/mdi/help-circle";
  import ErrorIcon from "virtual:icons/mdi/error";

  interface Props {
    fileName: string;
    fikenLines: FikenLine[];
  }

  let { fileName, fikenLines }: Props = $props();

  let showModal = $state(false);
</script>

<Section variant="surface">
  <Header>
    <Heading level={3} size="small">
      <span>{fileName}</span>
    </Heading>
    
    <div class="button-container">
      {#if fikenLines.length === 1 && fikenLines[0].referanse === null}
        <Button variant="secondary" size="small" icon={helpIcon} onclick={() => {showModal = true;}} />
        <Modal isOpen={showModal} onClose={() => {showModal = false;}}>
          Denne måneden er fylt inn for at Fiken skal kunne avstemme måneden.
        </Modal>
      {/if}

      {#if fikenLines.some(l => l.difference !== 0)}
        <Button variant="error" size="small" icon={errorIcon} onclick={() => {showModal = true;}} />
        <Modal isOpen={showModal} onClose={() => {showModal = false;}} variant="error">
          Det er forskjell i inngående beløp og forrige saldo.
        </Modal>
      {:else}
        <Button onclick={() => downloadFikenLinesCsv(fikenLines, format(parsedKey, 'yyyy.MM'))} variant="primary" size="small" icon={downloadIcon}>
          Last ned
        </Button>
      {/if}
    </div>
  </Header>
  
  <Table
    headers={FIKEN_TABLE_HEADERS}
    rows={fikenLines.toSorted((a,b) => a.bokførtDato.getTime() - b.bokførtDato.getTime()).map((l) => [
      format(l.bokførtDato, 'dd. MMM yyyy', { locale: nb }),
      l.fraKonto,
      l.tilKonto,
      l.forklarendeTekst,
      prettyFormatMoney(l.inngående),
      prettyFormatMoney(l.ut),
      prettyFormatMoney(l.inn),
      prettyFormatMoney(l.saldo),
      l.referanse,
      prettyFormatMoney(l.difference),
      l.source.fileName === null ? null : `${l.source.fileName} (${l.source.rowNumber + 1})`,
    ])}
  />
</Section>

{#snippet downloadIcon()}
  <DownloadIcon  />
{/snippet}

{#snippet helpIcon()}
  <HelpIcon />
{/snippet}

{#snippet errorIcon()}
  <ErrorIcon />
{/snippet}

<style>
  .button-container {
    display: flex;
    gap: 0.5rem;
  }
</style>