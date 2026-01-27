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
  CheckCircle2
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-md">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">MedSupportTravel</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Medical Case Management Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Streamline your medical practice with automated case ingestion, provider management, and seamless patient communication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/setup">
                Create Admin Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            Everything You Need to Manage Medical Cases
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Mail}
              title="Email Ingestion"
              description="Automatically parse and create cases from incoming medical referral emails."
            />
            <FeatureCard
              icon={Users}
              title="Provider Management"
              description="Create provider accounts and assign cases to the right medical professionals."
            />
            <FeatureCard
              icon={MessageCircle}
              title="Patient Communication"
              description="Secure magic links enable patients to communicate without creating accounts."
            />
            <FeatureCard
              icon={Shield}
              title="Role-Based Access"
              description="Owners manage the system while providers focus on their assigned cases."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-6">
            <Step
              number={1}
              title="Cases Arrive via Email"
              description="Medical case referrals are received via your configured email inbox. The system automatically parses and extracts patient information."
            />
            <Step
              number={2}
              title="Assign to Providers"
              description="Review incoming cases and assign them to available providers. Track status through the complete workflow."
            />
            <Step
              number={3}
              title="Patient Communication"
              description="Generate secure magic links for patients to complete intake forms and communicate about their case."
            />
            <Step
              number={4}
              title="Track & Complete"
              description="Monitor case progress, communicate with patients, and mark cases as completed when resolved."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Set up your medical case management system in minutes.
          </p>
          <Button size="lg" asChild>
            <Link href="/setup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>MedSupportTravel - Medical Case Management Platform</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType
  title: string
  description: string 
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function Step({ 
  number, 
  title, 
  description 
}: { 
  number: number
  title: string
  description: string 
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
          {number}
        </div>
      </div>
      <div className="pt-0.5">
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  )
}
