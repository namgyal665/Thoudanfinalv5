import { useState, useEffect } from "react";
import { 
  Plus, X, Check, ArrowRight, ArrowLeft, 
  Trophy, AlertCircle, ChevronDown, RotateCcw, 
  Gamepad2, Users, Banknote, HelpCircle, Save 
} from "lucide-react";
import { AppState, Profile, Screen, Game, Round, PayoutDetail, Payment } from "../types";
import { calculateGamePayouts, simplifyDebts } from "../utils";
import { motion, AnimatePresence } from "motion/react";

interface GameFlowProps {
  state: AppState;
  onUpdateState: (update: Partial<AppState>) => void;
  onNavigate: (screen: Screen) => void;
  profiles: Profile[];
  onFinishSession: () => void;
}

export function GameFlow({ state, onUpdateState, onNavigate, profiles, onFinishSession }: GameFlowProps) {
  const [tieModalVisible, setTieModalVisible] = useState(false);
  const [tiePositions, setTiePositions] = useState<Record<number, number>>({});

  // Helper to get selected profile
  const getProfile = (id: string) => profiles.find(p => p.id === id);

  if (state.screen === 'setup') {
    return <SetupScreen 
      state={state} 
      onUpdateState={onUpdateState} 
      profiles={profiles}
      onBack={() => onNavigate('home')}
      onStart={() => onNavigate('game')}
    />;
  }

  if (state.screen === 'game') {
    return <ActiveGameScreen 
      state={state} 
      onUpdateState={onUpdateState} 
      onFinishGame={() => onNavigate('endgame')}
    />;
  }

  if (state.screen === 'endgame') {
    return <EndGameScreen 
      state={state} 
      onUpdateState={onUpdateState}
      onNavigate={onNavigate}
      tiePositions={tiePositions}
      setTiePositions={setTiePositions}
      tieModalVisible={tieModalVisible}
      setTieModalVisible={setTieModalVisible}
    />;
  }

  if (state.screen === 'settle') {
    return <SettleScreen 
      state={state}
      onFinishSession={onFinishSession}
    />;
  }

  return null;
}

