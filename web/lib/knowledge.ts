import fs from "fs";
import path from "path";

import perfil from "@/data/perfil_investidor.json";
import produtos from "@/data/produtos_financeiros.json";
import glossario from "@/data/glossario_financeiro.json";

type Transacao = {
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: "entrada" | "saida";
};

const dataDir = path.join(process.cwd(), "data");

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

function loadTransacoes(): Transacao[] {
  const raw = fs.readFileSync(path.join(dataDir, "transacoes.csv"), "utf-8");
  return parseCsv(raw).map((row) => ({
    data: row.data,
    descricao: row.descricao,
    categoria: row.categoria,
    valor: parseFloat(row.valor),
    tipo: row.tipo as "entrada" | "saida",
  }));
}

function fmtMoeda(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function resumirGastos(transacoes: Transacao[]) {
  const saidas = transacoes.filter((t) => t.tipo === "saida");
  const porCategoria: Record<string, number> = {};
  for (const t of saidas) {
    porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + t.valor;
  }
  const sorted = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const receitas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((s, t) => s + t.valor, 0);
  const totalSaidas = saidas.reduce((s, t) => s + t.valor, 0);
  return {
    receitas,
    totalSaidas,
    saldo: receitas - totalSaidas,
    porCategoria: Object.fromEntries(sorted),
    maiorCategoria: sorted[0]?.[0] ?? null,
  };
}

export function statusReserva(resumo: ReturnType<typeof resumirGastos>) {
  const meta = perfil.reserva_emergencia_meta ?? perfil.renda_mensal * 3;
  const atual = perfil.reserva_emergencia_atual;
  const falta = Math.max(meta - atual, 0);
  const coberturaMeses =
    resumo.totalSaidas > 0 ? atual / resumo.totalSaidas : 0;
  return {
    atual,
    meta,
    falta,
    percentual: meta ? Math.round((atual / meta) * 1000) / 10 : 0,
    coberturaMeses: Math.round(coberturaMeses * 10) / 10,
  };
}

export function montarContexto(): string {
  const transacoes = loadTransacoes();
  const historicoRaw = fs.readFileSync(
    path.join(dataDir, "historico_atendimento.csv"),
    "utf-8"
  );
  const resumo = resumirGastos(transacoes);
  const reserva = statusReserva(resumo);
  const linhasCategorias = Object.entries(resumo.porCategoria)
    .map(([cat, valor]) => `- ${cat}: ${fmtMoeda(valor)}`)
    .join("\n");

  return `
CLIENTE: ${perfil.nome}, ${perfil.idade} anos, ${perfil.profissao}
PERFIL DE INVESTIDOR: ${perfil.perfil_investidor}
OBJETIVO: ${perfil.objetivo_principal}
RENDA MENSAL: ${fmtMoeda(perfil.renda_mensal)}
PATRIMÔNIO: ${fmtMoeda(perfil.patrimonio_total)}

RESERVA DE EMERGÊNCIA:
- Atual: ${fmtMoeda(reserva.atual)}
- Meta: ${fmtMoeda(reserva.meta)}
- Falta para completar: ${fmtMoeda(reserva.falta)}
- Progresso: ${reserva.percentual}%
- Cobertura estimada: ${reserva.coberturaMeses} meses de gastos do período

RESUMO FINANCEIRO (transacoes.csv):
- Receitas no período: ${fmtMoeda(resumo.receitas)}
- Saídas no período: ${fmtMoeda(resumo.totalSaidas)}
- Saldo do período: ${fmtMoeda(resumo.saldo)}
- Maior categoria de gasto: ${resumo.maiorCategoria}
Gastos por categoria:
${linhasCategorias}

METAS:
${JSON.stringify(perfil.metas, null, 2)}

HISTÓRICO DE ATENDIMENTO:
${historicoRaw.trim()}

PRODUTOS DISPONÍVEIS (apenas para explicar, não recomendar):
${JSON.stringify(produtos, null, 2)}

GLOSSÁRIO:
${JSON.stringify(glossario, null, 2)}
`.trim();
}

export const sugestoes = [
  "Quanto gastei com alimentação?",
  "Onde estou gastando mais?",
  "Como está minha reserva de emergência?",
  "O que é CDI?",
];