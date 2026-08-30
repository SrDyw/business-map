"use client"

import {
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const DISMISS_THRESHOLD_PX = 100
const RUBBER_BAND_DECAY = 0.4

type DragToDismissProps = {
  onDismiss: () => void
  className?: string
  contentClassName?: string
  handle?: ReactNode
  children: ReactNode
}

export function DragToDismiss({
  onDismiss,
  className,
  contentClassName,
  handle,
  children,
}: DragToDismissProps) {
  const [dragY, setDragY] = useState(0)
  const [isSnapping, setIsSnapping] = useState(false)

  const gestureRef = useRef({
    startY: 0,
    pull: 0,
    active: false,
  })

  function handleHandleDown(e: PointerEvent<HTMLDivElement>) {
    gestureRef.current = {
      startY: e.clientY,
      pull: 0,
      active: true,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handleHandleMove(e: PointerEvent<HTMLDivElement>) {
    const g = gestureRef.current
    if (!g.active) return

    e.preventDefault()

    const deltaY = e.clientY - g.startY
    g.pull = deltaY > 0 ? deltaY * RUBBER_BAND_DECAY : 0
    setIsSnapping(false)
    setDragY(g.pull)
  }

  function endGesture() {
    const g = gestureRef.current
    if (!g.active) return
    g.active = false

    if (g.pull >= DISMISS_THRESHOLD_PX) {
      onDismiss()
      return
    }

    setIsSnapping(true)
    setDragY(0)
    window.setTimeout(() => setIsSnapping(false), 200)
  }

  return (
    <div
      data-slot="drag-to-dismiss"
      className={cn(isSnapping && "duration-200", className)}
      style={{ transform: `translateY(${dragY}px)` }}
    >
      <div
        data-slot="drag-to-dismiss-handle"
        onPointerDown={handleHandleDown}
        onPointerMove={handleHandleMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        className="flex shrink-0 cursor-grab touch-none select-none items-center justify-center py-3"
      >
        {handle ?? <div className="h-1.5 w-12 rounded-full bg-muted" />}
      </div>
      <div
        data-slot="drag-to-dismiss-content"
        className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}
      >
        {children}
      </div>
    </div>
  )
}
