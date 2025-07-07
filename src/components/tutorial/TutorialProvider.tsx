import React, { createContext, useContext, useState, useEffect, memo } from 'react';
import { useTutorial } from '@/hooks/useTutorial';
import TutorialOverlay from './TutorialOverlay';
import TutorialSelectionDialog from './TutorialSelectionDialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface TutorialContextType {
  openTutorialSelection: () => void;
  startTutorial: (tutorialId: string) => void;
  isActive: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider = memo(({ children }: TutorialProviderProps) => {
  const tutorial = useTutorial();
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);

  // Auto-show tutorial on first visit
  useEffect(() => {
    if (tutorial.shouldShowFirstTutorial) {
      const timer = setTimeout(() => {
        setShowSelectionDialog(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [tutorial.shouldShowFirstTutorial]);

  const openTutorialSelection = () => {
    setShowSelectionDialog(true);
  };

  const startTutorial = (tutorialId: string) => {
    tutorial.startTutorial(tutorialId);
    setShowSelectionDialog(false);
  };

  const contextValue: TutorialContextType = {
    openTutorialSelection,
    startTutorial,
    isActive: tutorial.isActive
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      
      {/* Tutorial Overlay */}
      {tutorial.isActive && tutorial.currentStep && (
        <TutorialOverlay
          step={tutorial.currentStep}
          currentStepIndex={tutorial.currentStepIndex}
          totalSteps={tutorial.currentTutorial?.steps.length || 0}
          onNext={tutorial.nextStep}
          onPrevious={tutorial.previousStep}
          onSkip={tutorial.skipStep}
          onExit={tutorial.exitTutorial}
          canGoNext={tutorial.canGoNext}
          canGoPrevious={tutorial.canGoPrevious}
          isLastStep={tutorial.isLastStep}
        />
      )}

      {/* Tutorial Selection Dialog */}
      <TutorialSelectionDialog
        open={showSelectionDialog}
        onOpenChange={setShowSelectionDialog}
        availableTutorials={tutorial.availableTutorials}
        completedTutorials={tutorial.completedTutorials}
        tutorialCompletion={tutorial.tutorialCompletion}
        onStartTutorial={startTutorial}
      />
    </TutorialContext.Provider>
  );
});

TutorialProvider.displayName = 'TutorialProvider';

// Tutorial help button component
export const TutorialHelpButton = memo(() => {
  const context = useContext(TutorialContext);
  
  if (!context) {
    console.warn('TutorialHelpButton must be used within TutorialProvider');
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={context.openTutorialSelection}
      className="text-muted-foreground hover:text-foreground"
      title="튜토리얼 보기"
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  );
});

TutorialHelpButton.displayName = 'TutorialHelpButton';

// Hook to access tutorial context
export const useTutorialContext = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorialContext must be used within TutorialProvider');
  }
  return context;
};

export default TutorialProvider;