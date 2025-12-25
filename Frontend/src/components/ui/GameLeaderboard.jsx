import { useEffect, useState } from "react";
import { getLeaderboard  } from "@/api";
import { Trophy } from "lucide-react";

const GameLeaderboard = ({ disabilityType, activityType }) => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getGameLeaderboard(disabilityType, activityType);
      setLeaders(data);
    };
    fetchLeaderboard();
  }, [disabilityType, activityType]);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Leaderboard
      </h3>
      {leaders.length === 0 && <p>No scores yet.</p>}
      <ul>
        {leaders.map((user, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{user.user_id}</span>
            <span>{user.score} / {user.max_score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameLeaderboard;
