# from flask import Flask, jsonify, request
# from flask_cors import CORS
# import sqlite3

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})

# # Configure MySQL
# DATABASE = '../SQLite/DMS.db'

# def get_db_connection():
#     conn = sqlite3.connect(DATABASE)
#     conn.row_factory = sqlite3.Row  # Allows dictionary-like row access
#     return conn

# @app.route("/get_user_info", methods=["POST"])
# def get_user_info():
#     try:
#         username = request.json.get("username")
#         if not username:
#             return jsonify({'error': 'Username not provided'}), 400

#         table_name = f"info_{username}"  # Make sure this table exists

#         conn = get_db_connection()
#         cursor = conn.cursor()

#         # Modify this query based on your actual schema
#         cursor.execute(f"""
#             SELECT * 
#             FROM {table_name} 
#             WHERE Week = (SELECT MAX(Week) FROM {table_name})
#         """)

#         row = cursor.fetchone()
#         conn.close()

#         if row:
#             data = dict(row)
#             return jsonify(data)
#         else:
#             return jsonify({'error': 'No data found for this user'}), 404

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
    
# @app.route("/get_user_info", methods=["POST"])
# def get_user_info():
#     try:
#         username = request.json.get("username")
#         if not username:
#             return jsonify({'error': 'Username not provided'}), 400

#         table_name = f"info_{username}"  # Make sure this table exists

#         conn = get_db_connection()
#         cursor = conn.cursor()

#         # Modify this query based on your actual schema
#         cursor.execute(f"""
#             SELECT * 
#             FROM {table_name} 
#             WHERE Week = (SELECT MAX(Week) FROM {table_name})
#         """)

#         row = cursor.fetchone()
#         conn.close()

#         if row:
#             data = dict(row)
#             return jsonify(data)
#         else:
#             return jsonify({'error': 'No data found for this user'}), 404

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/')
# def home():
#     return "Report API is running!"

# if __name__ == '__main__':
#     app.run(debug=True)