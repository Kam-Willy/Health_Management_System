"""
This module contains utility functions for disease prediction using machine learning models.
It includes functions to load models, predict diseases, and format patient responses.

-------------------------------------------------------------
1. Script meant for manual testing/debugging.
2. Prints everything directly to the console.
3. CLI-style output for humans.
4. Hardcoded print statements.
"""
import numpy as np
import joblib
import os

import tensorflow as tf

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Load the models
model_lr = joblib.load('logistic_regression_model.pkl')
model_nn = joblib.load('neural_network_model.pkl')
encoder = joblib.load('encoder.pkl')

def print_patient_info(index, symptom_vector, X_columns):
    """
    Utility function to print out the patient information in text.
    """
    symptoms_present = [X_columns[i] for i, val in enumerate(symptom_vector) if val == 1]
    print(f"\nPatient {index + 1}")
    print("Symptoms Present:", symptoms_present if symptoms_present else "None")
    print()
    print("########################PATIENT PREDICTIONS##########################")

def predict_and_explain(index, symptom_vector, X_columns):
    """
    Utility function to predict the most likely disease and the symptoms shown by the patient.
    """
    print_patient_info(index, symptom_vector, X_columns)

    # Get model predictions
    lr_label, nn_label = predict_disease(symptom_vector)

    print(f"Logistic Regression Prediction: {lr_label}")
    print(f"Neural Network Prediction: {nn_label}")

    # Optional: Show confidence
    nn_confidence = model_nn.predict(symptom_vector.reshape(1, -1))  # Use the neural network model
    nn_class = np.argmax(nn_confidence)
    print(f"Neural Net Confidence for {nn_label}: {nn_confidence[0][nn_class]:.2f}")

def predict_disease(symptom_vector):
    """
    Utility function to predict the disease labels using the Logistic Regression and Neural Network models.
    """
    # Assuming your models predict labels as 'lr_label' and 'nn_label' (you may need to adjust this based on your models)
    lr_label = model_lr.predict(symptom_vector.reshape(1, -1))
    nn_label = model_nn.predict(symptom_vector.reshape(1, -1))

    return lr_label[0], nn_label[0]
