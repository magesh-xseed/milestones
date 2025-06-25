import streamlit as st
import pandas as pd
import json

# The JSON data provided by the user
quiz_data_json = """
{
  "studentId": "STU12345",
  "name": "Arjun Sharma",
  "grade": 5,
  "subject": "Mathematics",
  "quizAttempt": {
    "quizTitle": "Grade 5 Mastery Quiz - Fractions & Geometry Focus",
    "totalQuestions": 20,
    "attemptDate": "2025-06-15",
    "timePerQuestionSeconds": 60,
    "results": [
      {
        "id": 1,
        "selectedOption": "5/4",
        "status": "correct",
        "timeTakenSeconds": 42,
        "concept": "Fractions - Addition"
      },
      {
        "id": 2,
        "selectedOption": "Rhombus",
        "status": "incorrect",
        "timeTakenSeconds": 51,
        "concept": "Geometry - Shapes"
      },
      {
        "id": 3,
        "selectedOption": "5/8",
        "status": "correct",
        "timeTakenSeconds": 37,
        "concept": "Fractions - Subtraction"
      },
      {
        "id": 4,
        "selectedOption": "6",
        "status": "correct",
        "timeTakenSeconds": 39,
        "concept": "Geometry - Symmetry"
      },
      {
        "id": 5,
        "selectedOption": "3/5",
        "status": "incorrect",
        "timeTakenSeconds": 58,
        "concept": "Fractions - Comparison"
      },
      {
        "id": 6,
        "selectedOption": "3/4",
        "status": "correct",
        "timeTakenSeconds": 33,
        "concept": "Fractions - Decimals"
      },
      {
        "id": 7,
        "selectedOption": "45°",
        "status": "correct",
        "timeTakenSeconds": 40,
        "concept": "Geometry - Angles"
      },
      {
        "id": 8,
        "selectedOption": "30 cm",
        "status": "incorrect",
        "timeTakenSeconds": 47,
        "concept": "Geometry - Perimeter"
      },
      {
        "id": 9,
        "selectedOption": "3/4",
        "status": "incorrect",
        "timeTakenSeconds": 22,
        "concept": "Fractions - Equivalence"
      },
      {
        "id": 10,
        "selectedOption": "3 ¾ hours",
        "status": "correct",
        "timeTakenSeconds": 54,
        "concept": "Fractions - Mixed Numbers"
      },
      {
        "id": 11,
        "selectedOption": "12",
        "status": "correct",
        "timeTakenSeconds": 29,
        "concept": "Fractions - Division"
      },
      {
        "id": 12,
        "selectedOption": "15 cm²",
        "status": "correct",
        "timeTakenSeconds": 31,
        "concept": "Geometry - Area"
      },
      {
        "id": 13,
        "selectedOption": "60°",
        "status": "correct",
        "timeTakenSeconds": 28,
        "concept": "Geometry - Angles"
      },
      {
        "id": 14,
        "selectedOption": "4/8",
        "status": "correct",
        "timeTakenSeconds": 35,
        "concept": "Fractions - Subtraction"
      },
      {
        "id": 15,
        "selectedOption": "4",
        "status": "correct",
        "timeTakenSeconds": 24,
        "concept": "Arithmetic - Division"
      },
      {
        "id": 16,
        "selectedOption": "Octagon",
        "status": "correct",
        "timeTakenSeconds": 27,
        "concept": "Geometry - Shapes"
      },
      {
        "id": 17,
        "selectedOption": "1 ¼",
        "status": "incorrect",
        "timeTakenSeconds": 36,
        "concept": "Fractions - Multiplication"
      },
      {
        "id": 18,
        "selectedOption": "3/4",
        "status": "correct",
        "timeTakenSeconds": 44,
        "concept": "Fractions - Equivalence"
      },
      {
        "id": 19,
        "selectedOption": "Circle",
        "status": "correct",
        "timeTakenSeconds": 19,
        "concept": "Geometry - Shapes"
      },
      {
        "id": 20,
        "selectedOption": null,
        "status": "skipped",
        "timeTakenSeconds": 0,
        "concept": "Geometry - Angles"
      }
    ]
  }
}
"""

# Parse the JSON data
quiz_data = json.loads(quiz_data_json)

# Set Streamlit page configuration for a centered, compact layout
st.set_page_config(
    page_title=f"Quiz Report for {quiz_data['name']}",
    page_icon="�",
    layout="centered" # Changed to 'centered' for a more A4-like feel
)

st.title("Student Quiz Performance Report")
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
st.metric("Subject", quiz_data["subject"]) # Subject takes full width for clarity

st.markdown("---")

# --- Quiz Attempt Summary ---
st.subheader("Quiz Attempt Summary") # Reduced font size
quiz_attempt = quiz_data["quizAttempt"]
results = quiz_attempt["results"]

