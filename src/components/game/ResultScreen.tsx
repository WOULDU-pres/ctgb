
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Leaderboard from "./Leaderboard";
import { Home, RotateCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useRef, useEffect } from "react";
import { toPng } from 'html-to-image';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";
import { useAchievements } from "@/hooks/useAchievements";
import { GameMode } from "@/hooks/useGameLogic";

type ResultScreenProps = {
  results: number[];
  onRetry: () => void;
  onGoToMenu: () => void;
  gameMode: GameMode;
};

const ResultScreen = ({ results, onRetry, onGoToMenu, gameMode }: ResultScreenProps) => {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const { checkAchievements } = useAchievements();

  useEffect(() => {
    if (results && gameMode) {
      checkAchievements(results, gameMode);
    }
  }, [results, gameMode, checkAchievements]);

  const validResults = results.filter(r => r < 3000);
  const average = validResults.length > 0 ? validResults.reduce((a, b) => a + b, 0) / validResults.length : 0;
  const best = validResults.length > 0 ? Math.min(...validResults) : 0;

  const getGrade = (avgTime: number) => {
    if (avgTime <= 0) return { grade: "-", color: "text-muted-foreground" };
    if (avgTime < 180) return { grade: "S", color: "text-primary" };
    if (avgTime < 220) return { grade: "A", color: "text-secondary" };
    if (avgTime < 280) return { grade: "B", color: "text-foreground" };
    if (avgTime < 350) return { grade: "C", color: "text-muted-foreground" };
    return { grade: "F", color: "text-destructive" };
  };

  const { grade, color } = getGrade(average);

  const handleShare = () => {
    if (resultCardRef.current === null) {
      toast.error("결과 카드를 찾을 수 없습니다.");
      return;
    }

    toast.info("결과 이미지를 생성 중입니다...");

    toPng(resultCardRef.current, { 
      cacheBust: true,
      backgroundColor: 'hsl(260, 40%, 8%)', // Match with background
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'reaction-test-result.png';
        link.href = dataUrl;
        link.click();
        toast.success("결과 이미지가 성공적으로 다운로드되었습니다!");
      })
      .catch((err) => {
        console.error('Failed to create image: ', err);
        toast.error("이미지 생성에 실패했습니다.");
      });
  };

  const getResultDisplay = (time: number) => {
    if (time >= 5000) {
      return { text: "너무 빠름!", className: "text-destructive font-bold" };
    }
    if (time >= 3000) {
      return { text: "놓침!", className: "text-destructive font-bold" };
    }
    return { text: `${time.toFixed(0)} ms`, className: "font-semibold" };
  };

  const chartData = results.map((time, index) => ({
    round: `${index + 1}회`,
    time: time < 3000 ? time : 3000,
    fullTime: time,
  }));

  const chartConfig = {
    time: {
      label: "반응 속도 (ms)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-8 animate-glow">게임 결과</h1>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-glow-primary bg-card" ref={resultCardRef} role="region" aria-labelledby="result-title">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle id="result-title">라운드별 기록</CardTitle>
              <CardDescription>
                평균: <span className="text-secondary font-bold">{average.toFixed(0)} ms</span> | 
                최고: <span className="text-primary font-bold">{best.toFixed(0)} ms</span>
              </CardDescription>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">종합 등급</p>
              <p className={`text-5xl sm:text-6xl font-bold ${color}`} aria-live="polite">{grade}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="round"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    domain={[0, 'dataMax + 100']}
                    label={{ value: "ms", position: "top", offset: 10, fill: "hsl(var(--muted-foreground))" }}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const resultDisplay = getResultDisplay(data.fullTime);
                        return (
                          <div className="bg-background/90 backdrop-blur-sm p-3 border border-border rounded-lg shadow-lg text-sm">
                            <p className="font-bold text-base mb-1">{data.round}</p>
                            <p>기록: <span className={resultDisplay.className}>{resultDisplay.text}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="time" fill="var(--color-time)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-8">
          <Leaderboard />
          <div className="flex flex-col gap-4">
             <Button onClick={onRetry} size="lg" className="h-16 text-xl shadow-glow-primary hover:shadow-none w-full" aria-label="게임 다시하기">
               <RotateCw className="mr-2 h-6 w-6" />
               다시하기
             </Button>
             <Button onClick={onGoToMenu} variant="outline" size="lg" className="h-16 text-xl w-full" aria-label="메인 메뉴로 돌아가기">
               <Home className="mr-2 h-6 w-6" />
               메인으로
             </Button>
             <Button onClick={handleShare} variant="secondary" size="lg" className="h-16 text-xl shadow-glow-secondary hover:shadow-none w-full" aria-label="결과를 이미지로 공유하기">
                <Share2 className="mr-2 h-6 w-6" />
                이미지로 공유
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
