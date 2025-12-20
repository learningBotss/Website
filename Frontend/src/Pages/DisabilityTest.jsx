import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { ResultDisplay } from "@/components/ResultDisplay";
import { getDisabilityQuestions } from "@/api";
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, PenTool, Calculator } from "lucide-react";

const icons = {
  dyslexia: BookOpen,
  dysgraphia: PenTool,
  dyscalculia: Calculator,
};

const titles = {
  dyslexia: "Dyslexia Assessment",
  dysgraphia: "Dysgraphia Assessment",
  dyscalculia: "Dyscalculia Assessment",
};

const colors = {
  dyslexia: "text-dyslexia",
  dysgraphia: "text-dysgraphia",
  dyscalculia: "text-dyscalculia",
};

const DisabilityTest = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!type || !["dyslexia", "dysgraphia", "dyscalculia"].includes(type)) {
      navigate("/disability/:type");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await getDisabilityQuestions(type);

        if (res && res.data && Array.isArray(res.data)) {
          setQuestions(res.data); // <-- use res.data directly
          setAnswers(new Array(res.data.length).fill(null)); // <-- initialize answers
        } else {
          console.warn("No questions found for this type:", type, res);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      }
    };



    fetchQuestions();
  }, [type, navigate]);

  if (!type || !questions || questions.length === 0) {
    return <p className="text-center mt-8">Loading questions...</p>;
  }


  const Icon = icons[type];
  const title = titles[type];
  const color = colors[type];

  const handleSelect = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmit = async () => {
    const validAnswers = answers.filter(a => a !== null);
    const totalScore = validAnswers.reduce((sum, val) => sum + val, 0);
    
    let calculatedResult = "low";
    if (totalScore / (questions.length * 4) > 0.7) calculatedResult = "high";
    else if (totalScore / (questions.length * 4) > 0.4) calculatedResult = "moderate";

    setResult(calculatedResult);
    setShowResult(true);

    
    // Optional: save locally too
    localStorage.setItem(`${type}Score`, totalScore.toString());
    localStorage.setItem(`${type}Result`, calculatedResult);
  };

  const allAnswered = answers.every(a => a !== null);
  const maxScore = questions.length * 4;
  const totalScore = answers.filter(a => a !== null).reduce((sum, val) => sum + val, 0);

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className={`text-3xl font-bold ${color}`}>{title} Results</h1>
          </div>
          <ResultDisplay result={result} disabilityType={type} score={totalScore} maxScore={maxScore} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card shadow-md ${color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <h1 className={`text-2xl font-bold ${color} md:text-3xl`}>{title}</h1>
          <p className="mt-2 text-muted-foreground">Answer each question based on your observations</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className={`h-5 w-5 ${color}`} />
              Screening Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuizQuestion
              question={questions[currentQuestion]}
              selectedAnswer={answers[currentQuestion]}
              onSelect={handleSelect}
              questionNumber={currentQuestion + 1}
              totalQuestions={questions.length}
            />

            <div className="mt-8 flex justify-between gap-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button variant="hero" onClick={handleSubmit} disabled={!allAnswered}>
                  View Results <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button variant="default" onClick={handleNext} disabled={answers[currentQuestion] === null}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate(`/disability/${type}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisabilityTest;
