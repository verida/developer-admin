"use client"

import { sora } from "@/styles/fonts"
import { cn } from "@/styles/utils"

export default function GlobalError() {
  return (
    <html>
      <body className={cn("h-dvh", sora.variable)}>
        <div>Something went wrong!</div>
      </body>
    </html>
  )
}
GlobalError.displayName = "GlobalError"
