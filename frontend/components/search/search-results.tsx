"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Trash2 } from "lucide-react"

const mockResults = [
  {
    id: 1,
    title: "Advanced Molecular Modeling Techniques",
    pmcid: "PMC7945821",
    authors: "Smith, J., et al.",
    year: 2023,
    figures: 14,
    graphs: 6,
    status: "completed",
  },
  {
    id: 2,
    title: "Protein Structure Analysis and Prediction",
    pmcid: "PMC7823456",
    authors: "Johnson, M., et al.",
    year: 2023,
    figures: 19,
    graphs: 8,
    status: "completed",
  },
  {
    id: 3,
    title: "Quantum Chemistry Methods in Drug Design",
    pmcid: "PMC7654321",
    authors: "Williams, R., et al.",
    year: 2022,
    figures: 22,
    graphs: 10,
    status: "processing",
  },
]

export function SearchResults() {
  return (
    <div className="space-y-4">
      {mockResults.map((result) => (
        <Card key={result.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {result.authors} • {result.year}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{result.pmcid}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{result.figures} Figuras</Badge>
                <Badge variant="outline">{result.graphs} Gráficos</Badge>
                <Badge variant={result.status === "completed" ? "default" : "secondary"}>
                  {result.status === "completed" ? "✓ Processado" : "Processando"}
                </Badge>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
                <Button size="sm" variant="ghost" className="ml-auto text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
