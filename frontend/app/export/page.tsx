"use client"

import { ExportManager } from "@/components/export/export-manager"

export default function ExportPage() {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exportar Dados</h1>
        <p className="text-muted-foreground">Exporte e gerencie seus dados extraídos em formato CSV</p>
      </div>

      <ExportManager />
    </div>
  )
}
