export interface SidebarItem {
  title: string
  href: string
  // Optional nested items for collapsible or nested navigation
  items?: SidebarItem[]
}
