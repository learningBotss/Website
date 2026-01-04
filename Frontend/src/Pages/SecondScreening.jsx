import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { getSecondScreening, saveQuizResult, getLatestQuizResult } from "../api.jsx";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SecondScreening() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const forceRetake = location.state?.forceRetake === true; 

  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(50);
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
        // Ambik soalan
        const resQuestions = await getSecondScreening();
        const fetchedQuestions = Object.entries(resQuestions.data.questions || {}).flatMap(
          ([type, qs]) => qs.map(q => ({ ...q, disability: type }))
        );
        setAllQuestions(fetchedQuestions);

        if (!user) return;

        const latestRes = await getLatestQuizResult(user.id, "Second Qualification");

        if (forceRetake) {
            // reset jawapan supaya boleh mula baru
            setAnswers(new Array(fetchedQuestions.length).fill(null));
            setCurrentQuestionIndex(0);
            setShowResult(false);
            setPassed(false);
            setDominantDisabilities([]);
          } else if (latestRes?.data) {
            // kalau tak forceRetake → terus show result lama
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

            setDominantDisabilities(displayDisabilities);
            setPassed(displayDisabilities.some(d => d.percentage >= threshold));
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
    };
    setAnswers(copy);
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === null)) {
      alert("Please answer all questions");
      return;
    }

    const scoreMap = {};
    const maxMap = {};

    answers.forEach((a, i) => {
      const q = allQuestions[i];
      if (!q) return;
      const opt = q.options?.find(o => o.value === a.answer);
      const score = opt?.score || 0;
      const weight = q.weight || 1;
      scoreMap[q.disability] = (scoreMap[q.disability] || 0) + score;
      maxMap[q.disability] = (maxMap[q.disability] || 0) + weight;
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
      await saveQuizResult(user.id, "Second Qualification", answers);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // ===================== RESULT SCREEN =====================
  if (showResult) {
    const percentages = allQuestions
      .reduce((acc, q, i) => {
        const ans = answers[i];
        if (!ans) return acc;
        const opt = q.options?.find(o => o.value === ans.answer);
        const score = opt?.score || 0;
        const weight = q.weight || 1;
        if (!acc[q.disability]) acc[q.disability] = { score: 0, max: 0 };
        acc[q.disability].score += score;
        acc[q.disability].max += weight;
        return acc;
      }, {});

    const displayDisabilities = Object.entries(percentages).map(([d, {score, max}]) => ({
      disability: d,
      percentage: Math.round((score / max) * 100),
    }));

    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center">
        <div className="w-full max-w-lg">
          <Card className={`shadow-lg ${passed ? "border-success/50" : "border-destructive/50"}`}>
            <CardContent className="pt-8 text-center">
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                passed ? "bg-success/10" : "bg-destructive/10"
              }`}>
                {passed ? <Trophy className="h-10 w-10 text-success"/> : <XCircle className="h-10 w-10 text-destructive"/>}
              </div>

              <h2 className="mb-4 text-2xl font-bold">
                {passed ? "Second Qualification Passed" : "Second Qualification Failed"}
              </h2>

              {passed && displayDisabilities.length > 0 && (
                <div className="mb-6 rounded-xl bg-muted p-4 space-y-6">
                  {(() => {
                    const sorted = [...displayDisabilities]
                      .filter(d => d.percentage >= threshold)
                      .sort((a,b) => b.percentage - a.percentage);
                    const highest = sorted[0];
                    const others = sorted.slice(1);

                    return (
                      <>
                        <div className="p-4 rounded-xl bg-green-50 border-l-4 border-success shadow-md">
                          <p className="font-semibold text-lg mb-2">🔥 Main Indicator</p>
                          <p className="mb-2">Based on your answers, you show strong indication of <span className="capitalize font-bold">{highest.disability}</span>.</p>
                          <div className="w-full h-5 rounded-full bg-gray-200">
                            <div className="h-5 rounded-full bg-success shadow-lg transition-all duration-1000" style={{width: `${highest.percentage}%`}}/>
                          </div>
                          <p className="text-sm mt-1 font-semibold text-success">{highest.percentage}%</p>
                        </div>

                        {others.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <p className="font-semibold">Other indicators:</p>
                            {others.map(d => (
                              <div key={d.disability} className="flex flex-col">
                                <div className="flex justify-between mb-1">
                                  <span className="capitalize font-medium">{d.disability}</span>
                                  <span className="font-semibold text-blue-600">{d.percentage}%</span>
                                </div>
                                <div className="w-full h-4 rounded-full bg-gray-200">
                                  <div className="h-4 rounded-full bg-blue-500 shadow transition-all duration-1000" style={{width: `${d.percentage}%`}}/>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {!passed && (
                <div className="mb-6 rounded-xl bg-red-50 p-4">
                  <p className="text-destructive font-semibold mb-2">You did not pass the second qualification.</p>
                  <p className="text-sm text-destructive">You can retake from the first or second qualification again to improve your result.</p>
                </div>
              )}

              <div className="flex justify-center gap-4 flex-wrap">
                <Button variant={passed ? "hero" : "destructive"} onClick={() => navigate(passed ? "/select" : "/qualification", {state: {forceRetake: true}})}>
                  {passed ? "Continue" : "Retake First Qualification"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/second-screening", {state: {forceRetake: true}})}>Retake Second Assessment</Button>
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
