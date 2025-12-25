import { useState, useEffect } from "react";
import { DisabilityCard } from "@/components/DisabilityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Award, History, RotateCcw, Home as HomeIcon, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPastResults } from "@/api"; // <-- make sure this exists

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qualifyPassed = localStorage.getItem("qualifyPassed") === "true";
  const [pastResults, setPastResults] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) fetchPastResults();
  }, [user]);

const getLevel = (percentage) => {
  if (percentage >= 70) return "High";
  if (percentage >= 40) return "Moderate";
  return "Low";
};

const getLevelColor = (percentage) => {
  if (percentage >= 70) return "text-green-700 bg-green-100";
  if (percentage >= 40) return "text-yellow-700 bg-yellow-100";
  return "text-red-700 bg-red-100";
};


  const fetchPastResults = async () => {
    if (!user) return;
    try {
      const response = await getPastResults(user.id);
      const data = response.data; // <- key point
      if (data) setPastResults(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Failed to fetch past results", err);
    }
  };

  const getResultColor = (percentage) => {
    return percentage >= 60
      ? "text-green-600 bg-green-100"
      : "text-red-600 bg-red-100";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const cleanDate = dateString.replace(/\.\d+/, ''); // remove microseconds
    const dateObj = new Date(cleanDate);
    return isNaN(dateObj) ? "—" : dateObj.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-12 text-center">
          {qualifyPassed && (
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-success">
              <Award className="h-5 w-5" />
              <span className="text-sm font-medium">Assessment Qualified</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Learning Disabilities
            <span className="block text-gradient">Support Center</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Select a learning disability to take a specific assessment or access 
            learning resources tailored to support different learning needs.
          </p>
          {user && (
            <p className="mt-2 text-sm text-primary">
              Welcome, {user.email}! Your results will be saved.
            </p>
          )}
        </div>

        {/* User Past Results */}
        {user && pastResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Your Assessment History
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? "Hide" : "Show"} ({pastResults.length})
              </Button>
            </CardHeader>
            {showHistory && (
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pastResults.map((result) => {
                    const isPassed = result.passed === true || result.passed === "true";
                    return (
                      <div
                        key={result.quiz_id}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                      >
                        <div>
                          <span className="font-medium capitalize">{result.type}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {formatDate(result.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">
                            {result.percentage}%
                          </span>

                          {result.type === "qualification" ? (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                isPassed ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                              }`}
                            >
                              {isPassed ? "Passed" : "Failed"}
                            </span>
                          ) : (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getLevelColor(result.percentage)}`}
                            >
                              {getLevel(result.percentage)}
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}

          </Card>
        )}

        {!user && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">Sign in to save your progress</p>
                <p className="text-sm text-muted-foreground">
                  Your quiz results and chat history will be saved
                </p>
              </div>
              <Button onClick={() => navigate("/auth")}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Disability Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <DisabilityCard
            type="dyslexia"
            title="Dyslexia"
            description="Reading and language processing difficulties affecting word recognition and comprehension."
            delay={100}
          />
          <DisabilityCard
            type="dysgraphia"
            title="Dysgraphia"
            description="Writing difficulties affecting handwriting, spelling, and organizing thoughts on paper."
            delay={200}
          />
          <DisabilityCard
            type="dyscalculia"
            title="Dyscalculia"
            description="Mathematical difficulties affecting number sense, calculations, and math reasoning."
            delay={300}
          />
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button variant="outline" onClick={() => navigate("/qualification")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Qualification
          </Button>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Start
          </Button>
        </div>

        {/* Info */}
        <div className="mt-12 rounded-2xl bg-card p-6 text-center shadow-sm">
          <h3 className="mb-2 font-semibold text-foreground">Important Notice</h3>
          <p className="text-sm text-muted-foreground">
            These assessments are for educational and screening purposes only. 
            They are not diagnostic tools. For a proper diagnosis, please consult 
            with qualified healthcare professionals such as educational psychologists, 
            neuropsychologists, or learning specialists.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Home;
