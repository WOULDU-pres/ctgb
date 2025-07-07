import { useState, useCallback, useEffect, useMemo } from 'react';
import { TutorialState, TutorialFlow, TutorialProgress, TutorialAction } from '@/types/tutorial';
import { tutorialFlows, getAvailableTutorials } from '@/data/tutorialFlows';

const TUTORIAL_STORAGE_KEY = 'ctgb_tutorial_progress';
const FIRST_VISIT_KEY = 'ctgb_first_visit';

const initialState: TutorialState = {
  isActive: false,
  currentStepIndex: 0,
  progress: [],
  showOnFirstVisit: true
};

export const useTutorial = () => {
  const [state, setState] = useState<TutorialState>(initialState);

  // Load tutorial progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
      
      if (savedProgress) {
        const progress: TutorialProgress[] = JSON.parse(savedProgress);
        setState(prev => ({
          ...prev,
          progress,
          showOnFirstVisit: isFirstVisit
        }));
      } else {
        setState(prev => ({
          ...prev,
          showOnFirstVisit: isFirstVisit
        }));
      }
    } catch (error) {
      console.error('Failed to load tutorial progress:', error);
    }
  }, []);

  // Save tutorial progress to localStorage
  const saveProgress = useCallback((progress: TutorialProgress[]) => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save tutorial progress:', error);
    }
  }, []);

  // Mark first visit as completed
  const markFirstVisitCompleted = useCallback(() => {
    try {
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
      setState(prev => ({ ...prev, showOnFirstVisit: false }));
    } catch (error) {
      console.error('Failed to mark first visit:', error);
    }
  }, []);

  // Get completed tutorial IDs
  const completedTutorials = useMemo(() => {
    return state.progress
      .filter(p => p.completed)
      .map(p => p.tutorialId);
  }, [state.progress]);

  // Get available tutorials based on prerequisites
  const availableTutorials = useMemo(() => {
    return getAvailableTutorials(completedTutorials);
  }, [completedTutorials]);

  // Check if first tutorial should be shown automatically
  const shouldShowFirstTutorial = useMemo(() => {
    return state.showOnFirstVisit && completedTutorials.length === 0;
  }, [state.showOnFirstVisit, completedTutorials.length]);

  // Tutorial dispatch function
  const dispatch = useCallback((action: TutorialAction) => {
    setState(prev => {
      switch (action.type) {
        case 'START_TUTORIAL': {
          markFirstVisitCompleted();
          
          const existingProgress = prev.progress.find(p => p.tutorialId === action.tutorial.id);
          let progress = [...prev.progress];
          
          if (!existingProgress) {
            progress.push({
              tutorialId: action.tutorial.id,
              currentStep: 0,
              completed: false,
              startedAt: new Date().toISOString()
            });
          }
          
          return {
            ...prev,
            isActive: true,
            currentTutorial: action.tutorial,
            currentStepIndex: existingProgress?.currentStep || 0,
            progress
          };
        }

        case 'NEXT_STEP': {
          if (!prev.currentTutorial) return prev;
          
          const nextStepIndex = prev.currentStepIndex + 1;
          const isCompleted = nextStepIndex >= prev.currentTutorial.steps.length;
          
          const updatedProgress = prev.progress.map(p => 
            p.tutorialId === prev.currentTutorial!.id
              ? {
                  ...p,
                  currentStep: isCompleted ? prev.currentTutorial!.steps.length - 1 : nextStepIndex,
                  completed: isCompleted,
                  completedAt: isCompleted ? new Date().toISOString() : p.completedAt
                }
              : p
          );
          
          saveProgress(updatedProgress);
          
          if (isCompleted) {
            return {
              ...prev,
              isActive: false,
              currentTutorial: undefined,
              currentStepIndex: 0,
              progress: updatedProgress
            };
          }
          
          return {
            ...prev,
            currentStepIndex: nextStepIndex,
            progress: updatedProgress
          };
        }

        case 'PREVIOUS_STEP': {
          if (!prev.currentTutorial || prev.currentStepIndex <= 0) return prev;
          
          const prevStepIndex = prev.currentStepIndex - 1;
          const updatedProgress = prev.progress.map(p => 
            p.tutorialId === prev.currentTutorial!.id
              ? { ...p, currentStep: prevStepIndex, completed: false }
              : p
          );
          
          saveProgress(updatedProgress);
          
          return {
            ...prev,
            currentStepIndex: prevStepIndex,
            progress: updatedProgress
          };
        }

        case 'SKIP_STEP': {
          // Same as NEXT_STEP for now
          return dispatch({ type: 'NEXT_STEP' });
        }

        case 'SET_STEP': {
          if (!prev.currentTutorial) return prev;
          
          const updatedProgress = prev.progress.map(p => 
            p.tutorialId === prev.currentTutorial!.id
              ? { ...p, currentStep: action.stepIndex }
              : p
          );
          
          saveProgress(updatedProgress);
          
          return {
            ...prev,
            currentStepIndex: action.stepIndex,
            progress: updatedProgress
          };
        }

        case 'COMPLETE_TUTORIAL': {
          if (!prev.currentTutorial) return prev;
          
          const updatedProgress = prev.progress.map(p => 
            p.tutorialId === prev.currentTutorial!.id
              ? {
                  ...p,
                  completed: true,
                  completedAt: new Date().toISOString()
                }
              : p
          );
          
          saveProgress(updatedProgress);
          
          return {
            ...prev,
            isActive: false,
            currentTutorial: undefined,
            currentStepIndex: 0,
            progress: updatedProgress
          };
        }

        case 'EXIT_TUTORIAL': {
          return {
            ...prev,
            isActive: false,
            currentTutorial: undefined,
            currentStepIndex: 0
          };
        }

        default:
          return prev;
      }
    });
  }, [markFirstVisitCompleted, saveProgress]);

  // Helper functions
  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = tutorialFlows.find(t => t.id === tutorialId);
    if (tutorial) {
      dispatch({ type: 'START_TUTORIAL', tutorial });
    }
  }, [dispatch]);

  const getCurrentStep = useCallback(() => {
    if (!state.currentTutorial) return null;
    return state.currentTutorial.steps[state.currentStepIndex] || null;
  }, [state.currentTutorial, state.currentStepIndex]);

  const canGoNext = useMemo(() => {
    const currentStep = getCurrentStep();
    return currentStep?.nextEnabled ?? true;
  }, [getCurrentStep]);

  const canGoPrevious = useMemo(() => {
    return state.currentStepIndex > 0;
  }, [state.currentStepIndex]);

  const isLastStep = useMemo(() => {
    if (!state.currentTutorial) return false;
    return state.currentStepIndex >= state.currentTutorial.steps.length - 1;
  }, [state.currentTutorial, state.currentStepIndex]);

  const tutorialCompletion = useMemo(() => {
    const total = tutorialFlows.length;
    const completed = completedTutorials.length;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [completedTutorials.length]);

  return {
    // State
    isActive: state.isActive,
    currentTutorial: state.currentTutorial,
    currentStepIndex: state.currentStepIndex,
    currentStep: getCurrentStep(),
    progress: state.progress,
    
    // Computed values
    availableTutorials,
    completedTutorials,
    shouldShowFirstTutorial,
    canGoNext,
    canGoPrevious,
    isLastStep,
    tutorialCompletion,
    
    // Actions
    startTutorial,
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    previousStep: () => dispatch({ type: 'PREVIOUS_STEP' }),
    skipStep: () => dispatch({ type: 'SKIP_STEP' }),
    setStep: (stepIndex: number) => dispatch({ type: 'SET_STEP', stepIndex }),
    completeTutorial: () => dispatch({ type: 'COMPLETE_TUTORIAL' }),
    exitTutorial: () => dispatch({ type: 'EXIT_TUTORIAL' }),
    
    // Utility
    getTutorialProgress: (tutorialId: string) => {
      return state.progress.find(p => p.tutorialId === tutorialId);
    },
    isTutorialCompleted: (tutorialId: string) => {
      return completedTutorials.includes(tutorialId);
    }
  };
};