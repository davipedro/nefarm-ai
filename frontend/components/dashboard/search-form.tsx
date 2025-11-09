"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export function SearchForm() {
  const [loading, setLoading] = useState(false)
  const [pmcId, setPmcId] = useState("")
  const [pmId, setPmId] = useState("")
  const [keywords, setKeywords] = useState("")

  const handleSearch = async (type: "pmc" | "pm" | "keywords") => {
    setLoading(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    console.log(`Search by ${type}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar Artigos</CardTitle>
        <CardDescription>Encontre artigos do PubMed e Europe PMC</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pmc" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pmc">PMCID</TabsTrigger>
            <TabsTrigger value="pm">PMID</TabsTrigger>
            <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
          </TabsList>

          <TabsContent value="pmc" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pmc-id">ID PMC</Label>
              <Input
                id="pmc-id"
                placeholder="ex.: PMC7028984"
                value={pmcId}
                onChange={(e) => setPmcId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Digite o ID do PubMed Central para buscar um artigo</p>
            </div>
            <Button onClick={() => handleSearch("pmc")} disabled={loading || !pmcId} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Buscando..." : "Buscar por PMCID"}
            </Button>
          </TabsContent>

          <TabsContent value="pm" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pm-id">ID PubMed</Label>
              <Input id="pm-id" placeholder="ex.: 32015217" value={pmId} onChange={(e) => setPmId(e.target.value)} />
              <p className="text-xs text-muted-foreground">Digite o ID PubMed para encontrar e buscar o artigo</p>
            </div>
            <Button onClick={() => handleSearch("pm")} disabled={loading || !pmId} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Buscando..." : "Buscar por PMID"}
            </Button>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Termos de Busca</Label>
              <Input
                id="keywords"
                placeholder="ex.: modelagem molecular estrutura proteica"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Buscar no Europe PMC por palavras-chave ou frases</p>
            </div>
            <Button onClick={() => handleSearch("keywords")} disabled={loading || !keywords} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Buscando..." : "Buscar por Palavras-chave"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
