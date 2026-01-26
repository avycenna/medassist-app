"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createCase } from "@/lib/actions/cases"
import type { AssistanceType } from "@/lib/types"

const assistanceTypes: { value: AssistanceType; label: string }[] = [
  { value: "TELECONSULTATION", label: "Teleconsultation" },
  { value: "CLINIC_CONSULT", label: "Clinic Consultation" },
  { value: "HOME_VISIT", label: "Home Visit" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "OTHER", label: "Other" },
]

export default function NewCasePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const dobValue = formData.get("dob") as string
    
    await createCase({
      firstName: formData.get("firstName") as string || undefined,
      lastName: formData.get("lastName") as string || undefined,
      patientName: `${formData.get("firstName") || ""} ${formData.get("lastName") || ""}`.trim() || undefined,
      dob: dobValue ? new Date(dobValue) : undefined,
      address: formData.get("address") as string || undefined,
      phoneNumber: formData.get("phone") as string || undefined,
      email: formData.get("email") as string || undefined,
      symptoms: formData.get("symptoms") as string || undefined,
      assistanceType: (formData.get("assistanceType") as AssistanceType) || undefined,
    })

    router.push("/dashboard/cases")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/cases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Case</h1>
          <p className="text-muted-foreground mt-1">
            Manually add a new medical case to the system.
          </p>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Case Information</CardTitle>
          <CardDescription>
            Enter the patient and case details. All fields are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-foreground">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assistanceType" className="text-foreground">Type of Assistance</Label>
                <Select name="assistanceType">
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assistanceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="patient@example.com"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-foreground">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, Country"
                className="bg-background"
              />
            </div>

            {/* Medical Info */}
            <div className="space-y-2">
              <Label htmlFor="symptoms" className="text-foreground">Symptoms / Complaint</Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                placeholder="Describe the patient's symptoms or chief complaint..."
                rows={4}
                className="bg-background"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Case"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/cases">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
