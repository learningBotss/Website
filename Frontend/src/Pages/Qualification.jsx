import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { getQualificationQuiz, postQualificationResult } from "../api"; // API kau

import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function QualifyQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch qualification quiz from backend
    const fetchQuiz = async () => {
      try {
        const res = await getQualificationQuiz();
        setQuestions(res.data);
      } catch (err) {
        console.error("Gagal ambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, []);

  const handleSelect = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = { id: questions[currentQuestion].id, answer: value };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmit = async () => {
  if (answers.length !== questions.length) {
    alert("Please answer all questions!");
    return;
  }

  try {
    // postQualificationResult mungkin return res.data terus
    const res = await postQualificationResult(answers);
    // pastikan ambil object actual
    const data = res?.data ?? res;

    if (!data || !("percentage" in data)) {
      console.error("Response dari server tak valid:", res);
      alert("Server error, please try again.");
      return;
    }

    const { probability, percentage } = data;

    // Save locally
    localStorage.setItem("qualifyPassed", percentage >= 80 ? "true" : "false");

    // Check score >= 80
    if (percentage >= 60) navigate("/select"); // Lulus
    else navigate("/not-qualified"); // Tidak lulus
  } catch (err) {
    console.error("Error submit:", err);
    alert("Failed to submit quiz. Please try again.");
  }
};



  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!questions.length) return <p className="text-center mt-10">No questions available</p>;

  const question = questions[currentQuestion];
  const allAnswered = answers.length === questions.length && answers.every(a => a.answer);

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Qualification Assessment</h1>
          <p className="mt-2 text-muted-foreground">
            Answer these questions to help us understand your learning needs
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Assessment Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuizQuestion
              question={question}
              selectedAnswer={answers[currentQuestion]?.answer || null}
              onSelect={handleSelect}
              questionNumber={currentQuestion + 1}
              totalQuestions={questions.length}
            />

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button variant="hero" onClick={handleSubmit} disabled={!allAnswered}>
                  Submit Assessment
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleNext}
                  disabled={!answers[currentQuestion]?.answer}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Back to start */}
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Start
          </Button>
        </div>
      </div>
    </div>
  );
}
