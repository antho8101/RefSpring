
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { cn } from '@/lib/utils';

interface TourTooltipProps {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  nextButton?: string;
}

const TourTooltip = ({
  target,
  title,
  content,
  position,
  onNext,
  onPrevious,
  onSkip,
  currentStep,
  totalSteps,
  isFirst,
  isLast,
  nextButton
}: TourTooltipProps) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const targetElement = target === 'body' 
        ? document.body 
        : document.querySelector(target) as HTMLElement;
      
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = target === 'body' 
        ? { 
            top: window.innerHeight / 2, 
            left: window.innerWidth / 2, 
            width: 0, 
            height: 0,
            bottom: window.innerHeight / 2,
            right: window.innerWidth / 2,
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
          }
        : targetElement.getBoundingClientRect();
      
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 16;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom':
          top = targetRect.bottom + 16;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 16;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 16;
          break;
      }

      // Ajustements pour rester dans la viewport
      if (left < 16) left = 16;
      if (left + tooltipRect.width > window.innerWidth - 16) {
        left = window.innerWidth - tooltipRect.width - 16;
      }
      if (top < 16) top = 16;
      if (top + tooltipRect.height > window.innerHeight - 16) {
        top = window.innerHeight - tooltipRect.height - 16;
      }

      setTooltipPosition({ top, left });
      setIsVisible(true);

      // Highlight de l'élément cible
      if (target !== 'body' && targetElement) {
        targetElement.style.position = 'relative';
        targetElement.style.zIndex = '9999';
        targetElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        targetElement.style.borderRadius = '8px';
        targetElement.style.boxShadow = '0 0 0 2px rgb(59, 130, 246), 0 0 20px rgba(59, 130, 246, 0.3)';
        targetElement.style.transition = 'all 0.3s ease';
      }
    };

    // Attendre un peu pour que les éléments soient rendus
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      
      // Nettoyer le highlight
      const targetElement = document.querySelector(target) as HTMLElement;
      if (targetElement && target !== 'body') {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.backgroundColor = '';
        targetElement.style.borderRadius = '';
        targetElement.style.boxShadow = '';
        targetElement.style.transition = '';
      }
    };
  }, [target, position]);

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[10000] max-w-sm animate-scale-in"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
    >
      <Card className="shadow-2xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-blue-900">{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={(currentStep + 1) / totalSteps * 100} className="h-2" />
          <p className="text-xs text-slate-500">
            Étape {currentStep + 1} sur {totalSteps}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-slate-700 mb-4 leading-relaxed">{content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {!isFirst && (
                <Button variant="outline" size="sm" onClick={onPrevious}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-slate-500">
                <SkipForward className="h-4 w-4 mr-1" />
                Passer
              </Button>
            </div>
            
            <Button onClick={onNext} size="sm" className="bg-blue-600 hover:bg-blue-700">
              {nextButton || (isLast ? 'Terminer' : 'Suivant')}
              {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const GuidedTourOverlay = () => {
  const {
    isActive,
    currentStepData,
    currentStep,
    totalSteps,
    nextStep,
    previousStep,
    skipTour
  } = useGuidedTour();

  if (!isActive || !currentStepData) return null;

  return (
    <>
      {/* Overlay sombre */}
      <div className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in" />
      
      {/* Tooltip */}
      <TourTooltip
        target={currentStepData.target}
        title={currentStepData.title}
        content={currentStepData.content}
        position={currentStepData.position}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={skipTour}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isFirst={currentStep === 0}
        isLast={currentStep === totalSteps - 1}
        nextButton={currentStepData.nextButton}
      />
    </>
  );
};
