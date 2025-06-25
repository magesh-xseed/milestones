# realtime_homework_app.py
import streamlit as st
import requests
import json

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"

def chat_with_ollama(prompt):
    """
    Sends a prompt to the Ollama API and returns the generated response.
    Handles network errors and unexpected response formats.
    """
    try:
        response = requests.post(OLLAMA_API_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False
        })
        response.raise_for_status()  # Check for HTTP errors (like 404, 500)
        return response.json()['response'].strip()
    except requests.exceptions.RequestException as e:
        return f"Error talking to Ollama: {e}. Please make sure Ollama is running and '{MODEL}' model is available."
    except KeyError:
        return "Error: Ollama gave a strange answer. Try again."

st.title("🤝 Bond & Learn: Parent-Child Activity")

# User provides the grade and weak concepts
# Removed the st.header("Tell me what your child needs help with") as requested

# Dynamic Grade Level Input
grade_level = st.selectbox(
    "Select your child's Grade Level:",
    options=["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"] # You can expand this
)

weak_concepts_input = st.text_area(
    f"Type what your child in {grade_level} finds hard (e.g., 'Fractions - Comparison, Geometry - Angles'):",
    height=100
)

# Button to make homework and get tips
if st.button("Generate Homework & Tips"):
    if weak_concepts_input:
        # --- Prompt for Homework Activities ---
        homework_system_message = f"""
        You are a friendly AI helper. You make fun homework for kids in {grade_level}.
        Your job is to turn academic concepts into simple, real-life games that parents can do at home.
        Each game should be short and help with one topic. It should clearly tell parents:
        - Topic Name - "Fun Game Title" (The title MUST be inside double quotes)
        When: (suggested time/context for the activity with parent involvement)
        What to do: (clear instructions for the parent on how to do it with their child)
        Question to ask: (a simple question for the child to prompt learning, designed for parents to ask)
        Learning Focus: (what the child will understand)

        **Each of these sections (When, What to do, Question to ask, Learning Focus) MUST start on a new line and have an empty line after it for clear separation.**
        """

        homework_user_query = f"""
        Please make fun homework games for kids in {grade_level}. Use simple words.
        The topics they need help with are: {weak_concepts_input}.
        
        Here is an example of how I want the homework to look for a Grade 1 concept, with clear vertical spacing:
        1. Fractions - "Dinner Plate Divider"

        When: Mealtime (dinner, lunch, or even snack time).

        What to do: When serving a food item that can be easily divided (like a piece of roti, toast, or a small pizza slice), ask your child to help you "make two equal halves" for themselves or for two people.

        Question to ask: "Did we cut it fairly? Is your half the same size as mine?"

        Learning Focus: Visual comparison of halves, understanding the concept of "equal shares."
        
        Generate activities for all the topics I listed, following the exact format of the example, ensuring each section is on a new line with an empty line following it.
        """

        full_homework_prompt = f"{homework_system_message}\n\n{homework_user_query}"

        with st.spinner("Thinking up homework..."):
            homework_result = chat_with_ollama(full_homework_prompt)
        
        st.subheader(f"Your New Homework Games for {grade_level}:")
        st.write(homework_result) # Show the homework from Ollama

        # --- Prompt for Parent Tips ---
        st.markdown("---") # Separator
        st.header(f"Tips for Parents: Helping Your {grade_level} Child Learn Together")

        tips_system_message = f"""
        You are a helpful AI assistant giving advice to parents of {grade_level} children.
        Your goal is to provide general, easy-to-understand tips focused on **how parents can actively engage with and support their child's learning at home**, especially when they are struggling with certain topics.
        Emphasize the importance of positive parent-child interaction in learning.
        Keep the language simple and encouraging.
        """

        tips_user_query = f"""
        Please provide general tips for parents on how to help their {grade_level} child learn through **daily interaction and shared activities**.
        These tips should be specifically helpful for children working on concepts like: {weak_concepts_input}.
        Focus on easy-to-do-at-home tips that encourage parent-child bonding around learning and build positive learning habits together.
        Present the tips in a simple, numbered list or bullet points.
        """
        
        full_tips_prompt = f"{tips_system_message}\n\n{tips_user_query}"

        with st.spinner("Generating parent tips..."):
            tips_result = chat_with_ollama(full_tips_prompt)
        
        st.write(tips_result) # Show the parent tips from Ollama

    else:
        st.warning("Please type at least one topic to get homework and tips.")