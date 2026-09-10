"use client";

import { useEffect, useState } from "react";
import { isOpenNow } from "@/lib/systemuitls";

export function useOpenStatus(
  scheduleDays: string | null,
  scheduleHours: string | null,
): boolean | null {
  const [status, setStatus] = useState<boolean | null>(null);

  useEffect(() => {
    setStatus(isOpenNow(scheduleDays, scheduleHours));
  }, [scheduleDays, scheduleHours]);

  return status;
}
