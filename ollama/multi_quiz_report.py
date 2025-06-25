# streamlit run '/Users/mahesh.r/Xseed/milestone/ollama/multi_quiz_report.py'

import streamlit as st
import pandas as pd
import json
import requests # Import requests for API calls

# --- Ollama Configuration ---
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL = "mistral" # Ensure this model is downloaded and running on your Ollama instance

# --- Student Quiz Data (Modified to include multiple attempts) ---
# This JSON now contains a list of 'quizAttempt' objects under 'quizAttempts'
quiz_data_json = """
{
  "studentId": "STU12345",
  "name": "Arjun Sharma",
  "grade": 5,
  "subject": "Mathematics",
  "quizAttempts": [
    {
      "quizTitle": "Grade 5 Mastery Quiz - Fractions & Geometry Focus (Attempt 1)",
      "totalQuestions": 20,
      "attemptDate": "2025-06-10",
      "timePerQuestionSeconds": 60,
      "results": [
        { "id": 1, "selectedOption": "5/4", "status": "correct", "timeTakenSeconds": 42, "concept": "Fractions - Addition" },
        { "id": 2, "selectedOption": "Rhombus", "status": "incorrect", "timeTakenSeconds": 51, "concept": "Geometry - Shapes" },
        { "id": 3, "selectedOption": "5/8", "status": "correct", "timeTakenSeconds": 37, "concept": "Fractions - Subtraction" },
        { "id": 4, "selectedOption": "6", "status": "correct", "timeTakenSeconds": 39, "concept": "Geometry - Symmetry" },
        { "id": 5, "selectedOption": "3/5", "status": "incorrect", "timeTakenSeconds": 58, "concept": "Fractions - Comparison" },
        { "id": 6, "selectedOption": "3/4", "status": "correct", "timeTakenSeconds": 33, "concept": "Fractions - Decimals" },
        { "id": 7, "selectedOption": "45°", "status": "correct", "timeTakenSeconds": 40, "concept": "Geometry - Angles" },
        { "id": 8, "selectedOption": "30 cm", "status": "incorrect", "timeTakenSeconds": 47, "concept": "Geometry - Perimeter" },
        { "id": 9, "selectedOption": "3/4", "status": "incorrect", "timeTakenSeconds": 22, "concept": "Fractions - Equivalence" },
        { "id": 10, "selectedOption": "3 ¾ hours", "status": "correct", "timeTakenSeconds": 54, "concept": "Fractions - Mixed Numbers" },
        { "id": 11, "selectedOption": "12", "status": "correct", "timeTakenSeconds": 29, "concept": "Fractions - Division" },
        { "id": 12, "selectedOption": "15 cm²", "status": "correct", "timeTakenSeconds": 31, "concept": "Geometry - Area" },
        { "id": 13, "selectedOption": "60°", "status": "correct", "timeTakenSeconds": 28, "concept": "Geometry - Angles" },
        { "id": 14, "selectedOption": "4/8", "status": "correct", "timeTakenSeconds": 35, "concept": "Fractions - Subtraction" },
        { "id": 15, "selectedOption": "4", "status": "correct", "timeTakenSeconds": 24, "concept": "Arithmetic - Division" },
        { "id": 16, "selectedOption": "Octagon", "status": "correct", "timeTakenSeconds": 27, "concept": "Geometry - Shapes" },
        { "id": 17, "selectedOption": "1 ¼", "status": "incorrect", "timeTakenSeconds": 36, "concept": "Fractions - Multiplication" },
        { "id": 18, "selectedOption": "3/4", "status": "correct", "timeTakenSeconds": 44, "concept": "Fractions - Equivalence" },
        { "id": 19, "selectedOption": "Circle", "status": "correct", "timeTakenSeconds": 19, "concept": "Geometry - Shapes" },
        { "id": 20, "selectedOption": null, "status": "skipped", "timeTakenSeconds": 0, "concept": "Geometry - Angles" }
      ]
    },
    {
      "quizTitle": "Grade 5 Mid-Term Fractions Review (Attempt 2)",
      "totalQuestions": 15,
      "attemptDate": "2025-06-15",
      "timePerQuestionSeconds": 45,
      "results": [
        { "id": 1, "selectedOption": "1/2", "status": "correct", "timeTakenSeconds": 25, "concept": "Fractions - Addition" },
        { "id": 2, "selectedOption": "Rectangle", "status": "correct", "timeTakenSeconds": 30, "concept": "Geometry - Shapes" },
        { "id": 3, "selectedOption": "1/4", "status": "correct", "timeTakenSeconds": 28, "concept": "Fractions - Subtraction" },
        { "id": 4, "selectedOption": "Triangle", "status": "incorrect", "timeTakenSeconds": 40, "concept": "Geometry - Shapes" },
        { "id": 5, "selectedOption": "2/3", "status": "correct", "timeTakenSeconds": 35, "concept": "Fractions - Comparison" },
        { "id": 6, "selectedOption": "0.75", "status": "correct", "timeTakenSeconds": 22, "concept": "Fractions - Decimals" },
        { "id": 7, "selectedOption": "90°", "status": "correct", "timeTakenSeconds": 33, "concept": "Geometry - Angles" },
        { "id": 8, "selectedOption": "20 cm", "status": "correct", "timeTakenSeconds": 29, "concept": "Geometry - Perimeter" },
        { "id": 9, "selectedOption": "1/2", "status": "incorrect", "timeTakenSeconds": 18, "concept": "Fractions - Equivalence" },
        { "id": 10, "selectedOption": "2 ½ hours", "status": "correct", "timeTakenSeconds": 41, "concept": "Fractions - Mixed Numbers" },
        { "id": 11, "selectedOption": "5", "status": "correct", "timeTakenSeconds": 20, "concept": "Fractions - Division" },
        { "id": 12, "selectedOption": "10 cm²", "status": "correct", "timeTakenSeconds": 24, "concept": "Geometry - Area" },
        { "id": 13, "selectedOption": "120°", "status": "incorrect", "timeTakenSeconds": 38, "concept": "Geometry - Angles" },
        { "id": 14, "selectedOption": "1/8", "status": "correct", "timeTakenSeconds": 26, "concept": "Fractions - Subtraction" },
        { "id": 15, "selectedOption": "7", "status": "correct", "timeTakenSeconds": 15, "concept": "Arithmetic - Division" }
      ]
    }
  ]
}
"""

