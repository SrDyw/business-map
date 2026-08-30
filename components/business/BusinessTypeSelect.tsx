"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPES } from "@/lib/validators";

type BusinessTypeSelectProps = {
  value: string;
  onChange: (value: string | null) => void;
  id?: string;
};

export function BusinessTypeSelect({
  value,
  onChange,
  id,
}: BusinessTypeSelectProps) {
  return (
    <Select
      value={value || null}
      onValueChange={(v) => onChange(v)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select a business type" />
      </SelectTrigger>
      <SelectContent>
        {BUSINESS_TYPES.map((type) => (
          <SelectItem key={type} value={type}>
            {BUSINESS_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
