from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, Score
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class ScoreInput(BaseModel):
    player_name: str
    score: int

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/submit_score")
def submit_score(score_input: ScoreInput):
    db = next(get_db())
    new_score = Score(player_name=score_input.player_name, score=score_input.score)
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    return {"message": "Score submitted"}

@app.get("/leaderboard")
def leaderboard():
    db = next(get_db())
    scores = db.query(Score).all()
    leaderboard_data = {}
    for s in scores:
        if s.player_name not in leaderboard_data:
            leaderboard_data[s.player_name] = {"total_score": 0, "games_played": 0}
        leaderboard_data[s.player_name]["total_score"] += s.score
        leaderboard_data[s.player_name]["games_played"] += 1

    result = sorted(
        [(name, data["total_score"], data["games_played"]) for name, data in leaderboard_data.items()],
        key=lambda x: x[1],
        reverse=True
    )
    return {"leaderboard": result}
