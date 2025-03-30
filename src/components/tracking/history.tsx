"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteTimeEntry } from "@/lib/tauri-api";
import { formatTime, TimeEntry } from "@/lib/tracking";
import { formatDistance } from "date-fns";
import { EditIcon, PlayIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { EditTimeEntry } from "./edit-time-entry";

type HistoryProps = {
  entries: TimeEntry[];
  onStartAgain?: (entry: TimeEntry) => void;
  onEntryUpdated?: () => Promise<void>;
};

export function TimeHistory({
  entries,
  onStartAgain,
  onEntryUpdated,
}: HistoryProps) {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (entry: TimeEntry) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteTimeEntry(entry.id);
      if (onEntryUpdated) {
        await onEntryUpdated();
      }
    } catch (error) {
      console.error("Failed to delete time entry:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="text-xl">Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No time entries recorded yet
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
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
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        onClick={() => onStartAgain && onStartAgain(entry)}
                      >
                        <PlayIcon className="h-3.5 w-3.5 mr-1.5" />
                        Start Again
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        onClick={() => handleEditClick(entry)}
                      >
                        <EditIcon className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleDeleteClick(entry)}
                            disabled={isDeleting}
                          >
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete entry</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <EditTimeEntry
        entry={editingEntry}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onEntryUpdated || (async () => {})}
      />
    </>
  );
}
