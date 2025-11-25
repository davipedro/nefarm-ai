# nefarm-ai
Este projeto é uma aplicação interativa para auxiliar pesquisadores em estudos de análise farmacocinética.
Ele realiza buscas no PubMed/Europe PMC, extrai textos e figuras dos artigos científicos, identifica automaticamente gráficos através de visão computacional e converte os dados contidos neles em formato CSV, facilitando a análise e comparação de resultados experimentais.
# 🧬 Pharmacokinetic Research Assistant
> Sistema modular que automatiza a busca, análise e extração de dados de artigos científicos do PubMed e Europe PMC, transformando gráficos experimentais em dados estruturados para pesquisa em análise farmacocinética.

---
# 🧠 PMC Image Extractor

Extrator automatizado de figuras e legendas de artigos científicos disponíveis no **PubMed Central (PMC)** e **Europe PMC**, com classificação automática via IA local.

---

## O Problema

### Contexto

Pesquisadores em análise farmacocinética frequentemente precisam analisar e comparar dados experimentais publicados em artigos científicos. Esses dados geralmente estão apresentados na forma de **gráficos** (barras, linhas, dispersão, etc.) e não em formato tabulado.

### A Dor Identificada

| Problema | Impacto |
|----------|---------|
| **Extração manual de dados de gráficos** | Processo demorado e propenso a erros |
| **Volume massivo de publicações** | Milhares de artigos relevantes para análise |
| **Falta de padronização** | Cada artigo apresenta dados de forma diferente |
| **Tempo gasto em tarefas repetitivas** | Pesquisadores dedicam horas a trabalho mecânico |

### A Solução

O NEFARM-AI automatiza todo o processo:

1. **Busca automatizada** de artigos relevantes
2. **Identificação inteligente** de figuras que são gráficos (vs. ilustrações/fotos)
3. **Extração automática** dos dados contidos nos gráficos
4. **Exportação estruturada** em formato CSV para análise

> **Resultado:** Redução de horas de trabalho manual para minutos de processamento automatizado.


## 🚀 Visão Geral

O **PMC Image Extractor** é uma ferramenta modular voltada à pesquisa científica, que permite:

- 🔍 Buscar artigos por **PMCID**, **PMID** ou **termos de pesquisa** (Europe PMC);
- 🖼️ Extrair automaticamente **figuras e legendas** do HTML do artigo no PMC;
- 🧩 Classificar imagens (separando gráficos) utilizando IA local (Ollama - llama3:8b);
- 📊 Extração automática dos dados dos gráficos utilizando Graph Extractor MCP (Gemini Vision);
- 📦 Exportar os resultados para CSV.

---

## 🏗️ Arquitetura
A arquitetura é **orientada a serviços (SOA)** — cada componente é independente e pode ser executado ou substituído separadamente, facilitando escalabilidade e integração.

### Justificativa
A arquitetura orientada a serviços (SOA) foi escolhida por permitir:
- modularidade, 
- baixo acoplamento
- reuso de componentes

Alinhando-se aos princípios dos MCPs. 
Cada serviço representa uma função independente, facilitando evolução, integração com MCPs e manutenção controlada do sistema.

<!-- <img width="1124" height="1600" alt="image" src="https://github.com/user-attachments/assets/1c78f88a-d7e1-445c-bc0a-38ab2b445c3c" /> -->
<img width="1435" height="860" alt="diagrama-arquitetonico-topologico-simplificado" src="https://github.com/user-attachments/assets/f006e772-0c4d-4553-ac62-745f58ff552e" />


