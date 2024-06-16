import type { Csv } from "@app/lib/csv";
import { formatMoney } from "@app/lib/money";
import { NordnetType, type NordnetLine, type NordnetLineSource } from "@app/lib/nordnet/types";
import { format } from "date-fns";

export const FIKEN_CSV_HEADERS = [
  "Bokført dato",
  "Fra konto",
  "Til konto",
  "Forklarende tekst",
  "Inngående",
  "Ut",
  "Inn",
  "Saldo",
  "Referanse"
];

export const FIKEN_TABLE_HEADERS = [...FIKEN_CSV_HEADERS, "Forskjell", "Fra fil"];

export interface FikenLine {
  readonly fraKonto: string;
  readonly tilKonto: string;
  readonly bokførtDato: Date;
  readonly forklarendeTekst: string;
  readonly inngående: number;
  readonly ut: number;
  readonly inn: number;
  readonly saldo: number;
  readonly referanse: string | null;
  readonly source: NordnetLineSource;
  readonly difference: number;
}

export interface FikenFile {
  readonly fileName: string;
  readonly rows: FikenLine[];
}

const getForklarendeTekst = (nordnetLine: NordnetLine): string => {
  if (nordnetLine.type === NordnetType.KJØPT) {
    return `Kjøp av ${nordnetLine.verdipapir} (${nordnetLine.ISIN})`;
  }

  if (nordnetLine.type === NordnetType.SOLGT) {
    return `Salg av ${nordnetLine.verdipapir} (${nordnetLine.ISIN})`;
  }

  return nordnetLine.transaksjonstekst;
}

export const toFikenLines = (nordnetLines: NordnetLine[], fraKonto: string): FikenFile[] => {
  return nordnetLines.reduce<FikenFile[]>((fikenFiles, nordnetLine) => {

    const fikenLine: FikenLine = {
      bokførtDato: nordnetLine.bokførtDato,
      fraKonto,
      tilKonto: nordnetLine.tilKonto,
      forklarendeTekst: getForklarendeTekst(nordnetLine),
      inngående: nordnetLine.inngående,
      ut: nordnetLine.ut,
      inn: nordnetLine.inn,
      saldo: nordnetLine.saldo,
      referanse: nordnetLine.referanse,
      source: nordnetLine.source,
      difference: 0,
    };

    const fileName = `nordnet-fiken-${fikenLine.source.year}.${fikenLine.source.month}.csv`;
    const existingFile = fikenFiles.find((f) => f.fileName === fileName);

    if (existingFile) {
      existingFile.rows.push(fikenLine);
    } else {
      fikenFiles.push({ fileName, rows: [fikenLine] });
    }

    return fikenFiles;
  }, []);
};

export const toFikenCsv = (fikenLines: FikenLine[]): Csv => {
  const rows = fikenLines.map((fikenLine) => [
    format(fikenLine.bokførtDato, 'yyyy-MM-dd'),
    fikenLine.fraKonto,
    fikenLine.tilKonto,
    fikenLine.forklarendeTekst,
    formatMoney(fikenLine.inngående),
    formatMoney(fikenLine.ut),
    formatMoney(fikenLine.inn),
    formatMoney(fikenLine.saldo),
    fikenLine.referanse ?? ''
  ]);

  return { headers: FIKEN_CSV_HEADERS, rows };
};
