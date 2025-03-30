"use client";

import { TimeEntry } from "@/lib/tracking";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { TimeTracker } from "./counter";
import { TimeHistory } from "./history";

export function TimeTrackerWrapper() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<{
    activity: string;
    description?: string;
    tags: string[];
  } | null>(null);

  const handleSaveTimeEntry = (data: {
    activity: string;
    elapsed: number;
    description?: string;
    tags: string[];
  }) => {
    // Only save entries that have actual time tracked
    if (data.elapsed > 0) {
      const newEntry: TimeEntry = {
        id: uuidv4(),
        activity: data.activity,
        elapsed: data.elapsed,
        description: data.description,
        tags: data.tags,
        timestamp: new Date(),
      };

      // Add new entry to the beginning of the array
      setTimeEntries((prevEntries) => [newEntry, ...prevEntries]);
    }
  };

  function handleStartAgain(entry: TimeEntry) {
    setCurrentTemplate({
      activity: entry.activity,
      description: entry.description,
      tags: [...entry.tags],
    });
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <TimeTracker
            onSave={handleSaveTimeEntry}
            initialValues={currentTemplate}
            onSessionStart={() => setCurrentTemplate(null)} // Clear template after starting
          />
        </div>
        <div>
          <TimeHistory entries={timeEntries} onStartAgain={handleStartAgain} />
        </div>
      </div>
    </div>
  );
}
