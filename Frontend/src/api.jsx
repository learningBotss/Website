import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL + "/api",
});

//baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`
//baseURL: "http://localhost:8000/api"

export const getQualificationQuiz = () => api.get("/qualification");
export const postQualificationResult = (answers) => api.post("/qualification", { answers });

export const getDisabilityQuestions = (name) => api.get(`/quiz/${name}`);
export const postDisabilityResult = (name, answers) => api.post(`/quiz/${name}`, { answers });

export const getDisability = (type) => api.get(`/disability/${type}`);

export const getLatihan = (disability) => api.get(`/latihan/${disability}`);

export default api;