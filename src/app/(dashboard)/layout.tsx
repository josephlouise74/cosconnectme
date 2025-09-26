"use client"

import type React from "react"

import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"

import { usePathname } from "next/navigation"
import SidebarLender from "@/components/Lender/SidebarLender/SideBarLender"
import { SocketProvider } from "@/lib/contexts/SocketProvider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentRole, isLoading, isAuthenticated } = useSupabaseAuth()
  const pathname = usePathname()



  return (
    <SocketProvider>
      <div className="flex min-h-screen bg-muted/40">
        <div className="flex flex-1 flex-col w-full mx-auto">
          <div className={`flex-1 flex ${currentRole === "lender" ? "flex-row" : "flex-col"}`}>
            {currentRole !== "lender" && <Header />}
            {isAuthenticated && currentRole === "lender" && <SidebarLender />}

            <main className="flex-1 overflow-auto min-w-[320px]">{children}</main>

            {currentRole !== "lender" &&
              pathname !== "/costumes/chat" &&
              pathname !== "/" &&
              pathname !== "/messages" && <Footer />}
          </div>
        </div>
      </div>
    </SocketProvider>
  )
}
