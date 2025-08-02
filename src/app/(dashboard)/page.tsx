"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import WelcomePage from "@/components/auth/WelcomePage";
/* import Dashboard from "@/components/forms/Lender/DashboardLender";
import SocialFeedSection from "@/components/forms/Lender/SocialFeed/SocialFeedSection"; */
import { cn } from "@/lib/utils";
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth";

const Page = () => {
  const { isAuthenticated, userRolesData, isLoading } = useSupabaseAuth();

  // Get current role from the API data
  const currentRole = userRolesData?.current_role;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-900" />
      </div>
    );
  }

  // Show welcome page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col w-full">
        <main className="flex-1 w-full mx-auto">
          <WelcomePage />
        </main>
      </div>
    );
  }

  // Show dashboard for lenders
  if (currentRole === "lender") {
    return (
      <div className="flex overflow-hidden min-h-screen">
        <ScrollArea className="flex-1">
          {/*   <Dashboard /> */}
        </ScrollArea>
      </div>
    );
  }

  // Show social feed for borrowers
  if (currentRole === "borrower") {
    return (
      <div className="flex overflow-hidden min-h-screen">
        {/*  <SocialFeedSection /> */}
      </div>
    );
  }

  // Fallback for any unexpected state
  return (
    <div className="flex items-center justify-center h-screen">
      <p className={cn("text-xl")} >
        Unauthorized Access - Invalid Role
      </p>
    </div>
  );
};

export default Page;