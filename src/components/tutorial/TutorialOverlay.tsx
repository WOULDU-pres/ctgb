import React, { useEffect, useState, useCallback, memo, useRef, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, SkipForward, Play } from 'lucide-react';
import { TutorialStep } from '@/types/tutorial';
import { useFocusTrap } from '@/hooks/accessibility/useFocusTrap';
import { useKeyboardNavigation } from '@/hooks/accessibility/useKeyboardNavigation';
import { useAnnouncement } from '@/hooks/accessibility/useAnnouncement';

interface TutorialOverlayProps {
  step: TutorialStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onExit: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastStep: boolean;
}

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TutorialOverlay = memo(({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onExit,
  canGoNext,
  canGoPrevious,
  isLastStep
}: TutorialOverlayProps) => {
  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Refs for accessibility
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  
  // IDs for ARIA relationships
  const titleId = useId();
  const contentId = useId();
  const progressId = useId();
  
  // Accessibility hooks
  const { announcePolite, announceAssertive } = useAnnouncement();
  
  // Focus trap for modal behavior
  useFocusTrap(overlayRef, {
    isActive: true,
    initialFocus: nextButtonRef,
    restoreFocus: true
  });
  
  // Keyboard navigation
  useKeyboardNavigation({
    isActive: true,
    onEscape: onExit,
    onArrowLeft: canGoPrevious ? onPrevious : undefined,
    onArrowRight: canGoNext && step.action !== 'click' ? onNext : undefined,
    onEnter: canGoNext && step.action !== 'click' ? onNext : undefined,
    preventDefault: true
  });

  // Calculate highlight and tooltip positions
  const calculatePositions = useCallback(() => {
    if (!step.target) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Highlight position (absolute positioning)
    const highlight: HighlightPosition = {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };

    // Tooltip position based on step.position
    let tooltip = { top: 0, left: 0 };
    const tooltipOffset = 20;

    switch (step.position) {
      case 'top':
        tooltip = {
          top: highlight.top - tooltipOffset,
          left: highlight.left + highlight.width / 2
        };
        break;
      case 'bottom':
        tooltip = {
          top: highlight.top + highlight.height + tooltipOffset,
          left: highlight.left + highlight.width / 2
        };
        break;
      case 'left':
        tooltip = {
          top: highlight.top + highlight.height / 2,
          left: highlight.left - tooltipOffset
        };
        break;
      case 'right':
        tooltip = {
          top: highlight.top + highlight.height / 2,
          left: highlight.left + highlight.width + tooltipOffset
        };
        break;
      case 'center':
      default:
        tooltip = {
          top: window.innerHeight / 2 + scrollTop,
          left: window.innerWidth / 2 + scrollLeft
        };
        break;
    }

    setHighlightPosition(highlight);
    setTooltipPosition(tooltip);
  }, [step.target, step.position]);

  // Update positions on mount and resize
  useEffect(() => {
    calculatePositions();
    
    const handleResize = () => calculatePositions();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [calculatePositions]);

  // Auto-advance timer
  useEffect(() => {
    if (step.duration && step.action !== 'click') {
      const timer = setTimeout(() => {
        if (canGoNext) {
          onNext();
        }
      }, step.duration);

      return () => clearTimeout(timer);
    }
  }, [step.duration, step.action, canGoNext, onNext]);

  // Handle click on highlighted element
  useEffect(() => {
    if (step.action === 'click' && step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const handleClick = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          onNext();
        };

        targetElement.addEventListener('click', handleClick, { once: true });
        return () => {
          targetElement.removeEventListener('click', handleClick);
        };
      }
    }
  }, [step.action, step.target, onNext]);

  // Progress percentage
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
  
  // Announce step changes to screen readers
  useEffect(() => {
    const stepInfo = `튜토리얼 ${currentStepIndex + 1}단계 중 ${totalSteps}단계: ${step.title}`;
    announcePolite(stepInfo);
  }, [currentStepIndex, totalSteps, step.title, announcePolite]);
  
  // Announce progress changes
  useEffect(() => {
    const progressInfo = `진행률 ${Math.round(progressPercentage)}%`;
    announcePolite(progressInfo);
  }, [progressPercentage, announcePolite]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={contentId}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Highlight spotlight */}
      {highlightPosition && step.target && (
        <div
          className="absolute border-4 border-primary rounded-lg shadow-glow-primary pointer-events-auto"
          style={{
            top: highlightPosition.top - 4,
            left: highlightPosition.left - 4,
            width: highlightPosition.width + 8,
            height: highlightPosition.height + 8,
            background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(var(--primary), 0.8)'
          }}
          role="img"
          aria-label={`강조된 요소: ${step.title}에서 상호작용할 영역`}
        />
      )}

      {/* Tutorial tooltip */}
      {tooltipPosition && (
        <Card 
          className="absolute pointer-events-auto max-w-sm w-80 p-6 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: step.position === 'center' ? 'translate(-50%, -50%)' : 
                      step.position === 'left' ? 'translate(-100%, -50%)' :
                      step.position === 'right' ? 'translate(0, -50%)' :
                      step.position === 'top' ? 'translate(-50%, -100%)' :
                      'translate(-50%, 0)'
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 
              ref={titleRef}
              id={titleId}
              className="text-lg font-semibold text-foreground pr-4"
            >
              {step.title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="text-muted-foreground hover:text-foreground -mt-2 -mr-2"
              aria-label="튜토리얼 종료"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div 
              className="flex justify-between text-xs text-muted-foreground mb-2"
              aria-live="polite"
              aria-atomic="true"
            >
              <span>단계 {currentStepIndex + 1} / {totalSteps}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              aria-labelledby={progressId}
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
            <span id={progressId} className="sr-only">
              튜토리얼 진행률: {Math.round(progressPercentage)}%
            </span>
          </div>

          {/* Content */}
          <p 
            ref={contentRef}
            id={contentId}
            className="text-sm text-muted-foreground mb-6 leading-relaxed"
          >
            {step.content}
          </p>

          {/* Action hint */}
          {step.action === 'click' && (
            <div 
              className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-xs text-primary">
                <Play className="w-3 h-3" aria-hidden="true" />
                <span>위에서 강조된 요소를 클릭하세요</span>
              </div>
            </div>
          )}

          {step.action === 'wait' && step.duration && (
            <div 
              className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <div 
                  className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span>잠시 기다려주세요...</span>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-2" role="group" aria-label="튜토리얼 내비게이션">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="flex items-center gap-2"
              aria-label={`이전 단계로 이동 (${currentStepIndex}/${totalSteps})`}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              이전
            </Button>

            <div className="flex items-center gap-2">
              {step.skippable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="flex items-center gap-2 text-muted-foreground"
                  aria-label="현재 단계 건너뛰기"
                >
                  <SkipForward className="w-4 h-4" aria-hidden="true" />
                  건너뛰기
                </Button>
              )}

              <Button
                ref={nextButtonRef}
                onClick={onNext}
                disabled={!canGoNext || (step.action === 'click')}
                size="sm"
                className="flex items-center gap-2"
                aria-label={
                  isLastStep 
                    ? '튜토리얼 완료' 
                    : step.action === 'click' 
                      ? '강조된 요소를 클릭하여 계속 진행'
                      : `다음 단계로 이동 (${currentStepIndex + 2}/${totalSteps})`
                }
              >
                {isLastStep ? '완료' : '다음'}
                {!isLastStep && <ChevronRight className="w-4 h-4" aria-hidden="true" />}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

TutorialOverlay.displayName = 'TutorialOverlay';

export default TutorialOverlay;