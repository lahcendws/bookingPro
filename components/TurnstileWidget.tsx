'use client'

import React, { useEffect } from 'react'

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
}

export function TurnstileWidget({ siteKey, onVerify }: TurnstileProps) {
  useEffect(() => {
    // Load Cloudflare Turnstile script if not already present
    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    // Define global callback expected by Turnstile
    ;(window as any).onTurnstileSuccess = (token: string) => {
      onVerify(token)
    }
  }, [onVerify])

  if (!siteKey) {
    // In development or if unconfigured, bypass gracefully
    return null
  }

  return (
    <div
      className="cf-turnstile"
      data-sitekey={siteKey}
      data-callback="onTurnstileSuccess"
    />
  )
}
