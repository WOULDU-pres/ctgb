
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { allAchievements, Achievement, AchievementID } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

type AchievementsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unlockedIds: Set<AchievementID>;
};

export const AchievementsDialog = ({ open, onOpenChange, unlockedIds }: AchievementsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>업적</DialogTitle>
          <DialogDescription>
            달성한 업적 목록입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {allAchievements.map((achievement: Achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-all",
                  isUnlocked
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border bg-muted/50 text-muted-foreground"
                )}
              >
                <achievement.Icon
                  className={cn(
                    "h-10 w-10 shrink-0",
                    isUnlocked ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div>
                  <h3 className={cn(
                    "font-semibold text-lg",
                    isUnlocked ? "text-primary" : "text-foreground"
                  )}>{achievement.name}</h3>
                  <p className="text-sm">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
