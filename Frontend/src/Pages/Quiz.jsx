import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDisabilityQuiz, submitDisabilityQuiz } from "../api";

export default function DisabilityQuiz() {
  const { name } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true); // pastikan setiap nama quiz baru loading
    getDisabilityQuiz(name)
      .then(res => {
        setQuestions(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-64 h-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!questions.length) {
    return <p className="text-center mt-10">No questions available</p>;
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (ans) => {
    const newAnswers = [...answers, { id: current.id, answer: ans }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitDisabilityQuiz(name, newAnswers)
        .then(res => navigate(`/result/${res.data.probability}`))
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md transition-all">
        <h2 className="text-2xl font-bold mb-4">{current.question}</h2>
        <div className="flex gap-4">
          {["Yes", "No"].map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`flex-1 py-2 rounded-lg ${
                opt === "Yes"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white transition`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="h-2 bg-gray-300 rounded mt-4">
          <div
            className="h-2 bg-yellow-500 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {currentIndex + 1} / {questions.length}
        </p>
      </div>
    </div>
  );
}
