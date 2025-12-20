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

export const DisabilityCard = ({ type, title, description, delay = 0 }) => {
  const navigate = useNavigate();
  const Icon = icons[type];
  const color = colors[type];
  const descColor = descriptionColors[type];

  return (
    <Card
      className="animate-slide-up cursor-pointer overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => navigate(`/disability/${type}`)}
      variant={type} // variant card untuk bg sesuai
    >
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/disability/${type}/test`);
            }}
          >
            Take Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/disability/${type}/learn`);
            }}
          >
            Learn More
          </Button>
        </div>
        <button
          className={`mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium ${color} hover:underline`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/disability/${type}`);
          }}
        >
          View All Options <ArrowRight className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
};
