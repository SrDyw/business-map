"use client"

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const DISMISS_THRESHOLD_PX = 100
const RUBBER_BAND_DECAY = 0.4
const DRAG_START_PX = 10

type DragToDismissProps = {
  onDismiss: () => void
  className?: string
  contentClassName?: string
  children: ReactNode
}

export function DragToDismiss({
  onDismiss,
  className,
  contentClassName,
  children,
}: DragToDismissProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = useState(0)
  const [isSnapping, setIsSnapping] = useState(false)

  const atTopRef = useRef(true)
  const onDismissRef = useRef(onDismiss)

  const touchStateRef = useRef({
    startY: 0,
    pull: 0,
    active: false,
    dragged: false,
  })
  const pointerStateRef = useRef({
    startY: 0,
    pull: 0,
    active: false,
    dragged: false,
  })

  function handleScroll() {
    const el = contentRef.current
    atTopRef.current = !el || el.scrollTop <= 0
  }

  function snapBack() {
    setIsSnapping(true)
    setDragY(0)
    window.setTimeout(() => setIsSnapping(false), 200)
  }

  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      if (!atTopRef.current) {
        touchStateRef.current.active = false
        return
      }
      const touch = e.touches[0]
      touchStateRef.current = {
        startY: touch.clientY,
        pull: 0,
        active: true,
        dragged: false,
      }
    }

    function onTouchMove(e: TouchEvent) {
      const s = touchStateRef.current
      if (!s.active) return
      const touch = e.touches[0]
      const deltaY = touch.clientY - s.startY

      if (!s.dragged) {
        if (deltaY > DRAG_START_PX) {
          s.dragged = true
        } else {
          return
        }
      }

      if (deltaY > 0) {
        e.preventDefault()
        s.pull = deltaY * RUBBER_BAND_DECAY
        setIsSnapping(false)
        setDragY(s.pull)
      } else {
        s.pull = 0
        setDragY(0)
      }
    }

    function onTouchEnd() {
      const s = touchStateRef.current
      if (!s.active) return
      s.active = false

      if (!s.dragged) return

      if (s.pull >= DISMISS_THRESHOLD_PX) {
        onDismissRef.current()
        return
      }
      snapBack()
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    el.addEventListener("touchcancel", onTouchEnd)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [])

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return

    pointerStateRef.current = {
      startY: e.clientY,
      pull: 0,
      active: true,
      dragged: false,
    }
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return
    const s = pointerStateRef.current
    if (!s.active) return

    const deltaY = e.clientY - s.startY

    if (!s.dragged) {
      if (deltaY > DRAG_START_PX) {
        s.dragged = true
      } else {
        return
      }
    }

    if (deltaY > 0) {
      e.preventDefault()
      s.pull = deltaY * RUBBER_BAND_DECAY
      setIsSnapping(false)
      setDragY(s.pull)
    } else {
      s.pull = 0
      setDragY(0)
    }
  }

  function handlePointerEnd() {
    const s = pointerStateRef.current
    if (!s.active) return
    s.active = false

    if (!s.dragged) return

    if (s.pull >= DISMISS_THRESHOLD_PX) {
      onDismissRef.current()
      return
    }
    snapBack()
  }

  return (
    <div
      data-slot="drag-to-dismiss"
      className={cn(
        "flex flex-col",
        isSnapping && "duration-200",
        className,
      )}
      style={{ transform: `translateY(${dragY}px)` }}
    >
      <div
        ref={contentRef}
        data-slot="drag-to-dismiss-content"
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
