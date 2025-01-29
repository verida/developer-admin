import { RootConnectionHandler } from "@/components/root-connection-handler"
import { VeridaConnectButton } from "@/features/verida/components/verida-connect-button"

export default function RootPage() {
  return (
    <RootConnectionHandler>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Landing page when not connected</h1>
        <VeridaConnectButton />
      </div>
    </RootConnectionHandler>
  )
}
RootPage.displayName = "RootPage"
