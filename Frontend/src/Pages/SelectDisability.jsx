import { useState, useEffect } from "react";
import { DisabilityCard } from "@/components/DisabilityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Award, History, RotateCcw, Home as HomeIcon, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPastResults } from "@/api"; // <-- API untuk history

const Home = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const qualifyPassed = localStorage.getItem("qualifyPassed") === "true";
  const [pastResults, setPastResults] = useState([]); 
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) fetchPastResults();
    if (showHistory) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [user, showHistory]);

  const fetchPastResults = async () => {
    if (!user) return;
    try {
      const response = await getPastResults(user.id);
      const data = response.data;
      if (data) setPastResults(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Failed to fetch past results", err);
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const cleanDate = dateString.replace(/\.\d+/, ''); // remove microseconds
    const dateObj = new Date(cleanDate);
    return isNaN(dateObj) ? "—" : dateObj.toLocaleDateString();
  };

const secondQualResults = pastResults.filter(r => r.type === "Second Qualification");

// get the latest result (by date)
const latestResult = secondQualResults.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

const recommendedDisabilities = latestResult
  ? Object.entries(latestResult.percentage)
      .filter(([_, pct]) => pct >= 60)
      .map(([type, _]) => type)
  : [];


  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Header */}
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          {user ? (
            <>
              {userRole === "admin" && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <Shield className="mr-2 h-4 w-4" /> Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => {signOut(); navigate("/"); }}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          )}
        </div>

        <div className="mb-12 text-center pt-20">
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
        {user && pastResults.length > 0 && (
          <div className="flex justify-center mb-6">
            <Button variant="outline" onClick={() => setShowHistory(true)}>
              <History className="mr-2 h-4 w-4" />
              View Assessment History
            </Button>
          </div>
        )}
        {/* User Past Results */}
        {user && pastResults.length > 0 && showHistory && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-24">
          <Card className="w-full max-w-3xl mx-4 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Your Assessment History
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                Close
              </Button>
            </CardHeader>
           
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pastResults.map((result) => {
                    /* ================= FIRST QUALIFICATION ================= */
                    if (result.type === "First Qualification") {
                      const passed = result.percentage >= 50;

                      return (
                        <div
                          key={result.quiz_id}
                          className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3" // Tukar kepada flex-col
                        >
                          {/* Baris Atas: Tajuk & Tarikh */}
                          <div className="flex justify-between items-center w-full">
                            <span className="font-medium">{result.type}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(result.date)}
                            </span>
                          </div>

                          {/* Baris Bawah: Status Badge */}
                          <div className="flex">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                passed
                                  ? "text-green-700 bg-green-100"
                                  : "text-red-700 bg-red-100"
                              }`}
                            >
                              {passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    /* ================= SECOND QUALIFICATION ================= */
                    if (result.type === "Second Qualification") {
                      return (
                        <div
                          key={result.quiz_id}
                          className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3"
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{result.type}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(result.date)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {Object.entries(result.percentage).map(([type, pct]) => {
                              const detected = pct >= 60;
                              return (
                                <span
                                  key={type}
                                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                                    detected
                                      ? "text-green-700 bg-green-100"
                                      : "text-gray-600 bg-gray-100"
                                  }`}
                                >
                                  {type}: {Math.round(pct)}% —{" "}
                                  {detected ? "Detected" : "Not Detected"}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    /* ================= OTHER ASSESSMENTS ================= */
                    const percentage = result.percentage;
                    let level = "Low";
                    let color = "text-red-700 bg-red-100";

                    if (percentage >= 70) {
                      level = "High";
                      color = "text-green-700 bg-green-100";
                    } else if (percentage >= 40) {
                      level = "Moderate";
                      color = "text-yellow-700 bg-yellow-100";
                    }

                    return (
                      <div
                        key={result.quiz_id}
                        className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3" // Tukar flex-items-center justify-between kepada flex-col
                      >
                        {/* Baris Atas: Tajuk & Tarikh */}
                        <div className="flex justify-between items-center w-full">
                          <span className="font-medium capitalize">{result.type}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(result.date)}
                          </span>
                        </div>
                        
                        {/* Baris Bawah: Percentage Badge */}
                        <div className="flex">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}
                          >
                            {Math.round(percentage)}% — {level}
                          </span>
                        </div>
                      </div>
                    );
                  })}


                </div>
              </CardContent>
          </Card>
          
          </div> 
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
            recommended={recommendedDisabilities.includes("dyslexia")}
            delay={100}
          />
          <DisabilityCard
            type="dysgraphia"
            title="Dysgraphia"
            description="Writing difficulties affecting handwriting, spelling, and organizing thoughts on paper."
            recommended={recommendedDisabilities.includes("dysgraphia")}
            delay={200}
          />
          <DisabilityCard
            type="dyscalculia"
            title="Dyscalculia"
            description="Mathematical difficulties affecting number sense, calculations, and math reasoning."
            recommended={recommendedDisabilities.includes("dyscalculia")}
            delay={300}
          />
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("qualifyPassed");
              localStorage.removeItem("qualifyScore");
              navigate("/qualification", { state: { forceRetake: true } });
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Qualification
          </Button>

          <Button variant="ghost" onClick={() => navigate("/")}>
            <HomeIcon className="mr-2 h-4 w-4" />
            Back to Start
          </Button>
        </div>

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
