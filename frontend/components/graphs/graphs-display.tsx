"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye } from "lucide-react"

const mockGraphs = [
  {
    id: 1,
    name: "Protein Binding Curve",
    source: "PMC7945821",
    figure: "Figure 1A",
    confidence: "94%",
    dataPoints: 24,
    type: "line-chart",
  },
  {
    id: 2,
    name: "Enzyme Kinetics",
    source: "PMC7945821",
    figure: "Figure 2B",
    confidence: "87%",
    dataPoints: 18,
    type: "scatter-plot",
  },
  {
    id: 3,
    name: "Concentration vs Activity",
    source: "PMC7823456",
    figure: "Figure 3",
    confidence: "91%",
    dataPoints: 32,
    type: "bar-chart",
  },
  {
    id: 4,
    name: "Temperature Effect",
    source: "PMC7654321",
    figure: "Figure 4A",
    confidence: "88%",
    dataPoints: 15,
    type: "line-chart",
  },
]

export function GraphsDisplay() {
  const [selectedGraph, setSelectedGraph] = useState<(typeof mockGraphs)[0] | null>(null)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Graph List */}
      <div className="lg:col-span-2 space-y-4">
        {mockGraphs.map((graph) => (
          <Card
            key={graph.id}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => setSelectedGraph(graph)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{graph.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {graph.figure} de {graph.source}
                    </p>
                    <p>Tipo: {graph.type === "line-chart" ? "Gráfico de Linha" : graph.type === "scatter-plot" ? "Gráfico de Dispersão" : graph.type === "bar-chart" ? "Gráfico de Barras" : graph.type.replace("-", " ")}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge>{graph.confidence}</Badge>
                  <span className="text-xs text-muted-foreground text-right">{graph.dataPoints} pontos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graph Preview */}
      <div>
        {selectedGraph ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visualização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted h-48 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p className="text-sm text-muted-foreground">{selectedGraph.name}</p>
                </div>
              </div>

              <Tabs defaultValue="info" className="space-y-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="data">Dados</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Confiança</p>
                    <p className="font-semibold">{selectedGraph.confidence}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pontos de Dados</p>
                    <p className="font-semibold">{selectedGraph.dataPoints}</p>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="space-y-2 text-sm max-h-32 overflow-y-auto">
                  <p className="text-muted-foreground">Pontos de dados de exemplo:</p>
                  <div className="space-y-1 text-xs font-mono">
                    <p>X: 1.2, Y: 45.3</p>
                    <p>X: 2.4, Y: 52.1</p>
                    <p>X: 3.1, Y: 58.7</p>
                    <p>X: 4.5, Y: 63.2</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" className="flex-1">
                  <Download className="w-3 h-3 mr-1" />
                  CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">Selecione um gráfico para visualizar</CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
