import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { getSecondScreening, saveQuizResult, getLatestQuizResult } from "../api.jsx";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SecondScreening() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const forceRetake = location.state?.forceRetake === true; 

  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(60);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [dominantDisabilities, setDominantDisabilities] = useState([]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const resQuestions = await getSecondScreening();
        const fetchedQuestions = Object.entries(resQuestions.data.questions || {}).flatMap(
          ([type, qs]) => qs.map(q => ({ ...q, disability: type }))
        );
        setAllQuestions(fetchedQuestions);

        if (!user) return;

        const latestRes = await getLatestQuizResult(user.id, "Second Qualification");

        if (forceRetake) {
            setAnswers(new Array(fetchedQuestions.length).fill(null));
            setCurrentQuestionIndex(0);
            setShowResult(false);
            setPassed(false);
            setDominantDisabilities([]);
        } else if (latestRes?.data) {
            const fetchedAnswers = latestRes.data.answers || [];
            setAnswers(fetchedAnswers);

            const scoreMap = {};
            const maxMap = {};
            fetchedQuestions.forEach((q, i) => {
              const ans = fetchedAnswers[i];
              const opt = q.options?.find(o => o.value === ans?.answer);
              const score = opt?.score || 0;
              const weight = q.weight || 1;
              scoreMap[q.disability] = (scoreMap[q.disability] || 0) + score;
              maxMap[q.disability] = (maxMap[q.disability] || 0) + weight;
            });

            const displayDisabilities = Object.keys(scoreMap).map(d => ({
              disability: d,
              percentage: Math.round((scoreMap[d] / maxMap[d]) * 100),
            }));

            const passedAny = displayDisabilities.some(d => d.percentage >= threshold);
            setDominantDisabilities(displayDisabilities.filter(d => d.percentage >= threshold));
            setPassed(passedAny);
            setShowResult(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, forceRetake]);

  const handleSelect = (value) => {
    const copy = [...answers];
    copy[currentQuestionIndex] = {
      id: allQuestions[currentQuestionIndex].id,
      answer: value,
      disability: allQuestions[currentQuestionIndex].disability,
      quiz_type: allQuestions[currentQuestionIndex].disability,
    };
    setAnswers(copy);
  };

 const handleSubmit = async () => {
  if (answers.some(a => a === null)) {
    alert("Please answer all questions");
    return;
  }

  // Map answers to include score for backend
  const payloadAnswers = answers.map((a, i) => {
    const q = allQuestions[i];
    const opt = q.options.find(o => o.score === a.answer);
    const score = opt?.score ?? 0;

    return {
      id: a.id,
      answer: score,      
      disability: a.disability,
      quiz_type: a.quiz_type,
      type: a.disability,
    };
  });

  // Calculate scores safely
  const scoreMap = {};
  const maxMap = {};

  payloadAnswers.forEach(a => {
    const q = allQuestions.find(q => q.id === a.id && q.disability === a.disability);
    if (!q) return;

    const maxScore = Math.max(...q.options.map(o => o.score));

    scoreMap[a.disability] = (scoreMap[a.disability] || 0) + a.answer;
    maxMap[a.disability] = (maxMap[a.disability] || 0) + maxScore;
  });

  const percentages = Object.keys(scoreMap).map(d => ({
    disability: d,
    percentage: Math.round((scoreMap[d] / maxMap[d]) * 100),
  }));

  const passedAny = percentages.some(p => p.percentage >= threshold);
  setPassed(passedAny);
  setDominantDisabilities(percentages.filter(p => p.percentage >= threshold).map(h => h.disability)); 

  setShowResult(true);

  if (user) {
    await saveQuizResult(user.id, "Second Qualification", payloadAnswers);
  }
};



  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // ===================== RESULT SCREEN =====================
  if (showResult) {
  const percentages = allQuestions.reduce((acc, q, i) => {
    const ans = answers[i];
    if (!ans) return acc;
    const score = ans.answer;      // already score
    const weight = q.weight || 1;

    if (!acc[q.disability]) acc[q.disability] = { score: 0, max: 0 };
    acc[q.disability].score += score;
    acc[q.disability].max += weight;
    return acc;
  }, {});

  // local variables only
  const displayDisabilities = Object.entries(percentages)
    .map(([d, {score, max}]) => ({
      disability: d,
      percentage: Math.round((score / max) * 100),
    }))
    .filter(d => d.percentage >= threshold);

  const passedAny = displayDisabilities.length > 0;


    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center">
        <div className="w-full max-w-lg">
          <Card className={`shadow-lg ${passed ? "border-success/50" : "border-destructive/50"}`}>
            <CardContent className="pt-8 text-center">
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                passed ? "bg-success/10" : "bg-destructive/10"
              }`}>
                {passed ? <CheckCircle  className="h-10 w-10 text-success"/> : <XCircle className="h-10 w-10 text-destructive"/>}
              </div>

              <h2 className="mb-4 text-2xl font-bold">
                {passed ? "Assessment Completed" : "Assessment Result"}
              </h2>

              {displayDisabilities.length > 0 && (
                <div className="mb-6 rounded-xl bg-muted p-4 space-y-6">
                  {displayDisabilities.map(d => (
                    <div key={d.disability} className="p-4 rounded-xl bg-green-50 border-l-4 border-success shadow-md">
                      <p className="font-semibold text-lg mb-2">Result</p>
                      <p className="mb-2">
                        Based on your responses, you may have <span className="capitalize font-bold">{d.disability}</span>.
                      </p>
                      <div className="w-full h-5 rounded-full bg-gray-200">
                        <div className="h-5 rounded-full bg-success shadow-lg transition-all duration-1000" style={{width: `${d.percentage}%`}}/>
                      </div>
                      <p className="text-sm mt-1 font-semibold text-success">{d.percentage}%</p>
                    </div>
                  ))}
                </div>
              )}

              {displayDisabilities.length === 0 && (
                <div className="mb-6 rounded-xl bg-yellow-50 p-4">
                  <p className="text-yellow-800 font-semibold mb-2">Keep Going!</p>
                  <p className="text-sm text-yellow-800">
                    No dominant indicators detected above 60%. Consider reviewing the earlier sections or retaking the assessment to gain more insight.
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 flex-wrap">
                {passed && (
                  <Button variant="hero" onClick={() => navigate("/select")}>
                    Continue
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    // Clear state and force retake
                    setAnswers([]);
                    setCurrentQuestionIndex(0);
                    setShowResult(false);
                    setPassed(false);
                    setDominantDisabilities([]);
                    navigate("/second-screening", { state: { forceRetake: true }, replace: true });
                  }}
                >
                  Retake Assessment
                </Button>
              </div>


            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Start
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== QUESTION UI =====================
  const q = allQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Second Qualification Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizQuestion
              question={q}
              selectedAnswer={answers[currentQuestionIndex]?.answer}
              onSelect={handleSelect}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={allQuestions.length}
            />

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setCurrentQuestionIndex(i => i - 1)} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Previous
              </Button>

              {currentQuestionIndex === allQuestions.length - 1 ? (
                <Button variant="hero" onClick={handleSubmit}>
                  Submit <CheckCircle className="ml-2 h-4 w-4"/>
                </Button>
              ) : (
                <Button onClick={() => setCurrentQuestionIndex(i => i + 1)} disabled={!answers[currentQuestionIndex]}>
                  Next <ArrowRight className="ml-2 h-4 w-4"/>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Back to Start
          </Button>
        </div>
      </div>
    </div>
  );
}
