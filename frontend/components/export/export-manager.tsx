"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, Copy } from "lucide-react"

const mockExports = [
  {
    id: 1,
    name: "Protein_Binding_Study_Nov2024",
    graphs: 12,
    rows: 340,
    size: "2.4 MB",
    created: "2024-11-08",
    status: "ready",
  },
  {
    id: 2,
    name: "Enzyme_Kinetics_Analysis",
    graphs: 8,
    rows: 256,
    size: "1.8 MB",
    created: "2024-11-07",
    status: "ready",
  },
  {
    id: 3,
    name: "Molecular_Dynamics_Data",
    graphs: 15,
    rows: 512,
    size: "3.6 MB",
    created: "2024-11-06",
    status: "ready",
  },
]

export function ExportManager() {
  const [selectedExport, setSelectedExport] = useState<(typeof mockExports)[0] | null>(null)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Export List */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Exportações Disponíveis</CardTitle>
            <CardDescription>Arquivos CSV prontos para download e análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockExports.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExport(exp)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-semibold">{exp.name}.csv</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>{exp.graphs} gráficos</span>
                      <span>{exp.rows} linhas</span>
                      <span>{exp.size}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{exp.created}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Details */}
      <div>
        {selectedExport ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes da Exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome do Arquivo</p>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1 truncate">{selectedExport.name}.csv</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gráficos</span>
                  <span className="font-semibold">{selectedExport.graphs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Linhas de Dados</span>
                  <span className="font-semibold">{selectedExport.rows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamanho do Arquivo</span>
                  <span className="font-semibold">{selectedExport.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado</span>
                  <span className="font-semibold">{selectedExport.created}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar CSV
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
                <Button variant="ghost" className="w-full text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Selecione uma exportação para ver os detalhes
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
