const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const axios = require('axios');

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
const db = new sqlite3.Database('./DMS-Extension/SQLite/DMS.db');

// USER

db.run(`
    CREATE TABLE IF NOT EXISTS User_Info (
        Username TEXT PRIMARY KEY,
        Name TEXT NOT NULL,
        Email TEXT NOT NULL,
        Password TEXT NOT NULL,
        IsLoggedIn BOOLEAN NOT NULL DEFAULT FALSE,
        Week INTEGER NOT NULL DEFAULT 0,
        IsChosenExpert BOOLEAN NOT NULL DEFAULT 0,
        Expert_Selected_ID INTEGER,
        Date_Selected TEXT,
        Time_Selected TEXT,
        Expert_Session_Status TEXT
    )
`);

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });

        req.user = decoded;
        next();
    });
};

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
        return res.status(401).json({ error: "All fields are required!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        db.run(
            `INSERT INTO User_Info (Username, Name, Email, Password, IsLoggedIn, Week, IsChosenExpert) VALUES (?, ?, ?, ?, TRUE, 0, 0)`,
            [username, name, email, hashedPassword],
            (err) => {
                if (err) {
                    console.error(err);
                    res.status(400).json({ error: 'User already exists or invalid data' });
                } else {
                    createUserTable(username);
                    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
                    res.status(201).json({ message: 'User registered successfully!', token});
                }
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

// Create User Specific Table
function createUserTable(username) {
    const tableName = `info_${username}`;
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            Week INTEGER PRIMARY KEY,
            Session1_predicted_label TEXT,
            Session1_depression_score INTEGER,
            Session2_predicted_label TEXT,
            Session2_depression_score INTEGER,
            Session3_predicted_label TEXT,
            Session3_depression_score INTEGER,
            Final_predicted_label TEXT,
            Final_depression_score INTEGER
        );
    `;
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error(`Error creating table ${tableName}:`, err.message);
        } else {
            console.log(`Table ${tableName} created successfully.`);
        }
    });
}

app.get('/get_user_info', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const tableName = `Extension_${username}`;
    const scoreQuery = `SELECT Predicted_label, Depression_score, User_Input FROM ${tableName}`;
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
                label: scoreInfo.Predicted_label,
                depression_score: scoreInfo.Depression_score,
                input: scoreInfo.User_Input,
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

app.post('/bookingSession', (req, res) => {
    const { username, psychologist_id, date_selected, time_selected } = req.body;

    // try-catch
    if (!username || !psychologist_id || !date_selected || !time_selected) {
        return res.status(400).json({message: "All information is required"})
    }

    db.get(`SELECT IsChosenExpert, Expert_Selected_ID, Date_Selected, Time_Selected
        FROM User_Info WHERE Username = ?`, [username], (err, user) => {
        if (err) {
            console.error(err)
            return res.status(500).json({error: 'An error occurred while booking session'})
        }

        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        if (user.IsChosenExpert && (user.Expert_Selected_ID || user.Date_Selected || user.Time_Selected)) {
            return res.status(400).json({ message: "Already chosen an expert, cannot book another session." });
        }

        db.run(`UPDATE User_Info 
            SET IsChosenExpert = TRUE, 
            Expert_Selected_ID = ?, 
            Date_Selected = ?, 
            Time_Selected = ?,
            Expert_Session_Status = 'Scheduled'
            WHERE Username = ? `, 
            [psychologist_id, date_selected, time_selected, username], (updateErr) => {
            if (updateErr) {
                console.error(updateErr)
                return res.status(500).json({error: 'Failed to update booking status'})
            }
            res.status(200).json({message: 'Booking session successful!'})
        });
    });

});

app.get('/disclaimer', (req, res) => {
    const { username } = req.query;

    try {

        db.get(`SELECT Expert_Session_Status FROM User_Info WHERE Username = ?`, [username], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({error: 'An error occurred while checking user status'});
            }

            if(!user){
                return res.status(400).json({message: 'User not found!'})
            }

            if(user.Expert_Session_Status === 'Scheduled'){
                return res.status(401).json({message: 'first complete your scheduled expert session!'})
            }

            if(user.Expert_Session_Status === 'Missed'){
                return res.status(401).json({message: 'first complete your missed expert session!'})
            }

            if(user.Expert_Session_Status === 'Completed'){
                return res.status(200).json({message: 'You may proceed!'})
                // Now the button should do its functionality
            }

            if(user.Expert_Session_Status === null){
                res.status(404).json({message: 'First choose a expert!'})
            }
        })
        
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
    }
})

app.get('/week', (req, res) => {
    const { username } = req.query;

    try {
        db.get(`SELECT MAX(Week) AS Week FROM User_Info WHERE Username = ?`, [username], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'An error occurred while checking user status' });
            }

            if (!user || user.Week === null) {
                return res.status(200).json({ week: 0 });  
            }

            return res.status(200).json({ week: user.Week });
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/emailID', (req, res) => {
    const { username } = req.query;

    try {
        db.get(`SELECT Email FROM User_Info WHERE Username = ?`, [username], (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'An error occurred while checking user status' });
            }

            if (!user) {
                return res.status(404).json({ message: "No User Found" });  
            }

            return res.status(200).json({ email: user.Email });
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DASHBOARD

app.get('/dashboard_home', (req, res) => {
    const { username, date } = req.query;

    if (!username || !date) {
        return res.status(400).json({ message: "Missing username or date" });
    }

    const formattedDate = new Date(date).toDateString();

    const tableName = `Extension_${username}`;
    const scoreQuery = `SELECT Depression_score, User_Input FROM ${tableName} WHERE Date = ?`;

    try {
        db.all(scoreQuery, [formattedDate], (err, rows) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Database error' });
            }
        
            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: "No data found for selected date" });
            }

            const formatted = rows.map(row => ({
                score: row.Depression_score,
                input: row.User_Input
            }));
        
            return res.status(200).json(formatted);
          });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/get_day_index", async (req, res) => {
    const username = req.query.username;
    const selectedDate = req.query.date;

    if (!username || !selectedDate) {
        return res.status(400).json({ message: "Missing username or date" });
    }

    const tableName = `Extension_${username}`;
    const query = `SELECT Day FROM ${tableName} WHERE Date = ? `;

    db.get(query, [selectedDate], (dayErr, dayInfo) => {
        if (dayErr) {
            return res.status(500).json({ error: 'Failed to fetch depression score' });
        }

        if (!dayInfo) {
            return res.status(404).json({ error: 'User not found in depression data' });
        }

        res.status(200).json({day: dayInfo.Day});
    });
});


app.get('/weekly_score/:username', (req, res) => {
    const { username } = req.params;
    const tableName = `info_${username}`;

    const scoreQuery = `SELECT Week, Final_depression_score FROM ${tableName}`;

    db.all(scoreQuery, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        const formatted = rows.map(row => ({
            week: row.Week,
            score: row.Final_depression_score
        }));

        return res.status(200).json(formatted);
    });
});

app.get('/daily_score/:username', (req, res) => {
    const { username } = req.params;
    const tableName = `Extension_${username}`;

    const scoreQuery = `SELECT Day, Depression_score FROM ${tableName}`;

    db.all(scoreQuery, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        const formatted = rows.map(row => ({
            day: row.Day,
            score: row.Depression_score
        }));

        return res.status(200).json(formatted);
    });
});

app.get('/weekly_report/:username', (req, res) => {
    const { username } = req.params;
    const tableName = `info_${username}`;
    const query = `SELECT Week, Session_Date FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const formatted = rows.map(row => ({
            week: row.Week,
            date: row.Session_Date
        }));
        res.status(200).json(formatted);
    });
});

