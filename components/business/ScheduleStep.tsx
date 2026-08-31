"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { TimeInputField } from "@/components/business/TimeInputField";
import type { DayOfWeek, ScheduleData, TimeOfDay } from "@/lib/schedule";
import { DAYS_OF_WEEK, DAY_FULL_NAMES } from "@/lib/schedule";
import { History } from "lucide-react";

type ScheduleStepProps = {
  value: ScheduleData;
  onChange: (schedule: ScheduleData) => void;
  daysError?: string;
  hoursError?: string;
};

export function ScheduleStep({
  value,
  onChange,
  daysError,
  hoursError,
}: ScheduleStepProps) {
  function updateOpenTime(openTime: TimeOfDay) {
    onChange({ ...value, openTime });
  }

  function updateCloseTime(closeTime: TimeOfDay) {
    onChange({ ...value, closeTime });
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      <Field className="gap-2">
        <FieldLabel className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          Operating days
        </FieldLabel>
        <ToggleGroup
          multiple
          value={value.days}
          onValueChange={(days) =>
            onChange({ ...value, days: days as DayOfWeek[] })
          }
          className="flex-wrap"
        >
          {DAYS_OF_WEEK.map((day) => (
            <ToggleGroupItem
              key={day}
              value={day}
              size="sm"
              variant="outline"
              className="min-w-11 rounded-md text-xs data-[state=on]:border-green-400/60 data-[state=on]:bg-green-500/15 data-[state=on]:text-green-300"
              aria-label={DAY_FULL_NAMES[day]}
            >
              {day}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription>
          Select at least one day for your schedule.
        </FieldDescription>
        {daysError && (
          <FieldDescription className="text-destructive">
            {daysError}
          </FieldDescription>
        )}
      </Field>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex-1">
          <TimeInputField
            id="open-time"
            label="Opening time"
            value={value.openTime}
            onChange={updateOpenTime}
          />
        </div>
        <div className="flex-1">
          <TimeInputField
            id="close-time"
            label="Closing time"
            value={value.closeTime}
            onChange={updateCloseTime}
          />
        </div>
      </div>

      {hoursError && (
        <FieldDescription className="text-destructive">
          {hoursError}
        </FieldDescription>
      )}
    </div>
  );
}
