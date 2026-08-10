"use client"

import { useLayoutEffect, useRef } from "react"
import { Quote, Star } from "lucide-react"

type Testimonial = {
  name: string
  role: string
  quote: string
}

const LOOP_COPIES = 3
const AUTOPLAY_SPEED_PX_PER_SECOND = 36

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const isPaused = useRef(false)
  const dragStartX = useRef(0)
  const dragStartScroll = useRef(0)
  const draggedDistance = useRef(0)

  const loopedTestimonials = Array.from({ length: LOOP_COPIES }).flatMap(() => testimonials)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    track.scrollLeft = track.scrollWidth / LOOP_COPIES

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let rafId: number
    let lastTimestamp: number | null = null

    function tick(timestamp: number) {
      if (lastTimestamp === null) lastTimestamp = timestamp
      // limita o passo a 100ms: evita um salto grande quando a aba estava em
      // segundo plano (rAF pausado) e volta a ficar visível.
      const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.1)
      lastTimestamp = timestamp

      if (!prefersReducedMotion && !isPaused.current && !isDragging.current) {
        track!.scrollLeft += AUTOPLAY_SPEED_PX_PER_SECOND * deltaSeconds
      }

      const setWidth = track!.scrollWidth / LOOP_COPIES
      if (setWidth > 0) {
        if (track!.scrollLeft < setWidth * 0.5) {
          track!.scrollLeft += setWidth
        } else if (track!.scrollLeft > setWidth * 1.5) {
          track!.scrollLeft -= setWidth
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      track!.scrollLeft += event.deltaY
      event.preventDefault()
    }

    track.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      cancelAnimationFrame(rafId)
      track.removeEventListener("wheel", handleWheel)
    }
  }, [])

  function handlePointerEnter() {
    isPaused.current = true
  }

  function handlePointerLeave() {
    isPaused.current = false
    endDrag()
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    isPaused.current = true
    if (event.pointerType !== "mouse") return
    const track = trackRef.current
    if (!track) return
    isDragging.current = true
    draggedDistance.current = 0
    dragStartX.current = event.clientX
    dragStartScroll.current = track.scrollLeft
    track.classList.add("is-dragging")
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) return
    const track = trackRef.current
    if (!track) return
    const delta = event.clientX - dragStartX.current
    draggedDistance.current = Math.abs(delta)
    track.scrollLeft = dragStartScroll.current - delta
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    endDrag()
    if (event.pointerType !== "mouse") {
      isPaused.current = false
    }
  }

  function endDrag() {
    isDragging.current = false
    trackRef.current?.classList.remove("is-dragging")
  }

  function preventClickAfterDrag(event: React.MouseEvent<HTMLDivElement>) {
    if (draggedDistance.current > 5) {
      event.preventDefault()
    }
  }

  return (
    <div className="accounting-testimonials-carousel">
      <div
        className="accounting-testimonials-track"
        ref={trackRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={preventClickAfterDrag}
      >
        {loopedTestimonials.map(({ name, role, quote }, index) => (
          <article className="accounting-testimonial-card" key={`${name}-${index}`}>
            <Quote size={22} strokeWidth={2} className="accounting-testimonial-quote-icon" aria-hidden="true" />
            <div className="accounting-testimonial-stars" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star key={starIndex} size={15} strokeWidth={0} fill="currentColor" />
              ))}
            </div>
            <p className="accounting-testimonial-quote">{quote}</p>
            <div className="accounting-testimonial-author">
              <span className="accounting-testimonial-name">{name}</span>
              <span className="accounting-testimonial-role">{role}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
