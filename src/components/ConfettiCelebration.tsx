
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiCelebrationProps {
  trigger?: boolean;
  onComplete?: () => void;
}

export const ConfettiCelebration = ({ trigger = true, onComplete }: ConfettiCelebrationProps) => {
  useEffect(() => {
    if (!trigger) return;

    const runConfetti = () => {
      // Confettis qui partent des deux côtés
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          onComplete?.();
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Confettis du côté gauche
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });

        // Confettis du côté droit
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Explosion centrale pour l'effet "YAY!"
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
        });
      }, 500);
    };

    // Petit délai pour que l'animation soit visible
    const timer = setTimeout(runConfetti, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [trigger, onComplete]);

  return null; // Ce composant ne rend rien visuellement
};
