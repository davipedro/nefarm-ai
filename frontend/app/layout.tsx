import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AppLayout } from "@/components/layout/app-layout"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NeFarm AI - Assistente de Pesquisa",
  description: "Assistente de Pesquisa Molecular para artigos PubMed & PMC",

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        <AppLayout>{children}</AppLayout>
        <Analytics />
      </body>
    </html>
  )
}
