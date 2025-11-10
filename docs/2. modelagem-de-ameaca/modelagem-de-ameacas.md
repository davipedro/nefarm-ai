`Modelagem de Ameaças solicitada pelo professor:`

# Modelagem de Ameaças

# 🧰 Tutorial Prático: Modelagem de Ameaças

## 🎯 Objetivo

Aprender a identificar, documentar e priorizar ameaças de segurança em sistemas de software, utilizando a metodologia STRIDE e diagramas de fluxo de dados (DFD).

---

## 📌 Etapa 1: Compreendendo a Modelagem de Ameaças

**O que é?**

A modelagem de ameaças é um processo que ajuda a identificar e mitigar possíveis vulnerabilidades em um sistema antes que elas sejam exploradas por atacantes.

**Por que é importante?**

- Identifica vulnerabilidades desde as fases iniciais do desenvolvimento.
- Melhora a comunicação entre equipes de desenvolvimento e segurança.
- Auxilia na priorização de esforços de mitigação com base no risco.[Redalyc.org](https://www.redalyc.org/pdf/2912/291222099008.pdf?utm_source=chatgpt.com)

---

## 🧠 Etapa 2: Conhecendo a Metodologia STRIDE

A metodologia STRIDE categoriza ameaças em seis tipos:

1. **S**poofing (Falsificação de identidade)
2. **T**ampering (Manipulação de dados)
3. **R**epudiation (Repúdio)
4. **I**nformation Disclosure (Divulgação de informações)
5. **D**enial of Service (Negação de serviço)
6. **E**levation of Privilege (Elevação de privilégio)

Cada categoria ajuda a identificar diferentes tipos de ameaças que um sistema pode enfrentar.

---

## 🗺️ Etapa 3: Criando o Diagrama de Fluxo de Dados (DFD)

**Passos:**

1. Identifique os **elementos** do sistema:
    - Processos
    - Armazenamento de dados
    - Fluxos de dados
    - Entidades externas[Uniedusul+4Thomson Reuters+4YouTube+4](https://www.thomsonreuters.com.br/content/dam/ewp-m/documents/brazil/pt/pdf/other/repro-331-desmistificando-os-processos-estruturais-processos-estruturais-e-separacao-de-poderes.pdf?utm_source=chatgpt.com)[Controllab+5Coleções USP+5Comum+5](https://colecoes.abcd.usp.br/fsp/files/original/35de9b723bd4a3d4a28d0872990fbba3.pdf?utm_source=chatgpt.com)[Coleções USP+4SciELO Livros |+4IPEA+4](https://books.scielo.org/id/sb6rs/pdf/valle-9788579831195.pdf?utm_source=chatgpt.com)
2. Desenhe o DFD representando como os dados fluem entre esses elementos.
3. Identifique os **limites de confiança**, ou seja, as fronteiras onde o controle de segurança muda.

---

## 🔍 Etapa 4: Identificando Ameaças com STRIDE

Para cada elemento do DFD, aplique as categorias do STRIDE para identificar possíveis ameaças.

**Exemplo:**

- Para um processo de autenticação de usuário:
    - **Spoofing**: Um atacante pode se passar por outro usuário.
    - **Tampering**: Manipulação de credenciais durante a transmissão.
    - **Repudiation**: Usuário nega ter realizado uma ação.
    - **Information Disclosure**: Exposição de senhas em texto claro.
    - **Denial of Service**: Ataques que sobrecarregam o processo de login.
    - **Elevation of Privilege**: Usuário comum obtém acesso de administrador.

---

## 📝 Etapa 5: Documentando as Ameaças

Para cada ameaça identificada, registre:[Redalyc.org+1Sed+1](https://www.redalyc.org/pdf/2912/291222099008.pdf?utm_source=chatgpt.com)

- **Descrição**: Detalhe da ameaça.
- **Categoria STRIDE**: Tipo de ameaça.
- **Elemento afetado**: Parte do sistema impactada.
- **Impacto potencial**: Consequências da ameaça.
- **Probabilidade de ocorrência**: Alta, média ou baixa.
- **Mitigações sugeridas**: Ações para reduzir o risco.[SciELO Livros |+8Repositoriat ENAP+8Comum+8](https://repositorio.enap.gov.br/bitstream/1/2989/1/171002_inovacao_no_setor_publico.pdf?utm_source=chatgpt.com)

---

## 📊 Etapa 6: Priorizando as Ameaças

Utilize uma matriz de risco para priorizar as ameaças com base em seu impacto e probabilidade.

**Exemplo de matriz:**

| Impacto / Probabilidade | Baixa (5) | Média (10) | Alta (15) |
| --- | --- | --- | --- |
| **Baixo (5)** | 25 | 50 | 75 |
| **Médio (10)** | 50 | 100 | 150 |
| **Alto (15)** | 75 | 150 | 225 |

Ameaças com pontuação mais alta devem ser tratadas com maior prioridade.

---

## 🛡️ Etapa 7: Implementando Mitigações

Para as ameaças priorizadas, implemente as mitigações sugeridas, como:

- Autenticação multifator.
- Criptografia de dados sensíveis.
- Validação e sanitização de entradas.
- Logs e auditorias de atividades.
- Limitação de tentativas de login.

---

## 🔄 Etapa 8: Revisão e Atualização Contínua

A modelagem de ameaças é um processo contínuo. Revise e atualize regularmente:

- O DFD, conforme o sistema evolui.
- As ameaças identificadas, à medida que novas vulnerabilidades surgem.
- As mitigações implementadas, garantindo sua eficácia.

---

## 📚 Recursos Adicionais

- Artigo: P. Torr, "Demystifying the threat modeling process," IEEE Security & Privacy, vol. 3, no. 5, pp. 66-70, Sept.-Oct. 2005
- Ferramentas para criação de DFDs: draw.io, Lucidchart.
- Planilhas para documentação de ameaças.