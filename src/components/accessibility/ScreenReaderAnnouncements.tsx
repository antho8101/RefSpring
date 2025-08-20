import { useAccessibility } from '@/hooks/useAccessibility';

export const ScreenReaderAnnouncements = () => {
  const { announcements } = useAccessibility();

  return (
    <>
      {/* Polite announcements */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        id="polite-announcements"
      >
        {announcements
          .filter(a => a.priority === 'polite')
          .map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))
        }
      </div>

      {/* Assertive announcements */}
      <div 
        className="sr-only" 
        aria-live="assertive" 
        aria-atomic="true"
        id="assertive-announcements"
      >
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))
        }
      </div>
    </>
  );
};