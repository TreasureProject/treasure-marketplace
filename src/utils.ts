import { formatEther } from "ethers/lib/utils";
import { BigNumberish } from "ethers";

const UNITS = ["", "K", "M", "B", "T", "Q"];

function toFixed(num: number, fixed: number) {
  const formatted = parseFloat(num.toFixed(2));
  const re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
  const numStr = formatted.toString().match(re);

  return numStr ? numStr[0] : formatted.toString();
}

export const generateIpfsLink = (hash: string) => {
  const removedIpfs = hash.replace(/.+\/(Qm[^\/]+)/, "$1");

  return `https://ipfs.io/ipfs/${removedIpfs}`;
};

export const formatNumber = (number: number) =>
  new Intl.NumberFormat().format(number);

export const formatPrice = (price: BigNumberish) =>
  formatNumber(parseFloat(formatEther(price)));

export const formattable = (string: BigNumberish) => {
  // TODO: Fix regex, but will work for Head Size for now
  if (isNaN(Number(string)) || /^\d$/.test(string.toString())) {
    return string;
  }

  return formatPrice(string);
};

export const formatPercent = (percentage: string) => {
  const number = parseFloat(percentage);
  return toFixed(number * 100, 2) + "%";
};

export const abbreviatePrice = (number: string) => {
  if (!number) return 0;

  let formatted_number = parseFloat(formatEther(number));
  let unit_index = 0;

  while (Math.floor(formatted_number / 1000.0) >= 1) {
    // Jump up a 1000 bracket and round to 1 decimal
    formatted_number = Math.round(formatted_number / 100.0) / 10.0;
    unit_index += 1;
  }

  const unit = UNITS[unit_index] ?? "";

  return formatted_number.toFixed(1).replace(/\.0+$/, "") + unit;
};

// takes a Collection Name and tries to return a user-friendly slug for routes
// can return undefined if chainId is missing, or address lookup fails
// TODO: See if this can be removed?
export function getCollectionSlugFromName(
  collectionName: string | null | undefined
): string | undefined {
  return collectionName?.replace(/\s+/g, "-")?.toLowerCase();
}
