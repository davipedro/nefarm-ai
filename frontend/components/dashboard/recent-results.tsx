"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"

const recentResults = [
  {
    id: 1,
    title: "Structural Analysis of Protein Binding",
    pmcid: "PMC7854320",
    figures: 12,
    graphs: 5,
    status: "completed",
    date: "2024-11-08",
  },
  {
    id: 2,
    title: "Molecular Dynamics Simulation Results",
    pmcid: "PMC7821456",
    figures: 18,
    graphs: 8,
    status: "completed",
    date: "2024-11-07",
  },
  {
    id: 3,
    title: "Enzyme Kinetics and Substrate Interaction",
    pmcid: "PMC7798901",
    figures: 15,
    graphs: 6,
    status: "processing",
    date: "2024-11-06",
  },
  {
    id: 4,
    title: "Crystal Structure Determination Methods",
    pmcid: "PMC7765432",
    figures: 21,
    graphs: 9,
    status: "completed",
    date: "2024-11-05",
  },
]

export function RecentResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados Recentes</CardTitle>
        <CardDescription>Suas buscas e extrações de artigos recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentResults.map((result) => (
            <div
              key={result.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-accent/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.title}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{result.pmcid}</span>
                  <span>{result.figures} figuras</span>
                  <span>{result.graphs} gráficos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={result.status === "completed" ? "default" : "secondary"}>
                  {result.status === "completed" ? "Concluído" : "Processando"}
                </Badge>
                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
