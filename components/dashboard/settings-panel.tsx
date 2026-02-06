"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Mail, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  Settings,
  Terminal,
  ChevronDown,
  ChevronUp
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
  const [ingestResult, setIngestResult] = useState<{ 
    success: boolean
    message: string
    errors?: string[]
    details?: any
  } | null>(null)
  
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean
    connected: boolean
    message: string
    details?: any
    errors?: string[]
  } | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [messagesToCheck, setMessagesToCheck] = useState(50)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [logPolling, setLogPolling] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    testConnection()
    loadEmailSettings()
    return () => {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (logsEndRef.current && advancedMode) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, advancedMode])

  async function loadEmailSettings() {
    try {
      const response = await fetch("/api/email/settings")
      if (response.ok) {
        const data = await response.json()
        setMessagesToCheck(data.messagesToCheck || 50)
      }
    } catch (error) {
      console.error("Failed to load email settings:", error)
    }
  }

  async function saveEmailSettings() {
    setSavingSettings(true)
    setSettingsSaved(false)
    try {
      const response = await fetch("/api/email/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messagesToCheck }),
      })
      if (response.ok) {
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 3000)
      }
    } catch (error) {
      console.error("Failed to save email settings:", error)
    } finally {
      setSavingSettings(false)
    }
  }

  async function testConnection() {
    setTestingConnection(true)
    try {
      const response = await fetch("/api/email/test-connection")
      const data = await response.json()
      
      setConnectionStatus({
        tested: true,
        connected: data.success,
        message: data.message,
        details: data.details,
        errors: data.errors,
      })
    } catch (error) {
      setConnectionStatus({
        tested: true,
        connected: false,
        message: "Failed to test connection",
        errors: ["Network error or server unavailable"],
      })
    } finally {
      setTestingConnection(false)
    }
  }

  async function fetchLogs() {
    try {
      const response = await fetch("/api/email/ingest/logs")
      if (response.ok) {
        const data = await response.json()
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs)
        }
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    }
  }

  function startLogPolling() {
    setLogs([])
    setLogPolling(true)
    fetchLogs()
    
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current)
    }
    
    logIntervalRef.current = setInterval(() => {
      if (ingesting) {
        fetchLogs()
      } else {
        if (logIntervalRef.current) {
          clearInterval(logIntervalRef.current)
        }
        setLogPolling(false)
      }
    }, 1000)
  }

  function stopLogPolling() {
    if (logIntervalRef.current) {
      clearInterval(logIntervalRef.current)
      logIntervalRef.current = null
    }
    setLogPolling(false)
  }

  async function handleTriggerIngestion() {
    setIngesting(true)
    setIngestResult(null)
    setLogs([])
    
    if (advancedMode) {
      startLogPolling()
    }
    
    try {
      const response = await fetch("/api/email/ingest")
      const data = await response.json()
      
      if (advancedMode) {
        setTimeout(() => {
          fetchLogs()
          stopLogPolling()
        }, 500)
      }
      
      if (data.success) {
        const errorMsg = data.errorDetails && data.errorDetails.length > 0 
          ? ` (${data.errors} errors)`
          : ""
        setIngestResult({
          success: true,
          message: data.message || `Processed ${data.processed} emails, created ${data.created} cases${errorMsg}`,
          errors: data.errorDetails,
        })
      } else {
        setIngestResult({
          success: false,
          message: data.message || data.error || "Failed to run ingestion",
          errors: data.errorDetails,
        })
      }
    } catch (error) {
      if (advancedMode) {
        stopLogPolling()
      }
      setIngestResult({
        success: false,
        message: "Failed to connect to ingestion service",
        errors: [error instanceof Error ? error.message : "Network error"],
      })
    } finally {
      setIngesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure email ingestion and system settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="advanced-mode" className="text-sm font-medium cursor-pointer">
            Advanced Mode
          </Label>
          <Switch
            id="advanced-mode"
            checked={advancedMode}
            onCheckedChange={setAdvancedMode}
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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

        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground">Email Connection Status</CardTitle>
              </div>
              {connectionStatus && (
                <Badge variant={connectionStatus.connected ? "default" : "destructive"}>
                  {connectionStatus.connected ? (
                    <><Wifi className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><WifiOff className="h-3 w-3 mr-1" /> Not Connected</>
                  )}
                </Badge>
              )}
            </div>
            <CardDescription>
              IMAP email server connection configuration and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionStatus && (
              <>
                <Alert variant={connectionStatus.connected ? "default" : "destructive"}>
                  {connectionStatus.connected ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {connectionStatus.connected ? "Configuration Valid" : "Configuration Error"}
                  </AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">{connectionStatus.message}</p>
                    {connectionStatus.details && connectionStatus.details.configured && (
                      <div className="mt-2 space-y-1 text-xs font-mono">
                        <p>Host: {connectionStatus.details.host}</p>
                        <p>Port: {connectionStatus.details.port}</p>
                        <p>User: {connectionStatus.details.user}</p>
                        <p>TLS: {connectionStatus.details.tlsEnabled ? "Enabled" : "Disabled"}</p>
                      </div>
                    )}
                    {connectionStatus.errors && connectionStatus.errors.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs list-disc list-inside">
                        {connectionStatus.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testConnection} 
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Retest Connection</>
                  )}
                </Button>
              </>
            )}
            
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Ingestion Settings</CardTitle>
            </div>
            <CardDescription>
              Configure how many emails to check when determining if it's a new case
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="messagesToCheck">Messages to Check</Label>
              <div className="flex gap-2">
                <Input
                  id="messagesToCheck"
                  type="number"
                  min="1"
                  max="1000"
                  value={messagesToCheck}
                  onChange={(e) => setMessagesToCheck(parseInt(e.target.value) || 50)}
                  className="max-w-[200px]"
                />
                <Button
                  onClick={saveEmailSettings}
                  disabled={savingSettings}
                  size="sm"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : settingsSaved ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Number of unread emails to check when determining if an email is a new case. Default: 50
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Email Ingestion</CardTitle>
            </div>
            <CardDescription>
              Manually trigger email ingestion to check for new cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ingestResult && (
              <Alert variant={ingestResult.success ? "default" : "destructive"}>
                {ingestResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{ingestResult.success ? "Ingestion Complete" : "Ingestion Failed"}</AlertTitle>
                <AlertDescription>
                  <p>{ingestResult.message}</p>
                  {ingestResult.errors && ingestResult.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold">
                        View Error Details ({ingestResult.errors.length})
                      </summary>
                      <ul className="mt-1 space-y-1 text-xs list-disc list-inside">
                        {ingestResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleTriggerIngestion} 
              disabled={ingesting || (connectionStatus?.connected === false)}
              className="w-full"
            >
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
            {connectionStatus && !connectionStatus.connected && (
              <p className="text-xs text-destructive">
                Fix connection errors before running ingestion
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {advancedMode && (
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Live Ingestion Logs</CardTitle>
            </div>
            <CardDescription>
              Real-time logs from email ingestion process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  {ingesting ? "Waiting for logs..." : "No logs available. Start an ingestion to see logs."}
                </div>
              ) : (
                <>
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1 text-green-400">
                      <span className="text-gray-500">[*]</span> {log}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </>
              )}
            </div>
            {logs.length > 0 && (
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogs([])}
                >
                  Clear Logs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
