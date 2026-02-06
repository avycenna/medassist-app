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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, User, Phone, Mail, MapPin, Calendar, Plane, Shield, Stethoscope, Building, CreditCard, Hash } from "lucide-react"
import Link from "next/link"
import { createCase } from "@/lib/actions/cases"
import type { AssistanceType } from "@/lib/types"
import { toast } from "sonner"

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

    try {
      const formData = new FormData(e.currentTarget)
      
      const dobValue = formData.get("dob") as string
      const registeredDateValue = formData.get("registeredDate") as string
      const reportedDateValue = formData.get("reportedDate") as string
      const idAssistValue = formData.get("idAssist") as string
      const idAssistanceTypeValue = formData.get("idAssistanceType") as string
      const approvedStatusValue = formData.get("approvedStatus") as string
      const idUsersCreatedValue = formData.get("idUsersCreated") as string

      await createCase({
        firstName: formData.get("firstName") as string || undefined,
        lastName: formData.get("lastName") as string || undefined,
        patientName: formData.get("patientName") as string || 
          `${formData.get("firstName") || ""} ${formData.get("lastName") || ""}`.trim() || undefined,
        dob: dobValue ? new Date(dobValue) : undefined,
        address: formData.get("address") as string || undefined,
        phoneNumber: formData.get("phoneNumber") as string || undefined,
        email: formData.get("email") as string || undefined,
        nationality: formData.get("nationality") as string || undefined,
        assistanceType: (formData.get("assistanceType") as AssistanceType) || undefined,
        referenceNumber: formData.get("referenceNumber") as string || undefined,
        availability: formData.get("availability") as string || undefined,
        isoCountry: formData.get("isoCountry") as string || undefined,
        isoCountrySource: formData.get("isoCountrySource") as string || undefined,
        origin: formData.get("origin") as string || undefined,
        passport: formData.get("passport") as string || undefined,
        symptom: formData.get("symptom") as string || undefined,
        symptomDetail: formData.get("symptomDetail") as string || undefined,
        symptoms: formData.get("symptoms") as string || undefined,
        triageColor: formData.get("triageColor") as string || undefined,
        triageLabel: formData.get("triageLabel") as string || undefined,
        triageStatus: formData.get("triageStatus") as string || undefined,
        idAssist: idAssistValue ? parseInt(idAssistValue) : undefined,
        codeAssist: formData.get("codeAssist") as string || undefined,
        clientName: formData.get("clientName") as string || undefined,
        descAssistanceType: formData.get("descAssistanceType") as string || undefined,
        statusAssistLabel: formData.get("statusAssistLabel") as string || undefined,
        statusAssistStatus: formData.get("statusAssistStatus") as string || undefined,
        statusAssistIcon: formData.get("statusAssistIcon") as string || undefined,
        idAssistanceType: idAssistanceTypeValue ? parseInt(idAssistanceTypeValue) : undefined,
        approvedStatus: approvedStatusValue ? parseInt(approvedStatusValue) : undefined,
        idUsersCreated: idUsersCreatedValue ? parseInt(idUsersCreatedValue) : undefined,
        specialityLocation: formData.get("specialityLocation") as string || undefined,
        assignedToAssistance: formData.get("assignedToAssistance") as string || undefined,
        codigo: formData.get("codigo") as string || undefined,
        prefijo: formData.get("prefijo") as string || undefined,
        refund: formData.get("refund") as string || undefined,
        voucherIsManual: formData.get("voucherIsManual") as string || undefined,
        canCancelVoucher: formData.get("canCancelVoucher") as string || undefined,
        registeredDate: registeredDateValue ? new Date(registeredDateValue) : undefined,
        reportedDate: reportedDateValue ? new Date(reportedDateValue) : undefined,
        view: formData.get("view") as string || undefined,
      })

      toast.success("Case created successfully")
      router.push("/dashboard/cases")
    } catch (error) {
      toast.error("Failed to create case")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assistance">Assistance</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
                <CardDescription>
                  Basic patient details and identification
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-foreground">Full Name</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      placeholder="John Doe"
                      className="bg-background"
                    />
                  </div>
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
                    <Label htmlFor="nationality" className="text-foreground">Nationality</Label>
                    <Input
                      id="nationality"
                      name="nationality"
                      placeholder="e.g., US, GB, FR"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-foreground">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address" className="text-foreground">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main St, City, Country"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Case Details
                </CardTitle>
                <CardDescription>
                  Case reference and status information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber" className="text-foreground">Reference Number</Label>
                    <Input
                      id="referenceNumber"
                      name="referenceNumber"
                      placeholder="Enter reference number"
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
                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-foreground">Availability</Label>
                    <Input
                      id="availability"
                      name="availability"
                      placeholder="Enter availability"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registeredDate" className="text-foreground">Registered Date</Label>
                    <Input
                      id="registeredDate"
                      name="registeredDate"
                      type="date"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportedDate" className="text-foreground">Reported Date</Label>
                    <Input
                      id="reportedDate"
                      name="reportedDate"
                      type="date"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Travel Information
                </CardTitle>
                <CardDescription>
                  Travel and location details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="passport" className="text-foreground">Passport/Document</Label>
                    <Input
                      id="passport"
                      name="passport"
                      placeholder="Enter passport number"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin" className="text-foreground">Contact Origin</Label>
                    <Input
                      id="origin"
                      name="origin"
                      placeholder="Enter contact origin"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isoCountrySource" className="text-foreground">From Country</Label>
                    <Input
                      id="isoCountrySource"
                      name="isoCountrySource"
                      placeholder="e.g., US, GB, FR"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isoCountry" className="text-foreground">Destination Country</Label>
                    <Input
                      id="isoCountry"
                      name="isoCountry"
                      placeholder="e.g., US, GB, FR"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assistance" className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Assistance Details
                </CardTitle>
                <CardDescription>
                  Assistance provider and type information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="idAssist" className="text-foreground">Assistance ID</Label>
                    <Input
                      id="idAssist"
                      name="idAssist"
                      type="number"
                      placeholder="Enter assistance ID"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codeAssist" className="text-foreground">Assistance Code</Label>
                    <Input
                      id="codeAssist"
                      name="codeAssist"
                      placeholder="Enter assistance code"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="clientName" className="text-foreground">Insurance Provider</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      placeholder="Enter insurance provider"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="descAssistanceType" className="text-foreground">Assistance Type Description</Label>
                    <Textarea
                      id="descAssistanceType"
                      name="descAssistanceType"
                      placeholder="Enter assistance type description"
                      rows={3}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statusAssistLabel" className="text-foreground">Assistance Status</Label>
                    <Input
                      id="statusAssistLabel"
                      name="statusAssistLabel"
                      placeholder="Enter assistance status"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statusAssistStatus" className="text-foreground">Status Assist Status</Label>
                    <Input
                      id="statusAssistStatus"
                      name="statusAssistStatus"
                      placeholder="Enter status"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statusAssistIcon" className="text-foreground">Status Assist Icon</Label>
                    <Input
                      id="statusAssistIcon"
                      name="statusAssistIcon"
                      placeholder="Enter icon name"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idAssistanceType" className="text-foreground">Assistance Type ID</Label>
                    <Input
                      id="idAssistanceType"
                      name="idAssistanceType"
                      type="number"
                      placeholder="Enter assistance type ID"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvedStatus" className="text-foreground">Approved Status</Label>
                    <Input
                      id="approvedStatus"
                      name="approvedStatus"
                      type="number"
                      placeholder="Enter approved status"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idUsersCreated" className="text-foreground">User Created ID</Label>
                    <Input
                      id="idUsersCreated"
                      name="idUsersCreated"
                      type="number"
                      placeholder="Enter user ID"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialityLocation" className="text-foreground">Speciality Location</Label>
                    <Input
                      id="specialityLocation"
                      name="specialityLocation"
                      placeholder="Enter speciality location"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedToAssistance" className="text-foreground">Assigned To Assistance</Label>
                    <Input
                      id="assignedToAssistance"
                      name="assignedToAssistance"
                      placeholder="Enter assigned to assistance"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="view" className="text-foreground">View</Label>
                    <Input
                      id="view"
                      name="view"
                      placeholder="Enter view"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Voucher & Billing
                </CardTitle>
                <CardDescription>
                  Voucher and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-foreground">Codigo</Label>
                    <Input
                      id="codigo"
                      name="codigo"
                      placeholder="Enter codigo"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefijo" className="text-foreground">Prefijo</Label>
                    <Input
                      id="prefijo"
                      name="prefijo"
                      placeholder="Enter prefijo"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refund" className="text-foreground">Refund</Label>
                    <Input
                      id="refund"
                      name="refund"
                      placeholder="Enter refund"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voucherIsManual" className="text-foreground">Voucher Is Manual</Label>
                    <Input
                      id="voucherIsManual"
                      name="voucherIsManual"
                      placeholder="Enter voucher manual status"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="canCancelVoucher" className="text-foreground">Can Cancel Voucher</Label>
                    <Input
                      id="canCancelVoucher"
                      name="canCancelVoucher"
                      placeholder="Enter cancel voucher status"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Information
                </CardTitle>
                <CardDescription>
                  Symptoms, complaints, and medical details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="symptom" className="text-foreground">Symptom</Label>
                    <Input
                      id="symptom"
                      name="symptom"
                      placeholder="Enter symptom"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symptomDetail" className="text-foreground">Symptom Detail</Label>
                    <Input
                      id="symptomDetail"
                      name="symptomDetail"
                      placeholder="Enter symptom detail"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="symptoms" className="text-foreground">Symptoms / Complaint</Label>
                    <Textarea
                      id="symptoms"
                      name="symptoms"
                      placeholder="Describe the patient's symptoms or chief complaint..."
                      rows={4}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triageLabel" className="text-foreground">Triage Label</Label>
                    <Input
                      id="triageLabel"
                      name="triageLabel"
                      placeholder="Enter triage label"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triageStatus" className="text-foreground">Triage Status</Label>
                    <Input
                      id="triageStatus"
                      name="triageStatus"
                      placeholder="Enter triage status"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triageColor" className="text-foreground">Triage Color</Label>
                    <Input
                      id="triageColor"
                      name="triageColor"
                      placeholder="Enter triage color"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Communication
                </CardTitle>
                <CardDescription>
                  Additional communication notes and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Contact information is available in the Overview tab. Use this section for additional communication notes if needed.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
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
    </div>
  )
}
