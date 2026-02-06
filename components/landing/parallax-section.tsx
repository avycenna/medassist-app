"use client"

import { useEffect, useRef, ReactNode } from "react"

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  parallaxIndex?: number
}

export function ParallaxSection({ children, className = "", parallaxIndex = 0 }: ParallaxSectionProps) {
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset
        const rate = scrolled * (0.1 + parallaxIndex * 0.05)
        parallaxRef.current.style.transform = `translateY(${rate}px)`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [parallaxIndex])

  return (
    <div ref={parallaxRef} className={className}>
      {children}
    </div>
  )
}
