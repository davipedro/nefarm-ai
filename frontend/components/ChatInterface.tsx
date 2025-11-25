"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockArticles, Article, Graph } from "@/lib/mockData";
import { toast } from "sonner";

type Message = {
  id: string;
  type: "user" | "assistant" | "results" | "article" | "graph";
  content: string;
  data?: any;
};

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Olá! Digite sua busca para encontrar artigos científicos com gráficos relevantes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simular busca
    setTimeout(() => {
      const resultsMessage: Message = {
        id: Date.now().toString() + "-results",
        type: "results",
        content: `Encontrei ${mockArticles.length} artigos relacionados à sua busca:`,
        data: mockArticles,
      };
      setMessages((prev) => [...prev, resultsMessage]);
      setIsLoading(false);
      toast.success(`${mockArticles.length} artigos encontrados`);
    }, 1500);
  };

  const handleSelectArticle = (article: Article) => {
    const articleMessage: Message = {
      id: Date.now().toString(),
      type: "article",
      content: `Detalhes do artigo: ${article.title}`,
      data: article,
    };
    setMessages((prev) => [...prev, articleMessage]);
  };

  const handleExtractGraph = (graph: Graph, article: Article) => {
    setIsLoading(true);
    const loadingMessage: Message = {
      id: Date.now().toString(),
      type: "assistant",
      content: "Extraindo dados do gráfico...",
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // Simular extração de dados
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== loadingMessage.id));
      const graphMessage: Message = {
        id: Date.now().toString(),
        type: "graph",
        content: `Dados extraídos com sucesso`,
        data: { graph, article },
      };
      setMessages((prev) => [...prev, graphMessage]);
      setIsLoading(false);
      toast.success("Dados extraídos com sucesso!");
    }, 2000);
  };

  const handleExportCSV = (graph: Graph) => {
    if (!graph.extractedData) return;

    // Preparar dados CSV
    const csvHeader = "x,y\n";
    const csvRows = graph.extractedData
      .map((row: any) => `${row.x},${row.y}`)
      .join("\n");
    const csvContent = csvHeader + csvRows;

    // Criar blob e fazer download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graph_${graph.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Dados exportados com sucesso!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "user" ? (
              <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                {message.content}
              </div>
            ) : message.type === "assistant" ? (
              <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                {message.content}
              </div>
            ) : message.type === "results" ? (
              <Card className="w-full p-4">
                <p className="mb-4 font-medium">{message.content}</p>
                <div className="space-y-3">
                  {message.data.map((article: Article) => (
                    <Card
                      key={article.id}
                      className="p-4 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSelectArticle(article)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{article.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {article.authors.join(", ")} • {article.journal} • {article.year}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {article.abstract}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {article.graphCount} gráficos
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            ) : message.type === "article" ? (
              <Card className="w-full p-4">
                <h3 className="font-semibold mb-2">{message.data.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {message.data.authors.join(", ")}
                </p>
                <p className="text-sm mb-4">{message.data.abstract}</p>
                <Separator className="my-4" />
                <h4 className="font-medium mb-3">Gráficos encontrados ({message.data.graphCount})</h4>
                <div className="space-y-3">
                  {message.data.graphs.map((graph: Graph) => (
                    <Card key={graph.id} className="p-0 flex overflow-hidden">
                      <div className="flex gap-4 p-4 flex-1">
                        <img
                          src={graph.imageUrl}
                          alt={graph.type}
                          className="w-32 h-32 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{graph.caption}</p>
                          <Badge variant="secondary" className="text-xs">{graph.type}</Badge>
                        </div>
                      </div>
                      <Button
                        className="rounded-l-none rounded-r-lg h-auto px-6"
                        onClick={() => handleExtractGraph(graph, message.data)}
                        disabled={isLoading}
                      >
                        Extrair Dados
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            ) : message.type === "graph" ? (
              <Card className="w-full p-4">
                <h3 className="font-semibold mb-2">Dados do Gráfico</h3>
                <p className="text-sm text-muted-foreground mb-4">{message.data.graph.caption}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={message.data.graph.imageUrl}
                      alt={message.data.graph.type}
                      className="w-full rounded-lg border"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {message.data.graph.caption}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Dados Extraídos</h4>
                      <Button
                        size="sm"
                        onClick={() => handleExportCSV(message.data.graph)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">X</th>
                            <th className="text-left py-2">Y</th>
                          </tr>
                        </thead>
                        <tbody>
                          {message.data.graph.extractedData?.map((point: any, idx: number) => (
                            <tr key={idx} className="border-b">
                              <td className="py-1">{point.x}</td>
                              <td className="py-1">{point.y}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Buscando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className="border-t bg-background p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder="Digite sua busca"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Esta busca utiliza o Europe PMC, que contém principalmente artigos de acesso aberto.
                    Alguns artigos presentes no PubMed podem não aparecer aqui, pois podem ter acesso
                    restrito e não estar disponíveis no Europe PMC.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
