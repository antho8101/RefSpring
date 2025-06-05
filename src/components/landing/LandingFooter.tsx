

import { Globe, TrendingUp, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from 'react-i18next';

export const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
      
      <div className="mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="font-bold text-3xl text-white mb-4">RefSpring</div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              {t('hero.subtitle.normal')}
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <Globe className="w-5 h-5 text-slate-400" />
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                <TrendingUp className="w-5 h-5 text-slate-400" />
              </div>
              <a 
                href="https://github.com/antho8101/RefSpring" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Github className="w-5 h-5 text-slate-400" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/#features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link to="/#dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3 text-slate-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/status" className="hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400">&copy; 2024 RefSpring. All rights reserved.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-slate-800 rounded-xl p-3 shadow-lg border border-slate-700">
              <LanguageSelector variant="dark" />
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms</Link>
              <Link to="/security" className="text-slate-400 hover:text-white transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

