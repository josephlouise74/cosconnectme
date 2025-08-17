"use client"

import type React from "react"

import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"

import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentRole, isLoading } = useSupabaseAuth()
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-900" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="flex flex-1 flex-col w-full mx-auto">
        <div className={`flex-1 flex ${currentRole === "lender" ? "flex-row" : "flex-col"}`}>
          {currentRole !== "lender" && <Header />}

          <main className="flex-1 overflow-auto min-w-[320px]">{children}</main>

          {currentRole !== "lender" &&
            pathname !== "/costumes/chat" &&
            pathname !== "/" &&
            pathname !== "/messages" && <Footer />}
        </div>
      </div>
    </div>
  )
}
