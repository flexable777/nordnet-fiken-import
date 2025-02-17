<script lang="ts">
  import type { CsvFile } from "@app/lib/csv";
  import { parseCsvFiles } from "@app/lib/csv";
  import type { Snippet } from "svelte";

  type OnFiles = (files: CsvFile[]) => void;

  interface Props {
    onFiles: OnFiles;
    children: Snippet;
  }

  let { onFiles, children }: Props = $props();

  let isDragOver = $state<boolean>(false);

  let onDrop = async (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = false;

    if (event.dataTransfer === null) {
      return;
    }

    const parsed = await parseCsvFiles(event.dataTransfer.files);

    onFiles(parsed);
  };
</script>

<main
  ondrop={onDrop}
  ondragover={(e) => {
    e.preventDefault();
    isDragOver = true;
  }}
  ondragexit={() => {
    isDragOver = false;
  }}
  ondragleave={() => {
    isDragOver = false;
  }}
  class:drag-over={isDragOver}
>
  {@render children()}
</main>

<footer>
  Denne tjenesten har ingen relasjon til Fiken eller Nordnet. Bruk på eget ansvar.
</footer>

<style>
  main {
    width: 100%;
    padding: 16px;
    padding-bottom: 64px;
    border-radius: 16px;
    border-width: 3px;
    border-style: dashed;
    border-color: transparent;
    transition: border-color 0.2s ease-in-out;
    overflow: visible;
    position: relative;
    flex-grow: 1;
    flex-shrink: 0;

    &.drag-over {
      border-color: var(--primary-500);

      &::before {
        content: "Slipp filene her";
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2em;
        color: var(--primary-500);
        backdrop-filter: blur(4px);
        transition: backdrop-filter 0.2s ease-in-out;
      }
    }
  }

  footer {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-grow: 0;
    flex-shrink: 0;
    padding: 16px;
    background-color: var(--surface-900);
    box-shadow: 0 -8px 8px rgba(0, 0, 0, 0.1);
    font-style: italic;
  }
</style>
