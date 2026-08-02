"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type HorizontalCarouselProps<T> = {
  items: T[]
  ariaLabel: string
  className?: string
  renderItem: (item: T, index: number) => ReactNode
}

export default function HorizontalCarousel<T>({
  items,
  ariaLabel,
  className,
  renderItem,
}: HorizontalCarouselProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollBackward, setCanScrollBackward] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(false)

  const updateScrollState = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const maxScroll = track.scrollWidth - track.clientWidth
    setCanScrollBackward(track.scrollLeft > 2)
    setCanScrollForward(track.scrollLeft < maxScroll - 2)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    updateScrollState()
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(track)

    return () => observer.disconnect()
  }, [items.length, updateScrollState])

  function scrollByPage(direction: -1 | 1) {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollByPage(-1)
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollByPage(1)
    }
  }

  return (
    <div className={`hub-carousel${className ? ` ${className}` : ""}`}>
      {canScrollBackward && (
        <button
          className="hub-carousel-control is-left"
          type="button"
          aria-label="Ver itens anteriores"
          onClick={() => scrollByPage(-1)}
        >
          <ChevronLeft size={19} strokeWidth={2.4} aria-hidden="true" />
        </button>
      )}

      <div
        className="hub-carousel-track"
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={updateScrollState}
      >
        {items.map((item, index) => (
          <div className="hub-carousel-item" key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {canScrollForward && (
        <button
          className="hub-carousel-control is-right"
          type="button"
          aria-label="Ver próximos itens"
          onClick={() => scrollByPage(1)}
        >
          <ChevronRight size={19} strokeWidth={2.4} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
