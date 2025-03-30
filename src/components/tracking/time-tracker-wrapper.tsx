"use client";

import { getAllTimeEntries, saveTimeEntry } from "@/lib/tauri-api";
import { TimeEntry } from "@/lib/tracking";
import { useEffect, useRef, useState } from "react";
import { TimeTracker, TimeTrackerRef } from "./counter";
import { TimeHistory } from "./history";

export function TimeTrackerWrapper() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<{
    activity: string;
    description?: string;
    tags: string[];
  } | null>(null);
  // Reference to the TimeTracker component to programmatically start tracking
  const trackerRef = useRef<TimeTrackerRef>(null);
  const [loading, setLoading] = useState(true);

  // Load existing time entries from database on mount
  useEffect(() => {
    loadTimeEntries();
  }, []);

  async function loadTimeEntries() {
    try {
      setLoading(true);
      const entries = await getAllTimeEntries();
      setTimeEntries(entries);
    } catch (error) {
      console.error("Failed to load time entries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTimeEntry(data: {
    activity: string;
    elapsed: number;
    description?: string;
    tags: string[];
  }) {
    // Only save entries that have actual time tracked
    if (data.elapsed > 0) {
      try {
        // Save entry to database
        await saveTimeEntry({
          activity: data.activity,
          elapsed: data.elapsed,
          description: data.description,
          tags: data.tags,
        });

        // Refresh time entries from database
        await loadTimeEntries();
      } catch (error) {
        console.error("Failed to save time entry:", error);
      }
    }
  }

  function handleStartAgain(entry: TimeEntry) {
    setCurrentTemplate({
      activity: entry.activity,
      description: entry.description,
      tags: [...entry.tags],
    });

    setTimeout(() => {
      // Automatically start tracking after setting the template
      if (trackerRef.current) {
        trackerRef.current.startTracking();
      }
    }, 0);
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TimeTracker
            ref={trackerRef}
            onSave={handleSaveTimeEntry}
            initialValues={currentTemplate}
            onSessionStart={() => setCurrentTemplate(null)}
          />
        </div>
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p>Loading time entries...</p>
            </div>
          ) : (
            <TimeHistory
              entries={timeEntries}
              onStartAgain={handleStartAgain}
              onEntryUpdated={loadTimeEntries}
            />
          )}
        </div>
      </div>
    </div>
  );
}
