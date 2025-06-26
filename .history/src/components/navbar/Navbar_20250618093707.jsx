import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import LogoutButton from "@/app/(auth)/components/LogoutButton";
import ThemeSelector from "@/components/theme-selector";
import dynamic from "next/dynamic";
import Clock from "@/components/Clock";

export default function Navbar() {
  return (
    <nav className="items-center sticky top-0 h-16 w-full justify-between gap-x-4 flex border-b px-2 md:px-6 backdrop-blur-md bg-background/80 [width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 z-50">
      <div className="flex w-full items-center gap-1 sm:gap-2 px-2 sm:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex w-full justify-end items-center gap-2">
          <ThemeSelector />
          <Clock />
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