# Parse the JSON data
quiz_data = json.loads(quiz_data_json)

# --- Function to get suggestions from Ollama ---
@st.cache_data(ttl=3600) # Cache the results for 1 hour to avoid repeated API calls
def get_ollama_suggestions(concept: str, incorrect_percentage: float) -> str:
    """
    Sends a prompt to Ollama to get brief parental suggestions for a given concept.
    """
    prompt = (
        f"Provide brief, actionable suggestions for parents to help their child "
        f"improve in the '{concept}' concept, given that the child has an "
        f"incorrect rate of {incorrect_percentage:.2f}%. Focus on simple, "
        f"at-home activities or ways to support. Keep it concise, 2-3 sentences."
    )
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False # We explicitly request a non-streaming response for simplicity
            },
            timeout=30 # Add a timeout
        )
        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)

        data = response.json()
        if 'response' in data:
            return data['response'].strip()
        else:
            return "Could not generate specific suggestions from AI."

    except requests.exceptions.ConnectionError:
        return "AI connection error. Ensure Ollama is running and model is loaded."
    except requests.exceptions.Timeout:
        return "AI timeout. Ollama might be busy or model is slow."
    except requests.exceptions.RequestException as e:
        return f"AI request error: {e}"
    except json.JSONDecodeError:
        return "AI response format error."


# Set Streamlit page configuration for a centered, compact layout
st.set_page_config(
    page_title=f"Overall Quiz Report for {quiz_data['name']}",
    page_icon="📊",
    layout="centered"
)

st.title("Student Overall Performance Report")
st.markdown("---")

# --- Student Information ---
st.subheader("Student Information") # Reduced font size
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Student ID", quiz_data["studentId"])
with col2:
    st.metric("Name", quiz_data["name"])
with col3:
    st.metric("Grade", quiz_data["grade"])
st.metric("Subject", quiz_data["subject"])

st.markdown("---")

# --- Overall Quiz Attempt Summary ---
st.subheader("Overall Quiz Summary") # Reduced font size

