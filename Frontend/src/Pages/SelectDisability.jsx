import { useNavigate } from "react-router-dom";
import { DisabilityCard } from "@/components/DisabilityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home as HomeIcon, RotateCcw } from "lucide-react";

const selectDisability = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header with notice */}
        <Card className="mb-8 border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Standard Assessment Mode</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on your qualification assessment, you're in standard mode. 
                You can still take all disability-specific tests and access learning resources.
                Consider retaking the qualification assessment if you'd like to try again.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Learning Disabilities
            <span className="block text-gradient">Support Center</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Explore our comprehensive assessments and learning resources for 
            different learning disabilities.
          </p>
        </div>

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
          <Button variant="hero" onClick={() => navigate("/qualification")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Qualification Assessment
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
            with qualified healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default selectDisability;
