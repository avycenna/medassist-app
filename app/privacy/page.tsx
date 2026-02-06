import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="bg-card">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                MedSupport Travel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical travel assistance services. Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">2.1 Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect personal information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Name, date of birth, and contact information (email, phone, address)</li>
                <li>Passport and identification documents</li>
                <li>Nationality and travel information</li>
                <li>Payment and billing information</li>
                <li>Account credentials and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Medical and Health Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As a medical travel assistance provider, we collect sensitive health information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Medical symptoms and complaints</li>
                <li>Medical history and conditions</li>
                <li>Treatment records and medical reports</li>
                <li>Prescription information</li>
                <li>Communications with medical providers</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.3 Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We automatically collect certain information when you use our services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Location data (when permitted)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To provide and coordinate medical travel assistance services</li>
                <li>To connect you with appropriate medical providers</li>
                <li>To process payments and manage billing</li>
                <li>To communicate with you about your cases and services</li>
                <li>To improve our services and user experience</li>
                <li>To comply with legal obligations and regulatory requirements</li>
                <li>To prevent fraud and ensure security</li>
                <li>To send important updates and notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Legal Basis for Processing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We process your personal data based on:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Contractual necessity:</strong> To fulfill our service agreement with you</li>
                <li><strong>Legal obligation:</strong> To comply with applicable laws and regulations</li>
                <li><strong>Legitimate interests:</strong> To improve services and ensure security</li>
                <li><strong>Consent:</strong> Where you have provided explicit consent</li>
                <li><strong>Vital interests:</strong> To protect your health and safety in medical emergencies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.1 Medical Providers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We share necessary medical information with licensed medical professionals and healthcare facilities to coordinate your care.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.2 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share information with third-party service providers who assist in operations, such as payment processors, IT services, and communication platforms.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.3 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may disclose information when required by law, court order, or government regulation, or to protect our rights and safety.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">5.4 Business Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We retain your personal data for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide our services and fulfill contractual obligations</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain medical records as required by law</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Medical records may be retained for extended periods as required by healthcare regulations. When data is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (subject to legal requirements)</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided in Section 12.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve website functionality and user experience</li>
                <li>Provide personalized content</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit certain features of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child without parental consent, we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-foreground font-medium">MedSupport Travel</p>
                <p className="text-foreground font-medium">Data Protection Officer</p>
                <p className="text-muted-foreground">90000 Tanger, Tanger-Tétouan, Morocco</p>
                <p className="text-muted-foreground">Phone: +212 66 56 63 538</p>
                <p className="text-muted-foreground">Email: operations@medsupporttravel.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Complaints</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you believe we have not addressed your privacy concerns adequately, you have the right to file a complaint with the relevant data protection authority in your jurisdiction.
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
