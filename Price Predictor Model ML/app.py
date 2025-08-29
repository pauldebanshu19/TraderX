from flask import Flask, request, jsonify
import pandas as pd
import pickle

app = Flask(__name__)

# Load Ethereum price prediction model + feature names
#with open("ethereum_price_prediction_model.pkl", "rb") as f:
#    model_data = pickle.load(f)



# Load model + feature names (from a list)
with open("price_prediction_model.pkl", "rb") as f:
    model_data = pickle.load(f)

model = model_data[0]         # first item in list
feature_names = model_data[1] # second item in list





#model = model_data["model"]
#feature_names = model_data["feature_names"]

# Global DataFrame log
log_df = pd.DataFrame()
data_counter = 0

@app.route("/predict", methods=["POST"])
def predict():
    global log_df, data_counter

    try:
        data = request.json
        print("Incoming JSON:", data)

        # Extract features from JSON
        extracted_features = {
            "Open": float(data.get("Open", 0)),
            "High": float(data.get("High", 0)),
            "Low": float(data.get("Low", 0)),
            "Close": float(data.get("Close", 0)),
            "Volume": float(data.get("Volume", 0)),
            "VWAP": float(data.get("VWAP", 0)),
            "Count": float(data.get("Count", 0))
        }

        # Prepare DataFrame for model
        features_for_model = pd.DataFrame(
            [[extracted_features[col] for col in feature_names]],
            columns=feature_names
        )

        # Make prediction
        prediction = model.predict(features_for_model)[0]

        # Map prediction to signal
        result = "Buy" if prediction == 1 else "Sell / Hold"

        # Build log row=
        data_counter += 1
        new_row = {
            "Data No.": data_counter,
            "Timestamp": data.get("timestamp"),
            "Asset_ID": data.get("Asset_ID"),
            "Asset_Name": data.get("Asset_Name"),
            **extracted_features,
            "Prediction": result
        }

        # Append to log
        log_df = pd.concat([log_df, pd.DataFrame([new_row])], ignore_index=True)

        # Print log
        print("\n========= Prediction Log =========")
        print(log_df.to_string(index=False))
        print("==================================\n")

        return jsonify({
            "prediction": int(prediction),
            "signal": result,
            "log_row": new_row
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)