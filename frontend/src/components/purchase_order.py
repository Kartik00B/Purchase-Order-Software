import pandas as pd
import os
from flask import Flask, jsonify
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

# Function to clean and standardize date format
def clean_date(date_str):
    try:
        # Attempt to parse the date in dd/mm/yyyy format
        return pd.to_datetime(date_str, format="%d/%m/%Y", errors="coerce")
    except Exception as e:
        # If parsing fails, return NaT
        return pd.NaT

# Replace NaN with None (for valid JSON response)
def replace_nan_with_none(data):
    if isinstance(data, list):
        return [replace_nan_with_none(item) for item in data]
    elif isinstance(data, dict):
        return {key: replace_nan_with_none(value) for key, value in data.items()}
    elif pd.isna(data):  # Check if the value is NaN or NaT
        return None
    return data

# Endpoint for recommendations
@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        file_path = "purchase_orders_history.csv"
        if not os.path.exists(file_path):
            return jsonify({"error": "Order data file not found."}), 404

        # Load the CSV data
        data = pd.read_csv(file_path)

        # Clean and parse the 'date' column
        data['date'] = data['date'].apply(clean_date)

        # Extract the month number from the 'date' column
        data['month_number'] = data['date'].dt.month  # This will give you the month number (1 for Jan, 2 for Feb, etc.)

        # Log invalid dates and remove them
        invalid_rows = data[data['date'].isna()]
        if not invalid_rows.empty:
            print("Invalid rows found:", invalid_rows)
            data = data.dropna(subset=['date'])

        # Ensure that the 'month' column is created correctly
        data['month'] = data['date'].dt.to_period('M')  # Create a month period column

        # Group by month, sum the required columns (air_plug_ap and setting_ring_sr)
        monthly_data = data.groupby('month')[['air_plug_ap', 'setting_ring_sr']].sum().reset_index()

        # Add month-on-month change and trend analysis for air_plug_ap
        monthly_data['prev_air_plug_ap'] = monthly_data['air_plug_ap'].shift(1)
        monthly_data['change_air_plug_ap'] = monthly_data['air_plug_ap'] - monthly_data['prev_air_plug_ap']

        # Add trend labels for air_plug_ap
        def trend_label(change):
            if change > 0:
                return "Increasing"
            elif change < 0:
                return "Decreasing"
            else:
                return "Stable"

        monthly_data['trend_air_plug_ap'] = monthly_data['change_air_plug_ap'].apply(trend_label)

        # Add month-on-month change and trend analysis for setting_ring_sr
        monthly_data['prev_setting_ring_sr'] = monthly_data['setting_ring_sr'].shift(1)
        monthly_data['change_setting_ring_sr'] = monthly_data['setting_ring_sr'] - monthly_data['prev_setting_ring_sr']

        # Add trend labels for setting_ring_sr
        monthly_data['trend_setting_ring_sr'] = monthly_data['change_setting_ring_sr'].apply(trend_label)

        # Predict stock needs for the next month for both air_plug_ap and setting_ring_sr
        if len(monthly_data) >= 2:
            # For air_plug_ap
            if monthly_data.iloc[-1]['trend_air_plug_ap'] == "Increasing":
                avg_increase_air_plug = monthly_data['change_air_plug_ap'].tail(2).mean()  # Calculate the average increase
                predicted_air_plug_ap = monthly_data.iloc[-1]['air_plug_ap'] + avg_increase_air_plug
                next_month_prediction_air_plug = "More stock needed"
            else:
                next_month_prediction_air_plug = "Less or similar stock needed"
                predicted_air_plug_ap = monthly_data.iloc[-1]['air_plug_ap']  # Keep the last month's value for stability

            predicted_air_plug_ap = round(predicted_air_plug_ap, 2)

            # For setting_ring_sr
            if monthly_data.iloc[-1]['trend_setting_ring_sr'] == "Increasing":
                avg_increase_setting_ring = monthly_data['change_setting_ring_sr'].tail(2).mean()  # Calculate the average increase
                predicted_setting_ring_sr = monthly_data.iloc[-1]['setting_ring_sr'] + avg_increase_setting_ring
                next_month_prediction_setting_ring = "More stock needed"
            else:
                next_month_prediction_setting_ring = "Less or similar stock needed"
                predicted_setting_ring_sr = monthly_data.iloc[-1]['setting_ring_sr']  # Keep the last month's value for stability

            predicted_setting_ring_sr = round(predicted_setting_ring_sr, 2)

        # Prepare the final recommendations
        recommendations = []
        for _, row in monthly_data.iterrows():
            recommendations.append({
                "month": row['month'].strftime("%Y-%m"),  # Convert month to string for JSON
                "required_air_plug_ap": row['air_plug_ap'],
                "required_setting_ring_sr": row['setting_ring_sr'],
                "trend_air_plug_ap": row['trend_air_plug_ap'],
                "change_air_plug_ap": row['change_air_plug_ap'],
                "trend_setting_ring_sr": row['trend_setting_ring_sr'],
                "change_setting_ring_sr": row['change_setting_ring_sr'],
            })

        # Add next month's prediction data as the last entry
        recommendations.append({
            "month": (monthly_data['month'].max() + 1).strftime("%Y-%m"),  # Increment the last month
            "required_air_plug_ap": predicted_air_plug_ap,
            "required_setting_ring_sr": predicted_setting_ring_sr,
            "trend_air_plug_ap": "Increasing" if next_month_prediction_air_plug == "More stock needed" else "Stable",
            "change_air_plug_ap": None,  # No change as it's a prediction
            "trend_setting_ring_sr": "Increasing" if next_month_prediction_setting_ring == "More stock needed" else "Stable",
            "change_setting_ring_sr": None,  # No change as it's a prediction
            "next_month_prediction_air_plug": next_month_prediction_air_plug,
            "predicted_air_plug_ap": predicted_air_plug_ap,
            "next_month_prediction_setting_ring": next_month_prediction_setting_ring,
            "predicted_setting_ring_sr": predicted_setting_ring_sr
        })

        # Replace NaN values with None for valid JSON
        return jsonify(replace_nan_with_none(recommendations))

    except Exception as e:
        print("Error occurred:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8000)
