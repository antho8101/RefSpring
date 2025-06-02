
import { DollarSign, TrendingUp, Zap, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export const DashboardBackground = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Background Elements - Hidden on mobile for performance */}
      <div className="fixed inset-0 pointer-events-none hidden lg:block">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * -0.05}px)` }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] animate-pulse pointer-events-none opacity-30 lg:opacity-100"></div>

      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <DollarSign 
          className="absolute top-1/4 left-1/4 w-8 h-8 text-green-500/10 animate-bounce" 
          style={{ animationDelay: '0s', animationDuration: '3s' }}
        />
        <TrendingUp 
          className="absolute top-1/3 right-1/3 w-6 h-6 text-blue-500/10 animate-bounce" 
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <Zap 
          className="absolute bottom-1/3 left-1/5 w-7 h-7 text-purple-500/10 animate-bounce" 
          style={{ animationDelay: '2s', animationDuration: '3.5s' }}
        />
        <Globe 
          className="absolute top-1/5 right-1/5 w-9 h-9 text-indigo-500/10 animate-bounce" 
          style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}
        />
      </div>
    </>
  );
};
