import { invoke } from "@tauri-apps/api/core";
import { TimeEntry } from "./tracking";

/**
 * Save a time entry to the SQLite database
 */
export async function saveTimeEntry(
  entry: Omit<TimeEntry, "id" | "timestamp">
): Promise<void> {
  return invoke("save_time_entry", {
    activity: entry.activity,
    elapsed: entry.elapsed,
    description: entry.description,
    tags: entry.tags,
  });
}

/**
 * Get all time entries from the SQLite database
 */
export async function getAllTimeEntries(): Promise<TimeEntry[]> {
  const entries = await invoke<
    Array<Omit<TimeEntry, "timestamp"> & { timestamp: string }>
  >("get_all_time_entries");

  // Convert timestamp strings to Date objects
  return entries.map((entry) => ({
    ...entry,
    timestamp: new Date(entry.timestamp),
  }));
}

/**
 * Delete a time entry by ID
 */
export async function deleteTimeEntry(id: string): Promise<boolean> {
  return invoke<boolean>("delete_time_entry", { id });
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(entry: TimeEntry): Promise<boolean> {
  return invoke<boolean>("update_time_entry", {
    id: entry.id,
    activity: entry.activity,
    elapsed: entry.elapsed,
    description: entry.description,
    tags: entry.tags,
    timestamp: entry.timestamp.toISOString(),
  });
}
