"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchFilters() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="completed" defaultChecked />
                <Label htmlFor="completed" className="text-sm cursor-pointer">
                  Concluído
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="processing" />
                <Label htmlFor="processing" className="text-sm cursor-pointer">
                  Processando
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="pending" />
                <Label htmlFor="pending" className="text-sm cursor-pointer">
                  Pendente
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold">Intervalo de Data</h3>
            <Input type="date" />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <h3 className="text-sm font-semibold">Mín. de Figuras</h3>
            <Input type="number" placeholder="ex.: 5" />
          </div>

          <Button className="w-full mt-4">Aplicar Filtros</Button>
        </CardContent>
      </Card>
    </div>
  )
}
