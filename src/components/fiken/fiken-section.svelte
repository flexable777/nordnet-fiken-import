<script lang="ts">
  import Section from "@app/components/section.svelte";
  import Header from "@app/components/header.svelte";
  import Heading from "@app/components/heading.svelte";
  import Button from "@app/components/button.svelte";
  import Modal from "@app/components/modal.svelte";
  import Table from "@app/components/table.svelte";
  import { FIKEN_TABLE_HEADERS } from "@app/lib/fiken";
  import { downloadFikenLinesCsv } from "@app/lib/download";
  import type { FikenFile } from "@app/lib/fiken";
  import DownloadIcon from "virtual:icons/mdi/download";
  import HelpIcon from "virtual:icons/mdi/help-circle";
  import WarningIcon from "virtual:icons/mdi/warning";
  import FikenRow from "@app/components/fiken/fiken-row.svelte";
  import { isLastDayOfMonth } from "date-fns";

  let { fileName, rows }: FikenFile = $props();

  let showModal = $state(false);
  let errorMessage = $state<string | null>(null);
  let showErrorModal = $state(false);
    
  const onClose = () => { showModal = false; };
  const onOpen = () => { showModal = true; };
  const closeError = () => { showErrorModal = false; };

  const onClick = () => {
    try {
      downloadFikenLinesCsv(rows, fileName);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        errorMessage = error.message;
        showErrorModal = true;
      }
    }
  };

  const lastRow = rows.at(-1);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isCurrentMonth = lastRow !== undefined && lastRow.generated && lastRow.year === currentYear && lastRow.month === currentMonth && !isLastDayOfMonth(now);

  const isGenerated = rows.every((row) => row.generated);
</script>

<Section variant={"surface"}>
  <Header>
    <Heading level={3} size="small">
      <span>{fileName}</span>
    </Heading>
    
    <div class="button-container">
      {#if isCurrentMonth}
        <Button variant="warning" size="small" icon={warningIcon} onclick={onOpen}>Inneværende</Button>
        <Modal isOpen={showModal} onClose={onClose} variant="warning">
          <div>
            Dette er inneværende måned, i følge datoen på din enhet, og er derfor ufullstendig.
          </div>
          <div>
            Fiken vil ikke kunne avstemme måneden før den er over.
          </div>
        </Modal>
      {/if}

      {#if isGenerated}
        <Button variant="secondary" size="small" icon={helpIcon} onclick={onOpen}>Generert</Button>
        <Modal isOpen={showModal} onClose={onClose}>
          Denne måneden er fylt inn for at Fiken skal kunne avstemme måneden.
        </Modal>
      {/if}

      <Button onclick={onClick} variant="primary" size="small" icon={downloadIcon}>
        Last ned
      </Button>
      <Modal isOpen={showErrorModal} onClose={closeError} variant="error">
        {errorMessage}
      </Modal>
    </div>
  </Header>
  
  <Table
    headers={FIKEN_TABLE_HEADERS}
    showLineNumbers
    rowCount={rows.length}
  >
    {#each rows as line, lineNumber}
      <FikenRow {line} {lineNumber} />
    {/each}
  </Table>
</Section>

{#snippet downloadIcon()}
  <DownloadIcon  />
{/snippet}

{#snippet helpIcon()}
  <HelpIcon />
{/snippet}

{#snippet warningIcon()}
  <WarningIcon />
{/snippet}

<style>
  .button-container {
    display: flex;
    gap: 0.5rem;
  }
</style>
