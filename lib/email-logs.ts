const logs: string[] = []
const MAX_LOGS = 1000

export function addLog(message: string) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const logEntry = `${message}`
  logs.push(logEntry)
  
  if (logs.length > MAX_LOGS) {
    logs.shift()
  }
}

export function getLogs(): string[] {
  return [...logs]
}

export function clearLogs() {
  logs.length = 0
}

export function getRecentLogs(count: number = 100): string[] {
  return logs.slice(-count)
}
