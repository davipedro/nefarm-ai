# nefarm-ai
Este projeto é uma aplicação interativa para auxiliar pesquisadores em estudos de modelagem molecular.
Ele realiza buscas no PubMed/Europe PMC, extrai textos e figuras dos artigos científicos, identifica automaticamente gráficos através de visão computacional e converte os dados contidos neles em formato CSV, facilitando a análise e comparação de resultados experimentais.
# 🧬 Molecular Research Assistant  
> Sistema modular que automatiza a busca, análise e extração de dados de artigos científicos do PubMed e Europe PMC, transformando gráficos experimentais em dados estruturados para pesquisa em modelagem molecular.

---
# 🧠 PMC Image Extractor

Extrator automatizado de figuras e legendas de artigos científicos disponíveis no **PubMed Central (PMC)** e **Europe PMC**, com classificação automática via IA local.

---

## 🚀 Visão Geral

O **PMC Image Extractor** é uma ferramenta modular voltada à pesquisa científica, que permite:

- 🔍 Buscar artigos por **PMCID**, **PMID** ou **termos de pesquisa** (Europe PMC);
- 🖼️ Extrair automaticamente **figuras e legendas** do HTML do artigo no PMC;
- 🧩 Classificar imagens (separando gráficos) utilizando IA local (MobileNetV2);
- 🤖 Automação para extração dos dados dos gráficos utilizando Browse Use MCP;
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

<img width="1124" height="1600" alt="image" src="https://github.com/user-attachments/assets/1c78f88a-d7e1-445c-bc0a-38ab2b445c3c" />

