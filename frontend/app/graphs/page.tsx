"use client"

import { GraphsDisplay } from "@/components/graphs/graphs-display"

export default function GraphsPage() {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Análise de Gráficos</h1>
        <p className="text-muted-foreground">Gráficos classificados por IA com dados extraídos</p>
      </div>

      <GraphsDisplay />
    </div>
  )
}
