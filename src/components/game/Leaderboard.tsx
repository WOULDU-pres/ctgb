
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

const topPlayers = [
  { rank: 1, name: "Flash", score: 145, characteristic: "세상에서 가장 빠른 사나이" },
  { rank: 2, name: "Sonic", score: 149, characteristic: "소리보다 빠른 고슴도치" },
  { rank: 3, name: "QuickSilver", score: 151, characteristic: "엑스맨의 신속함" },
  { rank: 4, name: "RoadRunner", score: 152, characteristic: "미꿋미꿋!" },
  { rank: 5, name: "Goku", score: 155, characteristic: "순간이동의 달인" },
  { rank: 6, name: "SpeedyGonzales", score: 160, characteristic: "안달레! 안달레! 아리바!" },
  { rank: 7, name: "Bolt", score: 161, characteristic: "슈퍼 강아지" },
  { rank: 8, name: "Dash", score: 163, characteristic: "인크레더블한 스피드" },
  { rank: 9, name: "Cheetah", score: 165, characteristic: "정글의 스프린터" },
  { rank: 10, name: "ForrestGump", score: 170, characteristic: "뛰어요, 포레스트!" },
];

const Leaderboard = () => {
  return (
    <Card className="w-full shadow-glow-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="text-primary animate-pulse" />
          글로벌 랭킹 TOP 10
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {topPlayers.map((player) => (
            <li key={player.rank} className="flex justify-between items-center text-md sm:text-lg">
              <div>
                <span className="font-semibold">{player.rank}. {player.name}</span>
                <p className="text-xs sm:text-sm text-muted-foreground">{player.characteristic}</p>
              </div>
              <span className="text-secondary font-bold">{player.score} ms</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
