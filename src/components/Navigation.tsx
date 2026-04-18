import { 
  Home as HomeIcon, 
  Users, 
  Wallet, 
  History as HistoryIcon 
} from "lucide-react";
import { Screen } from "../types";

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  show: boolean;
}

export function Navigation({ currentScreen, onNavigate, show }: NavigationProps) {
  if (!show) return null;

  const tabs: { id: Screen; icon: any; label: string }[] = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'profiles', icon: Users, label: 'Profiles' },
    { id: 'debts', icon: Wallet, label: 'Debts' },
    { id: 'history', icon: HistoryIcon, label: 'History' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-black/5 flex justify-around items-center h-[64px] z-50 safe-bottom">
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id || 
                        (tab.id === 'profiles' && ['profile-edit', 'profile-view'].includes(currentScreen)) ||
                        (tab.id === 'history' && currentScreen === 'history-detail');
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive ? 'text-primary' : 'text-text-muted'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 font-semibold tracking-wide ${isActive ? '' : 'opacity-80'}`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
