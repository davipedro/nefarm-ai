"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SearchForm } from "./search-form"
import { RecentResults } from "./recent-results"
import { StatsOverview } from "./stats-overview"
import { FileText, BarChart3, Package } from "lucide-react"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"search" | "results">("search")

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Assistente de Pesquisa</h1>
        <p className="text-muted-foreground">Busque artigos PubMed e Europe PMC, extraia figuras e exporte dados</p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Search Section */}
        <div className="lg:col-span-2">
          <SearchForm />
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <FileText className="w-4 h-4" />
                Navegar Artigos
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <BarChart3 className="w-4 h-4" />
                Ver Gráficos
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Package className="w-4 h-4" />
                Exportar Dados
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Métodos de Busca</CardTitle>
              <CardDescription>Escolha como buscar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Por PMCID</p>
                  <p className="text-muted-foreground text-xs">ID PMC do PubMed Central</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Por PMID</p>
                  <p className="text-muted-foreground text-xs">ID PubMed para busca de artigos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Por Palavras-chave</p>
                  <p className="text-muted-foreground text-xs">Buscar no banco de dados Europe PMC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Results */}
      <RecentResults />
    </div>
  )
}
