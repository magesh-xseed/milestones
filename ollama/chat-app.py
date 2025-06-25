import streamlit as st
import requests
import json # Import json to handle potential streaming responses if needed, or structured data

# --- Configuration ---
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL = "mistral" # Ensure this model is downloaded and running on your Ollama instance

# --- Streamlit Page Configuration (optional but good practice) ---
st.set_page_config(
    page_title="Chat with AI Model",
    page_icon="💬",
    layout="centered" # Or "wide" for more space
)

# --- Initialize Chat History in Session State ---
# This ensures that the chat history persists across reruns of the script
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- Function to Interact with Ollama ---
def chat_with_ollama(prompt_text):
    """
    Sends a prompt to the Ollama API and returns the generated response.
    Handles non-streaming responses.
    """
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": MODEL,
                "prompt": prompt_text,
                "stream": False # We explicitly request a non-streaming response for simplicity
            },
            timeout=120 # Add a timeout to prevent indefinite waiting
        )
        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)

        # Assuming the API returns JSON with a 'response' key for non-streaming
        data = response.json()
        if 'response' in data:
            return data['response'].strip()
        else:
            st.error(f"Unexpected response format from Ollama: {data}")
            return "Error: Unexpected response format."

    except requests.exceptions.ConnectionError:
        st.error(f"Could not connect to Ollama at {OLLAMA_API_URL}. Please ensure Ollama is running and the model '{MODEL}' is available.")
        st.info("You can check if Ollama is running by navigating to `http://localhost:11434` in your browser. Also, ensure you have downloaded the model by running `ollama pull mistral` in your terminal.")
        return "Connection Error."
    except requests.exceptions.Timeout:
        st.error("Ollama API call timed out. The model might be taking too long to respond.")
        return "Timeout Error."
    except requests.exceptions.RequestException as e:
        st.error(f"An error occurred: {e}")
        return "Request Error."
    except json.JSONDecodeError:
        st.error("Failed to decode JSON response from Ollama. The response might not be valid JSON.")
        return "JSON Decode Error."

# --- Streamlit UI ---
st.title("AI Model")
st.markdown("---") # Horizontal line for separation

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Accept user input
if prompt := st.chat_input("What would you like to ask?"):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    # Display user message in chat message container
    with st.chat_message("user"):
        st.markdown(prompt)

    # Get LLM response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            # Concatenate current prompt with previous messages for better context
            # (Note: Ollama /generate endpoint directly takes a single prompt.
            # For multi-turn conversational context, you'd typically use /chat or manually construct a history-aware prompt)
            # For this /generate endpoint, we'll just send the latest prompt.
            # If you were using /chat, you'd send st.session_state.messages directly.
            response_content = chat_with_ollama(prompt)

            if response_content == "Connection Error." or \
               response_content == "Timeout Error." or \
               response_content == "Request Error." or \
               response_content == "JSON Decode Error." or \
               "Error:" in response_content:
                # Do not add error messages to history, or handle them differently
                st.error(response_content)
            else:
                st.markdown(response_content)
                # Add assistant response to chat history
                st.session_state.messages.append({"role": "assistant", "content": response_content})

# Optional: Add a clear chat history button
if st.button("Clear Chat"):
    st.session_state.messages = []
    st.rerun() # Rerun the app to clear displayed messages
