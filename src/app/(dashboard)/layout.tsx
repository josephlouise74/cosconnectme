"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
/* import SidebarLender from "@/components/forms/Lender/SideBarLender";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { SocketProvider } from "@/contexts/SocketProvider";
import { CostumeRentalSocketProvider } from "@/contexts/useCostumeRentalSocket"; */
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";

import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, userRolesData, isLoading } = useSupabaseAuth();
  const pathname = usePathname();

  // Get current role from the API data
  const currentRole = userRolesData?.current_role;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-900" />
      </div>
    );
  }

  return (
    /*  <SocketProvider> */
    /*  <CostumeRentalSocketProvider> */
    <div className="flex min-h-screen bg-muted/40">
      <div className="flex flex-1 flex-col w-full mx-auto">
        <div className={`flex-1 flex ${currentRole === "lender" ? "flex-row" : "flex-col"}`}>
          {currentRole !== "lender" && <Header />}
          {/*   {isAuthenticated && currentRole === "lender" && <SidebarLender />}
 */}
          <main className="flex-1 overflow-auto min-w-[320px]">
            {children}
          </main>

          {currentRole !== "lender" && pathname !== "/costumes/chat" && pathname !== "/" && pathname !== "/messages" && <Footer />}
        </div>
      </div>
    </div>
    /*  </CostumeRentalSocketProvider> */
    /* </SocketProvider> */
  );
}