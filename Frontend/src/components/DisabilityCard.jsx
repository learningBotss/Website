import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, Calculator, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const icons = {
  dyslexia: BookOpen,
  dysgraphia: PenTool,
  dyscalculia: Calculator,
};

const colors = {
  dyslexia: "text-dyslexia",
  dysgraphia: "text-dysgraphia",
  dyscalculia: "text-dyscalculia",
};

const descriptionColors = {
  dyslexia: "text-dyslexia-foreground",
  dysgraphia: "text-dysgraphia-foreground",
  dyscalculia: "text-dyscalculia-foreground",
};

export const DisabilityCard = ({ type, title, description, recommended = false, delay = 0 }) => {
  const navigate = useNavigate();
  const Icon = icons[type];
  const color = colors[type];
  const descColor = descriptionColors[type];

  return (
    <Card
      className={`animate-slide-up cursor-pointer overflow-hidden relative ${recommended ? "border-2 border-yellow-400 shadow-lg" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(`/disability/${type}`)}
      variant={type}
    >
      {recommended && (
        <div className="absolute top-2 right-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-white z-10 shadow-lg animate-bounce">
          Recommended
        </div>
      )}
      <CardHeader className="pb-4">
        <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow-sm ${color}`}>
          <Icon className="h-7 w-7" />
        </div>
        <CardTitle className={`text-xl ${color}`}>{title}</CardTitle>
        <CardDescription className={`${descColor} text-sm`}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); navigate(`/disability/${type}/test`); }}
          >
            Take Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); navigate(`/disability/${type}/learn`); }}
          >
            Learn More
          </Button>
        </div>
        <button
          className={`mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium ${color} hover:underline`}
          onClick={(e) => { e.stopPropagation(); navigate(`/disability/${type}`); }}
        >
          View All Options <ArrowRight className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
};