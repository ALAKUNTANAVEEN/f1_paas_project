import firebase_admin
from firebase_admin import credentials, auth
from google.cloud import firestore

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.Client()
 
