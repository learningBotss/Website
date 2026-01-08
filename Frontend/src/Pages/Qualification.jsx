import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { getQualificationQuiz, getLatestQuizResult, saveQuizResult } from "../api";
import { ArrowLeft, ArrowRight, CheckCircle, Trophy, RotateCcw, Shield, LogIn, FastForward } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function QualifyQuiz() {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const forceRetake = location.state?.forceRetake === true;

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  const [showPreviousPrompt, setShowPreviousPrompt] = useState(false);

  useEffect(() => {
  const fetchQuiz = async () => {
    try {
      const res = await getQualificationQuiz();
      const data = res.data ?? res;
      setQuestions(data);
      setAnswers(new Array(data.length).fill(null));
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrevious = async () => {
    if (!user || forceRetake) return; // skip check kalau retake paksa

    try {
      const qualRes = await getLatestQuizResult(user.id, "First Qualification");
      const secondRes = await getLatestQuizResult(user.id, "Second Qualification");

       if (!forceRetake && qualRes.data && secondRes.data) {
        navigate("/second-screening");
        return;
      }

      if (!forceRetake && qualRes.data) {
        setPreviousResult({
          score: qualRes.data.percentage,
          passed: qualRes.data.passed,
        });
        setShowPreviousPrompt(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  fetchQuiz();
  fetchPrevious();
}, [user, forceRetake]);


  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };
  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  // Store value for selection
const handleSelect = (value) => {
  const newAnswers = [...answers];
  const question = questions[currentQuestion];

  
  newAnswers[currentQuestion] = {
    id: question.id,
    type: question.quiz_type,
    answer: Number(value),
  };

  setAnswers(newAnswers);
};

const handleSubmit = async () => {
  if (answers.some((a) => a === null)) {
    alert("Please answer all questions!");
    return;
  }

  // Convert value -> score for submission
  const answersWithScore = answers.map((a, idx) => {
    const question = questions[idx];
    const selectedOption = question.options.find((o) => o.score === a.answer);
    return {
      ...a,
      answer: selectedOption ? selectedOption.score : 0, // send score
    };
  });

  // totalScore and maxScore
  const totalScore = answersWithScore.reduce((sum, a) => sum + a.answer, 0);
  const maxScore = questions.reduce(
    (sum, q) => sum + Math.max(...q.options.map((o) => o.score)),
    0
  );

  const percentage = Math.round((totalScore / maxScore) * 100);
  const passed = percentage >= 60;

  setPassed(passed);
  setShowResult(true);

  localStorage.setItem("qualifyPassed", passed);
  localStorage.setItem("qualifyScore", percentage);

  if (user) {
    try {
      await saveQuizResult(user.id, "First Qualification", answersWithScore); // <-- send SCORE
    } catch (err) {
      console.error("Failed to save quiz result:", err);
    }
  }
};

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
    setPassed(false);
    setShowPreviousPrompt(false);
  };

  const handleSkip = () => navigate("/select");

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!questions.length) return <p className="text-center mt-10">No questions available</p>;

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
              <Button variant="ghost" size="sm" onClick={() => {signOut();navigate("/");}}>
                Log Out
              </Button>
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
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${previousResult.passed ? "bg-success/10" : "bg-warning/10"}`}>
                {previousResult.passed ? <Trophy className="h-10 w-10 text-success" /> : <RotateCcw className="h-10 w-10 text-warning" />}
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">You've taken this quiz before!</h2>
              <p className="mb-6 text-muted-foreground">
                {previousResult.passed ? "You passed the qualification. Please proceed to Second Assessment." : "No Significant Learning Difficulties Detected."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {previousResult.passed && (
                  <Button onClick={() => navigate("/second-screening", { state: { forceRetake: true } })}>
                    <FastForward className="mr-2 h-4 w-4"/> Go to Second Assessment
                  </Button>
                )}

                <Button variant="hero" onClick={handleRetry}><RotateCcw className="mr-2 h-4 w-4"/> Retake Quiz</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card className={`shadow-lg ${passed ? "border-success/50" : "border-destructive/50"}`}>
            <CardContent className="pt-8 text-center">
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${passed ? "bg-success/10" : "bg-destructive/10"}`}>
                {passed ? <Trophy className="h-10 w-10 text-success"/> : <RotateCcw className="h-10 w-10 text-destructive"/>}
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">{passed ? "Passed Part 1!" : "Not Qualified Yet"}</h2>
              <p className="mb-6 text-muted-foreground">
                {passed ? "Please proceed to Second Qualification Assessment." : "No Significant Learning Difficulties Detected."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {passed ? (
                  <Button variant="hero" onClick={() => navigate("/second-screening", { state: { forceRetake: true } })}>Continue to Second Assessment <ArrowRight className="ml-2 h-4 w-4" /></Button>
                ) : (
                  <Button variant="outline" onClick={handleRetry}><RotateCcw className="mr-2 h-4 w-4"/> Try Again</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">First Qualification Assessment</h1>
          <p className="mt-2 text-muted-foreground">Answer these questions to help us understand your learning needs</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-primary"/> Assessment Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizQuestion
              question={question}
              selectedAnswer={answers[currentQuestion]?.answer || null}
              onSelect={handleSelect}
              questionNumber={currentQuestion + 1}
              totalQuestions={questions.length}
            />
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}><ArrowLeft className="mr-2 h-4 w-4"/> Previous</Button>
              {currentQuestion === questions.length - 1 ? (
                <Button variant="hero" onClick={handleSubmit} disabled={!allAnswered}>Submit Assessment <CheckCircle className="ml-2 h-4 w-4"/></Button>
              ) : (
                <Button variant="default" onClick={handleNext} disabled={!answers[currentQuestion]}>Next <ArrowRight className="ml-2 h-4 w-4"/></Button>
              )}
            </div>
          </CardContent>
        </Card>

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
