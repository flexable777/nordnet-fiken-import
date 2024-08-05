export type Money = number;

const INTEGER_REGEX = /^-?[0-9]+$/;
const DECIMAL_REGEX = /^[0-9]+$/;

/**
 * @returns A whole number representing the value in øre.
*/
export const parseMoney = (value: string): Money => {
  const [integer, decimal] = value.replaceAll(' ', '').split(",");

  if (!INTEGER_REGEX.test(integer)) {
    throw new Error(`Invalid integer: ${integer}`);
  }

  if (decimal !== undefined && !DECIMAL_REGEX.test(decimal)) {
    throw new Error(`Invalid decimal: ${decimal}`);
  }

  const parsedInteger = Number.parseInt(integer, 10);

  if (Number.isNaN(parsedInteger)) {
    throw new Error(`Failed to parse integer: ${integer}`);
  }

  if (decimal === undefined) {
    return parsedInteger * 100;
  }

  const parsedDecimal = Number.parseInt(decimal, 10);

  if (Number.isNaN(parsedDecimal)) {
    throw new Error(`Failed to parse decimal: ${decimal}`);
  }

  if (parsedInteger < 0) {
    return parsedInteger * 100 - parsedDecimal;
  }

  return parsedInteger * 100 + parsedDecimal;
}

export const formatMoney = (value: Money): string => {
  const integer = Math.floor(value / 100);
  const decimal = Math.abs(value) % 100;

  return `${integer.toString(10)},${decimal.toString(10).padStart(2, '0')}`;
}

export const prettyFormatMoney = (value: Money): string => {
  const integer = Math.floor(value / 100);
  const decimal = Math.abs(value) % 100;

  const integerString = Math.abs(integer).toString(10).split('').toReversed().map((n, i) => i % 3 === 0 ? `${n} ` : n).toReversed().join('').trim();

  return `${value < 0 ? '-' : ''}${integerString},${decimal.toString(10).padStart(2, '0')} kr`;
};
