export interface NavItem {
  title: string
  href: string
  // Optional nested items for collapsible or nested navigation
  items?: NavItem[]
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Credits",
    href: "/credits",
  },
  {
    title: "Sandbox",
    href: "/sandbox",
    items: [
      {
        title: "Generate API Key",
        href: "/sandbox/generate-api-key",
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
