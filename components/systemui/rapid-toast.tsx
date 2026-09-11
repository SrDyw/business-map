"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ToastManagerAddOptions } from "@base-ui/react";
import { useEffect } from "react";

export function RapidToast({
  title,
  description,
  type = "info",
}: {
  title: string;
  description: string;
  type?: string;
}) {
  function showToast() {
    const id = toast.add({
      title,
      type,
      description,
      actionProps: {
        children: "Undo",
        onClick() {
          toast.close(id);
        },
      },
    });
  }

  useEffect(() => {
    showToast();
  });

  return <></>;
}
