"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";

import { cn } from "@/lib/utils";

function FieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7",
        className,
      )}
      {...props}
    />
  );
}

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Root> & {
  orientation?: "vertical" | "horizontal" | "responsive";
}) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        "group/field flex w-full gap-3",
        "data-[orientation=vertical]:flex-col",
        "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:items-center",
        "data-[orientation=responsive]:@3xl/field-group:flex-row data-[orientation=responsive]:@3xl/field-group:items-center",
        className,
      )}
      {...props}
    />
  );
}

function FieldContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Label>) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 text-sm leading-snug font-medium",
        "has-data-checked:bg-primary/5 has-data-checked:border-primary dark:has-data-checked:bg-primary/10",
        "has-data-disabled:cursor-not-allowed has-data-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Description>) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm leading-normal font-normal",
        "group-data-[disabled=true]/field:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

function FieldError({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Error> & {
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      {children}
    </FieldPrimitive.Error>
  );
}

export {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
};