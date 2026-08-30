"use client";

import { useState } from "react";
import { Store } from "lucide-react";

import { cn } from "@/lib/utils";

type ImageStatus = "loading" | "loaded" | "error";

type BusinessImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
};

export function BusinessImage({
  src,
  alt,
  className,
  iconClassName,
}: BusinessImageProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");

  const showFallback = !src || status !== "loaded";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-muted text-muted-foreground",
        className,
      )}
    >
      {showFallback && <Store className={cn("size-6", iconClassName)} />}
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "absolute inset-0 size-full object-cover",
            status !== "loaded" && "opacity-0",
          )}
        />
      )}
    </div>
  );
}
