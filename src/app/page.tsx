import { ConnectButton } from "@/features/auth/components/connect-button"
import { RootAuthenticationHandler } from "@/features/auth/components/root-authentication-handler"

export default function RootPage() {
  return (
    <RootAuthenticationHandler>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Verida: AI Developer Admin</h1>
        <ConnectButton />
      </div>
    </RootAuthenticationHandler>
  )
}
RootPage.displayName = "RootPage"
