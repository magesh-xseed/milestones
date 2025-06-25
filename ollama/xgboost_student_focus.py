# How to run this script:
# source ~/my_ml_env/bin/activate
# python xgboost_student_focus.py

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, MultiLabelBinarizer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.multioutput import MultiOutputClassifier
import random

# --- Set a seed for reproducibility ---
random.seed(42)
# --- End of reproducibility setting ---

# Your provided JSON data for one student (Arjun)
arjun_data = {
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
      { "id": 20, "selectedOption": None, "status": "skipped", "timeTakenSeconds": 0, "concept": "Geometry - Angles" }
    ]
  }
}

def process_single_student_data(student_json):
    """Processes a single student's quiz data into a feature row and identifies weak concepts."""
    student_id = student_json['studentId']
    grade = student_json['grade']
    subject = student_json['subject']
    total_questions = student_json['quizAttempt']['totalQuestions']
    time_per_question_seconds = student_json['quizAttempt']['timePerQuestionSeconds']
    
    results = student_json['quizAttempt']['results']
    
    # Initialize features and weak concepts list
    num_correct = 0
    num_incorrect = 0
    num_skipped = 0
    total_time_taken = 0
    
    concept_performance = {} # {concept: {'correct': count, 'incorrect': count, 'skipped': count, 'time': total_time, 'attempts': count}}
    all_concepts = set()

    # Define a threshold for "long time taken"
    # For example, if time taken is more than 90% of the configured time per question, it's considered long.
    long_time_threshold_factor = 0.9
    
    for res in results:
        concept = res['concept']
        status = res['status']
        time_taken = res['timeTakenSeconds']
        
        all_concepts.add(concept)

        if concept not in concept_performance:
            concept_performance[concept] = {'correct': 0, 'incorrect': 0, 'skipped': 0, 'time': 0, 'attempts': 0, 'long_time_taken_count': 0}
        
        concept_performance[concept]['time'] += time_taken
        concept_performance[concept]['attempts'] += 1

        # Check for long time taken
        if time_taken > (time_per_question_seconds * long_time_threshold_factor):
            concept_performance[concept]['long_time_taken_count'] += 1

        if status == 'correct':
            num_correct += 1
            concept_performance[concept]['correct'] += 1
        elif status == 'incorrect':
            num_incorrect += 1
            concept_performance[concept]['incorrect'] += 1
        else: # skipped
            num_skipped += 1
            concept_performance[concept]['skipped'] += 1
        
        total_time_taken += time_taken
            
    # Calculate overall quiz features
    percentage_correct = (num_correct / total_questions) * 100
    average_time_overall = total_time_taken / total_questions if total_questions > 0 else 0

    # Identify weak concepts for this student
    weak_concepts = []
    for concept, stats in concept_performance.items():
        if stats['attempts'] > 0:
            correct_ratio = stats['correct'] / stats['attempts']
            # Rule 1: Less than 60% correct for ANY attempted questions
            if correct_ratio < 0.6:
                weak_concepts.append(concept)
            # Rule 2: Any skipped questions for a concept
            elif stats['skipped'] > 0:
                weak_concepts.append(concept)
            # Rule 3: If a significant portion of attempts for a concept took too long, even if correct
            # For simplicity, if more than 50% of attempts for a concept took too long, consider it weak.
            elif stats['long_time_taken_count'] / stats['attempts'] >= 0.5: # New rule for time
                weak_concepts.append(concept)
        # Rule 4: If a concept was only skipped (attempts = 0, but skipped > 0)
        elif stats['skipped'] > 0:
             weak_concepts.append(concept)
    
    # Sort weak concepts consistently for multi-label binarizer
    weak_concepts = sorted(list(set(weak_concepts))) # Remove duplicates and sort

    # Create a feature row
    feature_row = {
        'student_id': student_id,
        'grade': grade,
        'subject': subject,
        'total_questions': total_questions,
        'time_per_question_seconds_config': time_per_question_seconds,
        'num_correct': num_correct,
        'num_incorrect': num_incorrect,
        'num_skipped': num_skipped,
        'percentage_correct': percentage_correct,
        'average_time_overall': average_time_overall,
    }

    # Add concept-specific features
    for concept in all_concepts:
        stats = concept_performance.get(concept, {'correct': 0, 'incorrect': 0, 'skipped': 0, 'time': 0, 'attempts': 0, 'long_time_taken_count': 0})
        feature_row[f'concept_{concept.replace(" - ", "_").replace(" ", "_")}_attempts'] = stats['attempts']
        feature_row[f'concept_{concept.replace(" - ", "_").replace(" ", "_")}_correct_ratio'] = stats['correct'] / stats['attempts'] if stats['attempts'] > 0 else 0
        feature_row[f'concept_{concept.replace(" - ", "_").replace(" ", "_")}_avg_time'] = stats['time'] / stats['attempts'] if stats['attempts'] > 0 else 0
        feature_row[f'concept_{concept.replace(" - ", "_").replace(" ", "_")}_incorrect_count'] = stats['incorrect']
        feature_row[f'concept_{concept.replace(" - ", "_").replace(" ", "_")}_long_time_taken_ratio'] = stats['long_time_taken_count'] / stats['attempts'] if stats['attempts'] > 0 else 0


    return feature_row, weak_concepts, all_concepts

