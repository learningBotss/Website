import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Gamepad2 } from "lucide-react";
import { getLeaderboard, getAllUsers } from "@/api"; // API helpers

const gameTypes = [
  { id: "memory_game", label: "Memory Game" },
  { id: "drag_drop", label: "Drag & Drop" },
  { id: "timed_challenge", label: "Timed Challenge" },
];

export default function GameLeaderboard({ disabilityType, colorClass }) {
  const [activeGame, setActiveGame] = useState("memory_game");
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [disabilityType, activeGame]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const [data, allUsers] = await Promise.all([
        getLeaderboard(disabilityType, activeGame),
        getAllUsers(),
      ]);

      const mapped = data.map(entry => {
        const user = allUsers.find(u => u.id.toString() === entry.user_id.toString());
        return {
          ...entry,
          full_name: user?.full_name,
          email: user?.email,
        };
      });

      setEntries(mapped.slice(0, 10));
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="flex h-5 w-5 items-center justify-center text-sm font-bold text-muted-foreground">
            {rank}
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className={`h-5 w-5 ${colorClass.replace("bg-", "text-")}`} />
          Game Leaderboards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeGame} onValueChange={setActiveGame}>
          <TabsList className="mb-4 grid w-full grid-cols-3">
            {gameTypes.map(game => (
              <TabsTrigger key={game.id} value={game.id} className="text-xs sm:text-sm">
                {game.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {gameTypes.map(game => (
            <TabsContent key={game.id} value={game.id}>
              {isLoading ? (
                <p className="py-8 text-center text-muted-foreground">Loading...</p>
              ) : entries.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No scores yet. Be the first to complete this game!
                </p>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 rounded-lg p-3 ${
                        index === 0 ? `${colorClass} text-primary-foreground` : "bg-muted"
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {entry.full_name || entry.email?.split("@")[0] || "Unknown"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span>{entry.score} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
