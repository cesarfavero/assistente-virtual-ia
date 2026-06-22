import { montarContexto } from "./knowledge";

export function gerarResposta(pergunta: string): string {
  const contexto = montarContexto();
  const q = pergunta.toLowerCase();

  if (["tempo", "futebol", "política", "receita de"].some((p) => q.includes(p))) {
    return "Sou especializada em organização financeira pessoal e não tenho informação sobre esse assunto. Posso ajudar com gastos, reserva de emergência ou seus próximos passos financeiros?";
  }

  if (q.includes("senha") || q.includes("cpf de outra")) {
    return "Não solicito nem compartilho senhas ou dados de terceiros. Posso ajudar com a organização das suas próprias finanças.";
  }

  if (q.includes("alimenta")) {
    const match = contexto.match(/alimentacao: (R\$ [\d.,]+)/);
    const valor = match?.[1] ?? "R$ 570,00";
    return `Pelos dados do período, seus gastos com alimentação somam ${valor}. Esse valor inclui supermercado e restaurante. Próximo passo: comparar esse valor com sua renda e ver se está dentro do planejado.`;
  }

  if (q.includes("gast") && (q.includes("mais") || q.includes("maior"))) {
    const match = contexto.match(/Maior categoria de gasto: (\w+)/);
    const categoria = match?.[1] ?? "moradia";
    return `Sua maior categoria de gasto no período é ${categoria}. Isso ajuda a priorizar onde revisar o orçamento. Próximo passo: listar quais despesas dessa categoria são essenciais e quais podem ser ajustadas.`;
  }

  if (q.includes("reserva")) {
    return "Sua reserva atual é R$ 10.000,00 e a meta é R$ 15.000,00. Faltam R$ 5.000,00 para completar (67% do objetivo). Próximo passo: definir um valor mensal para aportar até junho/2026.";
  }

  if (q.includes("cdi")) {
    return "CDI é uma taxa de referência usada no mercado financeiro. Investimentos que rendem '102% do CDI', por exemplo, acompanham essa taxa com um bônus. Próximo passo: se quiser, posso explicar como isso se relaciona com a reserva de emergência.";
  }

  if (q.includes("invest") && q.includes("onde")) {
    return "Não recomendo onde investir, mas posso explicar como cada tipo de produto funciona e quais são indicados para reserva de emergência, com base no seu perfil moderado. Próximo passo: me pergunte sobre Tesouro Selic ou CDB se quiser entender as diferenças.";
  }

  if (q.includes("bbdc") || q.includes("bovespa")) {
    return "Não tenho cotações ou rentabilidade de ações específicas na base. Posso ajudar com seus gastos, metas e conceitos gerais de investimento.";
  }

  return "Com base nos dados disponíveis, posso ajudar com gastos do mês, progresso da reserva de emergência, metas financeiras e explicação de produtos. Qual desses temas você quer explorar primeiro?";
}