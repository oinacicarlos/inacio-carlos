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
const FEATURED_TESTIMONIAL_INDEX = 2

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase()
}

type TestimonialsCarouselProps = {
  testimonials: Testimonial[]
  variant?: "light" | "dark"
}

export function TestimonialsCarousel({ testimonials, variant = "light" }: TestimonialsCarouselProps) {
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

  const isDark = variant === "dark"
  const carouselClass = isDark ? "testimonials-dark-carousel" : "accounting-testimonials-carousel"
  const trackClass = isDark ? "testimonials-dark-track" : "accounting-testimonials-track"

  return (
    <div className={carouselClass}>
      <div
        className={trackClass}
        ref={trackRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={preventClickAfterDrag}
      >
        {loopedTestimonials.map(({ name, role, quote }, index) => {
          const isFeatured = isDark && index % testimonials.length === FEATURED_TESTIMONIAL_INDEX

          if (!isDark) {
            return (
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
            )
          }

          return (
            <article
              className={`testimonials-dark-card${isFeatured ? " is-featured" : ""}`}
              key={`${name}-${index}`}
            >
              {isFeatured && <span className="testimonials-dark-featured-badge">Mais citado</span>}

              <Quote size={26} strokeWidth={2} className="testimonials-dark-quote-icon" aria-hidden="true" />
              <div className="testimonials-dark-stars" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={16} strokeWidth={0} fill="currentColor" />
                ))}
              </div>
              <p className="testimonials-dark-quote">{quote}</p>

              <span className="testimonials-dark-divider" aria-hidden="true" />

              <div className="testimonials-dark-author">
                <span className="testimonials-dark-avatar" aria-hidden="true">
                  {getInitial(name)}
                </span>
                <span className="testimonials-dark-author-text">
                  <span className="testimonials-dark-name">{name}</span>
                  <span className="testimonials-dark-role">{role}</span>
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