// --- SETUP SCREEN ---
function SetupScreen({ state, onUpdateState, profiles, onBack, onStart }: { state: AppState, onUpdateState: (u: any) => void, profiles: Profile[], onBack: () => void, onStart: () => void }) {
  const [guestName, setGuestName] = useState('');
  const [step, setStep] = useState(1); // 1: Players, 2: Rules, 3: Payouts

  const toggleProfile = (id: string) => {
    const newSpids = state.spids.includes(id) 
      ? state.spids.filter(i => i !== id) 
      : [...state.spids, id];
    if (newSpids.length + state.guests.length <= 5) {
      onUpdateState({ spids: newSpids });
    }
  };

  const addGuest = () => {
    if (guestName.trim() && state.spids.length + state.guests.length < 5) {
      onUpdateState({ guests: [...state.guests, guestName.trim()] });
      setGuestName('');
    }
  };

  const removeGuest = (idx: number) => {
    onUpdateState({ guests: state.guests.filter((_, i) => i !== idx) });
  };

  const canProceed = state.spids.length + state.guests.length >= 2;
  const totalPlayers = state.spids.length + state.guests.length;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="vibrant-gradient safe-top p-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-40">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60"><X size={24} /></button>
        <div className="flex gap-2">
           {[1, 2, 3].map(i => (
             <div key={i} className={`w-8 h-1 rounded-full transition-colors ${step >= i ? 'bg-white' : 'bg-white/20'}`} />
           ))}
        </div>
        <button 
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else if (canProceed) onStart();
          }}
          disabled={!canProceed}
          className={`flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-full transition-all ${
            canProceed ? 'bg-white text-primary shadow-lg active:scale-95' : 'bg-white/10 text-white/30'
          }`}
        >
          {step === 3 ? 'Start' : 'Next'} <ArrowRight size={14} />
        </button>
      </div>

      <div className="flex-1 scroll-container p-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Pick Players</h2>
             <p className="text-gray-400 mb-8 font-medium">Select 2–5 players for this session.</p>

             <div className="space-y-6">
                {/* Guest Entry */}
                <div className="relative">
                   <div className="absolute inset-y-0 left-4 flex items-center text-gray-300">
                      <Plus size={20} />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Add guest name..."
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addGuest()}
                      className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-900 outline-hidden focus:ring-2 focus:ring-primary/20"
                   />
                </div>

                {/* Selected Count */}
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Participants ({totalPlayers}/5)</h3>
                </div>

                {/* Guests List */}
                <div className="flex flex-wrap gap-2">
                   {state.guests.map((g, i) => (
                     <div key={i} className="bg-gray-100 py-2 px-4 rounded-full flex items-center gap-2 font-bold text-gray-700 animate-in fade-in zoom-in slide-in-from-left-4">
                        {g}
                        <button onClick={() => removeGuest(i)} className="text-gray-400"><X size={14} /></button>
                     </div>
                   ))}
                </div>

                {/* Profiles List */}
                <div className="grid grid-cols-2 gap-3">
                   {profiles.map(p => {
                     const isSelected = state.spids.includes(p.id);
                     return (
                       <button
                         key={p.id}
                         onClick={() => toggleProfile(p.id)}
                         className={`relative p-4 rounded-3xl border text-left transition-all ${
                           isSelected 
                            ? 'bg-primary border-primary text-white shadow-lg' 
                            : 'bg-white border-gray-100 text-gray-900'
                         }`}
                       >
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border-2 ${isSelected ? 'border-white/20' : 'border-gray-50'}`} style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : undefined }}>
                               {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                            </div>
                            <span className="font-bold text-xs truncate max-w-[80px]">{p.name}</span>
                         </div>
                         {isSelected && <div className="absolute top-2 right-2"><Check size={14} /></div>}
                       </button>
                     );
                   })}
                </div>
             </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Game Style</h2>
             <p className="text-gray-400 mb-8 font-medium">How do you want to win?</p>

             <div className="space-y-4">
               <button 
                  onClick={() => onUpdateState({ wc: '1000' })}
                  className={`w-full p-6 rounded-[32px] border flex items-center gap-6 text-left transition-all ${
                   state.wc === '1000' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-white border-gray-100 opacity-60'
                  }`}
               >
                 <div className="bg-primary text-white p-4 rounded-2xl shadow-lg">
                   <Trophy size={24} />
                 </div>
                 <div className="flex-1">
                   <p className="font-black text-xl text-gray-900 uppercase tracking-tighter">Target 1000</p>
                   <p className="text-xs text-gray-400 font-medium">Game ends as soon as someone hits 1000 points. Bonus multiplier for exact hits!</p>
                 </div>
                 {state.wc === '1000' && <div className="text-primary"><Check size={24} strokeWidth={3} /></div>}
               </button>

               <button 
                  onClick={() => onUpdateState({ wc: 'high' })}
                  className={`w-full p-6 rounded-[32px] border flex items-center gap-6 text-left transition-all ${
                   state.wc === 'high' ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-white border-gray-100 opacity-60'
                  }`}
               >
                 <div className="bg-gray-100 text-gray-400 p-4 rounded-2xl">
                   <Gamepad2 size={24} />
                 </div>
                 <div className="flex-1">
                   <p className="font-black text-xl text-gray-900 uppercase tracking-tighter">High Score</p>
                   <p className="text-xs text-gray-400 font-medium">No limit. Play as many rounds as you want and finish whenever you like.</p>
                 </div>
                 {state.wc === 'high' && <div className="text-primary"><Check size={24} strokeWidth={3} /></div>}
               </button>
             </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Stakes</h2>
             <p className="text-gray-400 mb-8 font-medium">Configure payouts based on finishing positions.</p>

             <div className="space-y-4">
                {[...Array(totalPlayers)].map((_, i) => {
                  const rank = i; // 0 is lowest rank
                  const isWinner = rank === totalPlayers - 1;
                  const label = isWinner ? "Winner" : (rank === 0 ? "Last Place" : `${totalPlayers - rank}th Place`);
                  
                  return (
                    <div key={i} className={`p-5 rounded-[28px] border-b-4 flex items-center justify-between ${
                      isWinner ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          isWinner ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {isWinner ? <Trophy size={18} /> : totalPlayers - rank}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{label}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isWinner ? 'Collects' : 'Pays Output'}</p>
                        </div>
                      </div>
                      
                      {!isWinner ? (
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                          <span className="text-gray-400 font-bold ml-2">€</span>
                          <input 
                            type="number" 
                            step="0.5"
                            value={state.po[`p${rank}`] ?? 0}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value) || 0;
                              onUpdateState({ po: { ...state.po, [`p${rank}`]: v } });
                            }}
                            className="w-16 bg-transparent text-center font-black text-gray-900 outline-hidden"
                          />
                        </div>
                      ) : (
                        <div className="text-primary font-black text-lg mr-2 uppercase tracking-tighter">Collects All</div>
                      )}
                    </div>
                  );
                })}

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 mt-6">
                   <AlertCircle size={18} className="text-blue-500 shrink-0" />
                   <p className="text-[10px] font-bold text-blue-700 leading-normal uppercase">
                     Multipliers: 0/Negative Score pays 2x. Exact 1000 Win collected as 2x from everyone.
                   </p>
                </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- ACTIVE GAME SCREEN ---
