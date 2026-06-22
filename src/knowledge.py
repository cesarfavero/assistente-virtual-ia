"""Carrega e resume a base de conhecimento do assistente."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_perfil() -> dict:
    with open(DATA_DIR / "perfil_investidor.json", encoding="utf-8") as f:
        return json.load(f)


def load_transacoes() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "transacoes.csv")


def load_historico() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "historico_atendimento.csv")


def load_produtos() -> list[dict]:
    with open(DATA_DIR / "produtos_financeiros.json", encoding="utf-8") as f:
        return json.load(f)


def load_glossario() -> list[dict]:
    with open(DATA_DIR / "glossario_financeiro.json", encoding="utf-8") as f:
        return json.load(f)


def resumir_gastos(transacoes: pd.DataFrame) -> dict:
    saidas = transacoes[transacoes["tipo"] == "saida"]
    por_categoria = (
        saidas.groupby("categoria")["valor"].sum().sort_values(ascending=False)
    )
    receitas = transacoes[transacoes["tipo"] == "entrada"]["valor"].sum()
    total_saidas = saidas["valor"].sum()
    return {
        "receitas": float(receitas),
        "total_saidas": float(total_saidas),
        "saldo": float(receitas - total_saidas),
        "por_categoria": {k: float(v) for k, v in por_categoria.items()},
        "maior_categoria": por_categoria.index[0] if not por_categoria.empty else None,
    }


def status_reserva(perfil: dict, resumo_gastos: dict) -> dict:
    meta = perfil.get("reserva_emergencia_meta", perfil["renda_mensal"] * 3)
    atual = perfil["reserva_emergencia_atual"]
    falta = max(meta - atual, 0)
    cobertura_meses = (
        atual / resumo_gastos["total_saidas"]
        if resumo_gastos["total_saidas"] > 0
        else 0
    )
    return {
        "atual": atual,
        "meta": meta,
        "falta": falta,
        "percentual": round((atual / meta) * 100, 1) if meta else 0,
        "cobertura_meses": round(cobertura_meses, 1),
    }


def montar_contexto() -> str:
    perfil = load_perfil()
    transacoes = load_transacoes()
    historico = load_historico()
    produtos = load_produtos()
    glossario = load_glossario()
    resumo = resumir_gastos(transacoes)
    reserva = status_reserva(perfil, resumo)

    def fmt_moeda(valor: float) -> str:
        texto = f"{valor:,.2f}"
        return "R$ " + texto.replace(",", "X").replace(".", ",").replace("X", ".")

    linhas_categorias = "\n".join(
        f"- {cat}: {fmt_moeda(valor)}" for cat, valor in resumo["por_categoria"].items()
    )

    return f"""
CLIENTE: {perfil['nome']}, {perfil['idade']} anos, {perfil['profissao']}
PERFIL DE INVESTIDOR: {perfil['perfil_investidor']}
OBJETIVO: {perfil['objetivo_principal']}
RENDA MENSAL: {fmt_moeda(perfil['renda_mensal'])}
PATRIMÔNIO: {fmt_moeda(perfil['patrimonio_total'])}

RESERVA DE EMERGÊNCIA:
- Atual: {fmt_moeda(reserva['atual'])}
- Meta: {fmt_moeda(reserva['meta'])}
- Falta para completar: {fmt_moeda(reserva['falta'])}
- Progresso: {reserva['percentual']}%
- Cobertura estimada: {reserva['cobertura_meses']} meses de gastos do período

RESUMO FINANCEIRO (transacoes.csv):
- Receitas no período: {fmt_moeda(resumo['receitas'])}
- Saídas no período: {fmt_moeda(resumo['total_saidas'])}
- Saldo do período: {fmt_moeda(resumo['saldo'])}
- Maior categoria de gasto: {resumo['maior_categoria']}
Gastos por categoria:
{linhas_categorias}

METAS:
{json.dumps(perfil['metas'], ensure_ascii=False, indent=2)}

HISTÓRICO DE ATENDIMENTO:
{historico.to_string(index=False)}

PRODUTOS DISPONÍVEIS (apenas para explicar, não recomendar):
{json.dumps(produtos, ensure_ascii=False, indent=2)}

GLOSSÁRIO:
{json.dumps(glossario, ensure_ascii=False, indent=2)}
""".strip()