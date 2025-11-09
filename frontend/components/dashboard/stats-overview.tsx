"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, ImageIcon, Download } from "lucide-react"

const stats = [
  {
    title: "Artigos Buscados",
    value: "24",
    description: "Na sessão atual",
    icon: FileText,
  },
  {
    title: "Figuras Extraídas",
    value: "156",
    description: "De todos os artigos",
    icon: ImageIcon,
  },
  {
    title: "Gráficos Identificados",
    value: "42",
    description: "Classificados por IA",
    icon: BarChart3,
  },
  {
    title: "Exportações de Dados",
    value: "8",
    description: "Arquivos CSV gerados",
    icon: Download,
  },
]

export function StatsOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
