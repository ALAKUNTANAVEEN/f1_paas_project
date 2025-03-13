from fastapi import APIRouter, HTTPException
from google.cloud import firestore

router = APIRouter()
db = firestore.Client()
teams_ref = db.collection("teams")

# ✅ Compare Two Teams
@router.get("/compare/teams/{team1}/{team2}")
def compare_teams(team1: str, team2: str):
    team1_doc = teams_ref.document(team1).get()
    team2_doc = teams_ref.document(team2).get()

    if not team1_doc.exists or not team2_doc.exists:
        raise HTTPException(status_code=404, detail="One or both teams not found")

    team1_data = team1_doc.to_dict()
    team2_data = team2_doc.to_dict()

    # Fields to compare
    compare_fields = [
        "total_pole_positions", "total_race_wins", 
        "total_constructor_titles"
    ]

    # Fields where lower is better
    reverse_fields = ["previous_season_position", "year_founded"]

    comparison = {}
    
    for field in compare_fields:
        if team1_data[field] > team2_data[field]:
            comparison[field] = {team1: "✅", team2: "❌"}
        elif team1_data[field] < team2_data[field]:
            comparison[field] = {team1: "❌", team2: "✅"}
        else:
            comparison[field] = {team1: "🔵", team2: "🔵"}

    for field in reverse_fields:
        if team1_data[field] < team2_data[field]:  # Lower is better
            comparison[field] = {team1: "✅", team2: "❌"}
        elif team1_data[field] > team2_data[field]:
            comparison[field] = {team1: "❌", team2: "✅"}
        else:
            comparison[field] = {team1: "🔵", team2: "🔵"}

    return {"team1": team1_data, "team2": team2_data, "comparison": comparison}
 
