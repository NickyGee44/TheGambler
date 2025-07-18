import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import ProfilePicture from "@/components/ProfilePicture";

interface IndividualScoresTableProps {
  holeScores: any[];
  round: number;
  format: string;
}

export default function IndividualScoresTable({ holeScores, round, format }: IndividualScoresTableProps) {
  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
  });

  // Group hole scores by user
  const playerScores = holeScores.reduce((acc: any, score: any) => {
    const key = `${score.userId}`;
    if (!acc[key]) {
      acc[key] = {
        userId: score.userId,
        user: score.user,
        teamId: score.teamId,
        holes: {},
        totalScore: 0
      };
    }
    acc[key].holes[score.hole] = score.strokes;
    acc[key].totalScore += score.strokes || 0;
    return acc;
  }, {});

  // Convert to array and add team info
  const playersArray = Object.values(playerScores).map((player: any) => {
    const team = teams.find((t: any) => t.id === player.teamId);
    return {
      ...player,
      team,
      firstName: player.user?.firstName || '',
      lastName: player.user?.lastName || ''
    };
  });

  // Sort by total score for better ball and scramble, or by team for match play
  const sortedPlayers = playersArray.sort((a: any, b: any) => {
    if (format === "Match Play") {
      return (a.team?.teamNumber || 0) - (b.team?.teamNumber || 0);
    }
    return (a.totalScore || 999) - (b.totalScore || 999);
  });

  const holes = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <Card className="shadow-lg">
      <CardContent className="p-3 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-golf-green-600 mb-2">Round {round}: Individual Scores ({format})</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hole-by-hole scores for all players. {format === "Better Ball" ? "Better ball uses best score between partners." : format === "Scramble" ? "In scramble, both players play from the best shot." : "Match play individual gross scores."}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-golf-green-50 dark:bg-slate-700">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-semibold text-golf-green-600 dark:text-golf-green-400 sticky left-0 bg-golf-green-50 dark:bg-slate-700">Player</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-golf-green-600 dark:text-golf-green-400">Team</th>
                {holes.map(hole => (
                  <th key={hole} className="px-1 py-2 text-center text-xs font-semibold text-golf-green-600 dark:text-golf-green-400 min-w-[30px]">
                    {hole}
                  </th>
                ))}
                <th className="px-2 py-2 text-center text-xs font-semibold text-golf-green-600 dark:text-golf-green-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {sortedPlayers.map((player: any, index: number) => (
                <tr key={player.userId} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-2 py-2 sticky left-0 bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <ProfilePicture 
                        firstName={player.firstName} 
                        lastName={player.lastName} 
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate">{player.firstName} {player.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <span className="text-xs">Team {player.team?.teamNumber || 'N/A'}</span>
                  </td>
                  {holes.map(hole => (
                    <td key={hole} className="px-1 py-2 text-center text-xs">
                      <span className={`${player.holes[hole] ? 'font-medium' : 'text-gray-400'}`}>
                        {player.holes[hole] || '-'}
                      </span>
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center font-bold text-golf-green-600 text-xs">
                    {player.totalScore || '-'}
                  </td>
                </tr>
              ))}
              {sortedPlayers.length === 0 && (
                <tr>
                  <td colSpan={21} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No individual scores available for Round {round} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}