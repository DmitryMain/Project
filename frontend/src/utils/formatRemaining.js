/**
 * @param {string | undefined | null} endAt ISO date string from API
 * @returns {string} Human-readable countdown or empty string
 */
export function formatRemaining(endAt) {
  if (!endAt) return "";
  const ms = new Date(endAt).getTime();
  if (Number.isNaN(ms)) return "";
  const diffMs = Math.max(0, ms - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
