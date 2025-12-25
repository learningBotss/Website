import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { saveGameResult } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, CheckCircle } from "lucide-react";

const DragDropGame = ({ disabilityType, colorClass }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const gameDataMap = {
    dyslexia: [
      { word: "cat", category: "Short Words" },
      { word: "dog", category: "Short Words" },
      { word: "elephant", category: "Long Words" },
      { word: "butterfly", category: "Long Words" },
    ],
    dysgraphia: [
      { word: "a", category: "Lowercase" },
      { word: "B", category: "Uppercase" },
      { word: "c", category: "Lowercase" },
      { word: "D", category: "Uppercase" },
    ],
    dyscalculia: [
      { word: "2", category: "Even" },
      { word: "3", category: "Odd" },
      { word: "4", category: "Even" },
      { word: "5", category: "Odd" },
    ],
  };

  const categoriesMap = {
    dyslexia: ["Short Words", "Long Words"],
    dysgraphia: ["Lowercase", "Uppercase"],
    dyscalculia: ["Even", "Odd"],
  };

  const initializeGame = () => {
    const shuffledItems = [...gameDataMap[disabilityType]].sort(() => Math.random() - 0.5);
    setItems(shuffledItems.map(item => ({ ...item, placed: null })));
    setSelectedItem(null);
    setScore(0);
    setAttempts(0);
    setIsComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [disabilityType]);

  useEffect(() => {
    const unplaced = items.filter(item => !item.placed);
    if (unplaced.length === 0 && items.length > 0) {
      setIsComplete(true);
      saveProgress();
    }
  }, [items]);

  const saveProgress = async () => {
    if (!user) return;

    try {
      await saveGameResult({
        userId: user.id,
        disabilityType,
        activityType: "drag_drop",
        score,
        data: { attempts, totalItems: items.length },
      });

      toast({
        title: "Progress saved!",
        description: `You scored ${score} out of ${items.length}`,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save progress.", variant: "destructive" });
    }
  };

  const handleItemClick = index => {
    if (items[index].placed) return;
    setSelectedItem(selectedItem === index ? null : index);
  };

  const handleCategoryClick = category => {
    if (selectedItem === null) return;
    const item = items[selectedItem];
    setAttempts(prev => prev + 1);

    if (item.category === category) {
      setItems(prev =>
        prev.map((it, i) => (i === selectedItem ? { ...it, placed: category } : it))
      );
      setScore(prev => prev + 1);
    }

    setSelectedItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sort & Categorize</span>
          <Button variant="ghost" size="sm" onClick={initializeGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Click an item, then click the correct category</p>
      </CardHeader>
      <CardContent>
        {isComplete ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h3 className="text-xl font-bold">Great Job!</h3>
            <p className="mt-2 text-muted-foreground">
              You scored {score}/{items.length} ({attempts} attempts)
            </p>
            <Button onClick={initializeGame} className={`mt-4 ${colorClass}`}>
              Play Again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between text-sm text-muted-foreground">
              <span>Score: {score}/{items.length}</span>
              <span>Attempts: {attempts}</span>
            </div>

            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(index)}
                  disabled={!!item.placed}
                  className={`rounded-lg px-4 py-2 text-lg font-semibold transition-all ${
                    item.placed
                      ? "bg-muted text-muted-foreground opacity-50"
                      : selectedItem === index
                      ? `${colorClass} text-primary-foreground ring-2 ring-offset-2`
                      : "bg-card shadow hover:shadow-md"
                  }`}
                >
                  {item.word}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categoriesMap[disabilityType].map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                    selectedItem !== null
                      ? "border-primary hover:bg-primary/10"
                      : "border-muted"
                  }`}
                >
                  <h4 className="font-semibold">{category}</h4>
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {items.filter(item => item.placed === category).map((item, i) => (
                      <span key={i} className={`rounded px-2 py-1 text-xs ${colorClass} text-primary-foreground`}>
                        {item.word}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DragDropGame;
