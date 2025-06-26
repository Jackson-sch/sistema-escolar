import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar"
import ThemeSelector from "../theme-selector"


export function NavSecondary({
  items,
  ...props
}) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <ThemeSelector />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