app.get('/daily_report/:username', (req, res) => {
    const { username } = req.params;
    const tableName = `extension_${username}`;
    const query = `SELECT Day, Date FROM ${tableName}`;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const formatted = rows.map(row => ({
            day: row.Day,
            date: row.Date
        }));
        res.status(200).json(formatted);
    });
});

// REPORT 
app.get('/weekly_report_data', (req, res) => {
    const { username, week } = req.query;
    const tableName = `info_${username}`;
    const scoreQuery = `SELECT Final_predicted_label, Final_depression_score, User_Input, Session_Date FROM ${tableName} WHERE Week = ?`;
    const userInfoQuery = `SELECT Name, Age, Gender, PID FROM User_Info WHERE Username = ?`;

    db.get(userInfoQuery, [username], (userErr, userInfo) => {
        if (userErr) {
            console.error(userErr);
            return res.status(500).json({ error: 'Failed to fetch user info' });
        }

        if (!userInfo) {
            return res.status(404).json({ error: 'User not found in User_Info' });
        }

        db.get(scoreQuery, [week], (scoreErr, scoreInfo) => {
            if (scoreErr) {
                console.error(scoreErr);
                return res.status(500).json({ error: 'Failed to fetch depression score' });
            }

            if (!scoreInfo) {
                return res.status(404).json({ error: 'User not found in depression data' });
            }

            const combinedData = {
                name: userInfo.Name,
                session_Date: scoreInfo.Session_Date,
                label: scoreInfo.Final_predicted_label,
                depression_score: scoreInfo.Final_depression_score,
                input: scoreInfo.User_Input,
                age: userInfo.Age,
                gender: userInfo.Gender,
                pid: userInfo.PID
            };

            res.status(200).json(combinedData);
        });
    });
  });
  
  app.get('/daily_report_data', (req, res) => {
    const { username, day } = req.query;
    const tableName = `Extension_${username}`;
    const scoreQuery = `SELECT Predicted_label, Depression_score, User_Input, Date FROM ${tableName} WHERE Day = ?`;
    const userInfoQuery = `SELECT Name, Age, Gender, PID FROM User_Info WHERE Username = ?`;

    db.get(userInfoQuery, [username], (userErr, userInfo) => {
        if (userErr) {
            console.error(userErr);
            return res.status(500).json({ error: 'Failed to fetch user info' });
        }

        if (!userInfo) {
            return res.status(404).json({ error: 'User not found in User_Info' });
        }

        db.get(scoreQuery, [day], (scoreErr, scoreInfo) => {
            if (scoreErr) {
                console.error(scoreErr);
                return res.status(500).json({ error: 'Failed to fetch depression score' });
            }

            if (!scoreInfo) {
                return res.status(404).json({ error: 'User not found in depression data' });
            }

            const combinedData = {
                name: userInfo.Name,
                session_Date: scoreInfo.Date,
                label: scoreInfo.Predicted_label,
                depression_score: scoreInfo.Depression_score,
                input: scoreInfo.User_Input,
                age: userInfo.Age,
                gender: userInfo.Gender,
                pid: userInfo.PID
            };

            res.status(200).json(combinedData);
        });
    });
});
  

