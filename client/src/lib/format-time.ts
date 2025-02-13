/**
 *
 * @param {number} milliseconds Number of milliseconds
 * @return {String} Time formatted as hour:minutes:seconds.milliseconds. Only shows milliseconds when time is less than a minute. Currently doesn't account for any time measurement larger than hours.
 */
export const formatTime = (milliseconds: number) => {
  if (milliseconds < 0) return "00:00";

  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = Math.floor((milliseconds % 1000) / 100);

  // Show milliseconds when less than a minute
  if (minutes < 1) {
    return `${String(seconds).padStart(2, "0")}.${ms}`;
  }

  // Show hour when longer than an hour
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  // Otherwise, show mm:ss
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};
