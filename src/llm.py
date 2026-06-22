"""Cliente LLM com suporte a Ollama e modo local de demonstração."""

from __future__ import annotations

import os
import re

import requests

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
MODELO = os.getenv("OLLAMA_MODEL", "llama3.2")


def ollama_disponivel() -> bool:
    try:
        response = requests.get(
            OLLAMA_URL.replace("/api/generate", "/api/tags"),
            timeout=2,
        )
        return response.status_code == 200
    except requests.RequestException:
        return False


def gerar_resposta_ollama(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={"model": MODELO, "prompt": prompt, "stream": False},
        timeout=120,
    )
    response.raise_for_status()
    return response.json()["response"]


def gerar_resposta_local(pergunta: str, contexto: str) -> str:
    """Fallback sem LLM: respostas baseadas em regras e no contexto."""
    pergunta_lower = pergunta.lower()

    if any(p in pergunta_lower for p in ["tempo", "futebol", "política", "receita de"]):
        return (
            "Sou especializada em organização financeira pessoal e não tenho "
            "informação sobre esse assunto. Posso ajudar com gastos, reserva de "
            "emergência ou seus próximos passos financeiros?"
        )

    if "senha" in pergunta_lower or "cpf de outra" in pergunta_lower:
        return (
            "Não solicito nem compartilho senhas ou dados de terceiros. "
            "Posso ajudar com a organização das suas próprias finanças."
        )

    alimentacao = re.search(r"alimenta[cç][aã]o.*?R\$\s*([\d.,]+)", contexto)
    if "alimenta" in pergunta_lower and alimentacao:
        valor = alimentacao.group(1)
        return (
            f"Pelos dados do período, seus gastos com alimentação somam R$ {valor}. "
            "Esse valor inclui supermercado e restaurante. "
            "Próximo passo: comparar esse valor com sua renda e ver se está dentro do planejado."
        )

    if "gast" in pergunta_lower and ("mais" in pergunta_lower or "maior" in pergunta_lower):
        match = re.search(r"Maior categoria de gasto: (\w+)", contexto)
        if match:
            categoria = match.group(1)
            return (
                f"Sua maior categoria de gasto no período é {categoria}. "
                "Isso ajuda a priorizar onde revisar o orçamento. "
                "Próximo passo: listar quais despesas dessa categoria são essenciais e quais podem ser ajustadas."
            )

    if "reserva" in pergunta_lower:
        return (
            "Sua reserva atual é R$ 10.000,00 e a meta é R$ 15.000,00. "
            "Faltam R$ 5.000,00 para completar (67% do objetivo). "
            "Próximo passo: definir um valor mensal para aportar até junho/2026."
        )

    if "cdi" in pergunta_lower:
        return (
            "CDI é uma taxa de referência usada no mercado financeiro. "
            "Investimentos que rendem '102% do CDI', por exemplo, acompanham essa taxa com um bônus. "
            "Próximo passo: se quiser, posso explicar como isso se relaciona com a reserva de emergência."
        )

    if "invest" in pergunta_lower and "onde" in pergunta_lower:
        return (
            "Não recomendo onde investir, mas posso explicar como cada tipo de produto funciona "
            "e quais são indicados para reserva de emergência, com base no seu perfil moderado. "
            "Próximo passo: me pergunte sobre Tesouro Selic ou CDB se quiser entender as diferenças."
        )

    if "bbdc" in pergunta_lower or "bovespa" in pergunta_lower:
        return (
            "Não tenho cotações ou rentabilidade de ações específicas na base. "
            "Posso ajudar com seus gastos, metas e conceitos gerais de investimento."
        )

    return (
        "Com base nos dados disponíveis, posso ajudar com gastos do mês, progresso da reserva "
        "de emergência, metas financeiras e explicação de produtos. "
        "Qual desses temas você quer explorar primeiro?"
    )


def gerar_resposta(prompt: str, pergunta: str = "", contexto: str = "") -> tuple[str, str]:
    if ollama_disponivel():
        return gerar_resposta_ollama(prompt), "ollama"
    return gerar_resposta_local(pergunta, contexto), "local"