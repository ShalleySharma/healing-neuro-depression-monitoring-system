const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    console.error("ERROR: SECRET_KEY is missing ...");
    process.exit(1); 
}

const app = express();
const PORT = 5501;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite database
const db = new sqlite3.Database('./SQLite/DMS.db');

// db.run(`
//     CREATE TABLE IF NOT EXISTS User_Info (
//         Username TEXT PRIMARY KEY,
//         Name TEXT NOT NULL,
//         Email TEXT NOT NULL,
//         Password TEXT NOT NULL,
//         IsLoggedIn BOOLEAN NOT NULL DEFAULT FALSE,
//         Week INTEGER NOT NULL DEFAULT 0,
//         IsChosenExpert BOOLEAN NOT NULL DEFAULT 0,
//         Expert_Selected_ID INTEGER,
//         Date_Selected TEXT,
//         Time_Selected TEXT,
//         Expert_Session_Status TEXT
//     )
// `);

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });

        req.user = decoded;
        next();
    });
};

app.get('/get_user_info', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const tableName = `info_${username}`;
    const scoreQuery = `SELECT Final_predicted_label, Final_depression_score FROM ${tableName}`;
    const userInfoQuery = `SELECT Name, Session_Date, Age, Gender, PID FROM User_Info WHERE Username = ?`;

    db.get(userInfoQuery, [username], (userErr, userInfo) => {
        if (userErr) {
            console.error(userErr);
            return res.status(500).json({ error: 'Failed to fetch user info' });
        }

        if (!userInfo) {
            return res.status(404).json({ error: 'User not found in User_Info' });
        }

        db.get(scoreQuery, (scoreErr, scoreInfo) => {
            if (scoreErr) {
                console.error(scoreErr);
                return res.status(500).json({ error: 'Failed to fetch depression score' });
            }

            if (!scoreInfo) {
                return res.status(404).json({ error: 'User not found in depression data' });
            }

            const combinedData = {
                name: userInfo.Name,
                session_Date: userInfo.Session_Date,
                label: scoreInfo.Final_predicted_label,
                depression_score: scoreInfo.Final_depression_score,
                age: userInfo.Age,
                gender: userInfo.Gender,
                pid: userInfo.PID
            };

            res.status(200).json(combinedData);
        });
    });
});


// Login endpoint using JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {
        db.get("SELECT * FROM User_Info WHERE Username = ?", [username], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(501).json({ error: 'An error occurred while logging in' });
            }
            
            console.log("User fetched from database:", user);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const isValid = await bcrypt.compare(password, user.Password);

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            if (!SECRET_KEY) {
                console.error("Missing SECRET_KEY in environment variables.");
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' }); 

            db.run(`UPDATE User_Info SET IsLoggedIn = TRUE WHERE Username = ?`, [username], (updateErr) => {
                console.log("Database");
                if (updateErr) {
                    console.error(updateErr);
                    return res.status(500).json({ error: 'Failed to update login status' });
                }
                console.log("IsLoggedIn updated successfully for:", username);
                res.status(200).json({ message: 'Login successful!', token });
            });
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/login', (req, res) => {
    res.status(405).send('Method Not Allowed');
  });
  

// Logout endpoint
app.post('/logout', (req, res) => {
    const { username } = req.body;

    // try-catch
    db.get(`SELECT * FROM User_Info WHERE Username = ?`, [username], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while logging out' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        db.run(`UPDATE User_Info SET IsLoggedIn = FALSE WHERE Username = ?`, [username], (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).json({ error: 'Failed to update logout status' });
            }
            res.status(200).json({ message: 'Logout successful!' });
        });
    });
});


// Protecting a Route
app.get('/protected-data', authenticateToken, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// TO RUN BACKEND SERVER:
// npx nodemon filename 