total_questions = quiz_attempt["totalQuestions"]
correct_answers = sum(1 for r in results if r["status"] == "correct")
incorrect_answers = sum(1 for r in results if r["status"] == "incorrect")
skipped_questions = sum(1 for r in results if r["status"] == "skipped")

score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
avg_time_per_question = sum(r["timeTakenSeconds"] for r in results) / total_questions if total_questions > 0 else 0

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Quiz Title", quiz_attempt["quizTitle"])
with col2:
    st.metric("Attempt Date", quiz_attempt["attemptDate"])
with col3:
    st.metric("Total Questions", total_questions)
with col4:
    st.metric("Score", f"{correct_answers}/{total_questions} ({score_percentage:.2f}%)")

# Grouping performance metrics for compactness
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Correct", correct_answers)
with col2:
    st.metric("Incorrect", incorrect_answers)
with col3:
    st.metric("Skipped", skipped_questions)
with col4:
    st.metric("Avg. Time per Q", f"{avg_time_per_question:.2f} s")


st.markdown("---")

# --- Performance by Concept ---
st.header("Performance by Concept")

# Create a DataFrame for easier aggregation
df_results = pd.DataFrame(results)

# Group by concept and count statuses
concept_performance = df_results.groupby("concept")["status"].value_counts().unstack(fill_value=0)
concept_performance["Total Questions"] = concept_performance.sum(axis=1)
# Calculate Correct Percentage, handling division by zero for concepts with 0 total questions
concept_performance["Correct Percentage"] = (
    concept_performance["correct"] / concept_performance["Total Questions"] * 100
).fillna(0).round(2)

# Calculate Incorrect Percentage, handling division by zero
concept_performance["Incorrect Percentage"] = (
    concept_performance["incorrect"] / concept_performance["Total Questions"] * 100
).fillna(0).round(2)


# Reorder columns for better readability
column_order = ["Total Questions", "correct", "incorrect", "skipped", "Correct Percentage", "Incorrect Percentage"]
# Ensure all expected columns exist before reordering
for col in ["correct", "incorrect", "skipped"]:
    if col not in concept_performance.columns:
        concept_performance[col] = 0

concept_performance = concept_performance[column_order]

st.dataframe(concept_performance.style.background_gradient(cmap='Greens', subset=['Correct Percentage']), use_container_width=True)

st.markdown("---")

# --- Weak Concepts Prediction ---
st.header("Predicted Weak Concepts")

# Filter concepts with incorrect answers and sort by incorrect percentage
weak_concepts = concept_performance[concept_performance["incorrect"] > 0].sort_values(
    by="Incorrect Percentage", ascending=False
)

if not weak_concepts.empty:
    st.markdown("Based on the quiz results, the student needs to focus on the following concepts:")
    for index, row in weak_concepts.iterrows():
        st.markdown(f"- **{index}**: {row['Incorrect Percentage']:.2f}% incorrect")
else:
    st.info("Great job! No specific weak concepts identified based on incorrect answers in this quiz.")

st.markdown("---")

# --- Suggestions for Parents ---
st.header("Suggestions for Parents")

if not weak_concepts.empty:
    st.markdown("To help Arjun improve in the identified weak areas, consider the following brief suggestions:")
    for concept, row in weak_concepts.iterrows():
        st.subheader(f"How to help with **{concept}**")
        if "Fractions" in concept:
            st.markdown(
                """
                - **Hands-on practice**: Use real-world examples (e.g., sharing food, measuring ingredients) to explain fractions.
                - **Interactive games**: Find online games or apps that make learning fractions fun and engaging.
                - **Short, focused sessions**: Break down practice into small, manageable chunks to avoid overwhelming your child.
                """
            )
        elif "Geometry" in concept:
            st.markdown(
                """
                - **Identify shapes everywhere**: Point out geometric shapes in everyday objects and discuss their properties.
                - **Drawing and building**: Encourage drawing shapes and building models to understand spatial relationships.
                - **Problem-solving**: Work together on simple geometry problems, focusing on understanding concepts like perimeter and area.
                """
            )
        elif "Arithmetic" in concept:
            st.markdown(
                """
                - **Daily practice**: Incorporate quick arithmetic drills into daily routines.
                - **Mental math games**: Play games that encourage mental calculation to boost speed and accuracy.
                - **Real-life math**: Connect arithmetic to real-world scenarios, like calculating costs or change.
                """
            )
        else:
            st.markdown(
                """
                - **Review key concepts**: Briefly revisit the core ideas of the concept.
                - **Encourage questions**: Create a supportive environment where your child feels comfortable asking questions.
                - **Celebrate small wins**: Acknowledge and praise their efforts and progress, no matter how small.
                """
            )
        st.markdown("---")
else:
    st.info("No specific weak concepts identified, so no parental suggestions are currently needed. Continue to support Arjun's learning journey!")
