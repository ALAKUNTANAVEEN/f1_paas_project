from google.cloud import firestore

db = firestore.Client()
print("🔥 Connected to Firestore!")

# Try adding a test team
team_ref = db.collection("teams").document("test_team")
team_ref.set({"name": "Test Team", "year_founded": 2000, "total_race_wins": 50})

print("✅ Test team added successfully!")
 
