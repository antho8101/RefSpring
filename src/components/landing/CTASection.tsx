
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

interface CTASectionProps {
  onRedirectToDashboard: () => void;
}

export const CTASection = ({ onRedirectToDashboard }: CTASectionProps) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-8">
          <Clock className="w-16 h-16 text-blue-200 mx-auto mb-4 animate-pulse" />
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Your competition is already here
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          While others pay monthly fees for uncertain results, smart companies are already earning with RefSpring's 
          performance-based model. Don't let them get ahead.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-12 py-6 bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all shadow-xl" 
            onClick={onRedirectToDashboard}
          >
            Start earning now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-slate-900 hover:scale-105 transition-all" 
            onClick={onRedirectToDashboard}
          >
            See live demo
          </Button>
        </div>
      </div>
    </section>
  );
};
