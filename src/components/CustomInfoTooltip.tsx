import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface CustomInfoTooltipProps {
  text: string;
}

export const CustomInfoTooltip = ({ text }: CustomInfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: false, left: '50%' });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Vérifier si le tooltip dépasse à droite
      const spaceRight = window.innerWidth - rect.right;
      const spaceLeft = rect.left;
      
      let newLeft = '50%';
      if (tooltipRect.width / 2 > spaceRight) {
        newLeft = 'auto';
      } else if (tooltipRect.width / 2 > spaceLeft) {
        newLeft = '0%';
      }
      
      // Vérifier si il y a de la place en haut
      const spaceTop = rect.top;
      const showOnTop = spaceTop > tooltipRect.height + 10;
      
      setPosition({ top: !showOnTop, left: newLeft });
    }
  }, [isVisible]);

  return (
    <div ref={triggerRef} className="relative inline-block">
      <HelpCircle 
        className="h-3 w-3 text-gray-500 cursor-help" 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`fixed px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg w-48 text-center pointer-events-none`}
          style={{
            zIndex: 9999,
            top: position.top ? 'auto' : '-40px',
            bottom: position.top ? '-40px' : 'auto',
            left: position.left === '50%' ? '50%' : position.left === 'auto' ? 'auto' : '0%',
            right: position.left === 'auto' ? '0px' : 'auto',
            transform: position.left === '50%' ? 'translateX(-50%)' : 'none',
          }}
        >
          {text}
          <div 
            className={`absolute w-0 h-0 border-l-4 border-r-4 border-transparent ${
              position.top 
                ? 'top-0 -mt-1 border-b-4 border-b-gray-900' 
                : 'bottom-0 -mb-1 border-t-4 border-t-gray-900'
            }`}
            style={{
              left: position.left === '50%' ? '50%' : position.left === 'auto' ? 'auto' : '24px',
              right: position.left === 'auto' ? '24px' : 'auto',
              transform: position.left === '50%' ? 'translateX(-50%)' : 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};