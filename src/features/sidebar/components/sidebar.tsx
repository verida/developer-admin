"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { SIDEBAR_ITEMS } from "@/features/sidebar/constants"
import type { SidebarItem } from "@/features/sidebar/types"
import { useVeridaAuth } from "@/features/verida-auth/hooks/use-verida-auth"
import { cn } from "@/styles/utils"

function SidebarLink({ item }: { item: SidebarItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={cn(
        "block rounded px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {item.title}
    </Link>
  )
}

export function Sidebar() {
  const { disconnect } = useVeridaAuth()

  return (
    <nav className="flex h-full flex-col justify-between">
      <div className="space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          // If the item has nested items (e.g. Sandbox), we can render those as well:
          if (item.items?.length) {
            return (
              <div key={item.title}>
                <SidebarLink item={{ title: item.title, href: item.href }} />
                <div className="ml-4 mt-1 space-y-1">
                  {item.items.map((subItem) => (
                    <SidebarLink key={subItem.title} item={subItem} />
                  ))}
                </div>
              </div>
            )
          }

          return <SidebarLink key={item.title} item={item} />
        })}
      </div>
      <Button onClick={disconnect} variant="secondary" className="w-full">
        Disconnect
      </Button>
    </nav>
  )
}
