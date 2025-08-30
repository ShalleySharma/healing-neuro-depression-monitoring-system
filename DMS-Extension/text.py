import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import re
import nltk
nltk.download('punkt_tab')
nltk.download('stopwords') 
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize


df=pd.read_csv("mental_health.csv")

data=pd.DataFrame(df)

def clean_text(text):
    text = re.sub(r'\d+', '', text)  # Remove digits
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    text = text.lower()  # Convert to lowercase
    return text

data['cleaned_text'] = data['text'].apply(clean_text)

stop_words = set(stopwords.words('english'))
def tokenize_and_remove_stopwords(text):
    tokens = word_tokenize(text)
    tokens = [word for word in tokens if word not in stop_words]
    return ' '.join(tokens)

data['processed_text'] = data['cleaned_text'].apply(tokenize_and_remove_stopwords)

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(data['processed_text'])

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(data['label'])


from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Logistic Regression
model = LogisticRegression()
model.fit(X_train, y_train)
y_pred=model.predict(X_test)
print("Logistic Regression:")

print("Accuracy:",accuracy_score(y_test, y_pred)*100)

cm=confusion_matrix(y_test,y_pred)
print(cm)

import pickle

# Save the trained model
with open('Text_analysis_model.pkl', 'wb') as f:
    pickle.dump(model, f)

with open('tfidf_vectorizer.pkl', 'wb') as file:
    pickle.dump(vectorizer, file)

