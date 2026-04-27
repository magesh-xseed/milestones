import streamlit as st
import requests
import json
import pandas as pd
import io
import fitz

# --- Configuration ---
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"
DATA_URL = "https://reports.xseededu.net/asset/686669e20456bc00127d760c/download"

# --- Streamlit Page Configuration ---
st.set_page_config(page_title="Chat with AI Model", page_icon="💬", layout="centered")

# --- Initialize Chat History ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- Function to interact with Ollama ---
def chat_with_ollama(prompt_text):
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={"model": MODEL, "prompt": prompt_text, "stream": False},
            timeout=120
        )
        response.raise_for_status()
        data = response.json()
        return data['response'].strip() if 'response' in data else "Error: Unexpected response format."
    except requests.exceptions.ConnectionError:
        return "Connection Error."
    except requests.exceptions.Timeout:
        return "Timeout Error."
    except requests.exceptions.RequestException as e:
        return f"Request Error: {e}"
    except json.JSONDecodeError:
        return "JSON Decode Error."

# --- Load and display data from URL ---
st.markdown("### 📊 Auto-loading Report Data")
analysis_data = None

try:
    file_response = requests.get(DATA_URL)
    file_response.raise_for_status()
    content = file_response.content

    if content[:5] == b"%PDF-":
        # --- Handle PDF ---
        doc = fitz.open(stream=content, filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        st.success("PDF file loaded successfully!")
        st.text_area("📄 Extracted PDF Content", full_text[:2000])
        analysis_data = full_text[:4000]  # Limit text passed to model
    else:
        # --- Handle Excel ---
        try:
            df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
        except Exception:
            df = pd.read_excel(io.BytesIO(content), engine="xlrd")
        st.success("Excel file loaded successfully!")
        st.dataframe(df.head(10))
        analysis_data = df.head(10).to_string(index=False)

except Exception as e:
    st.error(f"Failed to load or parse the file: {e}")

# --- Chat Interface ---
st.title("AI Model")
st.markdown("---")

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- User Prompt Input ---
if prompt := st.chat_input("What would you like to ask?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            # Include extracted data in prompt
            final_prompt = f"The following is extracted data:\n\n{analysis_data}\n\nNow answer this question:\n{prompt}" if analysis_data else prompt
            response_content = chat_with_ollama(final_prompt)

            if "Error" in response_content:
                st.error(response_content)
            else:
                st.markdown(response_content)
                st.session_state.messages.append({"role": "assistant", "content": response_content})

# --- Clear Chat Option ---
if st.button("Clear Chat"):
    st.session_state.messages = []
    st.rerun()
