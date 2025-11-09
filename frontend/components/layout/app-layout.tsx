"use client"

import { Sidebar, MobileHeader, MobileMenuProvider } from "@/components/layout/sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileMenuProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <MobileHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </MobileMenuProvider>
  )
}

