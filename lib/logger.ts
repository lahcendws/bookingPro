export function logStructured(level: 'info' | 'warn' | 'error', event: string, businessId?: string, requestId?: string, durationMs?: number, meta?: Record<string, any>) {
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj
    const clone: Record<string, any> = {}
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase()
      if (
        lower.includes('password') ||
        lower.includes('token') ||
        lower.includes('secret') ||
        lower.includes('key') ||
        lower.includes('auth') ||
        lower.includes('email') ||
        lower.includes('phone') ||
        lower.includes('address') ||
        lower.includes('payment') ||
        lower.includes('card')
      ) {
        clone[k] = '[REDACTED]'
      } else if (typeof v === 'object') {
        clone[k] = sanitize(v)
      } else {
        clone[k] = v
      }
    }
    return clone
  }

  const logEntry = {
    level,
    event,
    business_id: businessId || null,
    request_id: requestId || null,
    duration_ms: durationMs ?? null,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta: sanitize(meta) } : {}),
  }

  if (level === 'error') {
    console.error(JSON.stringify(logEntry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry))
  } else {
    console.log(JSON.stringify(logEntry))
  }
}
