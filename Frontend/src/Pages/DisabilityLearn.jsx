import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisability } from "@/api";
import { BookOpen, PenTool, Calculator, ArrowLeft, Lightbulb, BookMarked, CheckCircle } from "lucide-react";

const icons = {
  dyslexia: BookOpen,
  dysgraphia: PenTool,
  dyscalculia: Calculator,
};

const colors = {
  dyslexia: { text: "text-dyslexia", bg: "bg-dyslexia", bgLight: "bg-dyslexia-light", border: "border-dyslexia/30" },
  dysgraphia: { text: "text-dysgraphia", bg: "bg-dysgraphia", bgLight: "bg-dysgraphia-light", border: "border-dysgraphia/30" },
  dyscalculia: { text: "text-dyscalculia", bg: "bg-dyscalculia", bgLight: "bg-dyscalculia-light", border: "border-dyscalculia/30" },
};

const DisabilityLearn = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);

  useEffect(() => {
  if (!type || !["dyslexia", "dysgraphia", "dyscalculia"].includes(type)) {
    navigate("/select");
    return;
  }

  const fetchData = async () => {
    try {
      const res = await getDisability(type);
      if (res && res.data && res.data[type]) {
        setContent(res.data[type]);
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
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(`/disability/${type}`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${colorScheme.bg} shadow-lg`}>
            <Icon className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className={`text-3xl font-bold ${colorScheme.text} md:text-4xl`}>
            Learning Resources
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
            {content.description}
          </p>
        </div>

        {/* Tips Section */}
        {content.tips && content.tips.length > 0 && (
          <Card className={`mb-8 ${colorScheme.border} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className={`h-5 w-5 ${colorScheme.text}`} />
                Helpful Tips & Strategies
              </CardTitle>
              <CardDescription>
                Evidence-based approaches to support learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-sm">
                    <CheckCircle className={`mt-0.5 h-5 w-5 shrink-0 ${colorScheme.text}`} />
                    <span className="text-sm text-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources Section */}
        {content.resources && content.resources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className={`h-5 w-5 ${colorScheme.text}`} />
                Learning Activities
              </CardTitle>
              <CardDescription>
                Interactive resources to support skill development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.resources.map((resource, index) => (
                  <div
                    key={index}
                    className={`rounded-xl ${colorScheme.bgLight} ${colorScheme.border} border-2 p-4 transition-all hover:shadow-md`}
                  >
                    <h4 className={`mb-2 font-semibold ${colorScheme.text}`}>
                      {resource.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant={type} onClick={() => navigate(`/disability/${type}/test`)}>
            Take Assessment
          </Button>
          <Button variant="outline" onClick={() => navigate("/select")}>
            Back to Home
          </Button>
        </div>

        {/* Additional info */}
        <Card className="mt-8 bg-card/50">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 font-semibold text-foreground">Need Professional Support?</h3>
            <p className="text-sm text-muted-foreground">
              These resources are designed to supplement, not replace, professional evaluation 
              and intervention. If you suspect a learning disability, consider consulting with 
              educational specialists, school psychologists, or learning disability specialists 
              who can provide comprehensive assessment and personalized support plans.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisabilityLearn;
