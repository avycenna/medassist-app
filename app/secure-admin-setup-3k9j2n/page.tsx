"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Stethoscope, Loader2, ShieldCheck } from "lucide-react"
import { createSecureOwner } from "@/lib/actions/auth"

export default function SecureSetupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [setupKeyVerified, setSetupKeyVerified] = useState(false)
  const [setupKey, setSetupKey] = useState("")

  const SETUP_KEY = "MedAssist_2026_Secure_Setup"

  function verifySetupKey() {
    if (setupKey === SETUP_KEY) {
      setSetupKeyVerified(true)
      setError(null)
    } else {
      setError("Invalid setup key. Access denied.")
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await createSecureOwner(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (!setupKeyVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-full">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Secure Setup</CardTitle>
            <CardDescription>Enter the setup key to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="setupKey" className="text-foreground">Setup Key</Label>
                <Input
                  id="setupKey"
                  type="password"
                  placeholder="Enter setup key"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      verifySetupKey()
                    }
                  }}
                />
              </div>
              
              <Button onClick={verifySetupKey} className="w-full">
                Verify Setup Key
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Create Administrator Account</CardTitle>
          <CardDescription>
            Set up your medical assistance management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Dr. John Doe"
                required
                autoComplete="name"
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                autoComplete="email"
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="bg-background"
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Create Administrator Account
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              This will create the main administrator account with full access to the system.
              This page will be disabled after the first owner account is created.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
