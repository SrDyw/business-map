"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import type { TimeOfDay, TimePeriod } from "@/lib/schedule";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const PERIODS: TimePeriod[] = ["AM", "PM"];

type TimeInputFieldProps = {
  id: string;
  label: string;
  value: TimeOfDay;
  onChange: (time: TimeOfDay) => void;
};

export function TimeInputField({
  id,
  label,
  value,
  onChange,
}: TimeInputFieldProps) {
  function updatePartial(patch: Partial<TimeOfDay>) {
    onChange({ ...value, ...patch });
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex w-fit items-center gap-2.5">
        <Select
          value={value.hour}
          onValueChange={(v) => updatePartial({ hour: Number(v) })}
        >
          <SelectTrigger
            id={id}
            aria-label={`${label} hour`}
            className="w-16 justify-center"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOURS.map((hour) => (
              <SelectItem key={hour} value={hour}>
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">:</span>

        <Select
          value={value.minute}
          onValueChange={(v) => updatePartial({ minute: Number(v) })}
        >
          <SelectTrigger
            aria-label={`${label} minute`}
            className="w-16 justify-center"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MINUTES.map((minute) => (
              <SelectItem key={minute} value={minute}>
                {String(minute).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.period}
          onValueChange={(v) => updatePartial({ period: v as TimePeriod })}
        >
          <SelectTrigger
            aria-label={`${label} period`}
            className="w-16 justify-center"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Field>
  );
}
