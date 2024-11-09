import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shrinkString(
  str: string,
  beginMaxLength: number,
  endMaxLength: number
) {
  if (str.length <= beginMaxLength + endMaxLength) return str;
  return str.slice(0, beginMaxLength) + "..." + str.slice(-endMaxLength);
}

export function forAllCombinations<T>(
  array: T[],
  minCombinationLength?: number,
  maxCombinationLength?: number
) {
  const result: T[][] = [];
  const allCombinationIndexes: number[][] = [];
  const f = function (subArray: number[], array: number[]) {
    for (let i = 0; i < array.length; i++) {
      const combinations = subArray.concat(array[i]);
      if (
        combinations.length >= (minCombinationLength || 0) &&
        combinations.length <= (maxCombinationLength || 99999)
      )
        allCombinationIndexes.push(combinations);
      f(combinations, array.slice(i + 1));
    }
  };
  f(
    [],
    array.map((_, i) => i)
  );
  allCombinationIndexes.sort((a, b) => b.length - a.length);
  for (const combination of allCombinationIndexes) {
    result.push(combination.map((i) => array[i]));
  }
  return result;
}

export function getUrl(path = "") {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000";

  const hasLeadingSlash = /^\/(.|\n)*$/.test(baseUrl);

  return `${baseUrl}${hasLeadingSlash ? "" : "/"}${path}`;
}
