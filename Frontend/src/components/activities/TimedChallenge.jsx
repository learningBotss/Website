import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { saveGameResult } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";

const TimedChallenge = ({ disabilityType, colorClass }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const challenges = {
    dyslexia: {
      type: "Word Spelling",
      generate: () => {
        const words = ["apple","banana","orange","grape","mango","peach"];
        const word = words[Math.floor(Math.random() * words.length)];
        const scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
        return { question: scrambled, answer: word };
      },
    },
    dysgraphia: {
      type: "Letter Sequence",
      generate: () => {
        const sequences = [
          { q: "A, B, C, _", a: "D" },
          { q: "X, Y, _", a: "Z" },
        ];
        const seq = sequences[Math.floor(Math.random() * sequences.length)];
        return { question: seq.q, answer: seq.a };
      },
    },
    dyscalculia: {
      type: "Quick Math",
      generate: () => {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const ops = ["+", "-", "×"];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let answer = op === "+" ? a+b : op === "-" ? a-b : a*b;
        return { question: `${a} ${op} ${b} = ?`, answer: answer.toString() };
      },
    },
  };

  const challenge = challenges[disabilityType];

  const generateNewChallenge = useCallback(() => {
    setCurrentChallenge(challenge.generate());
    setUserAnswer("");
  }, [challenge]);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(30);
    setScore(0);
    setIsComplete(false);
    generateNewChallenge();
  };

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isComplete) saveProgress();
  }, [isComplete]);

  const saveProgress = async () => {
    if (!user) return;
    try {
      await saveGameResult({
        userId: user.id,
        disabilityType,
        activityType: "timed_challenge",
        score,
        data: { timeLeft, score },
      });
      toast({ title: "Progress saved!", description: `You scored ${score} points!` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save progress.", variant: "destructive" });
    }
  };

  const checkAnswer = () => {
    if (!currentChallenge) return;
    if (userAnswer.toLowerCase().trim() === currentChallenge.answer.toLowerCase()) {
      setScore(prev => prev + 1);
    }
    generateNewChallenge();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") checkAnswer();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Timed Challenge</span>
          {isPlaying && <div className="flex items-center gap-2 text-lg"><Timer className="h-5 w-5"/><span className={timeLeft<=10?"text-destructive":""}>{timeLeft}s</span></div>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{challenge.type} - 30 seconds</p>
      </CardHeader>
      <CardContent>
        {!isPlaying && !isComplete && (
          <div className="py-8 text-center">
            <Timer className="mx-auto mb-4 h-16 w-16 text-muted-foreground"/>
            <p className="mb-4 text-muted-foreground">Answer as many questions as you can in 30 seconds!</p>
            <Button onClick={startGame} className={colorClass}><Play className="mr-2 h-4 w-4"/>Start Challenge</Button>
          </div>
        )}

        {isPlaying && currentChallenge && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Score</span>
              <p className="text-3xl font-bold">{score}</p>
            </div>
            <div className="rounded-xl bg-muted p-6 text-center">
              <p className="text-2xl font-bold">{currentChallenge.question}</p>
            </div>
            <div className="flex gap-2">
              <Input value={userAnswer} onChange={e=>setUserAnswer(e.target.value)} onKeyPress={handleKeyPress} placeholder="Your answer..." className="text-center text-lg" autoFocus/>
              <Button onClick={checkAnswer} className={colorClass}>Submit</Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">Press Enter to submit quickly!</p>
          </div>
        )}

        {isComplete && (
          <div className="py-8 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-500"/>
            <h3 className="text-xl font-bold">Time's Up!</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{score} points</p>
            <p className="mt-1 text-muted-foreground">Great effort!</p>
            <Button onClick={startGame} className={`mt-4 ${colorClass}`}><RotateCcw className="mr-2 h-4 w-4"/>Try Again</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimedChallenge;