function ActiveGameScreen({ state, onUpdateState, onFinishGame }: { state: AppState, onUpdateState: (u: any) => void, onFinishGame: () => void }) {
  const [roundPoints, setRoundPoints] = useState<Record<number, string>>({});
  const players = [...state.spids.map(id => state.profiles.find(p => p.id === id)?.name || 'Unknown'), ...state.guests];
  const scores = players.map((_, i) => {
    let score = 0;
    state.games[state.games.length - 1]?.rounds.forEach(r => { // wait, games list is for past.
       // We need a context for current game scores. 
       // For now, let's assume cg stores current game.
    });
    // Implementation refinement: calculate from current game "cg"
    return state.cg?.rounds.reduce((acc, r) => acc + (r.points[i] || 0), 0) || 0;
  });

  const totalNonDeclarerPoints = players.reduce((sum, _, i) => {
    if (state.ds[i] === 'none') {
      return sum + (parseInt(roundPoints[i] || '0') || 0);
    }
    return sum;
  }, 0);

  const hasSuccess = Object.values(state.ds).includes('success');
  const hasFail = Object.values(state.ds).includes('fail');
  const isDeclarationRound = hasSuccess || hasFail;

  const isValid = () => {
    if (hasSuccess) return true; // Success is auto-handled
    if (hasFail) {
      // Non-declarers must be 0-360
      return players.every((_, i) => {
        if (state.ds[i] === 'fail') return true;
        const pts = parseInt(roundPoints[i] || '0') || 0;
        return pts >= 0 && pts <= 360;
      });
    }
    // Normal round
    return totalNonDeclarerPoints === 360;
  };

  const handleConfirmRound = () => {
    if (!isValid()) return;

    const finalRoundPoints: Record<number, number> = {};
    players.forEach((_, i) => {
      if (hasSuccess) {
        if (state.ds[i] === 'success') finalRoundPoints[i] = 720;
        else if (state.ds[i] === 'fail') finalRoundPoints[i] = -360;
        else finalRoundPoints[i] = 0;
      } else if (hasFail) {
        if (state.ds[i] === 'fail') finalRoundPoints[i] = -360;
        else finalRoundPoints[i] = parseInt(roundPoints[i] || '0') || 0;
      } else {
        finalRoundPoints[i] = parseInt(roundPoints[i] || '0') || 0;
      }
    });

    const newRound: Round = { points: finalRoundPoints, ds: { ...state.ds } };
    const updatedGame = { ...state.cg!, rounds: [...state.cg!.rounds, newRound] };
    
    // Check win condition
    const newScores = players.map((_, i) => 
      updatedGame.rounds.reduce((acc, r) => acc + (r.points[i] || 0), 0)
    );

    onUpdateState({ 
      cg: updatedGame, 
      cr: state.cr + 1, 
      ds: {} 
    });
    setRoundPoints({});

    if (state.wc === '1000' && newScores.some(s => s >= 1000)) {
       onFinishGame();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-ios">
      <div className="vibrant-gradient safe-top p-4 border-b border-white/10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
           <div className="bg-white/20 text-white w-20 h-7 rounded-full flex items-center justify-center font-bold text-[10px] uppercase tracking-widest">ROUND {state.cr}</div>
        </div>
        <button 
          onClick={() => { if(confirm('End game and view leaderboard?')) onFinishGame(); }}
          className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/10 px-3 py-1.5 rounded-full"
        >
          Finish Game
        </button>
      </div>

      <div className="flex-1 scroll-container p-4 pb-40">
        {/* Simplified Leaderboard Mini */}
        <div className="grid grid-cols-4 gap-2 mb-6">
           {players.map((name, i) => (
             <div key={i} className={`bg-white p-2 rounded-xl text-center shadow-xs border ${scores[i] < 0 ? 'border-rose-100' : 'border-gray-50'}`}>
                <div className="w-8 h-8 rounded-full mx-auto mb-1 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                  {name.charAt(0)}
                </div>
                <p className="text-sm font-bold tracking-tight">{scores[i]}</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase truncate">{name}</p>
             </div>
           ))}
        </div>

        <div className="space-y-4">
          {players.map((name, i) => (
            <div key={i} className="player-entry-card bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center font-bold text-sm text-gray-400">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{name}</p>
                    </div>
                 </div>
                 {state.ds[i] === 'none' && !hasSuccess && (
                   <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={roundPoints[i] ?? ''}
                        onChange={e => setRoundPoints({ ...roundPoints, [i]: e.target.value })}
                        className="w-20 h-9 bg-gray-50 rounded-lg text-right px-3 font-bold text-lg text-primary outline-hidden ring-1 ring-gray-200 focus:ring-primary/40"
                      />
                   </div>
                 )}
              </div>
              
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
                 {(['none', 'success', 'fail'] as const).map(mode => (
                   <button
                     key={mode}
                     onClick={() => onUpdateState({ ds: { ...state.ds, [i]: mode } })}
                     className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                       (state.ds[i] || 'none') === mode 
                        ? (mode === 'success' ? 'bg-primary text-white shadow-md' : mode === 'fail' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-gray-900 shadow-sm')
                        : 'text-gray-400'
                     }`}
                   >
                     {mode === 'none' ? 'None' : mode === 'success' ? 'Won' : 'Fail'}
                   </button>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Panel */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-bottom">
         <div className="flex items-center justify-between mb-4">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${isValid() ? 'bg-emerald-50 text-primary' : 'bg-rose-50 text-rose-500'}`}>
               {hasSuccess ? 'Success: +720' : (hasFail ? 'Declarations Fail' : (`Total: ${totalNonDeclarerPoints} / 360`))}
            </div>
            <button
               onClick={handleConfirmRound}
               disabled={!isValid()}
               className={`px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md active:scale-95 ${
                 isValid() ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
               }`}
            >
               Confirm
            </button>
         </div>
         <AnimatePresence>
            {!isValid() && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-rose-50 text-rose-500 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide border border-rose-100"
              >
                <AlertCircle size={14} /> 
                {hasFail ? 'Invalid: Points must be 0-360 for each non-declarer.' : 'Wait! Points must total exactly 360 to confirm.'}
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

// --- ENDGAME SCREEN ---
function EndGameScreen({ 
  state, onUpdateState, onNavigate, 
  tiePositions, setTiePositions, 
  tieModalVisible, setTieModalVisible 
}: any) {
  const players = [...state.spids.map((id: string) => state.profiles.find(p => p.id === id)?.name || 'Unknown'), ...state.guests];
  const finalScores = players.map((_, i) => 
    state.cg?.rounds.reduce((acc: number, r: any) => acc + (r.points[i] || 0), 0) || 0
  );

  // Group by score to find ties
  const scoreMap: Record<number, number[]> = {};
  finalScores.forEach((s, i) => {
    if (!scoreMap[s]) scoreMap[s] = [];
    scoreMap[s].push(i);
  });
  
  const hasTie = Object.values(scoreMap).some(indices => indices.length > 1);
  const ties = Object.values(scoreMap).filter(indices => indices.length > 1);

  const handleFinish = () => {
    // Check if ties are resolved
    if (hasTie && Object.keys(tiePositions).length < players.length) {
      setTieModalVisible(true);
      return;
    }

    // Calculate payouts
    const { payouts, winnerIndex } = calculateGamePayouts(finalScores, players, state.po, state.wc);
    
    // Create game record
    const gameRecord: Game = {
       id: crypto.randomUUID(),
       players: players,
       finalScores: finalScores,
       rounds: state.cg!.rounds,
       payouts: payouts,
       date: new Date().toISOString(),
       winnerIndex: winnerIndex
    };

    const newGames = [...state.games, gameRecord];
    onUpdateState({ games: newGames, cg: null, cr: 1 });
    
    if (state.mode === 'single') {
       onNavigate('settle');
    } else {
       // Session mode: Stay in some screen? Use state.games to show summary
    }
  };

  const sortedIndices = [...finalScores.keys()].sort((a, b) => finalScores[b] - finalScores[a]);

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      <div className="p-8 text-center bg-white rounded-b-[48px] shadow-sm pb-12">
         <div className="vibrant-gradient p-5 rounded-[32px] mb-4 inline-block shadow-lg">
            <Trophy size={48} className="text-white" />
         </div>
         <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tighter">Standings</h1>
         <p className="text-text-muted font-bold uppercase tracking-widest text-[10px] mt-2">Final Results</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 -mt-6 pb-24">
         <div className="space-y-3">
            {sortedIndices.map((idx, rank) => {
               const isWinner = rank === 0;
               return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rank * 0.1 }}
                    className={`p-6 rounded-[32px] flex items-center justify-between shadow-xs border ${
                      isWinner ? 'bg-primary border-primary text-white scale-105 z-10' : 'bg-white border-gray-100 text-gray-900'
                    }`}
                  >
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${isWinner ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                           {rank + 1}
                        </div>
                        <div>
                           <p className="font-black text-xl uppercase tracking-tight">{players[idx]}</p>
                           <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isWinner ? 'text-white/60' : 'text-gray-300'}`}>Points</p>
                        </div>
                     </div>
                     <p className="text-3xl font-black tracking-tighter">{finalScores[idx]}</p>
                  </motion.div>
               );
            })}
         </div>

         {hasTie && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mt-6 flex items-center gap-3 text-amber-700">
               <HelpCircle size={20} className="shrink-0" />
               <p className="text-xs font-bold leading-tight">Wait! There's a tie. Please manually resolve final positions to continue.</p>
            </div>
         )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100 safe-bottom">
         <button 
           onClick={handleFinish}
           className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-transform"
         >
           {state.mode === 'single' ? 'Finish & Settle' : 'Save Game'}
         </button>
      </div>

      {/* Tie Resolution Bottom Sheet */}
      <AnimatePresence>
         {tieModalVisible && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setTieModalVisible(false)}
                 className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                 transition={{ type: 'spring', damping: 20 }}
                 className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[48px] z-[70] p-8 pb-12 safe-bottom"
               >
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                  <h3 className="text-2xl font-black text-gray-900 text-center uppercase tracking-tighter mb-2">Resolve Ties</h3>
                  <p className="text-center text-gray-400 text-sm font-medium mb-8">Manually assign positions for tied players.</p>
                  
                  <div className="space-y-4">
                     {players.map((name, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                           <span className="font-bold text-gray-900">{name}</span>
                           <div className="relative">
                              <select 
                                value={tiePositions[i] || ''} 
                                onChange={e => setTiePositions({ ...tiePositions, [i]: parseInt(e.target.value) })}
                                className="appearance-none bg-white font-black text-xs uppercase tracking-widest py-2 pl-4 pr-10 rounded-xl border border-gray-100 shadow-xs"
                              >
                                <option value="">Pick Rank</option>
                                {players.map((_, r) => (
                                   <option key={r} value={r + 1}>{r + 1}{r === 0 ? 'st' : r === 1 ? 'nd' : r === 2 ? 'rd' : 'th'}</option>
                                ))}
                              </select>
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                           </div>
                        </div>
                     ))}
                  </div>

                  <button 
                    onClick={() => setTieModalVisible(false)}
                    className="w-full bg-primary text-white py-4 rounded-2xl mt-8 font-black uppercase tracking-widest text-xs shadow-lg"
                  >
                    Set Final Positions
                  </button>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </div>
  );
}

// --- SETTLE SCREEN ---
function SettleScreen({ state, onFinishSession }: any) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const net: Record<string, number> = {};
    state.games.forEach((game: Game) => {
       game.payouts.forEach(p => {
          net[p.from] = (net[p.from] || 0) - p.amount;
          net[p.to] = (net[p.to] || 0) + p.amount;
       });
    });
    setBalances(net);
    setPayments(simplifyDebts(net, state.sessions[0]?.id || 'new'));
  }, [state.games, state.sessions]);

  const togglePaid = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, paid: !p.paid } : p));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="vibrant-gradient safe-top p-6 border-b border-white/10 text-center">
         <h2 className="text-2xl font-extrabold text-white uppercase tracking-tighter">Settlement</h2>
         <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] mt-1">Net Outcome</p>
      </div>

      <div className="flex-1 scroll-container p-6 pb-32">
         {/* Net Balances */}
         <div className="grid grid-cols-2 gap-3 mb-8">
            {Object.entries(balances).map(([name, bal]) => {
              const b = bal as number;
              return (
                <div key={name} className="vibrant-card p-4 shadow-sm">
                   <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1 truncate">{name}</p>
                   <p className={`text-xl font-bold tracking-tighter ${b >= 0 ? (b === 0 ? 'text-gray-300' : 'text-primary') : 'text-error'}`}>
                      {b > 0 && '+'}{b.toFixed(2)}€
                   </p>
                </div>
              );
            })}
         </div>

         <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Transactions</h3>
            {payments.length > 0 ? (
               payments.map(p => (
                 <button 
                  key={p.id}
                  onClick={() => togglePaid(p.id)}
                  className={`w-full p-5 rounded-[32px] border flex items-center justify-between transition-all ${
                    p.paid ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-primary shadow-lg ring-1 ring-primary'
                  }`}
                 >
                    <div className="flex items-center gap-4 flex-1">
                       <div className="text-left flex-1 min-w-0">
                          <p className="font-black text-gray-900 uppercase tracking-tight truncate">{p.from}</p>
                          <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Pays</p>
                       </div>
                       <ArrowRight size={16} className={p.paid ? 'text-gray-300' : 'text-primary'} />
                       <div className="text-left flex-1 min-w-0">
                          <p className="font-black text-gray-900 uppercase tracking-tight truncate">{p.to}</p>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">To</p>
                       </div>
                    </div>
                    <div className="text-right ml-4">
                       <p className={`text-2xl font-black tracking-tighter ${p.paid ? 'text-gray-400' : 'text-gray-900'}`}>{p.amount.toFixed(2)}€</p>
                       <div className={`mt-1 flex items-center justify-end gap-1.5 ${p.paid ? 'text-primary' : 'text-gray-300'}`}>
                          <Check size={14} strokeWidth={4} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{p.paid ? 'Paid' : 'Unpaid'}</span>
                       </div>
                    </div>
                 </button>
               ))
            ) : (
               <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center opacity-40">
                  <Banknote size={48} strokeWidth={1} />
                  <p className="mt-4 font-bold">No Debts</p>
               </div>
            )}
         </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-gray-50 via-gray-50 to-transparent safe-bottom">
         <button 
           onClick={() => onFinishSession()} // This should save session to history
           className="w-full bg-linear-to-r from-gray-900 to-gray-800 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3"
         >
           <Save size={20} />
           Complete & Archive
         </button>
      </div>
    </div>
  );
}
