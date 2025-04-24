import { type WebUser, type WebUserProfile } from "@verida/web-helpers"
import React, { createContext } from "react"

export type VeridaContextType = {
  webUserInstanceRef: React.RefObject<WebUser>
  isConnected: boolean
  isConnecting: boolean
  did: string | null
  profile: WebUserProfile | undefined
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  getAccountSessionToken: () => Promise<string>
}

export const VeridaContext = createContext<VeridaContextType | null>(null)
