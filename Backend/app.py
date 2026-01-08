from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import List
from datetime import datetime
import json
from fastapi import Query
from typing import Literal, Optional, Any
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = "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"


# Folder data
BASE_PATH = Path(__file__).parent / "data"
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "game_results.json"


# ===== Models =====
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

# Full User model with id and role for storage/response
class User(UserRegister):
    id: int
    role: str = "user"

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str

class Answer(BaseModel):
    id: int
    answer: float 
    quiz_type: str
    type : Optional[str] = None
    disability: str

class AnswerIn(BaseModel):
    id: int
    type: str
    answer: float

class QuizResultIn(BaseModel):
    user_id: int
    type: str
    answers: List[AnswerIn]

class Question(BaseModel):
    id: int
    quiz_type: str
    text: str
    weight: int
    options: List[dict]  # setiap option ada value, label, score

class QuestionIn(BaseModel):
    quiz_type: str
    text: str
    weight: Optional[int] = 4


class QuizSubmission(BaseModel):
    answers: List[Answer]

class QuizResult(BaseModel):
    probability: str
    percentage: float
    answers: List[Answer]

class MessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[MessageItem]
    disabilityType: str
# models
class GameResult(BaseModel):
    user_id: str
    disability_type: str
    activity_type: str
    score: int
    attempts: int | None = None
    completed: bool
    data: dict

# ===== Helpers =====
def load_json(name: str):
    file_path = DATA_DIR / f"{name}.json"
    if not file_path.exists():
        return []
    with open(file_path, "r") as f:
        return json.load(f)

def build_question_map():
    question_map = {}
    for fname in ["general", "dyslexia", "dysgraphia", "dyscalculia"]:
        questions = load_json(fname)
        # ambil nama file sebagai 'disability'
        disability = fname.replace(".json", "")
        for q in questions:
            option_score_map = {opt["score"]: opt["score"] for opt in q["options"]}
            # guna key unik
            q_key = f"{disability}_{q['id']}"
            question_map[q_key] = {
                "weight": q["weight"],
                "options": option_score_map,
                "quiz_type": q.get("quiz_type", disability),
                "disability": disability
            }
    return question_map


def questions_json(filename):
    path = BASE_PATH / filename
    print(f"Loading {path}")  # debug
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    print(f"File not found: {filename}")
    return []


def loadQuestion_json(filename: str):
    path = DATA_DIR / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def saveQuestion_json(filename: str, data):
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def save_json(name: str, data):
    file_path = DATA_DIR / f"{name}.json"
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)



# ===== Routes =====

# --- Users ---
@app.get("/api/users")
def get_users():
    return load_json("users")

@app.post("/api/login", response_model=UserOut)
def login(user: UserLogin):
    users = load_json("users")
    found = next(
        (u for u in users if u["email"] == user.email and u["password"] == user.password),
        None
    )

    if not found:
        raise HTTPException(status_code=401, detail="Invalid Email or Password")

    return {
        "id": found["id"],
        "email": found["email"],
        "full_name": found["full_name"],
        "role": found["role"],
    }


