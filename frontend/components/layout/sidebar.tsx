"use client"

import { createContext, useContext, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Search, ImageIcon, BarChart3, Download, Home, Beaker, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Painel", href: "/", icon: Home },
  { name: "Buscar", href: "/search", icon: Search },
  { name: "Imagens", href: "/images", icon: ImageIcon },
  { name: "Gráficos", href: "/graphs", icon: BarChart3 },
  { name: "Exportar", href: "/export", icon: Download },
]

type MobileMenuContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function useMobileMenu() {
  const context = useContext(MobileMenuContext)
  if (!context) {
    throw new Error("useMobileMenu must be used within MobileMenuProvider")
  }
  return context
}

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <MobileMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileMenuContext.Provider>
  )
}

function SidebarContent({ onNavigate, showCloseButton }: { onNavigate?: () => void; showCloseButton?: boolean }) {
  const pathname = usePathname()

  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border relative">
        <div className="flex items-center gap-2">
          <Beaker className="w-6 h-6 text-sidebar-accent" />
          <span className="font-semibold text-lg">NeFarm AI</span>
        </div>
        <p className="text-xs text-sidebar-foreground/60 mt-1">Assistente de Pesquisa</p>
        {showCloseButton && onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigate}
            className="absolute top-4 right-4 h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar menu</span>
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
        <p>v1.0.0</p>
        <p>Pesquisa Molecular</p>
      </div>
    </>
  )
}

export function Sidebar() {
  // Desktop Sidebar - hidden on mobile, shown on md and up
  return (
    <aside className="hidden md:flex w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col h-screen flex-shrink-0">
      <SidebarContent />
    </aside>
  )
}

export function MobileHeader() {
  const { open, setOpen } = useMobileMenu()

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-sidebar-accent" />
            <span className="font-semibold">NeFarm AI</span>
          </div>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="left" 
          className="w-64 p-0 bg-sidebar text-sidebar-foreground border-0 [&>button]:hidden max-w-[16rem]"
        >
          <div className="flex flex-col h-full">
            <SidebarContent onNavigate={() => setOpen(false)} showCloseButton />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
