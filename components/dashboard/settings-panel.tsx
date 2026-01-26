"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Mail, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Database
} from "lucide-react"

interface EmailStats {
  total: number
  processed: number
  withCases: number
  withErrors: number
  pending: number
}

interface SettingsPanelProps {
  emailStats: EmailStats
}

export function SettingsPanel({ emailStats }: SettingsPanelProps) {
  const [ingesting, setIngesting] = useState(false)
  const [ingestResult, setIngestResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; caseId?: string } | null>(null)
  const [emailText, setEmailText] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailFrom, setEmailFrom] = useState("")

  async function handleTriggerIngestion() {
    setIngesting(true)
    setIngestResult(null)
    
    try {
      const response = await fetch("/api/email/ingest")
      const data = await response.json()
      
      if (data.success) {
        setIngestResult({
          success: true,
          message: `Processed ${data.processed} emails, created ${data.created} cases`,
        })
      } else {
        setIngestResult({
          success: false,
          message: data.error || "Failed to run ingestion",
        })
      }
    } catch {
      setIngestResult({
        success: false,
        message: "Failed to connect to ingestion service",
      })
    } finally {
      setIngesting(false)
    }
  }

  async function handleImportEmail() {
    if (!emailText.trim()) return
    
    setImporting(true)
    setImportResult(null)
    
    try {
      const response = await fetch("/api/email/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailText,
          subject: emailSubject || undefined,
          from: emailFrom || undefined,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setImportResult({
          success: true,
          message: "Case created successfully",
          caseId: data.caseId,
        })
        setEmailText("")
        setEmailSubject("")
        setEmailFrom("")
      } else {
        setImportResult({
          success: false,
          message: data.error || "Failed to import email",
        })
      }
    } catch {
      setImportResult({
        success: false,
        message: "Failed to import email",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Ingestion Stats */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Email Processing Statistics</CardTitle>
          </div>
          <CardDescription>
            Overview of processed emails and created cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-2xl font-bold text-foreground">{emailStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Emails</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-2xl font-bold text-foreground">{emailStats.processed}</p>
              <p className="text-xs text-muted-foreground">Processed</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-2xl font-bold text-emerald-600">{emailStats.withCases}</p>
              <p className="text-xs text-muted-foreground">Cases Created</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-2xl font-bold text-amber-600">{emailStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-2xl font-bold text-red-600">{emailStats.withErrors}</p>
              <p className="text-xs text-muted-foreground">Errors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Ingestion Trigger */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Email Ingestion</CardTitle>
          </div>
          <CardDescription>
            Manually trigger email ingestion to check for new cases.
            Configure IMAP settings via environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-md space-y-2 font-mono text-sm">
            <p className="text-muted-foreground">Required environment variables:</p>
            <ul className="text-xs space-y-1 text-foreground">
              <li>IMAP_HOST - IMAP server hostname</li>
              <li>IMAP_PORT - IMAP server port (usually 993)</li>
              <li>IMAP_USER - Email account username</li>
              <li>IMAP_PASSWORD - Email account password</li>
              <li>IMAP_TLS - Enable TLS (true/false)</li>
            </ul>
          </div>
          
          {ingestResult && (
            <Alert variant={ingestResult.success ? "default" : "destructive"}>
              {ingestResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{ingestResult.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{ingestResult.message}</AlertDescription>
            </Alert>
          )}
          
          <Button onClick={handleTriggerIngestion} disabled={ingesting}>
            {ingesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Email Ingestion
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Email Import */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">Manual Email Import</CardTitle>
          </div>
          <CardDescription>
            Paste raw email text to create a case. Useful for testing the parser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-foreground">Subject (optional)</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from" className="text-foreground">From (optional)</Label>
              <Input
                id="from"
                value={emailFrom}
                onChange={(e) => setEmailFrom(e.target.value)}
                placeholder="sender@example.com"
                className="bg-background"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailText" className="text-foreground">Email Content</Label>
            <Textarea
              id="emailText"
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder={`Paste email content here. Example format:

Name: John Doe
DOB: 1985-03-15
Address: 123 Main St, City
Phone: +1 555-123-4567
Symptoms: Headache, fever for 3 days
Kind of assistance: Teleconsultation`}
              rows={10}
              className="bg-background font-mono text-sm"
            />
          </div>
          
          {importResult && (
            <Alert variant={importResult.success ? "default" : "destructive"}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{importResult.success ? "Case Created" : "Import Failed"}</AlertTitle>
              <AlertDescription>
                {importResult.message}
                {importResult.caseId && (
                  <span className="block mt-1 font-mono text-xs">
                    Case ID: {importResult.caseId}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleImportEmail} 
            disabled={importing || !emailText.trim()}
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Email & Create Case"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
