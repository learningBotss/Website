import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, Heart, ArrowRight } from "lucide-react";

const Start = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="animate-slide-up text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 animate-float items-center justify-center rounded-3xl bg-gradient-primary shadow-glow">
            <Brain className="h-12 w-12 text-primary-foreground" />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            Learning Disabilities
            <span className="mt-2 block text-gradient">Support System</span>
          </h1>

          <p className="mx-auto mb-12 max-w-xl text-lg text-muted-foreground md:text-xl">
            Discover, understand, and support learning differences. 
            Take assessments and access personalized learning resources.
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Interactive Assessments</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
              <Heart className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">Personalized Learning</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm">
              <Brain className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Expert Resources</span>
            </div>
          </div>

          <Button
            variant="hero"
            size="xl"
            onClick={() => navigate("/qualification")}
            className="group"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            No account required • Free assessment
          </p>
        </div>

        <div className="absolute bottom-6 text-center">
          <p className="text-xs text-muted-foreground">
            ISP543 Knowledge Based Systems Project
          </p>
        </div>
      </div>
    </div>
  );
};

export default Start;
