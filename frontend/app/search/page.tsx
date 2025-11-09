"use client"

import { SearchResults } from "@/components/search/search-results"
import { SearchFilters } from "@/components/search/search-filters"

export default function SearchPage() {
  return (
    <div className="p-6 lg:p-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Busca de Artigos</h1>
        <p className="text-muted-foreground">Navegue e gerencie seus artigos buscados</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <SearchFilters />
        <div className="lg:col-span-3">
          <SearchResults />
        </div>
      </div>
    </div>
  )
}
