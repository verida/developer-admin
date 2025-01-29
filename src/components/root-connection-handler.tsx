"use client"

import { redirect, useSearchParams } from "next/navigation"

import { useVerida } from "@/features/verida/hooks/use-verida"

const DEFAULT_REDIRECT_PATH = "/dashboard"

export interface RootConnectionHandlerProps {
  children: React.ReactNode
}

export function RootConnectionHandler(props: RootConnectionHandlerProps) {
  const { children } = props

  const { isConnected, isConnecting } = useVerida()

  const searchParams = useSearchParams()
  // Ensure to use the same `redirectPath` search parameter as in `AppConnectionHandler`.
  // TODO: Use nuqs to factorise the redirect path search param.
  const redirectPath = searchParams.get("redirectPath") || DEFAULT_REDIRECT_PATH

  if (isConnected) {
    redirect(decodeURIComponent(redirectPath))
  }

  if (isConnecting) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Connecting...</h1>
      </div>
    )
  }

  return <>{children}</>
}
RootConnectionHandler.displayName = "RootConnectionHandler"
