import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src="/medlogo.jpeg" 
              alt="MedSupport" 
              className="h-10 w-auto object-contain"
            />
          </Link>
          <Button variant="ghost" asChild size="sm">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="bg-card">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using MedSupport Travel's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                MedSupport Travel provides medical travel assistance services, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>24/7 medical assistance coordination</li>
                <li>Emergency medical services</li>
                <li>Home doctor visits</li>
                <li>Specialist doctor consultations</li>
                <li>Non-medical travel support services</li>
                <li>Medical case management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Users of MedSupport Travel services agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide accurate and complete information when requesting services</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the service for any unlawful purpose</li>
                <li>Maintain the confidentiality of account credentials</li>
                <li>Notify MedSupport immediately of any unauthorized use of their account</li>
                <li>Cooperate with medical providers and follow medical advice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Medical Services Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                MedSupport Travel acts as a coordinator and facilitator of medical services. We do not provide direct medical care, diagnosis, or treatment. All medical services are provided by licensed medical professionals who are independent contractors. MedSupport Travel is not responsible for the medical decisions, diagnoses, or treatments provided by third-party medical providers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the maximum extent permitted by law, MedSupport Travel shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Medical outcomes or results of treatment</li>
                <li>Delays or failures in service delivery due to circumstances beyond our control</li>
                <li>Actions or omissions of third-party medical providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Payment terms are as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Services are billed according to the agreed pricing structure</li>
                <li>Payment is due as specified in the service agreement</li>
                <li>Late payments may incur additional fees</li>
                <li>Refunds are subject to the terms of the specific service agreement</li>
                <li>All prices are subject to change with prior notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, trademarks, logos, and intellectual property on the MedSupport Travel platform are the property of MedSupport Travel or its licensors. Users may not reproduce, distribute, or create derivative works without express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information, especially medical and health data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                MedSupport Travel reserves the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Terminate or suspend access to services at any time, with or without cause</li>
                <li>Refuse service to anyone for any reason at any time</li>
                <li>Modify or discontinue services with reasonable notice</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Users may terminate their account at any time by contacting customer service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                MedSupport Travel reserves the right to modify these terms at any time. Users will be notified of significant changes via email or through the platform. Continued use of services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of Morocco, without regard to its conflict of law provisions. Any disputes arising from these terms or the use of our services shall be subject to the exclusive jurisdiction of the courts of Morocco.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-foreground font-medium">MedSupport Travel</p>
                <p className="text-muted-foreground">90000 Tanger, Tanger-Tétouan, Morocco</p>
                <p className="text-muted-foreground">Phone: +212 66 56 63 538</p>
                <p className="text-muted-foreground">Email: operations@medsupporttravel.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Entire Agreement</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and MedSupport Travel regarding the use of our services and supersede all prior agreements and understandings.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
