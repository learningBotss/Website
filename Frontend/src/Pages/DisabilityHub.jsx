import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisability } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, PenTool, Calculator, ArrowLeft, FileQuestion, GraduationCap, LogIn, Shield } from "lucide-react";
import Chatbot from "@/components/Chatbot";

const icons = {
  dyslexia: BookOpen,
  dysgraphia: PenTool,
  dyscalculia: Calculator,
};

const colors = {
  dyslexia: { text: "text-dyslexia", bg: "bg-dyslexia", bgLight: "bg-dyslexia-light" },
  dysgraphia: { text: "text-dysgraphia", bg: "bg-dysgraphia", bgLight: "bg-dysgraphia-light" },
  dyscalculia: { text: "text-dyscalculia", bg: "bg-dyscalculia", bgLight: "bg-dyscalculia-light" },
};

const DisabilityHub = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState(null);

  /* ===== Redirect if not logged in ===== */
  useEffect(() => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "You have to log in first",
        description: "Redirecting to Select Disability page",
      });
      navigate("/select");
      return;
    }
  }, [user, navigate, toast]);

  /* ===== Fetch disability content ===== */
  useEffect(() => {
    if (!type || !["dyslexia", "dysgraphia", "dyscalculia"].includes(type)) {
      navigate("/select");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await getDisability(type);
        if (res?.data?.[type]) {
          setContent(res.data[type]);
        } else {
          console.warn("No content found for", type);
        }
      } catch (err) {
        console.error("Failed to fetch disability data:", err);
      }
    };

    fetchData();
  }, [type, navigate]);

  if (!content) return <p className="text-center mt-8">Loading...</p>;

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <div className={`min-h-screen ${colorScheme.bgLight} px-4 py-8`}>
      {/* Header */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        {user ? (
          <>
            {userRole === "admin" && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Shield className="mr-2 h-4 w-4" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
              <LogIn className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate("/select")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${colorScheme.bg} shadow-lg`}>
            <Icon className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className={`text-3xl font-bold ${colorScheme.text} md:text-4xl`}>
            {content.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
            {content.description}
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => navigate(`/disability/${type}/test`)}
          >
            <CardHeader>
              <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorScheme.bgLight}`}>
                <FileQuestion className={`h-6 w-6 ${colorScheme.text}`} />
              </div>
              <CardTitle>Take Assessment</CardTitle>
              <CardDescription>
                {content.testDescription ?? "Complete a screening questionnaire to understand potential symptoms."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant={type} className="w-full">
                Start Assessment
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => navigate(`/disability/${type}/learn`)}
          >
            <CardHeader>
              <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorScheme.bgLight}`}>
                <GraduationCap className={`h-6 w-6 ${colorScheme.text}`} />
              </div>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Access tips, strategies, interactive activities, and AI chatbot support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Explore Resources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        {content.tips?.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Quick Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {content.tips.slice(0, 4).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${colorScheme.bg}`} />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <Chatbot disabilityType={type} colorClass={colorScheme.bg} />
    </div>
  );
};

export default DisabilityHub;
