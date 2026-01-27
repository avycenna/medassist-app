"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldOff } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <ShieldOff className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Setup Disabled</CardTitle>
          <CardDescription>
            Public account creation is not available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              This setup page has been disabled for security reasons. Account creation is now restricted to authorized administrators only.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                Go to Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