# --- Simulate a larger dataset ---
# In a real scenario, you'd load this from a database or CSV of many students.
# For demonstration, we'll create some variations of Arjun's data.

simulated_data = []
all_possible_concepts = set()

# Process Arjun's data (first student)
arjun_features, arjun_weak_concepts, arjun_all_concepts = process_single_student_data(arjun_data)
simulated_data.append({'features': arjun_features, 'weak_concepts': arjun_weak_concepts})
all_possible_concepts.update(arjun_all_concepts)

# Define a base set of concepts present in all quizzes for consistent generation
# This is crucial for MultiLabelBinarizer to have a consistent set of columns
base_concepts = sorted(list(arjun_all_concepts)) # Get unique concepts from Arjun's data as base

# Create more hypothetical students with varying performance
num_additional_students = 50 # Increased number of simulated students

for i in range(num_additional_students):
    student_id = f"STU{12348 + i}"
    student_name = f"Student {i+4}"
    grade = random.choice([4, 5, 6]) # Vary grade
    
    new_quiz_results = []
    # Generate results for each concept in the base set
    for concept_name in base_concepts:
        status_choice = random.choices(['correct', 'incorrect', 'skipped'], weights=[0.7, 0.2, 0.1], k=1)[0]
        time_taken = random.randint(20, 55) if status_choice != 'skipped' else 0
        
        # Introduce more controlled "weakness" for some students
        # ~25% chance for a concept to be struggled with
        if random.random() < 0.25:
            status_choice = random.choices(['incorrect', 'skipped'], weights=[0.7, 0.3], k=1)[0]
            if status_choice == 'incorrect':
                time_taken = random.randint(40, 60) # Longer time for incorrect
            else:
                time_taken = 0 # Skipped
        
        # Introduce cases where time taken is long even for correct answers, making it a "weakness"
        if random.random() < 0.15 and status_choice == 'correct': # 15% chance to be slow even if correct
            time_taken = random.randint(55, 75) # Longer than average

        new_quiz_results.append({
            "id": len(new_quiz_results) + 1,
            "selectedOption": "simulated", # Placeholder value
            "status": status_choice,
            "timeTakenSeconds": time_taken,
            "concept": concept_name
        })

    total_q = len(new_quiz_results) # Total questions matches the number of concepts
    time_per_q_config = random.choice([50, 60, 70]) # Vary time per question config

    student_data_template = {
      "studentId": student_id,
      "name": student_name,
      "grade": grade,
      "subject": "Mathematics", # Keeping subject consistent for now
      "quizAttempt": {
        "quizTitle": f"Simulated Quiz {i+1}",
        "totalQuestions": total_q,
        "attemptDate": f"2025-06-{random.randint(1, 28):02d}", # Vary date
        "timePerQuestionSeconds": time_per_q_config,
        "results": new_quiz_results
      }
    }
    
    s_features, s_weak_concepts, s_all_concepts = process_single_student_data(student_data_template)
    simulated_data.append({'features': s_features, 'weak_concepts': s_weak_concepts})
    all_possible_concepts.update(s_all_concepts)

