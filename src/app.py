"""Aplicação Streamlit do assistente Mira."""

import streamlit as st

from knowledge import montar_contexto
from llm import gerar_resposta
from prompts import montar_prompt

st.set_page_config(page_title="Mira | Organização Financeira", layout="centered")

st.title("Mira")
st.caption("Assistente de organização financeira pessoal")

if "mensagens" not in st.session_state:
    st.session_state.mensagens = []

contexto = montar_contexto()

with st.sidebar:
    st.subheader("Sobre")
    st.markdown(
        "A Mira ajuda a entender gastos, acompanhar a reserva de emergência "
        "e sugerir próximos passos com base nos dados mockados do cliente fictício."
    )
    st.subheader("Exemplos de pergunta")
    st.markdown(
        "- Quanto gastei com alimentação?\n"
        "- Onde estou gastando mais?\n"
        "- Como está minha reserva de emergência?\n"
        "- O que é CDI?"
    )

for papel, texto in st.session_state.mensagens:
    with st.chat_message(papel):
        st.write(texto)

if pergunta := st.chat_input("Digite sua dúvida financeira..."):
    st.session_state.mensagens.append(("user", pergunta))
    with st.chat_message("user"):
        st.write(pergunta)

    prompt = montar_prompt(pergunta, contexto)
    with st.chat_message("assistant"):
        with st.spinner("Pensando..."):
            resposta, modo = gerar_resposta(prompt, pergunta, contexto)
            st.write(resposta)
            if modo == "local":
                st.caption("Modo demonstração local (Ollama não detectado).")

    st.session_state.mensagens.append(("assistant", resposta))