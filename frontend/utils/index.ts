/**
 * Formats a confidence score from a decimal into a clean percentage.
 * Example: 0.9845 -> '98.5%'
 */
export function formatConfidence(score: number): string {
  if (isNaN(score)) return '0.0%';
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Formats an ISO timestamp into a localized clinical scan date format.
 * Example: '2026-07-13T14:53:24Z' -> 'Jul 13, 2026, 02:53 PM'
 */
export function formatScanDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown Date';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return 'Invalid Date';
  }
}

/**
 * Formats tumor area in square millimeters to a readable string.
 * Example: 145.2 -> '145.2 mm²'
 */
export function formatTumorArea(areaMm2?: number): string {
  if (areaMm2 === undefined || areaMm2 === null) return 'N/A';
  return `${areaMm2.toFixed(1)} mm²`;
}
