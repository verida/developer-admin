import Link from "next/link"
import type { ComponentProps } from "react"

import { VeridaNetworkLogo } from "@/assets/verida-network-logo"
import { Button } from "@/components/ui/button"
import { buildAuthUrl } from "@/features/auth/utils"
import { cn } from "@/styles/utils"

const authUrl = buildAuthUrl()

export interface ConnectButtonProps
  extends Omit<ComponentProps<typeof Button>, "children" | "onClick"> {}

export function ConnectButton(props: ConnectButtonProps) {
  const { className, ...buttonProps } = props

  return (
    <Button
      className={cn("w-fit [&_svg]:size-6", className)}
      {...buttonProps}
      asChild
    >
      <Link href={authUrl} className="flex flex-row items-center gap-2">
        <VeridaNetworkLogo className="text-primary-foreground" />
        <span>Connect Verida</span>
      </Link>
    </Button>
  )
}
ConnectButton.displayName = "ConnectButton"
