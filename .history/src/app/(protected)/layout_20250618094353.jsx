import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { auth } from "@/auth";
import Navbar from "@/components/navbar/Navbar";

export default async function DashboardPage({ children }) {
  const session = await auth();
  const { user } = session;

  if (!session) {
    return <div>Not Authenticated</div>;
  }

  return (
    <UserPr
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="overflow-y-hidden" variant="inset">
        <Navbar />
        <main className="flex min-h-screen w-full max-w-full mx-auto flex-col items-center justify-center mt-6 px-4 sm:px-6 lg:px-8 overflow-y-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