# Consolidate all concepts found across all simulated data for the MultiLabelBinarizer
# Ensure all_possible_concepts contains all concepts for the MLB classes parameter
all_possible_concepts = sorted(list(all_possible_concepts))


# Prepare data for DataFrame
features_list = [d['features'] for d in simulated_data]
weak_concepts_list = [d['weak_concepts'] for d in simulated_data]

df = pd.DataFrame(features_list)

# Handle categorical features
df = pd.get_dummies(df, columns=['subject'], drop_first=True) 

# Store student_id for later, then drop it from features used for training
df_student_ids = df['student_id']
df = df.drop(columns=['student_id'])


# Fill any NaN values that might result from concepts not appearing for a student
# A common strategy is to fill with 0 or the mean/median, depending on the feature
df = df.fillna(0) # For concept-specific stats where a concept might not have been attempted


# Define target labels (all possible concepts as columns)
mlb = MultiLabelBinarizer(classes=all_possible_concepts) # Ensure all possible concepts are in `classes`
y = mlb.fit_transform(weak_concepts_list)
y_df = pd.DataFrame(y, columns=mlb.classes_)

# Align columns in X (features) - This step is important for consistent feature sets
# between training and prediction, especially if some concepts don't appear in all data.
X = df

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y_df, test_size=0.3, random_state=42)

# Scale numerical features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Convert scaled arrays back to DataFrames for consistent column names for feature importance
X_train_scaled_df = pd.DataFrame(X_train_scaled, columns=X_train.columns)
X_test_scaled_df = pd.DataFrame(X_test_scaled, columns=X_test.columns)


# --- XGBoost Model for Multi-Label Classification ---
# Using MultiOutputClassifier to wrap XGBClassifier

# Define the base XGBoost classifier
xgb_classifier = xgb.XGBClassifier(
    objective='binary:logistic', # For binary classification per label
    eval_metric='logloss',       # Evaluation metric
    # use_label_encoder=False,   # Removed as it's deprecated and causes a UserWarning
    n_estimators=100,            # Number of boosting rounds
    learning_rate=0.1,           # Step size shrinkage to prevent overfitting
    random_state=42,
    tree_method='hist' # Faster for larger datasets
)

# Wrap it in MultiOutputClassifier
multi_output_model = MultiOutputClassifier(xgb_classifier, n_jobs=-1) 

# Train the model
print("Training XGBoost Multi-Output Classifier...")
multi_output_model.fit(X_train_scaled_df, y_train)
print("Training complete.")

# Make predictions on the test set
y_pred = multi_output_model.predict(X_test_scaled_df)
y_pred_proba = multi_output_model.predict_proba(X_test_scaled_df) 

# --- Evaluation (example metrics) ---
print("\n--- Model Evaluation ---")

# Micro F1-score: calculates metrics globally by counting the total true positives, false negatives, and false positives.
print(f"Micro F1 Score: {f1_score(y_test, y_pred, average='micro'):.4f}")
print(f"Micro Precision: {precision_score(y_test, y_pred, average='micro'):.4f}")
print(f"Micro Recall: {recall_score(y_test, y_pred, average='micro'):.4f}")

# Macro F1-score: calculates metrics for each label, and finds their unweighted mean.
print(f"Macro F1 Score: {f1_score(y_test, y_pred, average='macro'):.4f}")


