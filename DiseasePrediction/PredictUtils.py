"""
Utility functions for disease prediction using Logistic Regression and Neural Network models.
Includes functions to load models, predict diseases, and format patient responses.

---------------------------------------------------------------
1. Utility module to be used by an API.
2. Returns JSON-ready data.
3. Reusable backend logic (for API or frontend).
4. More modular, no printing, clean return values.
"""
import numpy as np
import pandas as pd
import joblib
import os
import tensorflow as tf

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Load the models
model_lr = joblib.load('models/logistic_regression_model.pkl')
model_nn = joblib.load('models/neural_network_model.pkl')
encoder = joblib.load('models/encoder.pkl')

X_columns = joblib.load("models/symptom_columns.pkl")  # ← correct way to load feature names

def process_symptoms(symptom_text):
    """
    Converts a comma-separated string of symptoms into a binary vector
    that matches the model's expected input format (excluding 'disease').
    """
    # Handle both string and list formats
    if isinstance(symptom_text, list):
        symptoms = [s.strip().lower() for s in symptom_text]
    elif isinstance(symptom_text, str):
        symptoms = [s.strip().lower() for s in symptom_text.split(",")]
    else:
        raise ValueError("Input symptoms must be a list or comma-separated string.")

    # Lowercase all symptoms for consistent matching
    symptom_set = set(symptoms)

    # Filter out 'disease' column from X_columns
    filtered_columns = [col for col in X_columns if col.lower() != "disease"]

    # Build the binary vector
    vector = [1 if col.lower() in symptom_set else 0 for col in filtered_columns]

    return vector


def predict_disease(symptom_vector):
    input_df = pd.DataFrame([symptom_vector], columns=X_columns)

    lr_label = model_lr.predict(input_df)
    nn_label = model_nn.predict(input_df)

    return lr_label[0], nn_label[0]


def get_nn_confidence(symptom_vector):
    input_df = pd.DataFrame([symptom_vector], columns=X_columns)

    probs = model_nn.predict(input_df)
    idx = np.argmax(probs)

    return probs[0][idx], idx


def format_patient_response(symptom_vector):
    symptoms_present = [X_columns[i] for i, val in enumerate(symptom_vector) if val == 1]
    
    return symptoms_present

