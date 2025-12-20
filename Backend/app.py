from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel
from typing import List
import json

app = FastAPI()

origins = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Guna Pathlib: Cari folder 'data' yang berada dalam folder yang sama dengan fail ini
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Model untuk data yang dihantar dari Frontend
class Answer(BaseModel):
    answer: str

class QuizSubmission(BaseModel):
    answers: List[Answer]

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

@app.post("/api/qualification")
async def post_qualification(submission: QuizSubmission):
    answers = submission.answers
    if not answers:
        return {"probability": "Low", "message": "No answers provided"}
    
    yes_count = sum(1 for a in answers if a.answer == "Yes")
    probability = "High" if yes_count / len(answers) >= 0.8 else "Low"
    return {"probability": probability}

@app.get("/api/{disability}")
async def get_disability(disability: str):
    if disability not in ["dyslexia", "dysgraphia", "dyscalculia"]:
        raise HTTPException(status_code=404, detail="Invalid disability")
    
    data = load_quiz_file(disability)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Fail {disability}.json tidak dijumpai")
    return data

@app.post("/api/{disability}")
async def post_disability(disability: str, submission: QuizSubmission):
    answers = submission.answers
    if not answers:
        return {"probability": "Low"}
    
    yes_count = sum(1 for a in answers if a.answer == "Yes")
    probability = "High" if yes_count / len(answers) >= 0.5 else "Low"
    return {"probability": probability}