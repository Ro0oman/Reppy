/**
 * Formats a number into a shorter string representation (e.g., 1000 -> 1K, 1000000 -> 1M)
 * @param {number} num 
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  if (num < 1000) return num.toString();
  
  if (num < 1000000) {
    const k = num / 1000;
    return (k % 1 === 0 ? k : k.toFixed(1)) + 'K';
  }
  
  const m = num / 1000000;
  return (m % 1 === 0 ? m : m.toFixed(1)) + 'M';
};
