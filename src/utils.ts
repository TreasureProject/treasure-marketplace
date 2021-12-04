import { formatEther } from "ethers/lib/utils";

const UNITS = ["", "K", "M", "B", "T", "Q"];

export const generateIpfsLink = (hash: string) => {
  const removedIpfs = hash.substring(7);

  return `https://treasure-marketplace.mypinata.cloud/ipfs/${removedIpfs}`;
};

export const formatNumber = (number: number) =>
  new Intl.NumberFormat().format(number);

export const formatPrice = (price: string) =>
  formatNumber(parseFloat(formatEther(price)));

export const formattable = (string: string) => {
  if (isNaN(Number(string))) {
    return string;
  }

  return formatPrice(string);
};

export const formatPercent = (percentage: string) => {
  const number = parseFloat(percentage);
  return number.toLocaleString("en-US", {
    style: "percent",
    // if its a whole number, don't add the decimal
    minimumFractionDigits: number % 1 !== 0 ? 2 : 0,
  });
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