all_results = []
total_questions_overall = 0
total_time_taken_overall = 0

for attempt in quiz_data["quizAttempts"]:
    all_results.extend(attempt["results"])
    total_questions_overall += attempt["totalQuestions"]
    total_time_taken_overall += sum(r["timeTakenSeconds"] for r in attempt["results"])

correct_answers_overall = sum(1 for r in all_results if r["status"] == "correct")
incorrect_answers_overall = sum(1 for r in all_results if r["status"] == "incorrect")
skipped_questions_overall = sum(1 for r in all_results if r["status"] == "skipped")

score_percentage_overall = (correct_answers_overall / total_questions_overall) * 100 if total_questions_overall > 0 else 0
avg_time_per_question_overall = total_time_taken_overall / len(all_results) if len(all_results) > 0 else 0

col1, col2 = st.columns(2)
with col1:
    st.metric("Number of Quizzes", len(quiz_data["quizAttempts"]))
with col2:
    st.metric("Total Questions Attempted", total_questions_overall)

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Overall Score", f"{correct_answers_overall}/{total_questions_overall} ({score_percentage_overall:.2f}%)")
with col2:
    st.metric("Correct Answers", correct_answers_overall)
with col3:
    st.metric("Incorrect Answers", incorrect_answers_overall)
with col4:
    st.metric("Skipped Questions", skipped_questions_overall)

st.metric("Overall Avg. Time per Q", f"{avg_time_per_question_overall:.2f} seconds")

st.markdown("---")

# --- Performance by Concept (Aggregated Across All Quizzes) ---
st.header("Performance by Concept (Overall)")

# Create a DataFrame from all aggregated results
df_all_results = pd.DataFrame(all_results)

# Group by concept and count statuses
concept_performance = df_all_results.groupby("concept")["status"].value_counts().unstack(fill_value=0)
concept_performance["Total Questions"] = concept_performance.sum(axis=1)

# Calculate Correct Percentage, handling division by zero
concept_performance["Correct Percentage"] = (
    concept_performance["correct"] / concept_performance["Total Questions"] * 100
).fillna(0).round(2)

# Calculate Incorrect Percentage, handling division by zero
concept_performance["Incorrect Percentage"] = (
    concept_performance["incorrect"] / concept_performance["Total Questions"] * 100
).fillna(0).round(2)

# Reorder columns for better readability
column_order = ["Total Questions", "correct", "incorrect", "skipped", "Correct Percentage", "Incorrect Percentage"]
for col in ["correct", "incorrect", "skipped"]: # Ensure columns exist before reordering
    if col not in concept_performance.columns:
        concept_performance[col] = 0
concept_performance = concept_performance[column_order]

st.dataframe(concept_performance.style.background_gradient(cmap='Greens', subset=['Correct Percentage']), use_container_width=True)

st.markdown("---")

# --- Weak Concepts Prediction (Overall) ---
st.header("Predicted Weak Concepts (Overall)")

# Filter concepts with incorrect answers and sort by incorrect percentage
weak_concepts = concept_performance[concept_performance["incorrect"] > 0].sort_values(
    by="Incorrect Percentage", ascending=False
)

if not weak_concepts.empty:
    st.markdown("Based on **all quiz attempts**, Arjun needs to focus on the following concepts:")
    for index, row in weak_concepts.iterrows():
        st.markdown(f"- **{index}**: {row['Incorrect Percentage']:.2f}% incorrect")
else:
    st.info("Great job! No specific weak concepts identified based on all quiz attempts.")

st.markdown("---")

# --- Suggestions for Parents (Overall - Powered by Ollama) ---
st.header("Suggestions for Parents")

if not weak_concepts.empty:
    st.markdown("To help Arjun improve in these identified weak areas, consider the following brief suggestions:")
    for concept, row in weak_concepts.iterrows():
        st.subheader(f"How to help with **{concept}**")
        with st.spinner(f"Generating suggestions for {concept} with Ollama..."):
            suggestion = get_ollama_suggestions(concept, row['Incorrect Percentage'])
            st.markdown(suggestion)
        st.markdown("---")
else:
    st.info("No specific weak concepts identified, so no parental suggestions are currently needed. Continue to support Arjun's learning journey!")
