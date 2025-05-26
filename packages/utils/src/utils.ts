/**
 * Abbreviates a number using K (thousand) or M (million) suffixes.
 * Handles negative numbers, NaN, and ensures proper rounding.
 * For example, 1500 becomes "1.5K", 2000000 becomes "2M".
 *
 * @param value - The number to abbreviate.
 * @returns The abbreviated number as a string.
 */
export const abbreviateNumber = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "0";
  if (value === 0) return "0";

  const absValue = Math.abs(value);
  const suffixes = ["", "K", "M"]; // Only up to million
  let suffixNum = 0;
  let shortValue = absValue;

  while (shortValue >= 1000 && suffixNum < suffixes.length - 1) {
    shortValue /= 1000;
    suffixNum++;
  }

  const rounded =
    shortValue % 1 !== 0 ? shortValue.toFixed(1) : shortValue.toString();
  const result = (value < 0 ? "-" : "") + rounded + suffixes[suffixNum];
  return result;
};
