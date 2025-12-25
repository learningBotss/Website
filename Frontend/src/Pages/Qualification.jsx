import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { getQualificationQuiz, getLatestQuizResult, saveQuizResult } from "../api";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy, RotateCcw, FastForward, Brain, Sparkles, Heart, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function QualifyQuiz() {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  const [showPreviousPrompt, setShowPreviousPrompt] = useState(false);

  // Fetch quiz & previous result when user exists
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
      if (!user) return; // only fetch previous result if logged in
      try {
        const res = await getLatestQuizResult(user.id, "qualification");
        if (res.data) {
          setPreviousResult({
            score: res.data.percentage,
            passed: res.data.passed,
          });
          setShowPreviousPrompt(true);
        }
      } catch (err) {
        console.error("Failed to fetch previous result:", err);
      }
    };

    fetchQuiz();
    fetchPrevious();
  }, [user]);


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
    if (answers.some((a) => a === null)) {
      alert("Please answer all questions!");
      return;
    }

    const totalScore = answers.reduce((sum, a) => sum + (a?.answer || 0), 0);
    const maxScore = questions.length * 4;
    const percentage = Math.round((totalScore / maxScore) * 100);
    const passed = percentage >= 60; // local pass/fail logic

    setPassed(passed);
    setShowResult(true);

    // Save locally
    localStorage.setItem("qualifyPassed", passed);
    localStorage.setItem("qualifyScore", percentage);

    // Only save to backend if user exists
    if (user) {
      try {
        await saveQuizResult(user.id, "qualification", answers);
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

const handleSkip = () => {
  navigate("/select"); // or any other page you want
};


  const allAnswered = answers.every((a) => a !== null);
  const totalScore = answers.reduce((sum, a) => sum + (a?.answer || 0), 0);
  const maxScore = questions.length * 4;
  const percentage = Math.round((totalScore / maxScore) * 100);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!questions.length) return <p className="text-center mt-10">No questions available</p>;

  // Show previous attempt
  if (showPreviousPrompt && previousResult) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8">
        {/* Header */}
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {user ? (
            <>
              {userRole === "admin" && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <Shield className="mr-2 h-4 w-4" /> Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => {signOut();navigate("/"); }}>Sign Out</Button>
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
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                  previousResult.passed ? "bg-success/10" : "bg-warning/10"
                }`}
              >
                {previousResult.passed ? (
                  <Trophy className="h-10 w-10 text-success" />
                ) : (
                  <RotateCcw className="h-10 w-10 text-warning" />
                )}
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">You've taken this quiz before!</h2>
              <p className="mb-6 text-muted-foreground">
                {previousResult.passed ? (
                  <>
                    You passed the qualification. Skip or retake?
                  </>
                ) : ( 
                  <>
                    😊 <b>No Significant Learning Difficulties Detected</b>
                    <br /><br />
                    Based on your responses, there are no strong indicators of dyslexia,
                    dysgraphia, or dyscalculia at this time.
                    This screening is not a diagnosis. If you experience learning challenges
                    in the future, you may retake the test or consult an educational
                    professional.
                  </>
                )}
              </p>
              <div className="mb-6 rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Previous Score</p>
                <p className="text-3xl font-bold text-foreground">{previousResult.score}%</p>
                <p className={`text-sm ${previousResult.passed ? "text-success" : "text-warning"}`}>
                  {previousResult.passed ? "Passed" : "Not Passed"}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={() => navigate("/select")}>
                  <FastForward className="mr-2 h-4 w-4" />
                  Skip Quiz
                </Button>

                <Button variant="hero" onClick={handleRetry}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show result after submit
  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8">
        <div className="mx-auto max-w-lg">
          <Card className={`shadow-lg ${passed ? "border-success/50" : "border-destructive/50"}`}>
            <CardContent className="pt-8 text-center">
              <div
                className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                  passed ? "bg-success/10" : "bg-destructive/10"
                }`}
              >
                {passed ? <Trophy className="h-10 w-10 text-success" /> : <XCircle className="h-10 w-10 text-destructive" />}
              </div>
              <h2 className="mb-2 text-2xl font-bold text-foreground">{passed ? "Congratulations!" : "Not Qualified Yet"}</h2>
              <p className="mb-6 text-muted-foreground">
                {passed ? (
                  <>
                    <p className="mb-6 text-muted-foreground">
                      You have passed the qualification assessment. You can now access disability tests.
                    </p>
                  </>
                ) : ( 
                  <>
                    <p className="mb-6 text-muted-foreground">
                      😊 <b>No Significant Learning Difficulties Detected</b>
                      <br />
                      Based on your responses, there are no strong indicators of
                      dyslexia, dysgraphia, or dyscalculia at this time.
                      <br />
                      This screening is not a diagnosis.
                    </p>
                  </>
                )}
              </p>
              <div className="mb-6 rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-3xl font-bold text-foreground">{percentage}%</p>
                <p className="text-sm text-muted-foreground">{totalScore} / {maxScore} points</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                {passed ? (
                  <Button variant="hero" onClick={() => navigate("/select")}>
                    Continue to Tests
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleRetry}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                    <Button variant="default" onClick={() => navigate("/select")}>
                      View Resources Anyway
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render current question
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Qualification Assessment</h1>
          <p className="mt-2 text-muted-foreground">Answer these questions to help us understand your learning needs</p>
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
                <Button variant="default" onClick={handleNext} disabled={!answers[currentQuestion]}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
