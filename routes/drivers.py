from fastapi import APIRouter, HTTPException, Query, Depends, Request
from google.cloud import firestore
from models import Driver
from authentication import verify_user
from fastapi.templating import Jinja2Templates

router = APIRouter()
db = firestore.Client()
templates = Jinja2Templates(directory="templates")
drivers_ref = db.collection("drivers")

# ✅ Add a Driver
@router.post("/add_driver")
def add_driver(driver: Driver):
    if drivers_ref.document(driver.name).get().exists:
        raise HTTPException(status_code=400, detail="Driver already exists")
    
    drivers_ref.document(driver.name).set(driver.dict())
    return {"message": "Driver added successfully"}

# ✅ Get a Driver by Name
@router.get("/get_driver/{name}")
def get_driver(name: str):
    driver_doc = drivers_ref.document(name).get()
    if not driver_doc.exists:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver_doc.to_dict()

@router.put("/update_driver/{name}")
def update_driver(name: str, updated_data: dict):
    driver_doc = drivers_ref.document(name).get()
    if not driver_doc.exists:
        raise HTTPException(status_code=404, detail="Driver not found")

    try:
        # ✅ Use Firestore `update` method to modify only changed fields
        drivers_ref.document(name).update(updated_data)
        return {"message": f"✅ Driver '{name}' updated successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.delete("/delete_driver/{name}")
def delete_driver(name: str, token: str = Depends(verify_user)):
    """ ✅ Only logged-in users can delete drivers """
    driver_doc = drivers_ref.document(name).get()
    if not driver_doc.exists:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    drivers_ref.document(name).delete()
    return {"message": "✅ Driver deleted successfully"}

@router.get("/query_drivers")
def query_drivers(
    attribute: str = Query(..., description="Attribute to filter by (e.g., 'age', 'total_race_wins')"),
    condition: str = Query(..., description="Comparison condition ('greater', 'less', 'equal')"),
    value: float = Query(..., description="Value to compare against")
):
    """ ✅ Query drivers based on an attribute """
    operators = {
        "greater": ">", 
        "less": "<", 
        "equal": "=="
    }

    if condition not in operators:
        raise HTTPException(status_code=400, detail="Invalid condition")

    # Firestore requires a special approach for filtering
    if condition == "greater":
        query = drivers_ref.where(attribute, ">", value).stream()
    elif condition == "less":
        query = drivers_ref.where(attribute, "<", value).stream()
    else:
        query = drivers_ref.where(attribute, "==", value).stream()

    results = [doc.to_dict() for doc in query]

    return results

@router.get("/compare_drivers", tags=["Drivers"], summary="Compare Two Drivers")
def compare_drivers(
    driver1: str = Query(..., title="Driver 1", description="Name of the first driver"),
    driver2: str = Query(..., title="Driver 2", description="Name of the second driver")
):
    """
    Compare two drivers based on their statistics.

    - **driver1**: Name of the first driver.
    - **driver2**: Name of the second driver.
    """
    doc1 = drivers_ref.document(driver1).get()
    doc2 = drivers_ref.document(driver2).get()

    if not doc1.exists or not doc2.exists:
        raise HTTPException(status_code=404, detail="One or both drivers not found")

    driver1_data = doc1.to_dict()
    driver2_data = doc2.to_dict()

    # Compare stats and highlight better ones
    comparison = {}
    for key in ["total_pole_positions", "total_race_wins", "total_points_scored", "total_world_titles", "total_fastest_laps"]:
        if driver1_data[key] > driver2_data[key]:
            comparison[key] = {driver1: f"{driver1_data[key]} ✅", driver2: f"{driver2_data[key]}"}
        elif driver1_data[key] < driver2_data[key]:
            comparison[key] = {driver1: f"{driver1_data[key]}", driver2: f"{driver2_data[key]} ✅"}
        else:
            comparison[key] = {driver1: f"{driver1_data[key]}", driver2: f"{driver2_data[key]}"}

    return {
        "driver1": driver1_data,
        "driver2": driver2_data,
        "comparison": comparison
    }    

@router.get("/details")
def driver_details(request: Request, name: str):
    driver_doc = drivers_ref.document(name).get()
    if not driver_doc.exists:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver_data = driver_doc.to_dict()
    return templates.TemplateResponse("driver_details.html", {"request": request, "driver": driver_data})