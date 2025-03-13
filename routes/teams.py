from fastapi import APIRouter, HTTPException, Query, Depends, Request
from google.cloud import firestore
from models import Team
from authentication import verify_user
from fastapi.templating import Jinja2Templates

router = APIRouter()
db = firestore.Client()
teams_ref = db.collection("teams")
templates = Jinja2Templates(directory="templates")

@router.post("/add_team")
def add_team(team: Team):
    """ Add a new team to Firestore """
    if teams_ref.document(team.name).get().exists:
        raise HTTPException(status_code=400, detail="Team already exists")
    
    teams_ref.document(team.name).set(team.dict())
    return {"message": "Team added successfully"}

@router.get("/get_team/{name}")
def get_team(name: str):
    """ Fetch a team's details """
    team_doc = teams_ref.document(name).get()
    if not team_doc.exists:
        raise HTTPException(status_code=404, detail="Team not found")
    return team_doc.to_dict()

@router.put("/update_team/{name}")
def update_team(name: str, updated_data: dict):
    team_doc = teams_ref.document(name).get()

    if not team_doc.exists:
        raise HTTPException(status_code=404, detail="Team not found")

    try:
        teams_ref.document(name).update(updated_data)
        return {"message": f" Team '{name}' updated successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.delete("/delete_team/{name}")
def delete_team(name: str, token: str = Depends(verify_user)):
    """ Only logged-in users can delete teams """
    team_doc = teams_ref.document(name).get()
    if not team_doc.exists:
        raise HTTPException(status_code=404, detail="Team not found")
    
    teams_ref.document(name).delete()
    return {"message": "Team deleted successfully"}

@router.get("/query_teams", tags=["Teams"], summary="Query Teams Based on Attributes")
def query_teams(
    attribute: str = Query(..., title="Attribute", description="Field to filter (e.g., 'year_founded', 'total_race_wins')"),
    condition: str = Query(..., title="Condition", description="Comparison ('greater', 'less', 'equal')"),
    value: float = Query(..., title="Value", description="Value to compare against")
):
    """
    Query teams based on attributes.

    - **attribute**: The field to filter (e.g., 'year_founded', 'total_race_wins')
    - **condition**: The comparison type ('greater', 'less', 'equal')
    - **value**: The value to compare against
    """
    operators = {
        "greater": ">", 
        "less": "<", 
        "equal": "=="
    }

    if condition not in operators:
        raise HTTPException(status_code=400, detail="Invalid condition")

    if condition == "greater":
        query = teams_ref.where(attribute, ">", value).stream()
    elif condition == "less":
        query = teams_ref.where(attribute, "<", value).stream()
    else:
        query = teams_ref.where(attribute, "==", value).stream()

    results = [doc.to_dict() for doc in query]

    return results

@router.get("/compare_teams", tags=["Teams"], summary="Compare Two Teams")
def compare_teams(
    team1: str = Query(..., title="Team 1", description="Name of the first team"),
    team2: str = Query(..., title="Team 2", description="Name of the second team")
):
    """
    Compare two teams based on their statistics.

    - **team1**: Name of the first team.
    - **team2**: Name of the second team.
    """
    doc1 = teams_ref.document(team1).get()
    doc2 = teams_ref.document(team2).get()

    if not doc1.exists or not doc2.exists:
        raise HTTPException(status_code=404, detail="One or both teams not found")

    team1_data = doc1.to_dict()
    team2_data = doc2.to_dict()

    comparison = {}
    for key in ["total_pole_positions", "total_race_wins", "total_constructor_titles"]:
        if team1_data[key] > team2_data[key]:
            comparison[key] = {team1: f"{team1_data[key]} ✅", team2: f"{team2_data[key]}"}
        elif team1_data[key] < team2_data[key]:
            comparison[key] = {team1: f"{team1_data[key]}", team2: f"{team2_data[key]} ✅"}
        else:
            comparison[key] = {team1: f"{team1_data[key]}", team2: f"{team2_data[key]}"}

    return {
        "team1": team1_data,
        "team2": team2_data,
        "comparison": comparison
    }

@router.get("/details/{name}")
def team_details(request: Request, name: str):
    """ Fetch and display team details """
    team_doc = teams_ref.document(name).get()
    
    if not team_doc.exists:
        raise HTTPException(status_code=404, detail="Team not found")

    return templates.TemplateResponse("team_details.html", {"request": request, "team": team_doc.to_dict()})