@app.post("/api/register", response_model=UserOut)
def register(user: UserRegister):
    users = load_json("users")

    if any(u["email"] == user.email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
      
    new_id = max([u["id"] for u in users], default=0) + 1

    new_user = {
        "id": new_id,
        "email": user.email,
        "password": user.password,
        "full_name": user.full_name,
        "role": "user",
        "created_at": datetime.now().isoformat()  
    }

    users.append(new_user)
    save_json("users", users)

    return {
        "id": new_id,
        "email": user.email,
        "full_name": user.full_name,
        "role": "user",
    }

# --- Qualification ---
@app.get("/api/qualification")
def get_qualification():
    data = load_json("general")
    if not data:
        raise HTTPException(status_code=404, detail="general.json not found")
    return data

@app.post("/api/qualification")
def post_qualification(submission: QuizSubmission, user_id: int):
    answers = submission.answers
    if not answers:
        return {"probability": "Low", "percentage": 0.0}

    max_score = len(answers) * 4
    total_score = sum(a.answer for a in answers)
    percentage = (total_score / max_score) * 100
    probability = "High" if percentage >= 50 else "Low"

    # Save to quiz_results.json (only latest per user)
    all_results = load_json("quiz_results")
    # Remove previous result for user
    all_results = [r for r in all_results if r["user_id"] != user_id]
    # Add new result
    all_results.append({
        "user_id": user_id,
        "percentage": percentage,
        "probability": probability,
        "answers": [a.dict() for a in answers]
    })
    save_json("quiz_results", all_results)

    return {"probability": probability, "percentage": percentage}


# --- Disability Quiz ---
@app.get("/api/quiz/{disability}")
def get_quiz(disability: str):
    if disability not in ["dyslexia", "dysgraphia", "dyscalculia"]:
        raise HTTPException(status_code=404, detail="Invalid disability")
    data = load_json(disability)
    if not data:
        raise HTTPException(status_code=404, detail=f"{disability}.json not found")
    return data

# @app.post("/api/qualification")
# def post_qualification(submission: QuizSubmission, user_id: int):
#     answers = submission.answers
#     if not answers:
#         return {"probability": "Low", "percentage": 0.0}

#     # Load questions from 'general.json'
#     quiz_data = load_json("general")
#     question_map = {q["id"]: q for q in quiz_data}

#     total_score = 0
#     max_score = 0

#     for a in answers:
#         q = question_map.get(a.id)
#         if not q:
#             continue

#         # max score comes from question weight
#         max_score += q.get("weight", 1)

#         # find selected option score
#         selected_option = next(
#             (opt for opt in q.get("options", []) if opt["score"] == a.answer),
#             None
#         )
#         if selected_option:
#             total_score += selected_option.get("score", 0)

#     if max_score == 0:
#         percentage = 0.0
#     else:
#         percentage = round((total_score / max_score) * 100, 1)

#     probability = "High" if percentage >= 50 else "Low"

#     # Save to quiz_results.json (only latest per user)
#     all_results = load_json("quiz_results")
#     all_results = [r for r in all_results if not (r["user_id"] == user_id and r.get("type") == "First Qualification")]

#     new_result = {
#         "user_id": user_id,
#         "type": "First Qualification",
#         "percentage": percentage,
#         "probability": probability,
#         "answers": [a.dict() for a in answers],
#         "date": datetime.now().isoformat()
#     }

#     all_results.append(new_result)
#     save_json("quiz_results", all_results)

#     return {"probability": probability, "percentage": percentage}



#--Second Screening Config--
@app.get("/api/second-screening")
def get_second_screening():
    config = load_json("second_screening_config")
    result = {}

    for disability, ids in config["questions"].items():
        all_q = load_json(disability)
        # filter ikut id yg ada dalam config
        filtered_qs = [q for q in all_q if q["id"] in ids]

        # sertakan weight dan score terus
        for q in filtered_qs:
            for opt in q.get("options", []):
                # pastikan setiap option ada score (dari JSON)
                opt["score"] = opt.get("score", 0)
            q["weight"] = q.get("weight", 1)   

        result[disability] = filtered_qs

    return {
        "threshold": config["threshold"],
        "questions": result
    }

#--- Admin: Update Second Screening Config ---
@app.post("/api/second-screening")
def save_second_screening_config(payload: dict):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / "second_screening_config.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return {"detail": "Second Screening Config updated"}


# --- Disability Info ---
@app.get("/api/disability/{disability}")
def get_disability_info(disability: str):
    data = load_json("disability")
    if not data:
        raise HTTPException(status_code=404, detail="disability.json not found")
    return data

@app.get("/api/exercise/{disability}")
def get_latihan(disability: str):
    data = load_json(f"exercise_{disability}")
    if not data:
        raise HTTPException(status_code=404, detail=f"exercise_{disability}.json not found")
    return data

# --- Quiz Results ---

class QuizSaveSubmission(BaseModel):
    user_id: int
    type: str
    answers: List[Answer]

@app.post("/api/quiz_result")
def save_quiz_result(payload: QuizResultIn):
    results = load_json("quiz_results")
    threshold_map = {
        "First Qualification": 50,
        "Second Qualification": 60,
        "dyslexia": 60,
        "dysgraphia": 60,
        "dyscalculia": 60
    }

    question_map = build_question_map()
    # ===== Second Qualification =====
    if payload.type == "Second Qualification":
        # build scores
        disability_scores = {}
        disability_max = {}

        for a in payload.answers:
            q_key = f"{a.type.lower()}_{int(a.id)}"
            q_info = question_map.get(q_key)
            if not q_info:
                continue
            score = q_info["options"].get(float(a.answer), 0)
            weight = q_info["weight"]
            dis = a.type
            disability_scores[dis] = disability_scores.get(dis, 0) + score
            disability_max[dis] = disability_max.get(dis, 0) + weight

        percentages = {}
        passed_map = {}
        for dis in disability_scores:
            total_score = disability_scores[dis]
            max_score = disability_max[dis]
            percentage = round((total_score / max_score) * 100, 1)
            threshold = threshold_map.get(dis, 60)
            percentages[dis] = percentage
            passed_map[dis] = percentage >= threshold

        overall_passed = all(passed_map.values())

        new_result = {
            "quiz_id": len(results) + 1,
            "user_id": payload.user_id,
            "type": payload.type,
            "percentage": percentages,      
            "passed": overall_passed,    
            "answers": [a.dict() for a in payload.answers],
            "passed_map": passed_map,    
            "date": datetime.now().isoformat()
        }

    else:
        total_score = 0
        max_score = 0
        for a in payload.answers:
            q_key = f"{a.type.lower()}_{a.id}"
            q_info = question_map.get(q_key)
            if q_info:
                weight = q_info.get("weight")
                score = q_info["options"].get(float(a.answer), 0)
                total_score += score
                max_score += weight
        if max_score == 0:
            percentage = 0
        else:
            percentage = round((total_score / max_score) * 100, 1)
        threshold = threshold_map.get(payload.type, 50)
        passed = percentage >= threshold

        new_result = {
            "quiz_id": len(results) + 1,
            "user_id": payload.user_id,
            "type": payload.type,
            "percentage": percentage,
            "passed": passed,
            "answers": [a.dict() for a in payload.answers],
            "date": datetime.now().isoformat()
        }




    # overwrite latest result untuk same user + type
    results = [
        r for r in results
        if not (r["user_id"] == payload.user_id and r["type"] == payload.type)
    ]
    results.append(new_result)
    save_json("quiz_results", results)

    return new_result


# --- Past Results ---
@app.get("/api/quiz_result/history/{user_id}")
def get_user_history(user_id: int):
    results = load_json("quiz_results")
    user_results = [r for r in results if r["user_id"] == user_id]
    # sort by date descending
    user_results.sort(key=lambda x: x.get("date", ""), reverse=True)
    return user_results


@app.get("/api/quiz_result/latest")
def get_latest_result(user_id: int, type: str):
    results = load_json("quiz_results")

    filtered = [
        r for r in results
        if r["user_id"] == user_id and r["type"] == type
    ]

    if not filtered:
        return None

    return max(filtered, key=lambda r: r["date"])

# --- Admin: Questions Management ---
@app.get("/api/Allquestions")
async def get_all_questions():
    # Load all quizzes
    general = questions_json("general.json")
    dyslexia = questions_json("dyslexia.json")
    dysgraphia = questions_json("dysgraphia.json")
    dyscalculia = questions_json("dyscalculia.json")
    
    # Combine all
    all_questions = general + dyslexia + dysgraphia + dyscalculia
    return all_questions

# --- Create Question ---
@app.post("/api/createQuestions", response_model=Question)
def create_question(q: QuestionIn):
    file_map = {
        "general": "general.json",
        "dyslexia": "dyslexia.json",
        "dysgraphia": "dysgraphia.json",
        "dyscalculia": "dyscalculia.json",
    }
    filename = file_map.get(q.quiz_type)
    if not filename:
        raise HTTPException(status_code=400, detail="Invalid quiz type")

    data = loadQuestion_json(filename)
    new_id = max([item["id"] for item in data], default=0) + 1

    # auto-bahagi options ikut weight
    num_options = 4
    option_labels = ["Never", "Sometimes", "Often", "Always"]
    options = [
        {"value": i, "label": label, "score": round(q.weight * i / num_options, 2)}
        for i, label in enumerate(option_labels, start=1)
    ]

    new_q = {"id": new_id, "quiz_type": q.quiz_type, "text": q.text, "weight": q.weight, "options": options}
    data.append(new_q)
    saveQuestion_json(filename, data)
    return new_q


# --- Update Question ---
@app.post("/api/updateQuestions/{question_id}", response_model=Question)
def update_question(question_id: int, q: QuestionIn):
    target_file = f"{q.quiz_type}.json"  # guna quiz_type terus
    data = loadQuestion_json(target_file)

    for item in data:
        if item["id"] == question_id:
            item["text"] = q.text
            item["quiz_type"] = q.quiz_type
            item["weight"] = q.weight
            option_labels = ["Never", "Sometimes", "Often", "Always"]
            num_options = len(option_labels) - 1  # because first one is 0
            item["options"] = [
                {"value": i, "label": label, "score": 0 if i == 1 else round(q.weight * (i-1) / num_options, 2)}
                for i, label in enumerate(option_labels, start=1)
            ]

            saveQuestion_json(target_file, data)
            return {"id": question_id, "quiz_type": q.quiz_type, "text": q.text, "weight": q.weight, "options": item["options"]}

    raise HTTPException(status_code=404, detail="Question not found")



# --- Delete Question ---
@app.delete("/api/deleteQuestions/{question_id}")
def delete_question(question_id: int, quiz_type: str):  # kena hantar quiz_type
    target_file = f"{quiz_type}.json"
    data = loadQuestion_json(target_file)
    new_data = [item for item in data if item["id"] != question_id]
    
    if len(new_data) == len(data):
        raise HTTPException(status_code=404, detail="Question not found")

    saveQuestion_json(target_file, new_data)
    return {"detail": "Deleted"}


# --- Admin: get all users ---
@app.get("/api/allusers")
def get_all_users():
    users = load_json("users")
    # Hanya return public info
    return [
        {
            "id": u["id"],
            "full_name": u.get("full_name"),
            "email": u.get("email"),
            "created_at": u.get("created_at") or datetime.now().isoformat(),
            "role": u.get("role", "user")
        }
        for u in users
    ]


# --- Admin: get all results ---
@app.get("/api/allresults")
def get_all_results():
    results = load_json("quiz_results")
    # Return as is, but we can enrich if needed
    return [
        {
            "quiz_id": r.get("quiz_id") or r.get("id"),
            "user_id": r["user_id"],
            "type": r.get("type", r.get("quiz_type", "unknown")),
            "percentage": r.get("percentage"),
            "passed": r.get("passed"),
            "date": r.get("date") or r.get("created_at"),
            "answers": r.get("answers", [])
        }
        for r in results
    ]

@app.post("/api/chat/send")
async def send_message(request: ChatRequest):
    # Ambil mesej terakhir dan disability context
    user_content = request.messages[-1].content
    disability = request.disabilityType

    messages = [
        {"role": "system", "content": f"The user has {disability}. Provide clear and accessible responses."},
    ]
    
    # Masukkan sejarah perbualan
    for m in request.messages:
        messages.append({"role": m.role, "content": m.content})

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "xiaomi/mimo-v2-flash:free", # Model pilihan kau
                "messages": messages,
                "reasoning": {"enabled": True} # Aktifkan reasoning
            }),
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        
        # OpenRouter ikut format OpenAI
        # 'content' adalah jawapan akhir, 'reasoning_details' adalah cara dia berfikir
        ai_message = data['choices'][0]['message']
        answer = ai_message.get('content', "No response content")
        
        # Kalau kau nak hantar sekali 'reasoning' ke frontend, boleh tambah kat return
        return {"content": answer}

    except Exception as e:
        print(f"OpenRouter Error: {str(e)}")
        return {"content": "Fail to connect with AI. Please try again or server busy right now."}