# --- Predicting for a New Student (using Arjun's processed data as "new data") ---
# Imagine Arjun's data is new and you want to predict his weak areas
new_student_data = arjun_data # Using Arjun's actual data for prediction
new_student_features, _, _ = process_single_student_data(new_student_data)

# Create a DataFrame for the new student, ensuring all expected columns are present
new_student_df = pd.DataFrame([new_student_features])

# Handle categorical features for the new student data (must match training)
new_student_df = pd.get_dummies(new_student_df, columns=['subject'], drop_first=True)
new_student_df = new_student_df.drop(columns=['student_id'])

# Align columns - crucial for consistent feature sets
# This ensures that even if a concept wasn't in new_student_df, it gets a column filled with 0
# It also ensures the order of columns matches X_train_scaled_df
missing_cols = set(X_train_scaled_df.columns) - set(new_student_df.columns)
for c in missing_cols:
    new_student_df[c] = 0
new_student_aligned_df = new_student_df[X_train_scaled_df.columns] # Reorder columns to match training set


# Scale the new student's features using the *trained* scaler
new_student_scaled = scaler.transform(new_student_aligned_df)
new_student_scaled_df = pd.DataFrame(new_student_scaled, columns=new_student_aligned_df.columns)


# Predict weak concepts for the new student
predicted_labels = multi_output_model.predict(new_student_scaled_df)
predicted_probabilities = multi_output_model.predict_proba(new_student_scaled_df)

# Convert predictions back to human-readable concepts (the "overall" prediction)
# This uses the default threshold (usually 0.5) from the classifiers
overall_predicted_weak_concepts = mlb.inverse_transform(predicted_labels)[0]


print(f"\n--- Prediction for Student {new_student_data['studentId']} ({new_student_data['name']}) ---")
print(f"Overall Predicted Weak Concepts (default threshold): {list(overall_predicted_weak_concepts)}")


# --- Display all concepts with their probabilities ---
print("\nPredicted Probabilities for All Concepts:")
# Create a list of tuples (concept, probability) for sorting
concept_probabilities = []
for i, concept_label in enumerate(mlb.classes_):
    prob_weak = predicted_probabilities[i][0][1] # Probability of being weak
    concept_probabilities.append((concept_label, prob_weak))

# Sort concepts by probability of being weak in descending order for better readability
concept_probabilities_sorted = sorted(concept_probabilities, key=lambda x: x[1], reverse=True)

for concept_label, prob_weak in concept_probabilities_sorted:
    print(f"- {concept_label}: {prob_weak:.4f}")


# --- Display Highly Confident Weak Concepts (Probability >= 0.9500) ---
print("\n--- Highly Confident Weak Concepts (Probability >= 0.9500) ---")
highly_confident_weak_concepts = [] # Initialize a list to store concepts meeting the threshold

for concept_label, prob_weak in concept_probabilities_sorted: # Use the sorted list
    if prob_weak >= 0.9500:
        highly_confident_weak_concepts.append(concept_label)

if highly_confident_weak_concepts:
    print(f"Weak Concepts: {list(highly_confident_weak_concepts)}")
else:
    print("No highly confident weak concepts found for this student.")


# --- Display Highly Confident Strong Concepts (Probability < 0.0500 of being weak) ---
print("\n--- Highly Confident Strong Concepts (Probability < 0.0500 of being weak) ---")
highly_confident_strong_concepts = [] # Initialize a list to store concepts meeting the threshold

for concept_label, prob_weak in concept_probabilities_sorted: # Use the sorted list
    if prob_weak < 0.05: # Threshold for strong: probability of being weak is very low
        highly_confident_strong_concepts.append(concept_label)

if highly_confident_strong_concepts:
    print(f"Strong Concepts: {list(highly_confident_strong_concepts)}")
else:
    print("No highly confident strong concepts found for this student.")