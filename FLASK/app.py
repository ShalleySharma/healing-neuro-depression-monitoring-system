from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pickle 
import pandas as pd
import tensorflow as tf
from transformers import BertTokenizer
import numpy as np
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Configure MySQL
DATABASE = '../DMS-Extension/SQLite/DMS.db'  

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  
    return conn

CORS(app)

# Load models and vectorizer
session1_model_filename = 'Rating_analysis_model.pkl'
feature_names = 'feature_names.pkl'
vectorizer_filename = 'tfidf_vectorizer.pkl'

# with open(session1_model_filename, 'rb') as file:
with open('Rating_analysis_model.pkl', 'rb') as file:
    session1_model = pickle.load(file)

with open(feature_names, 'rb') as file:
    required_columns = pickle.load(file)

with open(vectorizer_filename, 'rb') as file:
    vectorizer = pickle.load(file)

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = tf.keras.models.load_model(r'C:\Users\KHUSHI\Downloads\bert_model_backup')

response_map = {
    "Never": 0,
    "Some of the time": 1,
    "Most of the time": 2,
    "Nearly all the times": 3
}

@app.route('/process-responses', methods=['POST'])
def process_responses():
    try:
        data = request.get_json()  
        username = data['username']
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        week = data['week'] + 1
        sessions = data.get('sessions', [])

        session1_label = None
        session1_score = None
        session2_label = None
        session2_score = None
        session3_label = None
        session3_score = None

        cursor = get_db_connection().cursor()
        cursor.execute("SELECT Next_Session_Time FROM User_Info WHERE Username = ?", (username,))
        result = cursor.fetchone()

        if result and result['Next_Session_Time']:
            next_time = datetime.strptime(result['Next_Session_Time'], '%Y-%m-%d %H:%M:%S')
            now = datetime.now()

            if now < next_time:
                wait_hours = (next_time - now).total_seconds() / 3600
                return jsonify({
                    "error": f"Next session is locked. Try again in {round(wait_hours, 2)} hours."
                }), 403 

        for session in sessions:
            session_id = session['session_id']
            responses = session['responses']        

             # Session 1 - Rating analysis model
        
            if (session_id == 1):

                try:
                    mapped_responses = [response_map.get(response, -1) for response in responses]  # -1 for unknown responses

                    if -1 in mapped_responses:
                        return jsonify({"error": "Invalid responses detected"}), 400
                
                    df = pd.DataFrame([mapped_responses], columns=required_columns)  
                    prediction = session1_model.predict(df)
                    prediction_prob = session1_model.predict_proba(df)
                    session1_label = "Depressed" if prediction[0] == 1 else "Not Depressed"
                    session1_score = round(prediction_prob[0][1] * 100, 2)
                    print("Session 1 executed !!")
                
                except:
                    print("Session 1 processing left incompleted.")

            elif (session_id == 2) or (session_id == 3): 
                
                def process_text_response_bert(text):
                    inputs = tokenizer(text, return_tensors='tf', padding='max_length', truncation=True, max_length=128)
                    input_data = [inputs["input_ids"], inputs["attention_mask"]]
                    preds = bert_model(input_data, training=False).numpy()
                    predicted_class = int(np.argmax(preds, axis=1)[0])
                    label_map = {0: "Not Depressed", 1: "Depressed"}
                    return label_map.get(predicted_class, "Unknown"), round(preds[0][1] * 100, 2)

                # Session 2 - Text analysis model
                if session_id == 2:
                    session2_label, session2_score = process_text_response_bert(responses[0])
                    print("Session 2 executed !!")                    

                # Session 3 - Text analysis model
                elif session_id == 3:
                    session3_label, session3_score = process_text_response_bert(responses[0])
                    print("Session 3 executed !!")

        conn = get_db_connection()
        cursor = conn.cursor()

        table_name = f"info_{username}"
 
        query = f"""
            INSERT INTO {table_name}  
            (Week, session1_predicted_label, session1_depression_score, 
             session2_predicted_label, session2_depression_score, 
             session3_predicted_label, session3_depression_score, 
             Final_predicted_label, Final_depression_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        cursor.execute(query, (
            week,
            session1_label, session1_score,
            session2_label, session2_score,
            session3_label, session3_score,
            None,  
            None   
        ))

        conn.commit()

        cursor.execute(f"""
            SELECT session1_depression_score, session2_depression_score, session3_depression_score
            FROM {table_name}
            WHERE Week = ?
        """, (week,))

        scores = cursor.fetchall()[0]
        scores = [score for score in scores if score is not None] if scores else []

        final_score = sum(scores) / len(scores) if scores else None
        final_status = "Depressed" if final_score >= 50 else "Not Depressed"  

        cursor.execute(f"""
            UPDATE {table_name}
            SET Final_predicted_label = ?, Final_depression_score = ?
            WHERE Week = (SELECT MAX(Week) FROM {table_name})
        """, (final_status, final_score))

        cursor.execute("""
            UPDATE User_Info
            SET Week = ? WHERE Username = ?
        """, (week, username))

        if (week == 1):
            next_session_time = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
        else:
            next_session_time = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')

        cursor.execute("""
            UPDATE User_Info
            SET Next_Session_Time = ?
            WHERE Username = ?
        """, (next_session_time, username))

        conn.commit()   
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Responses processed and saved successfully.",
            "session1_label": session1_label,
            "session1_score": session1_score,
            "session2_label": session2_label,
            "session2_score": session2_score,
            "session3_label": session3_label,
            "session3_score": session3_score
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/')
def home():
    return "Depression Status Prediction API is running!"

if __name__ == '__main__':
    app.run(debug=True)
