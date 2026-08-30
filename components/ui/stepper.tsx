"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

type StepState = "completed" | "active" | "upcoming"

function getStepState(
  index: number,
  currentStep: number,
  state?: StepState,
): StepState {
  if (state) return state
  if (index < currentStep) return "completed"
  if (index === currentStep) return "active"
  return "upcoming"
}

const stepDotVariants = cva(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
  {
    variants: {
      state: {
        completed:
          "border-transparent bg-[#4CD9A0] text-black",
        active:
          "border-2 border-primary bg-muted text-foreground",
        upcoming:
          "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      state: "upcoming",
    },
  },
)

type StepperProps = {
  steps: { title: string; description?: string; icon?: React.ReactNode }[]
  currentStep: number
  orientation?: "horizontal" | "vertical"
  onStepClick?: (index: number) => void
  className?: string
}

function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  onStepClick,
  className,
}: StepperProps) {
  const isHorizontal = orientation === "horizontal"

  return (
    <div
      data-slot="stepper"
      className={cn(
        "flex w-full gap-2",
        isHorizontal
          ? "items-start"
          : "flex-col items-start gap-3",
        className,
      )}
    >
      {steps.map((step, index) => {
        const state = getStepState(index, currentStep)
        const isLast = index === steps.length - 1
        const clickable = onStepClick !== undefined

        return (
          <React.Fragment key={step.title}>
            <StepperItem
              state={state}
              stepNumber={index + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              onClick={clickable ? () => onStepClick(index) : undefined}
              orientation={orientation}
            />
            {!isLast && (
              <StepperSeparator
                state={state}
                horizontal={isHorizontal}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function StepperItem({
  state,
  stepNumber,
  title,
  description,
  icon,
  onClick,
  orientation,
}: {
  state: StepState
  stepNumber: number
  title: string
  description?: string
  icon?: React.ReactNode
  onClick?: () => void
  orientation: "horizontal" | "vertical"
}) {
  const isHorizontal = orientation === "horizontal"

  const content = (
    <div
      data-slot="stepper-item"
      className={cn(
        "group/step flex",
        isHorizontal ? "flex-col items-center text-center" : "items-start text-left",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          isHorizontal ? "flex-col" : "flex-row",
        )}
      >
        <span className={stepDotVariants({ state })}>
          {state === "completed" ? (
            <Check className="size-4" data-slot="stepper-check" />
          ) : state === "active" && icon ? (
            icon
          ) : (
            stepNumber
          )}
        </span>
        <div className={cn(isHorizontal ? "mt-2" : "-mt-0.5")}>
          <p
            className={cn(
              "text-sm font-medium",
              state === "active" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground/80">{description}</p>
          )}
        </div>
      </div>
    </div>
  )

  if (!onClick) return content

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </button>
  )
}

function StepperSeparator({
  state,
  horizontal,
}: {
  state: StepState
  horizontal: boolean
}) {
  const isActive = state === "completed"

  return (
    <div
      data-slot="stepper-separator"
      role="separator"
      aria-hidden="true"
      className={cn(
        "shrink-0 rounded-full bg-border transition-colors",
        isActive && "bg-[#4CD9A0]",
        horizontal ? "mt-4 h-0.5 min-w-8 flex-1" : "ml-4 h-8 w-0.5",
      )}
    />
  )
}

export { Stepper }
export type { StepperProps }
