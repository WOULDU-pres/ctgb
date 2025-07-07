import React, { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Play, 
  Target, 
  Gamepad2, 
  Trophy,
  Clock
} from 'lucide-react';
import { TutorialFlow } from '@/types/tutorial';

interface TutorialSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTutorials: TutorialFlow[];
  completedTutorials: string[];
  tutorialCompletion: {
    completed: number;
    total: number;
    percentage: number;
  };
  onStartTutorial: (tutorialId: string) => void;
}

const tutorialIcons: Record<string, React.ElementType> = {
  'basic-intro': Gamepad2,
  'advanced-modes': Target,
  'features-tour': BookOpen,
};

const TutorialSelectionDialog = memo(({
  open,
  onOpenChange,
  availableTutorials,
  completedTutorials,
  tutorialCompletion,
  onStartTutorial
}: TutorialSelectionDialogProps) => {
  const getTutorialStatus = (tutorial: TutorialFlow) => {
    if (completedTutorials.includes(tutorial.id)) {
      return 'completed';
    }
    
    if (tutorial.prerequisite && 
        !tutorial.prerequisite.every(prereq => completedTutorials.includes(prereq))) {
      return 'locked';
    }
    
    return 'available';
  };

  const getEstimatedDuration = (tutorial: TutorialFlow) => {
    const totalDuration = tutorial.steps.reduce((acc, step) => {
      return acc + (step.duration || 5000); // Default 5 seconds per step
    }, 0);
    
    return Math.ceil(totalDuration / 60000); // Convert to minutes
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-primary" />
            튜토리얼 가이드
          </DialogTitle>
          <DialogDescription>
            QuickTap Arena의 다양한 기능과 게임 모드를 단계별로 학습해보세요.
          </DialogDescription>
        </DialogHeader>

        {/* Overall Progress */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">전체 진행률</h3>
            <span className="text-sm text-muted-foreground">
              {tutorialCompletion.completed} / {tutorialCompletion.total} 완료
            </span>
          </div>
          <Progress value={tutorialCompletion.percentage} className="h-2" />
        </div>

        {/* Tutorial Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableTutorials.map((tutorial) => {
            const status = getTutorialStatus(tutorial);
            const Icon = tutorialIcons[tutorial.id] || Gamepad2;
            const duration = getEstimatedDuration(tutorial);
            const isCompleted = status === 'completed';
            const isLocked = status === 'locked';

            return (
              <Card 
                key={tutorial.id}
                className={`relative transition-all duration-200 ${
                  isCompleted ? 'border-green-500/50 bg-green-500/5' :
                  isLocked ? 'border-muted bg-muted/20' :
                  'border-primary/20 hover:border-primary/40 hover:shadow-lg'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${
                        isCompleted ? 'text-green-500' :
                        isLocked ? 'text-muted-foreground' :
                        'text-primary'
                      }`} />
                      <CardTitle className={`text-lg ${
                        isLocked ? 'text-muted-foreground' : ''
                      }`}>
                        {tutorial.name}
                      </CardTitle>
                    </div>
                    
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    )}
                    {isLocked && (
                      <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </div>

                  <CardDescription className="text-sm">
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Tutorial Info */}
                  <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>약 {duration}분</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      <span>{tutorial.steps.length}단계</span>
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {tutorial.prerequisite && tutorial.prerequisite.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">선행 조건:</p>
                      <div className="flex flex-wrap gap-1">
                        {tutorial.prerequisite.map((prereq) => {
                          const isPrereqCompleted = completedTutorials.includes(prereq);
                          const prereqTutorial = availableTutorials.find(t => t.id === prereq);
                          
                          return (
                            <Badge 
                              key={prereq}
                              variant={isPrereqCompleted ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {prereqTutorial?.name || prereq}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => onStartTutorial(tutorial.id)}
                    disabled={isLocked}
                    className="w-full"
                    variant={isCompleted ? "outline" : "default"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isCompleted ? '다시 보기' : '시작하기'}
                  </Button>

                  {/* Locked message */}
                  {isLocked && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      선행 튜토리얼을 먼저 완료해주세요
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* First Visit Helper */}
        {tutorialCompletion.completed === 0 && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-1">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-primary mb-1">
                  처음 방문하셨나요? 👋
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  '기본 게임 방법' 튜토리얼부터 시작하여 QuickTap Arena의 모든 기능을 차근차근 배워보세요.
                  단 몇 분이면 게임의 모든 요소를 마스터할 수 있습니다!
                </p>
                <Button
                  onClick={() => onStartTutorial('basic-intro')}
                  size="sm"
                  className="text-sm"
                >
                  기본 게임 방법 시작하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

TutorialSelectionDialog.displayName = 'TutorialSelectionDialog';

export default TutorialSelectionDialog;