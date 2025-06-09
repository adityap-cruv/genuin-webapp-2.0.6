/**
 * Formats a time duration in seconds into a human-readable string format (HH:MM:SS or MM:SS).
 *
 * @param {number} time - Time duration in seconds
 * @returns {string} Formatted time string (HH:MM:SS or MM:SS)
 *
 * @example
 * formatTime(65)    // "01:05"
 * formatTime(3665)  // "01:01:05"
 */
export const formatTime = (time: number): string => {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${pad(minutes)}:${pad(seconds)}`;
  }
};
