"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { Period } from "@/components/ui/time-picker-utils";
import { updateTimeEntry } from "@/lib/tauri-api";
import { TimeEntry } from "@/lib/tracking";
import { useEffect, useState } from "react";

interface EditTimeEntryProps {
  entry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void>;
}

export function EditTimeEntry({
  entry,
  open,
  onOpenChange,
  onSave,
}: EditTimeEntryProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState<string | undefined>("");
  const [tags, setTags] = useState<string>("");
  const [startPeriod, setStartPeriod] = useState<Period>("AM");
  const [endPeriod, setEndPeriod] = useState<Period>("AM");
  const [isSaving, setIsSaving] = useState(false);

  // Calculate elapsed time in seconds
  const calculateElapsed = () => {
    if (!startDate || !endDate) return 0;
    return Math.max(
      0,
      Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
    );
  };

  // Initialize form with entry data
  useEffect(() => {
    if (entry) {
      // Start date is the timestamp
      const start = new Date(entry.timestamp);
      setStartDate(start);

      // End date is timestamp + elapsed seconds
      const end = new Date(entry.timestamp);
      end.setSeconds(end.getSeconds() + entry.elapsed);
      setEndDate(end);

      setActivity(entry.activity);
      setDescription(entry.description || "");
      setTags(entry.tags.join(", "));

      // Set AM/PM based on hours
      setStartPeriod(start.getHours() >= 12 ? "PM" : "AM");
      setEndPeriod(end.getHours() >= 12 ? "PM" : "AM");
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry || !startDate || !endDate) return;

    setIsSaving(true);
    try {
      const elapsed = calculateElapsed();
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await updateTimeEntry({
        id: entry.id,
        activity,
        description: description || undefined,
        elapsed,
        tags: tagArray,
        timestamp: startDate,
      });

      await onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update time entry:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="activity">Activity</Label>
            <Input
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (Comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="project, meeting, client"
            />
          </div>

          <div className="grid gap-4">
            <Label>Start Time</Label>
            <div className="flex items-center gap-2">
              {startDate && (
                <>
                  <TimePickerInput
                    picker="12hours"
                    date={startDate}
                    setDate={setStartDate}
                    period={startPeriod}
                  />
                  <span className="px-1">:</span>
                  <TimePickerInput
                    picker="minutes"
                    date={startDate}
                    setDate={setStartDate}
                  />
                  <span className="px-1">:</span>
                  <TimePickerInput
                    picker="seconds"
                    date={startDate}
                    setDate={setStartDate}
                  />
                  <Select
                    value={startPeriod}
                    onValueChange={(val) => setStartPeriod(val as Period)}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="AM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <Label>End Time</Label>
            <div className="flex items-center gap-2">
              {endDate && (
                <>
                  <TimePickerInput
                    picker="12hours"
                    date={endDate}
                    setDate={setEndDate}
                    period={endPeriod}
                  />
                  <span className="px-1">:</span>
                  <TimePickerInput
                    picker="minutes"
                    date={endDate}
                    setDate={setEndDate}
                  />
                  <span className="px-1">:</span>
                  <TimePickerInput
                    picker="seconds"
                    date={endDate}
                    setDate={setEndDate}
                  />
                  <Select
                    value={endPeriod}
                    onValueChange={(val) => setEndPeriod(val as Period)}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="AM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
