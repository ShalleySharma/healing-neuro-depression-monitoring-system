-- CREATE TABLE DMS(Week INTEGER NOT NULL PRIMARY KEY, Session1_predicted_label TEXT, Session1_depression_score INTEGER, 
-- Session2_predicted_label TEXT, Session2_depression_score INTEGER, Session3_predicted_label TEXT, Session3_depression_score INTEGER,
-- Final_predicted_label TEXT, Final_depression_score INTEGER);

-- .schema DMS

-- .tables

-- CREATE TABLE User_Info(Username TEXT NOT NULL PRIMARY KEY, Name TEXT NOT NULL, Email TEXT NOT NULL, 
-- Password TEXT NOT NULL);

-- CREATE TABLE Extension_NainaS25(Day INTEGER NOT NULL PRIMARY KEY, Date TEXT, Predicted_label TEXT, Depression_score INTEGER, User_Input TEXT);

-- INSERT INTO Extension_NainaS25 (Day, Date, Predicted_label, Depression_score) VALUES (2, 'Sun Apr 24 2025', 'No Depression', 26.4);
 
-- CREATE TABLE Doctor_Info(Username TEXT NOT NULL PRIMARY KEY, Name TEXT NOT NULL, Email TEXT NOT NULL, Password TEXT NOT NULL);

.schema User_Info

.tables

SELECT * FROM User_Info;

SELECT * FROM Doctor_Info;

-- .schema info_NainaS25;

SELECT * FROM info_NainaS25;

SELECT * FROM Extension_NainaS25;


-- UPDATE Extension_NainaS25 SET Date = 'Thu Apr 24 2025' WHERE Day = 2;

-- UPDATE Extension_NainaS25 SET Predicted_label = 'Depression' WHERE Day = 3;

SELECT * FROM User_Info WHERE Username = 'KhushiM25 ';

-- DELETE FROM User_Info

-- DELETE FROM Doctor_Info WHERE Username = 'drRitam';

-- DELETE FROM Extension_NainaS25 WHERE Day = 3;

-- ALTER TABLE Doctor_Info ADD COLUMN IsLoggedIn BOOLEAN;

-- UPDATE Doctor_Info SET IsLoggedIn = FALSE ;

-- ALTER TABLE info_NainaS25 ADD COLUMN User_Input Text;

-- Session_Date

-- UPDATE info_NainaS25 SET Session_Date = 'Sun Apr 20 2025' WHERE Week = 1;  

-- UPDATE info_NainaS25 SET User_Input = 'I have been feeling really great lately! Life is full of positive surprises, and I find joy in the small things—like spending time with friends or enjoying a good book. I am excited about my future and have a supportive circle around me. Every day feels like an opportunity to grow and learn. I appreciate what I have and try to focus on the positive aspects of life. Overall, I am in a good place mentally and emotionally!' WHERE Week = 1;  

-- UPDATE User_Info SET Week = 0;

-- UPDATE User_Info SET IsLoggedIn = FALSE WHERE Username = 'NainaS25';

-- UPDATE Doctor_Info SET IsLoggedIn = FALSE WHERE Username = 'drNiharika';

-- UPDATE User_Info SET IsLoggedIn = TRUE WHERE Username = 'NainaS25';

-- ALTER TABLE User_Info ADD COLUMN IsChosenExpert BOOLEAN;

-- UPDATE User_Info SET IsChosenExpert = FALSE;

-- ALTER TABLE User_Info ADD COLUMN Expert_Selected TEXT;

-- UPDATE User_Info SET IsLoggedIn = FALSE WHERE Username = 'abc25';

-- UPDATE User_Info SET IsChosenExpert = 0;

-- DROP TABLE info_aarti;
