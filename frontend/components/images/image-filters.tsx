"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function ImageFilters() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipo de Imagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox id="graphs" defaultChecked />
            <Label htmlFor="graphs" className="text-sm cursor-pointer">
              Gráficos
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="diagrams" defaultChecked />
            <Label htmlFor="diagrams" className="text-sm cursor-pointer">
              Diagramas
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="photos" defaultChecked />
            <Label htmlFor="photos" className="text-sm cursor-pointer">
              Fotos
            </Label>
          </div>
          <Button className="w-full mt-4">Aplicar</Button>
        </CardContent>
      </Card>
    </div>
  )
}
