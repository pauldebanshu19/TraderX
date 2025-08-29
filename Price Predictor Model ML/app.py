from flask import Flask, request, jsonify
import pandas as pd
import pickle

app = Flask(__name__)

# ===============================
# Load model + feature names
# ===============================
with open("price_prediction_model.pkl", "rb") as f:
    model_data = pickle.load(f)

# Handle different pickle formats
if isinstance(model_data, dict):
    model = model_data["model"]
    feature_names = model_data["feature_names"]
elif isinstance(model_data, (list, tuple)):
    model = model_data[0]
    feature_names = model_data[1]
else:
    raise ValueError("Unsupported model_data format in pickle file")

# ===============================
# Global log storage
# ===============================
log_df = pd.DataFrame()
data_counter = 0


# ===============================
# Prediction Route
# ===============================
@app.route("/predict", methods=["POST"])
def predict():
    global log_df, data_counter

    try:
        data = request.json
        print("Incoming JSON:", data)
        
         # 👇 insert here
        missing_features = [col for col in feature_names if col not in data]
        print("Missing features (filled with 0.0):", missing_features)

        # ✅ Create DataFrame with all required features (missing → 0.0)
        features_for_model = pd.DataFrame(
            [[float(data.get(col, 0.0)) for col in feature_names]],
            columns=feature_names
        )

        # ✅ Prediction
        prediction = model.predict(features_for_model)[0]

        # ✅ Map prediction to label
        result = "Buy" if prediction == 1 else "Sell / Hold"

        # ✅ Build log entry
        data_counter += 1
        new_row = {
            "Data No.": data_counter,
            "Timestamp": data.get("timestamp"),
            "Asset_ID": data.get("Asset_ID"),
            "Asset_Name": data.get("Asset_Name", None),
            **{col: features_for_model[col].iloc[0] for col in feature_names},
            "Prediction": result
        }

        # ✅ Append to log
        log_df = pd.concat([log_df, pd.DataFrame([new_row])], ignore_index=True)

        # ✅ Print log for debugging
        print("\n========= Prediction Log =========")
        print(log_df.tail().to_string(index=False))
        print("==================================\n")

        return jsonify({
            "prediction": int(prediction),
            "signal": result,
            "log_row": new_row
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===============================
# Run Flask App
# ===============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

