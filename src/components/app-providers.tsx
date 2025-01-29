"use client"

export interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders(props: AppProvidersProps) {
  const { children } = props

  // Put providers only required for when the user is connected

  // For global providers required in any cases (user not connected), use the RootProviders component.
  return <>{children}</>
}
AppProviders.displayName = "AppProviders"
