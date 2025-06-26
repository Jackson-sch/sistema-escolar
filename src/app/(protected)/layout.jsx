import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { auth } from "@/auth";
import Navbar from "@/components/navbar/Navbar";
import UserProvider from "@/providers/UserProvider";
import { InstitucionProvider } from "@/providers/institucion-provider";

export default async function DashboardPage({ children }) {
  const session = await auth();
  const { user } = session;

  if (!session) {
    return <div>Not Authenticated</div>;
  }

  return (
    <InstitucionProvider>
      <UserProvider user={user}>
        <SidebarProvider>
          <AppSidebar user={user} />
          <SidebarInset>
            <Navbar />
            <main className="flex-1 pt-4 lg:px-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </UserProvider>
    </InstitucionProvider>
  );
}
