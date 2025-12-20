import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", 
});

export const getQualificationQuiz = () => api.get("/qualification");
export const postQualificationResult = async (answers) => {
  return fetch("http://localhost:8000/api/qualification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers }), 
  }).then((res) => res.json());
};

export const getDisabilityQuestions = (name) => api.get(`/quiz/${name}`);
export const postDisabilityResult = (name, answers) => api.post(`/quiz/${name}`, { answers });

export const getDisability = (type) => api.get(`/disability/${type}`);

export const getLatihan = (disability) => api.get(`/latihan/${disability}`);

export default api;