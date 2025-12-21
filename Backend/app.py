from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel
from typing import List
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Guna Pathlib: Cari folder 'data' yang berada dalam folder yang sama dengan fail ini
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Model untuk data yang dihantar dari Frontend
class Answer(BaseModel):
    id: int
    answer: int

class QuizSubmission(BaseModel):
    answers: List[Answer]

class QuizResult(BaseModel):
    probability: str
    percentage: float

def load_quiz_file(name: str):
    file_path = DATA_DIR / f"{name}.json"
    print(f"Mencari fail di: {file_path}")
    if not file_path.exists():
        return None
    with open(file_path, "r") as f:
        return json.load(f)

# ===== Routes =====

@app.get("/api/qualification")
async def get_qualification():
    data = load_quiz_file("qualification")
    if data is None:
        raise HTTPException(status_code=404, detail="Fail qualification.json tidak dijumpai")
    return data

@app.post("/api/qualification", response_model=QuizResult)
async def post_qualification(submission: QuizSubmission):
    answers = submission.answers
    if not answers:
        return {"probability": "Low", "percentage": 0.0}
    
    score_map = {1: 1, 2: 2, 3: 3}

    max_score = len(answers) * 3
    total_score = sum(a.answer for a in answers)
    percentage = (total_score / max_score) * 100
    probability = "High" if percentage >= 80 else "Low"

    return {"probability": probability, "percentage": percentage}


# Contoh lain endpoints tetap sama
@app.get("/api/quiz/{disability}")
async def get_disability(disability: str):
    if disability not in ["dyslexia", "dysgraphia", "dyscalculia"]:
        raise HTTPException(status_code=404, detail="Invalid disability")
    
    data = load_quiz_file(disability)
    if data is None:
        raise HTTPException(status_code=404, detail=f"{disability}.json not found")
    return data

@app.post("/api/quiz/{disability}")
async def post_disability(disability: str, submission: QuizSubmission):
    answers = submission.answers
    if not answers:
        return {"probability": "Low"}
    
    score_map = {
        "Rarely": 1,
        "Sometimes": 2,
        "Often": 3
    }
    total_score = sum(score_map.get(a.answer, 0) for a in answers)
    max_score = len(answers) * 3
    percentage = (total_score / max_score) * 100
    probability = "High" if percentage >= 50 else "Low"

    return {"probability": probability, "percentage": percentage}

@app.get("/api/disability/{disability}")
async def get_disability(disability: str):
    if disability not in ["dyslexia", "dysgraphia", "dyscalculia"]:
        raise HTTPException(status_code=404, detail="Invalid disability")
    
    data = load_quiz_file("disability")
    if data is None:
        raise HTTPException(status_code=404, detail=f"Fail disability.json tidak dijumpai")
    return data
