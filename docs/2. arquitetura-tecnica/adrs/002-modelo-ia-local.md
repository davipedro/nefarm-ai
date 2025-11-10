# ADR 002: DistilBERT para Classificação de Legendas de Gráficos

## Status
✅ **Aceito**

## Contexto

O sistema precisa identificar automaticamente se uma figura científica é um gráfico ou não. Requisitos:

1. **Modelo local** (requisito acadêmico obrigatório)
2. **Containerizado em Docker** (requisito acadêmico obrigatório)
3. **Leve** - Deve rodar em máquinas modestas
4. **Rápido** - Classificação de dezenas de imagens em segundos
5. **Preciso** - Minimizar falsos positivos/negativos

**Decisão de escopo:**
- Classificação baseada em **texto da legenda** (não na imagem)
- Legendas científicas são altamente descritivas e estruturadas
- Evita overhead de processamento de imagem

**Alternativas consideradas:**

| Modelo | Parâmetros | Velocidade | Precisão | Tamanho |
|--------|-----------|------------|----------|---------|
| BERT-base | 110M | Lento | Alta | ~440 MB |
| **DistilBERT** | 66M | Rápido | Alta | ~256 MB ✅ |
| MiniLM-L6 | 22M | Muito rápido | Média | ~90 MB |
| Regex/Keywords | - | Ultra rápido | Baixa | - |

## Decisão

Utilizaremos **DistilBERT-base-uncased** como modelo de classificação de legendas.

**Estratégia:**
1. Usar modelo pré-treinado do HuggingFace
2. **Fine-tuning opcional** (se precisão for insuficiente):
   - Dataset: Legendas de figuras do PubMed etiquetadas manualmente
   - Técnica: Transfer learning com camada de classificação binária
3. Deploy em container Docker com modelo pré-carregado

**Pipeline de inferência:**
```python
# Pseudocódigo
def classify_caption(caption: str) -> dict:
    tokenized = tokenizer(caption, max_length=128, truncation=True)
    output = model(**tokenized)
    probs = softmax(output.logits)

    return {
        "is_graph": probs[1] > 0.7,  # Threshold configurável
        "confidence": float(probs[1]),
        "graph_type": predict_type(caption)  # Opcional
    }
```

## Consequências

### Positivas ✅
- **Atende requisito acadêmico** de modelo local containerizado
- **Baixo consumo de recursos** (~500 MB RAM em runtime)
- **Inferência rápida** (~50-100ms por legenda em CPU)
- **Modelo maduro e testado** - Ampla adoção na comunidade
- **Facilidade de implementação** - HuggingFace Transformers
- **Fine-tuning possível** - Se precisão for insuficiente

### Negativas ⚠️
- Não analisa a imagem em si (pode perder contextos visuais)
- Dependente da qualidade das legendas
- Modelo não especializado em texto científico (pode requerer fine-tuning)

### Neutras 🔄
- Container Docker será ~1 GB (Python + modelo)
- Necessário ~2 GB de RAM para execução confortável
- Tempo de build do container: ~5-10 minutos (download do modelo)

## Métricas de Sucesso

**Critérios de aceitação:**
- Precisão: >85% na classificação de gráficos
- Recall: >90% (preferimos falsos positivos a falsos negativos)
- Tempo de inferência: <200ms por legenda
- Consumo de memória: <1 GB

**Plano B:**
- Se DistilBERT não atingir métricas → Testar **MiniLM-L6** (mais leve)
- Se ainda insuficiente → Coletar dataset e fazer fine-tuning

## Referências
- [DistilBERT Paper](https://arxiv.org/abs/1910.01108)
- [HuggingFace DistilBERT](https://huggingface.co/distilbert-base-uncased)
- [Docker Image com Transformers](https://huggingface.co/docs/transformers/installation#docker)
