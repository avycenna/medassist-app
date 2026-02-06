import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
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
  Zap,
  BarChart3,
  Lock,
  Clock
} from "lucide-react"

export default async function HomePage() {
  const session = await getSession()
  
  // If logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">MedAssist</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Benefits</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/setup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/50 rounded-full text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Modern Medical Case Management</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-balance leading-tight">
              Streamline Your Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Case Management</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Automate case ingestion, coordinate providers, and communicate with patients—all in one unified platform designed for medical professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="rounded-full">
                <Link href="/setup">
                  Create Admin Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 bg-card/30 border-y border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">Powerful Features Built for You</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to manage medical cases efficiently and securely</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Mail}
              title="Email Ingestion"
              description="Automatically parse and create cases from incoming medical referral emails without manual data entry."
              gradient="from-blue-500/20 to-blue-500/5"
            />
            <FeatureCard
              icon={Users}
              title="Provider Management"
              description="Create accounts and assign cases to medical professionals with granular access controls."
              gradient="from-emerald-500/20 to-emerald-500/5"
            />
            <FeatureCard
              icon={MessageCircle}
              title="Secure Communication"
              description="Enable patient communication with secure magic links—no account creation required."
              gradient="from-purple-500/20 to-purple-500/5"
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Owners manage the system while providers focus on their assigned cases with proper permissions."
              gradient="from-orange-500/20 to-orange-500/5"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
            <StatCard icon={BarChart3} label="Faster Case Processing" value="80%" detail="Reduction in manual work" />
            <StatCard icon={Clock} label="Time to Setup" value="<10" detail="Minutes to get started" />
            <StatCard icon={Lock} label="Enterprise Security" value="100%" detail="HIPAA-ready infrastructure" />
            <StatCard icon={Zap} label="Real-time Updates" value="Live" detail="Instant case synchronization" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-card/30 border-y border-border/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">How It Works</h2>
            <p className="text-muted-foreground">Simple workflow to manage your medical cases from start to finish</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <StepCard
              number={1}
              title="Cases Arrive via Email"
              description="Medical referrals are automatically received, parsed, and organized in your dashboard with patient information extracted."
              icon={Mail}
            />
            <StepCard
              number={2}
              title="Assign to Providers"
              description="Review incoming cases and assign them to available providers. Track status through every step of the workflow."
              icon={Users}
            />
            <StepCard
              number={3}
              title="Patient Communication"
              description="Generate secure magic links for patients to complete intake forms and communicate about their case."
              icon={MessageCircle}
            />
            <StepCard
              number={4}
              title="Track & Complete"
              description="Monitor case progress, collaborate with providers, and mark cases as completed when resolved."
              icon={CheckCircle2}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance">Built for Modern Medical Practices</h2>
              <div className="space-y-5">
                <BenefitItem title="Automated Workflows" description="Reduce manual data entry and human error with intelligent case processing" />
                <BenefitItem title="Secure by Design" description="Enterprise-grade security with role-based access and encrypted communications" />
                <BenefitItem title="Real-time Collaboration" description="Keep your team synchronized with instant updates and notifications" />
                <BenefitItem title="Easy Integration" description="Connects seamlessly with your existing email and communication tools" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 space-y-4">
                <div className="h-2 bg-primary/20 rounded w-3/4" />
                <div className="h-2 bg-primary/20 rounded w-full" />
                <div className="h-2 bg-primary/20 rounded w-5/6" />
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Cases processed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Provider assignments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Patient communications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-t border-border/50">
        <div className="container mx-auto max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-balance">Ready to Transform Your Practice?</h2>
            <p className="text-lg text-muted-foreground">
              Join medical practices already streamlining their case management with MedAssist.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="rounded-full">
              <Link href="/setup">Create Your Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <Link href="/login">Already Have an Account?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              <span className="font-semibold">MedAssist</span>
            </div>
            <p>Medical Case Management Platform © 2026</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  gradient = "from-primary/20 to-primary/5"
}: { 
  icon: React.ElementType
  title: string
  description: string
  gradient?: string
}) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative bg-card border border-border/50 rounded-xl p-6 space-y-4 hover:border-primary/50 transition-colors duration-300">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

function StepCard({
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
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl" />
      <div className="relative bg-card border border-border/50 rounded-xl p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {number}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: React.ElementType
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="text-center space-y-3 p-6 rounded-lg border border-border/50 bg-card/50">
      <Icon className="h-8 w-8 text-primary mx-auto" />
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function BenefitItem({
  title,
  description
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 items-start">
      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
