from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pickle 
import tensorflow as tf
from transformers import BertTokenizer
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app) 

# Configure SQLite Database
DATABASE = './SQLite/DMS.db'

def get_db_connection(): 
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Load the trained model and tokenizer
vectorizer_filename = 'tfidf_vectorizer.pkl'

with open(vectorizer_filename, 'rb') as file:
    vectorizer = pickle.load(file)

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = tf.keras.models.load_model(r'C:\Users\KHUSHI\Downloads\bert_model_backup')

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        cleaned_text = data.get('text', '').strip()
        username = data.get('username', '').strip()

        if not cleaned_text or not username:
            return jsonify({'error': 'Missing text or username'}), 400

        # BERT Prediction
        inputs = tokenizer(cleaned_text, return_tensors='tf', padding='max_length', truncation=True, max_length=128)
        input_data = [inputs["input_ids"], inputs["attention_mask"]]
        preds = bert_model(input_data, training=False).numpy()
        predicted_class = int(np.argmax(preds, axis=1)[0])
        depression_score = round(float(preds[0][1]) * 100, 2)
        label_map = {0: "Not Depressed", 1: "Depressed"}
        predicted_label = label_map.get(predicted_class, "Unknown")

        # Get current date
        current_date = datetime.today().strftime('%a %b %d %Y')

        # Insert into database
        conn = get_db_connection()
        cursor = conn.cursor()

        table_name = f"Extension_{username}"

        cursor.execute(f"SELECT MAX(Day) FROM {table_name}")
        last_day = cursor.fetchone()[0]
        day = (last_day + 1) if last_day else 1

        insert_query = f"""INSERT INTO {table_name} (Day, Date, Predicted_label, Depression_score, User_Input)
                           VALUES (?, ?, ?, ?, ?)"""
        cursor.execute(insert_query, (day, current_date, predicted_label, depression_score, cleaned_text))
        conn.commit()
        cursor.close()
        conn.close()

        # Final response
        return jsonify({
            "day": day,
            "date": current_date,
            "predicted_label": predicted_label,
            "depression_score": depression_score,
            "input": cleaned_text
        }), 200

    except Exception as e:
        print("Server Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
