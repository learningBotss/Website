import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import QuizQuestion from "../components/QuizQuestion.jsx";
import { getSecondScreening, saveQuizResult, getLatestQuizResult } from "../api.jsx";
import { ArrowLeft, ArrowRight, ShieldAlert, XCircle } from "lucide-react";
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

  // ===================== INIT =====================
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const resQuestions = await getSecondScreening();
        const fetchedQuestions = Object.entries(resQuestions.data.questions || {}).flatMap(
          ([type, qs]) =>
            qs.map(q => ({
              ...q,
              disability: type,
              options: q.options.filter(o => o.label !== "Never")
            }))
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
        } else if (latestRes?.data?.answers?.length) {
          const latestData = latestRes.data;

          // ========================== NEW: HANDLE PASSED_MAP ==========================
          if (latestData.passed_map) {
            // Dominant = mana-mana passed
            const dominantFromMap = Object.entries(latestData.passed_map)
              .filter(([_, isPassed]) => isPassed)
              .map(([dis, _]) => ({
                disability: dis,
                percentage: Math.round(latestData.percentage[dis] ?? 0)
              }));

            // Kalau tiada yang lulus, pilih percentage tertinggi (tie handling)
            let finalDominant = dominantFromMap;
            if (finalDominant.length === 0) {
              const maxPct = Math.max(...Object.values(latestData.percentage).map(p => Math.round(p)));
              finalDominant = Object.entries(latestData.percentage)
                .filter(([_, pct]) => Math.round(pct) === maxPct)
                .map(([dis, pct]) => ({ disability: dis, percentage: Math.round(pct) }));
            }

            setDominantDisabilities(finalDominant);
            setPassed(finalDominant.length > 0);
          } else {
            // fallback: guna backend percentages + threshold biasa
            const backendPercentages = Object.entries(latestData.percentage).map(([d, pct]) => ({
              disability: d,
              percentage: Math.round(pct)
            }));
            const dominant = backendPercentages.filter(d => d.percentage >= threshold);
            setDominantDisabilities(dominant);
            setPassed(dominant.length > 0);
          }

          // Jawapan & show result
          setAnswers(latestData.answers.map(a => ({ ...a, answer: a.answer })));
          setShowResult(true);
        } else {
          setAnswers(new Array(fetchedQuestions.length).fill(null));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, forceRetake]);


  // ===================== HANDLE SELECTION =====================
  const handleSelect = (value) => {
    const copy = [...answers];
    copy[currentQuestionIndex] = {
      id: allQuestions[currentQuestionIndex].id,
      answer: value, // will convert to score on submit
      disability: allQuestions[currentQuestionIndex].disability,
      quiz_type: allQuestions[currentQuestionIndex].disability,
    };
    setAnswers(copy);
  };

  // ===================== HANDLE SUBMIT =====================
  const handleSubmit = async () => {
    if (answers.some(a => a === null)) {
      alert("Please answer all questions");
      return;
    }

    // Convert value → score for backend
    const payloadAnswers = answers.map((a, i) => {
      const q = allQuestions[i];
      const opt = q.options.find(o => o.value === a.answer || o.score === a.answer);
      const score = opt?.score ?? 0;
      return {
        id: a.id,
        answer: score,
        disability: a.disability,
        quiz_type: a.quiz_type,
        type: a.disability,
      };
    });

    // Calculate percentages and update state
    const { percentages, passedAny, dominant } = calculatePercentages(allQuestions, payloadAnswers);
    setDominantDisabilities(dominant);
    setPassed(passedAny);
    setShowResult(true);

    if (user) {
      await saveQuizResult(user.id, "Second Qualification", payloadAnswers);
    }
  };

  // ===================== HELPER: CALCULATE PERCENTAGES =====================
  const calculatePercentages = (questions, answerList) => {
    const scoreMap = {};
    const maxMap = {};

    answerList.forEach(a => {
      const q = questions.find(q => q.id === a.id && q.disability === a.disability);
      if (!q) return;

      const score = a.answer;
      const maxScore = Math.max(...q.options.map(o => o.score));

      scoreMap[a.disability] = (scoreMap[a.disability] || 0) + score;
      maxMap[a.disability] = (maxMap[a.disability] || 0) + maxScore;
    });

    const percentages = Object.keys(scoreMap).map(d => ({
      disability: d,
      percentage: Math.round((scoreMap[d] / maxMap[d]) * 100),
    }));

    // Dominant = yang lulus threshold
    let dominant = percentages.filter(p => p.percentage >= threshold);

    // Kalau tiada satu pun lulus threshold, pilih satu dengan percentage tertinggi
    if (dominant.length === 0 && percentages.length > 0) {
      const maxPct = Math.max(...percentages.map(p => p.percentage));
      // Pilih semua yg sama percentange kalau tie
      dominant = percentages.filter(p => p.percentage === maxPct); 
    }

    const passedAny = dominant.length > 0;

    return { percentages, passedAny, dominant };
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // ===================== RESULT SCREEN =====================
  if (showResult) {
  const displayDisabilities = dominantDisabilities;

    return (
      <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center">
        <div className="w-full max-w-lg">
          <Card className={`shadow-lg ${passed ? "border-destructive/50" : "border-success/50"}`}>
            <CardContent className="pt-8 text-center">
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                passed ? "bg-destructive/50" : "bg-success/10"
              }`}>
                {passed ? <ShieldAlert  className="h-10 w-10 text-destructive"/> : <XCircle className="h-10 w-10 text-success"/>}
              </div>

              <h2 className="mb-4 text-2xl font-bold">
                {passed ? "Assessment Completed" : "Assessment Result"}
              </h2>

              {displayDisabilities.length > 0 ? (
                <div className="mb-6 rounded-xl bg-muted p-4 space-y-6">
                  {displayDisabilities.map(d => (
                    <div key={d.disability} className="p-4 rounded-xl bg-white border-l-4 border-destructive/50 shadow-md">
                      <p className="font-semibold text-lg mb-2">Result</p>
                      <p className="mb-2">
                        Based on your responses, you may have <span className="capitalize font-bold">{d.disability}</span>.
                      </p>
                      <div className="w-full h-5 rounded-full bg-gray-200">
                        <div className="h-5 rounded-full bg-destructive/50 shadow-lg transition-all duration-1000" style={{width: `${d.percentage}%`}}/>
                      </div>
                      <p className="text-sm mt-1 font-semibold text-destructive">{d.percentage}%</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-6 rounded-xl bg-yellow-50 p-4">
                  <p className="text-yellow-800 font-semibold mb-2">😊 No Significant Learning Difficulties Detected</p>
                  <p className="text-sm text-yellow-800">
                    Based on your responses, there are no strong indicators of dyslexia, dysgraphia, or dyscalculia at this time. This screening is not a diagnosis. If you experience learning challenges in the future, you may retake the test or consult an educational professional.
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
            <CardTitle>Second Assessment</CardTitle>
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
                  Submit <ShieldAlert className="ml-2 h-4 w-4"/>
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
