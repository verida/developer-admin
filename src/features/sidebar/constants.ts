import type { SidebarItem } from "@/features/sidebar/types"

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  // {
  //   title: "Credits",
  //   href: "/credits",
  // },
  {
    title: "Sandbox",
    href: "/sandbox",
    items: [
      {
        title: "Generate Token",
        href: "/sandbox/generate-token",
      },
      {
        title: "Token Info",
        href: "/sandbox/token-info",
      },
      {
        title: "API Requests",
        href: "/sandbox/api-requests",
      },
      {
        title: "Browse Data",
        href: "/sandbox/browse-data",
      },
    ],
  },
]
