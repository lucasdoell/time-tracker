"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistance } from "date-fns";

export type TimeEntry = {
  id: string;
  activity: string;
  elapsed: number;
  description?: string;
  tags: string[];
  timestamp: Date;
};

interface HistoryProps {
  entries: TimeEntry[];
}

export function TimeHistory({ entries }: HistoryProps) {
  // Format time as HH:MM:SS
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
      .map((val) => val.toString().padStart(2, "0"))
      .join(":");
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No time entries recorded yet
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{entry.activity}</h3>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold">
                        {formatTime(entry.elapsed)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistance(entry.timestamp, new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
