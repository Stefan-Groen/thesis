/**
 * Providers Component
 *
 * This wraps your entire app and provides context to all components.
 *
 * What is a Provider?
 * In React, a "Provider" makes data available to all child components without
 * having to pass it down manually through props.
 *
 * Think of it like Wi-Fi in a building:
 * - Provider = Wi-Fi router
 * - Components = Devices that connect to Wi-Fi
 * - Any component can access the session data (like any device can connect to Wi-Fi)
 *
 * Why do we need this?
 * The SessionProvider from NextAuth gives all components access to:
 * - Current user info
 * - Login status
 * - Session data
 *
 * Without this, useSession() wouldn't work!
 */

"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
