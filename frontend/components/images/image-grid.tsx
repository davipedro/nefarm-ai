"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

const mockImages = [
  {
    id: 1,
    name: "Figure 1A",
    source: "PMC7945821",
    type: "graph",
    size: "245 KB",
  },
  {
    id: 2,
    name: "Figure 2",
    source: "PMC7945821",
    type: "diagram",
    size: "189 KB",
  },
  {
    id: 3,
    name: "Figure 3B",
    source: "PMC7823456",
    type: "graph",
    size: "312 KB",
  },
  {
    id: 4,
    name: "Figure 4",
    source: "PMC7823456",
    type: "photo",
    size: "556 KB",
  },
  {
    id: 5,
    name: "Figure 5A",
    source: "PMC7654321",
    type: "graph",
    size: "201 KB",
  },
  {
    id: 6,
    name: "Figure 6C",
    source: "PMC7654321",
    type: "diagram",
    size: "178 KB",
  },
]

const typeColors: Record<string, string> = {
  graph: "bg-primary/10 text-primary",
  diagram: "bg-accent/10 text-accent",
  photo: "bg-secondary/10 text-secondary-foreground",
}

export function ImageGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockImages.map((image) => (
        <Card key={image.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-muted h-40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-muted-foreground/30 mb-2">📊</div>
              <p className="text-sm text-muted-foreground">{image.name}</p>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold truncate">{image.name}</p>
              <p className="text-xs text-muted-foreground">{image.source}</p>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={typeColors[image.type] || ""}>
                {image.type === "graph" ? "Gráfico" : image.type === "diagram" ? "Diagrama" : "Foto"}
              </Badge>
              <span className="text-xs text-muted-foreground">{image.size}</span>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                <Download className="w-3 h-3 mr-1" />
                Salvar
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
