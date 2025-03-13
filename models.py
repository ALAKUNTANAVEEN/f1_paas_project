from pydantic import BaseModel

class Driver(BaseModel):
    name: str
    age: int
    total_pole_positions: int
    total_race_wins: int
    total_points_scored: float
    total_world_titles: int
    total_fastest_laps: int
    team: str

class Team(BaseModel):
    name: str
    year_founded: int
    total_pole_positions: int
    total_race_wins: int
    total_constructor_titles: int
    previous_season_position: int
 
