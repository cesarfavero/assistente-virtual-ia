import { NextResponse } from "next/server";
import { gerarResposta } from "@/lib/responder";

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  }

  const reply = gerarResposta(message.trim());
  return NextResponse.json({ reply });
}