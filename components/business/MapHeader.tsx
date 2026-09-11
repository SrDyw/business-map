"use client";

import { Menu, Search } from "lucide-react";

import { AuthButton } from "@/components/auth/AuthButton";

type MapHeaderProps = {
  onOpenSearch: () => void;
};

export function MapHeader({ onOpenSearch }: MapHeaderProps) {
  return (
    <header className="absolute top-4 left-4 right-4 z-10">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1.5 shadow-lg">
        <button
          type="button"
          aria-label="Menú"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Menu className="size-4" />
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          translate="no"
          className="flex h-9 flex-1 items-center gap-2 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
        >
          <span className="truncate">Buscar productos o locales...</span>
          <span className="ml-auto hidden shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            Enter
          </span>
        </button>

        <div className="shrink-0">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}