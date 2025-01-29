import { AppConnectionHandler } from "@/components/app-connection-handler"
import { AppProviders } from "@/components/app-providers"

export interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout(props: AppLayoutProps) {
  const { children } = props

  return (
    <AppConnectionHandler>
      <AppProviders>
        <div className="flex h-dvh flex-col bg-background">
          {/* <AppHeader /> */}
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto">
            <main className="h-full w-full max-w-screen-2xl px-4 pb-0 pt-6 md:px-6 md:pt-10 xl:px-8">
              {children}
            </main>
          </div>
        </div>
      </AppProviders>
    </AppConnectionHandler>
  )
}
AppLayout.displayName = "AppLayout"
