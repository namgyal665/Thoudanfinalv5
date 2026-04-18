/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AppState, Screen, Profile, Session, Game } from "./types";
import { Navigation } from "./components/Navigation";
import { Home } from "./components/Home";
import { Profiles } from "./components/Profiles";
import { GameFlow } from "./components/GameFlow";
import { Debts } from "./components/Debts";
import { History } from "./components/History";
import { simplifyDebts } from "./utils";

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    let savedProfiles: Profile[] = [];
    let savedSessions: Session[] = [];
    
    try {
      const p = localStorage.getItem('t_prof');
      if (p) savedProfiles = JSON.parse(p);
      const s = localStorage.getItem('t_sess');
      if (s) savedSessions = JSON.parse(s);
    } catch (e) {
      console.error("Failed to parse localStorage", e);
    }
    
    return {
      screen: 'home',
      mode: 'single',
      wc: '1000',
      gp: [],
      po: { p0: 5, p1: 0, p2: 0, p3: 0, p4: 0 },
      games: [],
      cg: null,
      cr: 1,
      ds: {},
      sessions: Array.isArray(savedSessions) ? savedSessions : [],
      profiles: Array.isArray(savedProfiles) ? savedProfiles : [],
      pp: [],
      spids: [],
      guests: [],
      vid: null,
      eid: null,
      eph: null,
      ec: 0,
      historyId: null
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('t_prof', JSON.stringify(state.profiles));
    localStorage.setItem('t_sess', JSON.stringify(state.sessions));
  }, [state.profiles, state.sessions]);

  const updateState = (update: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...update }));
  };

  const navigate = (screen: Screen) => updateState({ screen });

  const startNewGame = (mode: 'session' | 'single') => {
    updateState({ 
      mode, 
      screen: 'setup', 
      games: [], 
      cg: { id: crypto.randomUUID(), players: [], finalScores: [], rounds: [], payouts: [], date: new Date().toISOString(), winnerIndex: -1 },
      cr: 1,
      ds: {},
      spids: [],
      guests: []
    });
  };

  const saveProfile = (p: Partial<Profile>) => {
    if (p.id) {
      // Update existing
      updateState({
        profiles: state.profiles.map(item => item.id === p.id ? { ...item, ...p } as Profile : item)
      });
    } else {
      // New profile
      const newProfile: Profile = {
        id: crypto.randomUUID(),
        name: p.name!,
        bio: p.bio || '',
        colorIdx: p.colorIdx || 0,
        photo: p.photo || null,
        wins: 0,
        games: 0,
        mw: 0,
        ml: 0
      };
      updateState({ profiles: [...state.profiles, newProfile] });
    }
  };

  const deleteProfile = (id: string) => {
    updateState({ profiles: state.profiles.filter(p => p.id !== id) });
  };

  const finishSession = () => {
    // Collect all games and consolidated payments
    // Calculate final outcome
    const session: Session = {
       id: crypto.randomUUID(),
       date: new Date().toISOString(),
       mode: state.mode,
       players: [...state.spids.map(id => state.profiles.find(p => p.id === id)?.name || 'Unknown'), ...state.guests],
       games: state.games,
       payoutConfig: state.po,
       payments: [] // This will be the simplified debts
    };

    // Calculate balances across all games in this session
    const balances: Record<string, number> = {};
    state.games.forEach(game => {
       game.payouts.forEach(p => {
          balances[p.from] = (balances[p.from] || 0) - p.amount;
          balances[p.to] = (balances[p.to] || 0) + p.amount;
       });
    });

    const sessionPayments = simplifyDebts(balances, session.id);
    session.payments = sessionPayments;
    
    const newSessions = [session, ...state.sessions];
    
    // Update profile stats when saving session
    const updatedProfiles = [...state.profiles];
    state.games.forEach(game => {
       game.players.forEach((pName, pIdx) => {
          const prof = updatedProfiles.find(item => item.name === pName || item.id === state.spids[pIdx]);
          if (prof) {
             prof.games += 1;
             if (game.winnerIndex === pIdx) {
                prof.wins += 1;
                prof.mw += game.payouts.reduce((sum, pay) => pay.to === pName ? sum + pay.amount : sum, 0);
             } else {
                prof.ml += game.payouts.filter(pay => pay.from === pName).reduce((sum, pay) => sum + pay.amount, 0);
             }
          }
       });
    });

    updateState({ 
      sessions: newSessions, 
      profiles: updatedProfiles,
      screen: 'home',
      games: [],
      cg: null,
      cr: 1
    });
  };

  const unpaidCount = (state.sessions || []).reduce((acc, s) => {
    const pCount = (s.payments || []).filter(p => !p.paid).length;
    return acc + pCount;
  }, 0);

  const getActiveView = () => {
    switch (state.screen) {
      case 'home':
        return <Home 
          sessions={state.sessions} 
          profiles={state.profiles} 
          onStartGame={startNewGame} 
          onNavigate={navigate}
          unpaidDebtsCount={unpaidCount}
        />;
      case 'profiles':
      case 'profile-edit':
      case 'profile-view':
        return <Profiles 
          profiles={state.profiles}
          screen={state.screen}
          currentProfileId={state.vid || state.eid}
          onNavigate={navigate}
          onSaveProfile={saveProfile}
          onDeleteProfile={deleteProfile}
          onViewProfile={(id) => updateState({ screen: 'profile-view', vid: id })}
          onEditProfile={(id) => updateState({ screen: 'profile-edit', eid: id, vid: null })}
        />;
      case 'setup':
      case 'game':
      case 'endgame':
      case 'settle':
        return <GameFlow 
          state={state}
          onUpdateState={updateState}
          onNavigate={navigate}
          profiles={state.profiles}
          onFinishSession={finishSession}
        />;
      case 'debts':
        return <Debts 
          sessions={state.sessions}
          onMarkPaid={(id) => {
             const newSessions = state.sessions.map(s => ({
                ...s,
                payments: s.payments.map(p => p.id === id ? { ...p, paid: true } : p)
             }));
             updateState({ sessions: newSessions });
          }}
        />;
      case 'history':
      case 'history-detail':
        return <History 
          sessions={state.sessions}
          screen={state.screen}
          historyId={state.historyId}
          onNavigate={navigate}
          onViewHistory={(id) => updateState({ screen: 'history-detail', historyId: id })}
        />;
      default:
        return <div>Screen not found</div>;
    }
  };

  const hideNav = ['setup', 'game', 'settle', 'profile-edit', 'history-detail'].includes(state.screen);

  return (
    <div className="fixed inset-0 flex flex-col font-sans text-gray-900 bg-[#f2f2f7] overflow-hidden">
      <main className="flex-1 relative overflow-y-auto">
        <div className="min-h-full">
           {getActiveView()}
        </div>
      </main>

      <Navigation 
        currentScreen={state.screen} 
        onNavigate={navigate} 
        show={!hideNav}
      />
    </div>
  );
}
