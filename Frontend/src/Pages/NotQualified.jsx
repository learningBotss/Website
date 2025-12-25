import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";


export default function NotQualified() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8 flex justify-center items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 classNa me="text-3xl font-bold text-foreground">
            Assessment Result
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for completing the assessment
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-lg text-center ">
          <CardHeader>
            <CardTitle className="flex flex-col items-center justify-center gap-2 text-center">
              😊 No Significant Learning Difficulties Detected
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="mb-6 text-muted-foreground leading-relaxed text-center ">
              Based on your responses, there are no strong indicators of
              dyslexia, dysgraphia, or dyscalculia at this time.
              This screening is <strong>not a diagnosis</strong>. If you
              experience learning challenges in the future, you may retake
              the assessment or consult an educational professional.
            </p>

            <div className="flex justify-center text-center ">
              <Button
                variant="hero"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

    
      </div>
    </div>
  );
}
