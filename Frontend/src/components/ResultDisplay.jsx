import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, AlertTriangle, Home, RotateCcw } from "lucide-react";

const resultConfig = {
  low: {
    icon: CheckCircle,
    title: "Low Probability",
    description: "Based on your responses, there is a low probability of having symptoms associated with this learning disability.",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    advice: "While the assessment shows low indicators, continue to monitor learning progress and seek professional evaluation if concerns arise.",
  },
  moderate: {
    icon: AlertCircle,
    title: "Moderate Probability",
    description: "Your responses indicate a moderate probability of having symptoms associated with this learning disability.",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    advice: "Consider consulting with an educational specialist or psychologist for a comprehensive assessment. Early intervention can make a significant difference.",
  },
  high: {
    icon: AlertTriangle,
    title: "High Probability",
    description: "Your responses suggest a high probability of having symptoms associated with this learning disability.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30",
    advice: "We strongly recommend seeking a professional evaluation from a qualified specialist. With proper support and strategies, individuals with learning disabilities can thrive.",
  },
};

export const ResultDisplay = ({ result, disabilityType, score, maxScore, resetQuiz }) => {
  const navigate = useNavigate();
  const config = resultConfig[result];
  const Icon = config.icon;
  const percentage = Math.round((score / maxScore) * 100);

const handleRetake = () => {
  setShowPreviousPrompt(false);
  setPreviousResult(null);
  setAnswers(new Array(questions.length).fill(null));
  setCurrentQuestion(0);
  setShowResult(false);
  setResult(null);
};

  return (
    <div className="mx-auto max-w-2xl animate-scale-in">
      <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${config.bgColor}`}>
            <Icon className={`h-10 w-10 ${config.color}`} />
          </div>
          <CardTitle className={`text-2xl ${config.color}`}>{config.title}</CardTitle>
          <p className="mt-2 text-lg font-medium text-foreground">
            Score: {score} / {maxScore} ({percentage}%)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground/80">{config.description}</p>
          
          <div className="rounded-xl bg-card p-4">
            <h4 className="mb-2 font-semibold text-foreground">Recommendation</h4>
            <p className="text-sm text-muted-foreground">{config.advice}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {disabilityType && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetQuiz}

              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Test
              </Button>
            )}
            {disabilityType && (
              <Button
                variant="default"
                className="flex-1"
                onClick={() => navigate(`/disability/${disabilityType}/learn`)}
              >
                View Learning Resources
              </Button>
            )}

            <Button variant="hero" className="flex-1" onClick={() => navigate("/select")}>
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <strong>Disclaimer:</strong> This assessment is for educational purposes only and is not a diagnostic tool. 
        Please consult with qualified healthcare professionals for proper evaluation and diagnosis.
      </p>
    </div>
  );
};
