"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/tracking";
import { PauseIcon, PlayIcon, Square } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

type TimeTrackerProps = {
  onSave?: (data: {
    activity: string;
    elapsed: number;
    description?: string;
    tags: string[];
  }) => void;
  initialValues?: {
    activity: string;
    description?: string;
    tags: string[];
  } | null;
  onSessionStart?: () => void;
};

export type TimeTrackerRef = {
  startTracking: () => void;
};

export const TimeTracker = forwardRef<TimeTrackerRef, TimeTrackerProps>(
  function TimeTracker({ onSave, initialValues = null, onSessionStart }, ref) {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [activity, setActivity] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");

    useEffect(() => {
      if (initialValues && !isRunning) {
        setActivity(initialValues.activity);
        setDescription(initialValues.description || "");
        setTags(initialValues.tags);
      }
    }, [initialValues, isRunning]);

    useEffect(() => {
      let interval: NodeJS.Timeout;

      if (isRunning) {
        interval = setInterval(() => {
          setElapsed((prev) => prev + 1);
        }, 1000);
      }

      return () => clearInterval(interval);
    }, [isRunning]);

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      startTracking: () => {
        if (activity.trim()) {
          setIsRunning(true);
          if (onSessionStart) {
            onSessionStart();
          }
        }
      },
    }));

    function handleStart() {
      if (!activity.trim()) {
        // Might want to show an error message here
        return;
      }
      setIsRunning(true);
      if (onSessionStart) {
        onSessionStart();
      }
    }

    function handlePause() {
      return setIsRunning(false);
    }

    function handleStop() {
      setIsRunning(false);
      if (onSave && activity.trim()) {
        onSave({
          activity,
          elapsed,
          description,
          tags,
        });
      }
      // Reset timer but keep other values for next session
      setElapsed(0);
    }

    function handleAddTag() {
      if (newTag.trim() && !tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
        setNewTag("");
      }
    }

    function handleRemoveTag(tag: string) {
      setTags(tags.filter((t) => t !== tag));
    }

    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2">
            <Input
              placeholder="What are you working on?"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              disabled={isRunning}
              className="font-medium text-lg"
            />

            <Input
              placeholder="Add details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isRunning}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold">
                {formatTime(elapsed)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                disabled={isRunning}
              />
              <Button
                variant="outline"
                onClick={handleAddTag}
                disabled={isRunning || !newTag.trim()}
                className="shrink-0"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  {!isRunning && (
                    <span
                      onClick={() => handleRemoveTag(tag)}
                      className="cursor-pointer ml-1"
                    >
                      ×
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex justify-between w-full">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 flex-1 mr-2"
                disabled={!activity.trim()}
              >
                <PlayIcon className="mr-2 h-4 w-4" /> Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="outline"
                className="flex-1 mr-2"
              >
                <PauseIcon className="mr-2 h-4 w-4" /> Pause
              </Button>
            )}

            <Button
              onClick={handleStop}
              variant="destructive"
              disabled={elapsed === 0}
              className="flex-1"
            >
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }
);
