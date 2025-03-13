import firebase_admin
from firebase_admin import credentials, auth
from google.cloud import firestore

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore Database
db = firestore.Client()
 
