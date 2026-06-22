# Base de Conhecimento

## Dados utilizados

| Arquivo | Formato | Função na Mira |
|---------|---------|----------------|
| `perfil_investidor.json` | JSON | Perfil, renda, metas e status da reserva |
| `transacoes.csv` | CSV | Histórico de receitas e despesas do período |
| `historico_atendimento.csv` | CSV | Contexto de interações anteriores |
| `produtos_financeiros.json` | JSON | Produtos para explicação educativa |
| `glossario_financeiro.json` | JSON | Definições de termos financeiros |

## Adaptações feitas

1. Inclusão de `glossario_financeiro.json` com conceitos básicos (CDI, Selic, reserva de emergência).
2. Campos `reserva_emergencia_meta` e `meses_cobertura_desejados` no perfil do cliente.
3. Resumo de gastos calculado automaticamente em `knowledge.py` para reduzir erro nas respostas.

## Estratégia de integração

### Carregamento

```python
from knowledge import montar_contexto

contexto = montar_contexto()
```

Os arquivos são lidos em tempo de execução e transformados em um bloco de texto único enviado ao LLM junto com a pergunta.

### Uso no prompt

O contexto entra no prompt do usuário, após o system prompt. Isso garante que a Mira tenha acesso a:

- Dados brutos (perfil, transações, histórico, produtos, glossário)
- Métricas derivadas (gastos por categoria, saldo, progresso da reserva)

## Exemplo de contexto montado

```
CLIENTE: João Silva, 32 anos, Analista de Sistemas
OBJETIVO: Completar a reserva de emergência e organizar os gastos mensais

RESERVA DE EMERGÊNCIA:
- Atual: R$ 10.000,00
- Meta: R$ 15.000,00
- Falta para completar: R$ 5.000,00
- Progresso: 66,7%

RESUMO FINANCEIRO:
- Receitas no período: R$ 5.000,00
- Saídas no período: R$ 2.488,90
- Maior categoria de gasto: moradia
Gastos por categoria:
- moradia: R$ 1.380,00
- alimentacao: R$ 570,00
- transporte: R$ 295,00
...
```