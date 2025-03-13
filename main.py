from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from routes import auth, drivers, teams, compare
from fastapi.middleware.cors import CORSMiddleware
from authentication import verify_user

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

app.include_router(auth.router)
app.include_router(drivers.router, prefix="/drivers")
app.include_router(teams.router, prefix="/teams")
app.include_router(compare.router, prefix="/compare")


@app.get("/add_driver")
def add_driver_page(request: Request):
    return templates.TemplateResponse("add_driver.html", {"request": request})

@app.get("/add_team")
def add_team_page(request: Request):
    return templates.TemplateResponse("add_team.html", {"request": request})

@app.get("/query_drivers")
def query_drivers_page(request: Request):
    return templates.TemplateResponse("query_drivers.html", {"request": request})

@app.get("/query_teams")
def query_teams_page(request: Request):
    return templates.TemplateResponse("query_teams.html", {"request": request})

@app.get("/compare_drivers")
def compare_drivers_page(request: Request):
    return templates.TemplateResponse("compare_drivers.html", {"request": request})

@app.get("/compare_teams")
def compare_teams_page(request: Request):
    return templates.TemplateResponse("compare_teams.html", {"request": request})

@app.get("/drivers/{driver_name}")
def driver_details(driver_name: str, request: Request):
    driver = drivers_ref.document(driver_name).get()
    if not driver.exists:
        return {"error": "Driver not found"}
    
    return templates.TemplateResponse("driver_details.html", {"request": request, "driver": driver.to_dict()})

@app.get("/teams/{team_name}")
def team_details(team_name: str, request: Request):
    team = teams_ref.document(team_name).get()
    if not team.exists:
        return {"error": "Team not found"}
    
    return templates.TemplateResponse("team_details.html", {"request": request, "team": team.to_dict()})

@app.get("/drivers/details")
def driver_details_page(request: Request, name: str):
    from google.cloud import firestore
    db = firestore.Client()

    driver_doc = db.collection("drivers").document(name).get()
    if not driver_doc.exists:
        raise HTTPException(status_code=404, detail="Driver not found")

    driver_data = driver_doc.to_dict()
    return templates.TemplateResponse("driver_details.html", {"request": request, "driver": driver_data})

@app.get("/teams/details")
def team_details_page(request: Request, name: str):
    from google.cloud import firestore
    db = firestore.Client()

    team_doc = db.collection("teams").document(name).get()
    if not team_doc.exists:
        raise HTTPException(status_code=404, detail="Team not found")

    team_data = team_doc.to_dict()
    return templates.TemplateResponse("team_details.html", {"request": request, "team": team_data})