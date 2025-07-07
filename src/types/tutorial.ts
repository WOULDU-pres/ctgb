/**
 * 인터랙티브 튜토리얼 시스템 타입 정의
 */

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'wait' | 'input' | 'none';
  duration?: number; // Auto-advance duration in ms
  skippable?: boolean;
  nextEnabled?: boolean;
}

export interface TutorialFlow {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  gameMode?: string; // Associated game mode
  prerequisite?: string[]; // Required completed tutorials
}

export interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface TutorialState {
  isActive: boolean;
  currentTutorial?: TutorialFlow;
  currentStepIndex: number;
  progress: TutorialProgress[];
  showOnFirstVisit: boolean;
}

export type TutorialAction = 
  | { type: 'START_TUTORIAL'; tutorial: TutorialFlow }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_STEP' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'EXIT_TUTORIAL' }
  | { type: 'SET_STEP'; stepIndex: number };