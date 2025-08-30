import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC

data = pd.read_csv('Depression_survey.csv')

response_map = {
    "Never": 0,
    "Some of the time": 1,
    "Most of the time": 2,
    "Nearly all the times": 3
}

for column in data.columns:
    data[column] = data[column].map(response_map)

data = data.drop(data.columns[0], axis=1)

threshold = 15  

data['total_score'] = data.sum(axis=1)

data['depression_status'] = data['total_score'].apply(lambda x: 1 if x > threshold else 0)

print(data[['total_score', 'depression_status']])

X = data.drop(columns=['depression_status', 'total_score'])  
y = data['depression_status'] 

print(X)
print(y)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = SVC()
model.fit(X_train, y_train)

nb_pred = model.predict(X_test)

train_accuracy =model.score(X_train, y_train)
print(f"Training Accuracy: {train_accuracy * 100:.2f}%")

test_accuracy =model.score(X_test, y_test)
print(f"Testing Accuracy: {test_accuracy * 100:.2f}%")

import pickle

with open('Rating_analysis_model.pkl', 'wb') as f:
    pickle.dump(model, f)

required_columns = X.columns.tolist()
with open('feature_names.pkl', 'wb') as f:
    pickle.dump(required_columns, f)