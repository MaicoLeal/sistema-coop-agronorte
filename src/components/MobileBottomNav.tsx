import React from 'react';
import { Home, Sprout, Package, History } from 'lucide-react';
import { Language } from '../types';

export type MobileTab = 'inicio' | 'cultivo' | 'cosecha' | 'historial' | 'mateo';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  lang?: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode; isSpecial?: boolean }[] = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'cultivo',
      label: 'Cultivo',
      icon: <Sprout className="w-5 h-5" />
    },
    {
      id: 'cosecha',
      label: 'Cosecha',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <History className="w-5 h-5" />
    },
    {
      id: 'mateo',
      label: 'Don Mateo',
      isSpecial: true,
      icon: (
        <div className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-emerald-500 shadow-xs bg-emerald-900 flex items-center justify-center">
          <img
            src="/assets/don-mateo/don-mateo-idle.jpg"
            alt="Don Mateo"
            className="w-full h-full object-cover scale-110"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white animate-pulse" />
        </div>
      )
    }
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Navegación Móvil Principal"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-all"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] py-1 px-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all select-none cursor-pointer active:scale-92 touch-manipulation ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                  : 'text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 scale-105'
                    : 'text-on-surface-variant'
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[11px] leading-none tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
