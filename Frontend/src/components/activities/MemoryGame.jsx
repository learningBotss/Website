import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { saveGameResult } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Trophy } from "lucide-react";

const MemoryGame = ({ disabilityType, colorClass }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const gameCards = {
    dyslexia: {
      items: [
        ["🅰️", "🅱️", "📖", "✏️", "📚", "🔤"],
        ["📕", "📗", "📘", "📙", "📓", "📔"],
      ],
      label: "Match the letters and symbols",
    },
    dysgraphia: {
      items: [
        ["✍️", "📝", "✏️", "🖊️", "📒", "🗒️"],
        ["🖋️", "✒️", "🖌️", "🖍️", "📃", "📄"],
      ],
      label: "Match the writing tools",
    },
    dyscalculia: {
      items: [
        ["1️⃣", "2️⃣", "3️⃣", "➕", "➖", "✖️"],
        ["4️⃣", "5️⃣", "6️⃣", "➗", "🔢", "💯"],
      ],
      label: "Match the numbers and symbols",
    },
  };

  const gameData = gameCards[disabilityType];

  const initializeGame = () => {
    const randomSet = gameData.items[Math.floor(Math.random() * gameData.items.length)];
    const items = [...randomSet, ...randomSet]; // duplicate for matching
    const shuffled = items
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
  };

  useEffect(() => {
    initializeGame();
  }, [disabilityType]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === first || c.id === second ? { ...c, isMatched: true } : c
            )
          );
          setMatches(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === first || c.id === second ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    const randomSet = gameData.items[Math.floor(Math.random() * gameData.items.length)];
    if (matches === randomSet.length && matches > 0) {
      setIsComplete(true);
      saveProgress();
    }
  }, [matches]);

  const saveProgress = async () => {
    if (!user) return;
    try {
      await saveGameResult({
        userId: user.id,
        disabilityType,
        activityType: "memory_game",
        score: Math.max(100 - moves * 2, 10),
        data: { moves, totalPairs: gameData.items.length },
      });

      toast({
        title: "Progress saved!",
        description: `You completed the game in ${moves} moves.`,
      });
    } catch (err) {
      console.error("Failed to save progress", err);
      toast({
        title: "Error",
        description: "Failed to save game progress.",
        variant: "destructive",
      });
    }
  };

  const handleCardClick = id => {
    if (flippedCards.length >= 2) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c)));
    setFlippedCards(prev => [...prev, id]);
    setMoves(prev => prev + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Memory Match</span>
          <Button variant="ghost" size="sm" onClick={initializeGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{gameData.label}</p>
      </CardHeader>
      <CardContent>
        {isComplete ? (
          <div className="py-8 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            <h3 className="text-xl font-bold">Congratulations!</h3>
            <p className="mt-2 text-muted-foreground">
              You completed the game in {moves} moves!
            </p>
            <Button onClick={initializeGame} className={`mt-4 ${colorClass}`}>
              Play Again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between text-sm text-muted-foreground">
              <span>Moves: {moves}</span>
              <span>Matches: {matches}/{gameData.items.length}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`flex h-16 items-center justify-center rounded-lg text-2xl transition-all ${
                    card.isFlipped || card.isMatched
                      ? "bg-card"
                      : `${colorClass} text-primary-foreground`
                  } ${card.isMatched ? "opacity-50" : ""}`}
                  disabled={card.isMatched}
                >
                  {card.isFlipped || card.isMatched ? card.content : "?"}
                </button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryGame;
