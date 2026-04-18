import { ArrowLeft, History as HistoryIcon, ChevronRight, Users, Calendar, Gamepad2, Info } from "lucide-react";
import { Session, Screen } from "../types";

interface HistoryProps {
  sessions: Session[];
  screen: Screen;
  historyId: string | null;
  onNavigate: (screen: Screen) => void;
  onViewHistory: (id: string) => void;
}

export function History({ sessions, screen, historyId, onNavigate, onViewHistory }: HistoryProps) {
  const session = sessions.find(s => s.id === historyId);

  if (screen === 'history-detail' && session) {
    return <HistoryDetail session={session} onBack={() => onNavigate('history')} />;
  }

  return (
    <div className="flex flex-col h-full bg-bg-ios">
      <div className="vibrant-gradient safe-top p-6 border-b border-white/10 rounded-b-[40px] shadow-lg mb-6 text-center">
         <h2 className="text-2xl font-extrabold text-white uppercase tracking-tighter">History</h2>
         <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Session Archive</p>
      </div>

      <div className="flex-1 scroll-container px-5 pb-24">
        {sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => onViewHistory(s.id)}
                className="vibrant-card w-full p-5 flex items-center justify-between transition-transform active:scale-98 text-left"
              >
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{new Date(s.date).toLocaleDateString()}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                      s.payments.every(p => p.paid) 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {s.payments.every(p => p.paid) ? 'Settled' : 'Pending'}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-gray-50 text-gray-400 border border-gray-100">
                      {s.mode}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 leading-tight">
                    {s.players.join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5 font-medium">
                    <Gamepad2 size={14} strokeWidth={2.5} />
                    {s.games.length} {s.games.length === 1 ? 'game' : 'games'} played
                  </p>
                </div>
                <ChevronRight size={24} className="text-gray-200" />
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
            <HistoryIcon size={64} strokeWidth={1} />
            <p className="font-black text-xl uppercase tracking-widest mt-4">NO SESSIONS</p>
            <p className="text-sm mt-2">Past games will be archived here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryDetail({ session, onBack }: { session: Session, onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white safe-top p-4 flex items-center gap-4 sticky top-0 z-40 border-b border-gray-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400"><ArrowLeft size={24} /></button>
        <h2 className="text-lg font-bold text-gray-900 border-l border-gray-100 pl-4 uppercase tracking-wider">Session Details</h2>
      </div>

      <div className="flex-1 scroll-container p-6 pb-24">
        {/* Session Meta */}
        <div className="bg-white rounded-[40px] p-8 shadow-xs border border-gray-100 mb-8">
           <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 p-4 rounded-3xl">
                <Calendar size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Session Date</p>
                <p className="text-xl font-black text-gray-900">{new Date(session.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
           </div>
           
           <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Players</span>
                <span className="text-sm font-bold text-gray-900">{session.players.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mode</span>
                <span className="text-sm font-bold text-gray-900 uppercase tracking-tighter">{session.mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Games</span>
                <span className="text-sm font-bold text-gray-900">{session.games.length}</span>
              </div>
           </div>
        </div>

        {/* Games Detail */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Games Played</h3>
          {session.games.map((game, idx) => (
            <div key={game.id} className="bg-white rounded-[32px] border border-gray-100 shadow-xs overflow-hidden">
               <div className="p-4 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
                  <span className="font-black text-xs text-gray-400 uppercase tracking-widest">Game {idx + 1}</span>
                  <span className="font-bold text-xs text-primary bg-primary/5 px-3 py-1 rounded-full uppercase">
                    Winner: {session.players[game.winnerIndex]}
                  </span>
               </div>
               <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-[9px] font-black text-gray-300 uppercase tracking-widest pb-3">Player</th>
                        <th className="text-right text-[9px] font-black text-gray-300 uppercase tracking-widest pb-3">Final Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {session.players.map((p, pIdx) => (
                        <tr key={pIdx}>
                          <td className="py-3 font-bold text-gray-700 text-sm">{p}</td>
                          <td className={`py-3 text-right font-black ${game.winnerIndex === pIdx ? 'text-primary' : 'text-gray-900'}`}>{game.finalScores[pIdx]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {game.payouts.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-50">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-4">Payouts</p>
                       <div className="space-y-3">
                          {game.payouts.map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between text-xs">
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">{p.from}</span>
                                  <span className="text-gray-300">→</span>
                                  <span className="font-bold text-gray-900">{p.to}</span>
                               </div>
                               <span className="font-black text-rose-500">{p.amount.toFixed(2)}€</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>
          ))}
        </div>

        {/* Settlement Summary */}
        <div className="mt-10 mb-10">
           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 mb-6">Final Settlement</h3>
           <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-xl">
              {session.payments.length > 0 ? (
                <div className="space-y-6">
                  {session.payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                       <div>
                          <p className="text-sm font-bold text-white mb-1"><span className="text-white/50">{p.from}</span> pays <span className="text-primary">{p.to}</span></p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${p.paid ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}`}>
                            {p.paid ? 'Done' : 'Pending'}
                          </span>
                       </div>
                       <p className="text-2xl font-black">{p.amount.toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center">
                   <Info size={40} className="text-white/20 mb-4" />
                   <p className="text-sm font-medium text-white/50 text-center">No transactions needed for this session.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
