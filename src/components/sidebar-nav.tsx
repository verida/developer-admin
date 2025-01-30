"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { navItems } from "@/config/nav"
import type { NavItem } from "@/config/nav"
import { cn } from "@/styles/utils"

// If you have a classNames utility

// Example simplified styling for the sidebar link:
function SidebarLink({ item }: { item: NavItem }) {
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

export function SidebarNav() {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
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
    </nav>
  )
}
