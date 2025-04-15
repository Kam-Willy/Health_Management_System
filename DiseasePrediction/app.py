from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
import os
import tensorflow as tf
from flask_cors import CORS
from PredictUtils import process_symptoms
from datetime import datetime

# Disable OneDNN optimizations for TensorFlow
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

app = Flask(__name__)
CORS(app)

# Load ML models and encoders
model_lr = joblib.load('models/logistic_regression_model.pkl')
model_nn = joblib.load('models/neural_network_model.pkl')
encoder = joblib.load('models/encoder.pkl')
disease_class = joblib.load('models/disease_class.pkl')
columns = joblib.load("models/symptom_columns.pkl")

# Optional: Path to save CSV logs
RESULTS_CSV = "diagnosis_results.csv"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        doctor = data.get("doctorName", "Unknown Doctor")
        patient = data.get("patientName", "Unknown Patient")
        patient_id = data.get("patientId", "0000")
        symptoms = data["symptoms"]

        # Preprocess input
        input_vector = process_symptoms(symptoms)
        X = pd.DataFrame([input_vector], columns=columns)

        # Logistic Regression
        prediction_lr = model_lr.predict(X)[0]
        disease_lr = disease_class.get(prediction_lr, "Unknown")

        # Neural Network
        probs = model_nn.predict(X)
        prediction_nn = int(np.argmax(probs[0]))
        confidence_nn = float(np.max(probs[0])) * 100
        disease_nn = disease_class.get(prediction_nn, "Unknown")


        # Save to CSV
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        new_record = {
            "timestamp": timestamp,
            "doctor": doctor,
            "patient": patient,
            "patient_id": patient_id,
            "symptoms": ", ".join(symptoms),
            "prediction_lr": prediction_lr,
            "prediction_nn": prediction_nn,
            "confidence_nn": confidence_nn
        }

        df = pd.DataFrame([new_record])
        if os.path.exists(RESULTS_CSV):
            df.to_csv(RESULTS_CSV, mode='a', header=False, index=False)
        else:
            df.to_csv(RESULTS_CSV, index=False)

        return jsonify({
            "success": True,
            "timestamp": timestamp,
            "doctor": doctor,
            "patient": patient,
            "patientId": patient_id,
            "symptoms": symptoms,
            "predictionLR": str(prediction_lr),
            "predictionNN": str(prediction_nn),
            "confidenceNN": round(confidence_nn, 2),
            "diseaseLR": disease_lr,
            "diseaseNN": disease_nn
            })

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, use_reloader=False)
