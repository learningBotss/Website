import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:8000/api",
  baseURL: "https://website-production-5f9b.up.railway.app/api",
});

//baseURL: "https://website-production-5f9b.up.railway.app/api" - Production
//baseURL: "http://localhost:8000/api" - Localhost Kat Visual Studio Code

// ===== Users / Auth =====
export const getUsers = () => api.get("/users"); // return users.json
export const loginUser = (email, password) => api.post("/login", { email, password });
export const registerUser = (email, password, fullName) =>
  api.post("/register", { email, password, full_name: fullName });

export const getAllUsers = async () => {
  const res = await api.get("/allusers");
  return res.data;
};


// ===== First Qualification =====
export const getQualificationQuiz = () => api.get("/qualification");

// ===== Second Qualification =====
export const getSecondScreening = () => api.get("/second-screening");

// ===== Disability Questions =====
export const getDisabilityQuestions = (name) => api.get(`/quiz/${name}`);


// ===== Quiz Results =====
export const saveQuizResult = (userId, type, answers) =>
  api.post("/quiz_result", {
    user_id: userId,
    type,
    answers,
  });

export const getLatestQuizResult = (userId, type) =>
  api.get(`/quiz_result/latest?user_id=${userId}&type=${type}`);



// ===== Admin: Questions Management =====
export const getAllQuestions = async () => {const res = await api.get("/Allquestions"); return res.data};
export const createQuestion = async (data) => (await api.post("/createQuestions", data)).data;
// updateQuestion: hantar id + quiz_type
export const updateQuestion = async (id, quiz_type, data) =>
  (await api.post(`/updateQuestions/${id}`, { ...data, quiz_type })).data;
// deleteQuestion: hantar id + quiz_type sebagai query param
export const deleteQuestion = async (id, quiz_type) =>
  (await api.delete(`/deleteQuestions/${quiz_type}/${id}`)).data;

//Second Qualification Options 
export const saveSecondScreeningConfig = async (payload) => {
  const res = await api.post("/second-screening", payload);
  return res.data;
};


//Results
export const getAllResults = async () => {
  const res = await api.get("/allresults");
  return res.data;
};
export const getPastResults = (userId) =>
  api.get(`/quiz_result/history/${userId}`);


// ===== Chatbot =====
export const sendChatMessage = async ({ messages, disabilityType }) => {
  try {
    const lastMessage = messages[messages.length - 1];
    const res = await api.post("/chat/send", { messages, disabilityType });

    return res.data; 
  } catch (err) {
    console.error(err);
    return { content: "Error: Unable to get response." };
  }
};

// ===== Disability Info =====
export const getDisability = (type) => api.get(`/disability/${type}`);

// ===== Game Results =====
export const saveGameResult = async ({ userId, disabilityType, activityType, score, attempts = null, data = null }) => {
  try {
    const res = await api.post("/save-progress", {
      user_id: userId,
      disability_type: disabilityType,
      activity_type: activityType,
      score,
      attempts,
      completed: true,
      data,
      date: new Date().toISOString() 
    });
    return res.data;
  } catch (err) {
    console.error("Failed to save game result:", err);
    return { error: "Unable to save game result" };
  }
};


export const getUserGameResults = async (userId, disabilityType) => {
  const res = await api.get(`/game-results/${userId}/${disabilityType}`);
  return res.data;
};

export const getLeaderboard = async (disabilityType, activityType) => {
  const res = await api.get(`/leaderboard/${disabilityType}/${activityType}`);
  return res.data;
};


export default api;