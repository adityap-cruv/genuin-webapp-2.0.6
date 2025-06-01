import { PROTECTED_ROUTES } from "../constants";

/**
 * This function will check if the url includes any of the protected routes.
 * @param url
 * @returns
 */
export function checkIfUrlIncludesProtectedRoute(url: string) {
  return PROTECTED_ROUTES.some((route) => url.includes(route));
}

/**
 * This function formats a date string in ISO format to a more readable format.
 * @param isoString = string - The ISO date string to format.
 * @returns
 */
export function formateDateToLocaleString(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
