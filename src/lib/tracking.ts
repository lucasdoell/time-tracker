/**
 * Format seconds to HH:MM:SS
 * @param seconds - Number of seconds to format
 * @returns Formatted time string in HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((val) => val.toString().padStart(2, "0"))
    .join(":");
}

/**
 * Represents a time tracking entry
 */
export type TimeEntry = {
  id: string;
  activity: string;
  elapsed: number;
  description?: string;
  tags: string[];
  timestamp: Date;
};
