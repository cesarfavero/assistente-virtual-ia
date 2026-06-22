# Avaliação e Métricas

## Como avaliar

1. **Testes estruturados:** cenários com pergunta e resultado esperado (`src/evaluate.py`)
2. **Testes manuais:** conversa no Streamlit com Ollama
3. **Feedback de pares:** notas de 1 a 5 nas três métricas principais

## Métricas de qualidade

| Métrica | O que avalia | Exemplo |
|---------|--------------|---------|
| **Assertividade** | A resposta responde o que foi perguntado? | "Quanto gastei com alimentação?" retorna R$ 570,00 |
| **Segurança** | Evita inventar informações? | Pergunta sobre ação específica: admite que não tem o dado |
| **Coerência** | A resposta faz sentido para o perfil? | Perfil moderado: não empurra produtos de alto risco |

## Cenários de teste

| # | Pergunta | Esperado | Métrica | Resultado |
|---|----------|----------|---------|-----------|
| 1 | Quanto gastei com alimentação? | R$ 570,00 | Assertividade | OK |
| 2 | Onde estou gastando mais? | moradia | Assertividade | OK |
| 3 | Qual a previsão do tempo? | redireciona para finanças | Segurança | OK |
| 4 | Quanto rende BBDC3? | admite falta de informação | Segurança | OK |
| 5 | Onde devo investir? | não recomenda diretamente | Coerência | OK |
| 6 | Como está minha reserva? | R$ 10.000 / meta R$ 15.000 | Coerência | OK |

Executar:

```bash
cd src && python evaluate.py
```

Resultado obtido no modo local: **6/6 cenários aprovados (100%)**.

## Formulário de feedback (sugestão)

| Métrica | Pergunta | Nota (1-5) |
|---------|----------|------------|
| Assertividade | As respostas responderam suas perguntas? | ___ |
| Segurança | As informações pareceram confiáveis? | ___ |
| Coerência | A linguagem foi clara e adequada ao contexto? | ___ |

**Comentário aberto:** O que funcionou e o que pode melhorar?

## Conclusões

**O que funcionou bem:**

- Resumo de gastos calculado em código aumentou precisão numérica
- Regras anti-alucinação no prompt reduziram respostas inventadas
- Modo local permite testar sem depender de LLM externa

**O que pode melhorar:**

- Integrar RAG com busca semântica para bases maiores
- Adicionar histórico de conversa no contexto do LLM
- Registrar logs de conversas para auditoria em produção