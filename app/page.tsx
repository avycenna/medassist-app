"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Stethoscope,
  Shield, 
  Mail, 
  Users, 
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Globe,
  Home,
  AlertCircle,
  Building2,
  Heart,
  Plane,
  CreditCard,
  Hotel,
  Star,
  ChevronDown,
  Award,
  TrendingUp,
  Zap,
  HeadphonesIcon,
  FileText,
  Calendar,
  UserCheck,
  Activity,
  BarChart3,
  LayoutDashboard,
  FolderKanban
} from "lucide-react"

export default function HomePage() {
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const dashboardParallaxRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    const handleScroll = () => {
      parallaxRefs.current.forEach((ref, index) => {
        if (ref) {
          const scrolled = window.pageYOffset
          const rate = scrolled * (0.3 + index * 0.1)
          ref.style.transform = `translateY(${rate}px)`
        }
      })

      if (dashboardParallaxRef.current) {
        const scrolled = window.pageYOffset
        const rect = dashboardParallaxRef.current.getBoundingClientRect()
        const elementTop = rect.top + scrolled
        const elementHeight = rect.height
        const viewportHeight = window.innerHeight
        
        if (scrolled + viewportHeight > elementTop && scrolled < elementTop + elementHeight) {
          const progress = ((scrolled + viewportHeight - elementTop) / (elementHeight + viewportHeight)) * 100
          const rate = progress * 0.5
          dashboardParallaxRef.current.style.transform = `translateY(${rate}px)`
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (!mountedRef.current) return

      setProgress((prev: number) => {
        if (prev >= 100) {
          if (mountedRef.current) {
            setActiveCard((current: number) => (current + 1) % 2)
          }
          return 0
        }
        return prev + 2
      })
    }, 100)

    return () => {
      clearInterval(progressInterval)
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleCardClick = (index: number) => {
    if (!mountedRef.current) return
    setActiveCard(index)
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="MedSupport" 
              className="h-15 w-auto object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</a>
            <a href="#services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a>
            <a href="#coverage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Coverage Area</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

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

      <section className="py-12 px-4 bg-card/50 border-y border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-4">
            <StatItem icon={Users} value="500+" label="Medical Providers" />
            <StatItem icon={Globe} value="50+" label="Countries Covered" />
            <StatItem icon={Clock} value="24/7" label="Availability" />
            <StatItem icon={Award} value="98%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-background via-card/30 to-background">
        <div className="absolute inset-0 -z-10">
          <div 
            ref={(el) => { parallaxRefs.current[7] = el }}
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
          />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/50 rounded-full text-sm text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span>Platform Overview</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Powerful Dashboard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Medical Case Management</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience seamless case tracking, real-time updates, and comprehensive medical assistance coordination
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto mb-8">
            <div 
              ref={dashboardParallaxRef}
              className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                  <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    activeCard === 0 ? "opacity-100 scale-100 blur-0 z-10" : "opacity-0 scale-95 blur-sm z-0"
                  }`}>
                    <img
                      src="/cases.png"
                      alt="Cases Overview Dashboard"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    activeCard === 1 ? "opacity-100 scale-100 blur-0 z-10" : "opacity-0 scale-95 blur-sm z-0"
                  }`}>
                    <img
                      src="/case.png"
                      alt="Detailed Case View"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto">
            <div className="grid gap-0 md:grid-cols-2 border border-border/50 rounded-xl overflow-hidden bg-card/50">
              <DashboardFeatureCard
                title="Case Overview"
                description="Real-time dashboard with comprehensive case statistics and status tracking"
                isActive={activeCard === 0}
                progress={activeCard === 0 ? progress : 0}
                onClick={() => handleCardClick(0)}
                icon={LayoutDashboard}
              />
              <DashboardFeatureCard
                title="Case Details"
                description="Detailed case information with patient data, medical history, and treatment plans"
                isActive={activeCard === 1}
                progress={activeCard === 1 ? progress : 0}
                onClick={() => handleCardClick(1)}
                icon={FolderKanban}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-card/30 border-y border-border/50 relative overflow-hidden">
        <div 
          ref={(el) => { parallaxRefs.current[3] = el }}
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"
        />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">OUR VISION</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              MedSupport is committed to being the most trusted provider of medical travel assistance.
            </p>
          </div>
          <div className="space-y-6 text-muted-foreground">
            <VisionCard
              title="Direct Provider Network"
              description="MedSupport has a network of medical and non-medical providers, arranged directly, so the Company-Client does not pay any duplication of the service fee."
              icon={Users}
            />
            <VisionCard
              title="Tailored Service Organization"
              description="Being available to a wide network of providers in each locality, MedSupport, in accordance with the authorization of the Company-Client organizes the most appropriate service to the pathology and the beneficiary's requirements."
              icon={Activity}
            />
            <VisionCard
              title="Cost-Effective Solutions"
              description="In this way, a regular pathology can be managed through a home doctor or a general medical consultation, which implies a significant reduction in costs for the company-client, without entailing a decrease in quality standards."
              icon={TrendingUp}
            />
            <VisionCard
              title="Local Market Pricing"
              description="The direct contracting of suppliers allows MedSupport to negotiate prices per service based on the average prices of that specific service in the local market."
              icon={BarChart3}
            />
            <VisionCard
              title="Volume-Based Negotiations"
              description="MedSupport negotiates costs based on the average price of the particular service within the locality, based on criteria of concentration of volume of cases and prompt payment."
              icon={FileText}
            />
            <VisionCard
              title="Quality Control"
              description="Direct contracting with suppliers implies not only a reduction in costs for the benefit of the Client-Company, greater control over the services performed by the supplier but also greater quality control of each and every one of the services performed."
              icon={Shield}
            />
          </div>
        </div>
      </section>

      <section id="services" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">OUR SERVICES</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Comprehensive medical and non-medical services for travelers worldwide
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              icon={Home}
              title="HOUSE CALL"
              subtitle="General Practitioner Medical Services"
              description="Home doctor service 24 hours a day, 365 days a year in most cities in Europe, Africa, the Middle East, and Latin America."
              gradient="from-blue-500/20 to-blue-500/5"
            />
            <ServiceCard
              icon={AlertCircle}
              title="EMERGENCY SERVICES"
              subtitle="24/7 Emergency Care"
              description="MedSupport has, in all the localities of its coverage areas, emergency services, either in private and/or public entities, where General Medicine, Internal Medicine, Radiology, and Traumatology services are offered."
              gradient="from-red-500/20 to-red-500/5"
            />
            <ServiceCard
              icon={Stethoscope}
              title="SPECIALIST DOCTORS"
              subtitle="Expert Medical Specialists"
              description="In the most important localities, MedSupport has 24-hour emergency services with specialists such as traumatology, pediatrics, gynecology, ophthalmology."
              gradient="from-purple-500/20 to-purple-500/5"
            />
            <ServiceCard
              icon={Building2}
              title="OFFICE VISIT"
              subtitle="Clinic Consultations"
              description="Access to professional medical consultations at partner clinics and medical facilities in your location."
              gradient="from-green-500/20 to-green-500/5"
            />
            <ServiceCard
              icon={Heart}
              title="OTHER HEALTH CARE SERVICES"
              subtitle="Comprehensive Care"
              description="Includes Imaging, Nursing, Physiotherapy, Laboratories, Podiatry and Rehabilitation."
              gradient="from-pink-500/20 to-pink-500/5"
            />
            <ServiceCard
              icon={Plane}
              title="NON-MEDICAL SERVICES"
              subtitle="Travel Support"
              description="We offer you additional services to complement the medical services offered, including cash advance services, taxi services, hotel reservations, airlines tickets etc."
              gradient="from-orange-500/20 to-orange-500/5"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 relative overflow-hidden">
        <div 
          ref={(el) => { parallaxRefs.current[4] = el }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <ProcessStep
                number={1}
                title="Contact Us"
                description="Reach out through our 24/7 hotline or online portal for immediate assistance"
                icon={Phone}
              />
              <ProcessStep
                number={2}
                title="Service Coordination"
                description="We coordinate with our network of providers to organize the most appropriate service"
                icon={UserCheck}
              />
              <ProcessStep
                number={3}
                title="Quality Care"
                description="Receive professional medical care with full support and follow-up"
                icon={CheckCircle2}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="coverage" className="py-20 px-4 bg-card/30 border-y border-border/50 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">OUR COVERAGE AREA</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We provide medical assistance services across multiple continents
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <CoverageCard 
              region="Europe" 
              description="Comprehensive coverage across European countries with 24/7 availability"
              countries={["France", "Germany", "UK", "Spain", "Italy", "More..."]}
            />
            <CoverageCard 
              region="Africa" 
              description="Medical services available in major African cities and tourist destinations"
              countries={["South Africa", "Morocco", "Egypt", "Kenya", "Tunisia", "More..."]}
            />
            <CoverageCard 
              region="Middle East" 
              description="24/7 assistance throughout the Middle East with specialized care"
              countries={["UAE", "Saudi Arabia", "Qatar", "Jordan", "Lebanon", "More..."]}
            />
            <CoverageCard 
              region="Latin America" 
              description="Full service network across Latin America with local expertise"
              countries={["Mexico", "Brazil", "Argentina", "Chile", "Colombia", "More..."]}
            />
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 relative overflow-hidden">
        <div 
          ref={(el) => { parallaxRefs.current[5] = el }}
          className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5"
        />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Trusted by companies and travelers worldwide
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <TestimonialCard
              name="Sarah Johnson"
              role="Travel Manager"
              company="Global Corp"
              rating={5}
              text="MedSupport has been invaluable for our international employees. Their 24/7 service and professional network give us complete peace of mind."
            />
            <TestimonialCard
              name="Michael Chen"
              role="HR Director"
              company="Tech Solutions"
              rating={5}
              text="The direct provider network means we get quality care at fair prices. Their coordination is seamless and efficient."
            />
            <TestimonialCard
              name="Emma Rodriguez"
              role="Operations Manager"
              company="Travel Agency"
              rating={5}
              text="Outstanding service quality and response time. MedSupport has become our trusted partner for all medical travel assistance needs."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">Why Choose MedSupport?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <FeatureHighlight
                icon={Shield}
                title="Direct Provider Network"
                description="No middlemen, no duplication fees. Direct contracts with providers ensure cost-effective solutions."
              />
              <FeatureHighlight
                icon={Zap}
                title="24/7 Availability"
                description="Round-the-clock service availability across all coverage areas. We're always here when you need us."
              />
              <FeatureHighlight
                icon={Award}
                title="Quality Assured"
                description="Rigorous quality control and monitoring of all services performed by our provider network."
              />
              <FeatureHighlight
                icon={TrendingUp}
                title="Cost Effective"
                description="Local market pricing and volume-based negotiations ensure the best value for your organization."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 relative overflow-hidden">
        <div 
          ref={(el) => { parallaxRefs.current[6] = el }}
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"
        />
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">CONTACT US</h2>
            <p className="text-muted-foreground text-lg">Get in touch with our team</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <ContactCard
              icon={MapPin}
              title="Address"
              content="90000 Tanger
Tanger-Tétouan
TANGER
TANGER-TÉTOUAN 90000
Morocco"
            />
            <ContactCard
              icon={Phone}
              title="Phone"
              content="+212 66 56 63 538"
            />
            <ContactCard
              icon={Mail}
              title="Email"
              content="operations@medsupporttravel.com"
            />
            <ContactCard
              icon={Clock}
              title="Availability"
              content="24 hours a day, 365 days a year"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo.png" 
                  alt="MedSupport" 
                  className="h-9 w-9 object-contain"
                />
                <span className="font-semibold text-foreground">MedSupport</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted provider of medical travel assistance worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#services" className="hover:text-foreground transition-colors">House Call</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">Emergency Services</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">Specialist Doctors</a></li>
                <li><a href="#services" className="hover:text-foreground transition-colors">Non-Medical Services</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#coverage" className="hover:text-foreground transition-colors">Coverage Area</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground pt-8 border-t border-border/50">
            <p>Medical Support Travel © 2026 MedSupportTravel. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function StatItem({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="text-center space-y-2">
      <Icon className="h-8 w-8 text-primary mx-auto" />
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function VisionCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

function ServiceCard({ 
  icon: Icon, 
  title, 
  subtitle,
  description,
  gradient = "from-primary/20 to-primary/5"
}: { 
  icon: React.ElementType
  title: string
  subtitle: string
  description: string
  gradient?: string
}) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative bg-card border border-border/50 rounded-xl p-6 space-y-4 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-sm font-medium text-primary">{subtitle}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

function ProcessStep({
  number,
  title,
  description,
  icon: Icon
}: {
  number: number
  title: string
  description: string
  icon: React.ElementType
}) {
  return (
    <div className="text-center space-y-4">
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
        <div className="relative h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
          {number}
        </div>
      </div>
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function CoverageCard({
  region,
  description,
  countries
}: {
  region: string
  description: string
  countries: string[]
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">{region}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-medium text-foreground mb-2">Coverage includes:</p>
          <div className="flex flex-wrap gap-2">
            {countries.map((country, idx) => (
              <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                {country}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard({
  name,
  role,
  company,
  rating,
  text
}: {
  name: string
  role: string
  company: string
  rating: number
  text: string
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed italic">"{text}"</p>
      <div className="pt-4 border-t border-border/50">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}, {company}</p>
      </div>
    </div>
  )
}

function FeatureHighlight({
  icon: Icon,
  title,
  description
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ContactCard({
  icon: Icon,
  title,
  content
}: {
  icon: React.ElementType
  title: string
  content: string
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-6 space-y-3 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground">{content}</p>
    </div>
  )
}

function DashboardFeatureCard({
  title,
  description,
  isActive,
  progress,
  onClick,
  icon: Icon
}: {
  title: string
  description: string
  isActive: boolean
  progress: number
  onClick: () => void
  icon: React.ElementType
}) {
  return (
    <div
      className={`
        w-full px-6 py-5 flex flex-col justify-start items-start gap-2 cursor-pointer relative
        border-r-0 md:border-r border-border/50 last:border-r-0
        transition-all duration-300
        ${isActive
          ? "bg-card shadow-[0px_0px_0px_1px_hsl(var(--border))_inset]"
          : "bg-card/50 hover:bg-card/80"
        }
      `}
      onClick={onClick}
    >
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-border">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
          isActive ? "bg-primary/20" : "bg-primary/10"
        }`}>
          <Icon className={`h-4 w-4 transition-colors ${
            isActive ? "text-primary" : "text-primary/70"
          }`} />
        </div>
        <h3 className={`text-sm font-semibold transition-colors ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}>
          {title}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
