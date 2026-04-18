import { Plus, Play, ChevronRight, AlertCircle, History as HistoryIcon } from "lucide-react";
import { Profile, Session, Screen } from "../types";
import { motion } from "motion/react";

interface HomeProps {
  sessions: Session[];
  profiles: Profile[];
  onStartGame: (mode: 'session' | 'single') => void;
  onNavigate: (screen: Screen) => void;
  unpaidDebtsCount: number;
}

export function Home({ sessions, profiles, onStartGame, onNavigate, unpaidDebtsCount }: HomeProps) {
  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-[#f2f2f7]">
      {/* Header */}
      <div className="vibrant-gradient text-white safe-top pb-10 px-6 rounded-b-[40px] shadow-lg text-center">
        <h1 className="text-2xl font-extrabold tracking-widest mt-4 uppercase">♠ THOUSAND</h1>
        <p className="opacity-70 text-[10px] font-bold uppercase tracking-widest mt-1">Professional Tracker</p>
      </div>

      <div className="px-5 mt-4 flex-1 scroll-container pb-32">
        {/* Unpaid Debts Banner */}
        {unpaidDebtsCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onNavigate('debts')}
            className="w-full bg-white border border-error/20 rounded-2xl p-4 mb-6 flex items-center gap-3 text-error shadow-sm"
          >
            <div className="bg-error/10 p-2 rounded-full">
              <AlertCircle size={20} className="text-error" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm uppercase tracking-tight">Pending Settlements</p>
              <p className="text-xs font-medium opacity-80">You have {unpaidDebtsCount} unpaid debts.</p>
            </div>
            <ChevronRight size={18} className="text-error/30" />
          </motion.button>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => onStartGame('single')}
            className="vibrant-card p-6 flex flex-col items-center gap-3 transition-transform active:scale-95"
          >
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Play size={24} className="text-primary fill-primary" />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest text-gray-900">Single Game</span>
          </button>
          <button
            onClick={() => onStartGame('session')}
            className="vibrant-card p-6 flex flex-col items-center gap-3 transition-transform active:scale-95"
          >
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Plus size={24} className="text-blue-600" />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest text-gray-900">New Session</span>
          </button>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Sessions</h2>
              <button 
                onClick={() => onNavigate('history')}
                className="text-primary text-sm font-semibold"
              >
                See All
              </button>
            </div>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onNavigate('history')} // In a real app, go to detail
                  className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between transition-transform active:scale-98 text-left"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date(session.date).toLocaleDateString()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        session.payments.every(p => p.paid) 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {session.payments.every(p => p.paid) ? 'Settled' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 line-clamp-1">
                      {session.players.join(', ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{session.games.length} {session.games.length === 1 ? 'game' : 'games'}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center text-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <HistoryIcon size={32} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-800">No sessions yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-[200px]">Start your first game to see history here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