// DOCTOR

app.post('/doctor_login', (req, res) => {
    const { username, password } = req.body;

    try {
        db.get("SELECT * FROM Doctor_Info WHERE Username = ?", [username], async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(501).json({ error: 'An error occurred while logging in' });
            }
            
            console.log("User fetched from database:", user);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // const isValid = await bcrypt.compare(password, user.Password);
            const isValid = await bcrypt.compare(password, user.Password.toString());

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            if (!SECRET_KEY) {
                console.error("Missing SECRET_KEY in environment variables.");
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' }); 

            db.run(`UPDATE Doctor_Info SET IsLoggedIn = TRUE WHERE Username = ?`, [username], (updateErr) => {
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

app.post('/doctor_logout', (req, res) => {
    const { username } = req.body;

    // try-catch
    db.get(`SELECT * FROM Doctor_Info WHERE Username = ?`, [username], (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'An error occurred while logging out' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        db.run(`UPDATE Doctor_Info SET IsLoggedIn = FALSE WHERE Username = ?`, [username], (updateErr) => {
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).json({ error: 'Failed to update logout status' });
            }
            res.status(200).json({ message: 'Logout successful!' });
        });
    });
});

// AI Activity Suggestion
app.post('/get-activity-suggestions', async (req, res) => {
    const API_KEY = process.env.OPENROUTER_API_KEY;
    console.log(API_KEY);
    
    if (!API_KEY) {
        console.error("ERROR: API_KEY is missing ...");
        process.exit(1); 
    }

    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'deepseek/deepseek-r1:free',
                messages: [
                    {
                        role: 'user',
                        content: `
Suggest exactly 3 simple mental health activities that are evidence-based and recommended by psychologists. 
List them as plain text, without any markdown formatting, headings, or numbering. 
Each suggestion should be short (5-10 words) and immediately actionable.
Examples: "Practice gratitude journaling", "Do 5 minutes of mindful breathing", "Take a 10-minute nature walk".
                        `.trim(),
                    },
                ],
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:5500', 
                    'X-Title': 'HealingNeuro' 
                },
            }
        );

        const suggestionsText = response.data.choices[0].message.content;

        // Cleaning: split into lines, trim spaces
        const suggestions = suggestionsText.split('\n').map(s => s.trim()).filter(Boolean);

        res.json({ suggestions });

    } catch (error) {
        console.error("AI Suggestion Error:", error.message);
        res.status(500).json({ error: "Unable to fetch activity suggestions" });
    }
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