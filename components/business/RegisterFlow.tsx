"use client";

import { Plus, X } from "lucide-react";

import { Alert } from "@/components/systemui/alter";
import { Button } from "@/components/ui/button";
import { DragToDismiss } from "@/components/ui/drag-to-dismiss";
import { RegistrationForm } from "@/components/business/RegistrationForm";
import type { Business } from "@/types";
import type { Coordinates } from "@/components/map/MapContainer";

type Step = "picker" | "form";

type RegisterFlowProps = {
  isFormOpen: boolean;
  step: Step;
  coordinates: Coordinates | null;
  onOpen: () => void;
  onClose: () => void;
  onSelectCoordinates: (coordinates: Coordinates) => void;
  onChangeLocation: () => void;
  onBusinessCreated: (business: Business) => void;
  hasRoute: boolean;
};

export function RegisterFlow({
  isFormOpen,
  step,
  coordinates,
  onOpen,
  onClose,
  onChangeLocation,
  onBusinessCreated,
  hasRoute,
}: RegisterFlowProps) {
  if (!isFormOpen && !hasRoute) {
    return (
      <Button
        className="absolute p-5 right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 z-10 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 shadow-xl sm:right-auto sm:left-4 sm:w-auto sm:max-w-none sm:translate-x-0"
        onClick={onOpen}
      >
        <Plus className="size-4" /> Register my business
      </Button>
    );
  }

  if (isFormOpen && step === "picker") {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center pt-16 sm:pt-24">
        <Alert
          title="¿Donde esta tu negocio?"
          description="Toca el punto en el mapa donde esta ubicado tu negocio"
          closeIcon={<X />}
          onClose={onClose}
        />
      </div>
    );
  }

  if (isFormOpen && step === "form" && coordinates) {
    return (
      <div className="absolute inset-0 z-20 flex items-end justify-center overflow-hidden sm:items-center sm:p-4">
        <DragToDismiss
          onDismiss={onClose}
          className="relative w-full max-w-md overflow-hidden rounded-t-2xl bg-popover text-popover-foreground sm:rounded-2xl"
          contentClassName="max-h-[85vh]"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-md p-1.5 hover:bg-accent"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          <RegistrationForm
            initialCoordinates={coordinates}
            onChangeLocation={onChangeLocation}
            onBusinessCreated={onBusinessCreated}
          />
        </DragToDismiss>
      </div>
    );
  }

  return null;
}