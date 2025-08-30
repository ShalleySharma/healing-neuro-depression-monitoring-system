import sqlite3
import bcrypt

# Connect to your SQLite DB
conn = sqlite3.connect('DMS.db')  # Replace with your actual DB path
cursor = conn.cursor()

# Doctor info
username = 'Ritam_dr'
name = 'Dr. Ritam Dubey'
email = 'ritam@gmail.com'
plain_password = 'rd1234'

# Hash the password
hashed_password = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())

# Insert into Doctor_Info table
cursor.execute('''
    INSERT INTO Doctor_Info (Username, Name, Email, Password)
    VALUES (?, ?, ?, ?)
''', (username, name, email, hashed_password))

conn.commit()
conn.close()
print("Doctor added successfully!")
