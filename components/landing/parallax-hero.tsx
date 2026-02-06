"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Zap } from "lucide-react"
import Link from "next/link"

export function ParallaxHero() {
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      parallaxRefs.current.forEach((ref, index) => {
        if (ref) {
          const scrolled = window.pageYOffset
          const rate = scrolled * (0.3 + index * 0.1)
          ref.style.transform = `translateY(${rate}px)`
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="home" className="relative overflow-hidden pt-24 pb-32 px-4 min-h-screen flex items-center">
      <div className="absolute inset-0 -z-10">
        <div 
          ref={(el) => { parallaxRefs.current[0] = el }}
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
        />
        <div 
          ref={(el) => { parallaxRefs.current[1] = el }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
        />
        <div 
          ref={(el) => { parallaxRefs.current[2] = el }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
        />
      </div>
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/50 rounded-full text-sm text-foreground animate-pulse">
            <Zap className="h-4 w-4 text-primary" />
            <span>24/7 Medical Travel Assistance</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-balance leading-tight animate-slide-up">
            Medical Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Assistance</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed animate-slide-up delay-200">
            Trusted provider of medical travel assistance with a network of medical and non-medical providers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up delay-300">
            <Button size="lg" asChild className="rounded-full group">
              <Link href="/login">
                Access Portal
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <a href="#services">
                Learn More
                <ChevronDown className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  )
}
