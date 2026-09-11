"use client";

import { Search } from "lucide-react";

import { AuthButton } from "@/components/auth/AuthButton";

type MapHeaderProps = {
  onOpenSearch: () => void;
};

export function MapHeader({ onOpenSearch }: MapHeaderProps) {
  return (
    <header className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
      <button
        type="button"
        onClick={onOpenSearch}
        translate="no"
        className="flex h-11 flex-1 items-center gap-3 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-muted/60 sm:max-w-md"
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">Buscar productos o locales...</span>
        <span className="ml-auto hidden shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          Enter
        </span>
      </button>
      <AuthButton />
    </header>
  );
}