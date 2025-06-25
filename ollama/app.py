# app.py
import streamlit as st
import requests

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"

def chat_with_ollama(prompt):
    response = requests.post(OLLAMA_API_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    })
    if response.status_code == 200:
        return response.json()['response'].strip()
    else:
        return "Error communicating with Ollama."

st.title("🧠 Chat with Ollama (LLaMA2)")
user_input = st.text_input("Enter your prompt:")

if user_input:
    with st.spinner("Thinking..."):
        result = chat_with_ollama(user_input)
    st.success("Response:")
    st.write(result)
