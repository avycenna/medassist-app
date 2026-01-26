"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { submitIntakeForm } from "@/lib/actions/chat"

interface IntakeFormProps {
  token: string
  onComplete: (data: { firstName: string; lastName: string }) => void
}

export function IntakeForm({ token, onComplete }: IntakeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      dob: formData.get("dob") as string,
      address: formData.get("address") as string,
      symptoms: formData.get("symptoms") as string,
      medications: formData.get("medications") as string,
    }

    try {
      await submitIntakeForm(token, data)
      onComplete({ firstName: data.firstName, lastName: data.lastName })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-foreground">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="John"
            required
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            required
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="bg-background"
        />
        <p className="text-xs text-muted-foreground">
          We will use this to send you important updates about your case.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          required
          className="bg-background"
        />
        <p className="text-xs text-muted-foreground">
          We may call you regarding your case if needed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob" className="text-foreground">Date of Birth</Label>
        <Input
          id="dob"
          name="dob"
          type="date"
          required
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-foreground">Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="123 Main St, City, State, ZIP"
          required
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms" className="text-foreground">Current Symptoms</Label>
        <Textarea
          id="symptoms"
          name="symptoms"
          placeholder="Describe your symptoms..."
          required
          className="bg-background min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medications" className="text-foreground">Current Medications</Label>
        <Textarea
          id="medications"
          name="medications"
          placeholder="List any medications you are currently taking (or write 'None')"
          required
          className="bg-background"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Continue to Messages"
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-4">
          By submitting this form, you consent to us contacting you regarding your medical case.
        </p>
      </div>
    </form>
  )
}
