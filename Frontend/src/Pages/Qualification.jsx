import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQualificationQuiz, postQualificationResult } from "../api";

export default function Qualification() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await getQualificationQuiz();
        setQuestions(response.data);
      } catch (error) {
        console.error("Gagal ambil data:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchQuiz();
  }, []);

  const handleAnswer = (id, ans) => {
    const existing = answers.find(a => a.id === id);
    if (existing) existing.answer = ans;
    else answers.push({ id, answer: ans });
    setAnswers([...answers]);
  };

  const handleSubmit = () => {
    if (answers.length !== questions.length) {
      alert("Please answer all questions!");
      return;
    }

    postQualificationResult(answers)
      .then(res => {
        if (res.data.probability === "High") navigate("/select");
        else navigate("/not-qualified");
      })
      .catch(err => console.error(err));
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!questions.length) return <p className="text-center mt-10">No questions available</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-purple-100 p-6 gap-6">
      <h2 className="text-3xl font-bold mb-4">Qualification Quiz</h2>
      {questions.map(q => (
        <div key={q.id} className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h3 className="mb-2 font-medium">{q.question}</h3>
          <div className="flex gap-4">
            {["Yes", "No"].map(opt => (
              <button
                key={opt}
                className={`flex-1 py-2 rounded-lg ${answers.find(a => a.id === q.id && a.answer === opt) ? (opt === "Yes" ? "bg-green-500 text-white" : "bg-red-500 text-white") : "bg-gray-200"}`}
                onClick={() => handleAnswer(q.id, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Submit</button>
    </div>
  );
}
