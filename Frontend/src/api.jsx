import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", 
});

export const getQualificationQuiz = () => api.get("/qualification");
export const postQualificationResult = (answers) => api.post("/qualification", { answers });
export const getDisabilityQuiz = (name) => api.get(`/${name}`);
export const submitDisabilityQuiz = (name, answers) => api.post(`/${name}`, { answers });

export default api;