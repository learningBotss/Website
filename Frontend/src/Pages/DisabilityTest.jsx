import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { ResultDisplay } from "@/components/ResultDisplay";
import { ArrowLeft, CheckCircle, BookOpen, PenTool, Calculator, FastForward, RotateCcw, ArrowRight, LogIn, Shield } from "lucide-react";
import { getDisabilityQuestions, saveQuizResult, getLatestQuizResult } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const [previousResult, setPreviousResult] = useState(null);
  const [showPreviousPrompt, setShowPreviousPrompt] = useState(false);

  /* ===== Check Login ===== */
  useEffect(() => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "You have to log in first",
        description: "Redirecting you to Select Disability page",
      });
      navigate("/select");
      return;
    }
  }, [user, navigate, toast]);

  /* ===== Fetch Questions & Previous Result ===== */
  useEffect(() => {
    if (!type || !["dyslexia", "dysgraphia", "dyscalculia"].includes(type)) {
      navigate("/");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await getDisabilityQuestions(type);
        if (Array.isArray(res.data)) {
          setQuestions(res.data);
          setAnswers(new Array(res.data.length).fill(null));
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      }
    };

    fetchQuestions();

    // Fetch previous quiz result
    if (user?.id) {
      const fetchPrevious = async () => {
        try {
          const latestRes = await getLatestQuizResult(user.id, type);
          const latest = latestRes?.data;
          if (latest) {
            const percentage = Number(latest.percentage) || 0;
            const resultLevel =
              percentage > 70 ? "high" : percentage > 40 ? "moderate" : "low";

            const previous = { ...latest, percentage, result_level: resultLevel };
            setPreviousResult(previous);
            setShowPreviousPrompt(true);
          }
        } catch (err) {
          console.error("Failed to fetch previous result:", err);
        }
      };
      fetchPrevious();
    }
  }, [type, navigate, user]);

  if (!questions.length) return <p className="text-center mt-8">Loading questions...</p>;

  const Icon = icons[type];
  const title = titles[type];
  const color = colors[type];
  const colorScheme = { bg: color, text: color };

  const handleSelect = (score) => {
    const updated = [...answers];
    updated[currentQuestion] = score;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion((q) => q + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  };

 const handleSubmit = async () => {
  let totalScore = 0;
  let maxScore = 0;

  answers.forEach((score, idx) => {
    const question = questions[idx];
    const weight = question.weight || 1;

    totalScore += score;

    const maxOptionScore = Math.max(
      ...question.options.map((o) => o.score)
    );
    maxScore += weight;
  });

  const percentage = (totalScore / maxScore) * 100;

  let calculatedResult = "low";
  if (percentage > 70) calculatedResult = "high";
  else if (percentage > 40) calculatedResult = "moderate";

  setResult(calculatedResult);
  setShowResult(true);

  if (user?.id) {
    const payloadAnswers = questions.map((q, index) => ({
      id: q.id,
      type,
      answer: answers[index], 
    }));

    await saveQuizResult(user.id, type, payloadAnswers);
  }
};


  const allAnswered = answers.every((a) => a !== null);
 const maxScore = questions.reduce((sum, q) => sum + (q.weight || 1), 0);
  const totalScore = answers.reduce((sum, val) => sum + val, 0);

  const handleSkip = (prevResult) => {
    if (!prevResult) return;

    if (prevResult.answers && questions.length) {
      const mappedAnswers = questions.map((q) => {
        const found = prevResult.answers.find((a) => a.id === q.id);
        return found ? Number(found.answer) : 0;
      });
      setAnswers(mappedAnswers);
    }

    setShowPreviousPrompt(false);
    setResult(prevResult.result_level);
    setShowResult(true);
  };

  const handleRetake = () => {
    setShowPreviousPrompt(false);
    setPreviousResult(null);
    setAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResult(false);
    setResult(null);
  };

  if (showPreviousPrompt && previousResult) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8">
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {user ? (
            <>
              {userRole === "admin" && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <Shield className="mr-2 h-4 w-4" /> Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => {signOut();navigate("/");}}>Sign Out</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          )}
        </div>
        <div className="mx-auto max-w-lg pt-20">
          <Card className="shadow-lg">
            <CardContent className="pt-8 text-center">
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${colorScheme.bg}/10`}>
                <Icon className={`h-10 w-10 ${colorScheme.text}`} />
              </div>

              <h2 className="mb-2 text-2xl font-bold text-foreground">
                You've taken this quiz before!
              </h2>

              <p className="mb-6 text-muted-foreground">
                Your previous result was <span className="font-semibold capitalize">{previousResult.result_level}</span>.
                Would you like to skip or retake the assessment?
              </p>

              <div className="mb-6 rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Previous Score</p>
                <p className="text-3xl font-bold text-foreground">{previousResult.percentage.toFixed(1)}/100</p>
                <p className={`text-sm capitalize ${colorScheme.text}`}>{previousResult.result_level} Likelihood</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button variant="outline" onClick={() => navigate(`/disability/${type}/learn`)}>
                  <FastForward className="mr-2 h-4 w-4" />
                  Skip to Learning
                </Button>
                <Button variant={type} onClick={handleRetake}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className={`mb-6 text-center text-3xl font-bold ${color}`}>{title} Results</h1>

          <ResultDisplay
            result={result}
            disabilityType={type}
            score={totalScore}
            maxScore={maxScore}
            resetQuiz={handleRetake} 
          />

          <div className="mt-6 text-center">
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
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
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button variant="hero" onClick={handleSubmit} disabled={!allAnswered}>
                  View Results
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={answers[currentQuestion] === null}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisabilityTest;