@app.post("/api/save-progress")
def save_progress(result: GameResult):
    # Ensure data folder exists
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing results
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            all_results = json.load(f)
    else:
        all_results = []

    # Find or create user entry
    user_entry = next((u for u in all_results if u["user_id"] == result.user_id), None)
    if not user_entry:
        user_entry = {"user_id": result.user_id, "disabilities": {}}
        all_results.append(user_entry)

    # Find or create disability entry
    disability_entry = user_entry["disabilities"].get(result.disability_type, {})
    activity_entry = disability_entry.get(result.activity_type)

    # Compare and keep best score
    if not activity_entry or result.score > activity_entry["score"]:
        # Save the new best result
        new_entry = result.dict()
        new_entry["date"] = datetime.now().isoformat()
        disability_entry[result.activity_type] = new_entry

    # Update the user's disability data
    user_entry["disabilities"][result.disability_type] = disability_entry

    # Save back to file
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2)

    return {"detail": "Activity saved successfully"}


@app.get("/api/leaderboard/{disability}/{activity_type}")
def get_leaderboard(disability: str, activity_type: str):
    file_path = DATA_DIR / "game_results.json"

    if not file_path.exists():
        return []

    with open(file_path, "r", encoding="utf-8") as f:
        all_users = json.load(f)

    results = []
    for user in all_users:
        disabilities = user.get("disabilities", {})
        activity_data = disabilities.get(disability, {}).get(activity_type)
        if activity_data:
            results.append({
                "user_id": user["user_id"],
                "full_name": user.get("full_name"),
                "email": user.get("email"),
                "score": activity_data.get("score", 0),
                "date": activity_data.get("date")
            })

    # sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)

    # return top 10
    return results[:10]




