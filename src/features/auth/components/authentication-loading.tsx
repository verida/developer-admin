import type { ComponentProps } from "react"

import { cn } from "@/styles/utils"

export interface AuthenticationLoadingProps
  extends Omit<ComponentProps<"div">, "children"> {}

export function AuthenticationLoading(props: AuthenticationLoadingProps) {
  const { className, ...divProps } = props

  return (
    <div
      className={cn("flex flex-col items-center gap-4 text-center", className)}
      {...divProps}
    >
      <p className="text-lg font-bold">Connecting...</p>
      <p className="text-muted-foreground">
        Please wait while we establish a secure connection. This might take a
        moment.
      </p>
    </div>
  )
}
AuthenticationLoading.displayName = "AuthenticationLoading"
