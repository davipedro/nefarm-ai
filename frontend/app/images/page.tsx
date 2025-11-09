"use client"
import { ImageGrid } from "@/components/images/image-grid"
import { ImageFilters } from "@/components/images/image-filters"

export default function ImagesPage() {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Figuras Extraídas</h1>
        <p className="text-muted-foreground">Navegue e gerencie todas as imagens extraídas dos artigos</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <ImageFilters />
        <div className="lg:col-span-3">
          <ImageGrid />
        </div>
      </div>
    </div>
  )
}
