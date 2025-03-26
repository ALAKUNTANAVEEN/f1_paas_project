from fastapi import APIRouter, HTTPException
from google.cloud import firestore

router = APIRouter()
db = firestore.Client(database="f1-paas-db")
teams_ref = db.collection("teams")

@router.get("/compare/teams/{team1}/{team2}")
def compare_teams(team1: str, team2: str):
    team1_doc = teams_ref.document(team1).get()
    team2_doc = teams_ref.document(team2).get()

    if not team1_doc.exists or not team2_doc.exists:
        raise HTTPException(status_code=404, detail="One or both teams not found")

    team1_data = team1_doc.to_dict()
    team2_data = team2_doc.to_dict()

    compare_fields = [
        "total_pole_positions", "total_race_wins", 
        "total_constructor_titles"
    ]

    reverse_fields = ["previous_season_position", "year_founded"]

    comparison = {}
    
    for field in compare_fields:
        if team1_data[field] > team2_data[field]:
            comparison[field] = {team1: "Better", team2: "Worse"}
        elif team1_data[field] < team2_data[field]:
            comparison[field] = {team1: "Worse", team2: "Better"}
        else:
            comparison[field] = {team1: "Equal", team2: "Equal"}

    for field in reverse_fields:
        if team1_data[field] < team2_data[field]:  
            comparison[field] = {team1: "Better", team2: "Worse"}
        elif team1_data[field] > team2_data[field]:
            comparison[field] = {team1: "Worse", team2: "Better"}
        else:
            comparison[field] = {team1: "Equal", team2: "Equal"}

    return {
        "team1": team1_data,
        "team2": team2_data,
        "comparison": comparison
    }
