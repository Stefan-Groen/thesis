"use client"

import * as React from "react"
import {
  IconNews,
  IconAlertTriangle,
  IconSparkles,
  IconCircle,
  IconStarFilled,
  IconUser,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "All Articles",
      url: "/dashboard/articles",
      icon: IconNews,
    },
    {
      title: "Threats",
      url: "/dashboard/threats",
      icon: IconAlertTriangle,
    },
    {
      title: "Opportunities",
      url: "/dashboard/opportunities",
      icon: IconSparkles,
    },
    {
      title: "Neutral",
      url: "/dashboard/neutral",
      icon: IconCircle,
    },
    {
      title: "Starred",
      url: "/dashboard/starred",
      icon: IconStarFilled,
    },
    {
      title: "Own Articles",
      url: "/dashboard/user_uploaded",
      icon: IconUser,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <ThemeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {/* Footer intentionally left empty */}
      </SidebarFooter>
    </Sidebar>
  )
}
