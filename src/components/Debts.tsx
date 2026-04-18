import { Check, Wallet, ArrowRight, History, Receipt } from "lucide-react";
import { Payment, Session } from "../types";
import { simplifyDebts } from "../utils";

interface DebtsProps {
  sessions: Session[];
  onMarkPaid: (paymentId: string) => void;
}

export function Debts({ sessions, onMarkPaid }: DebtsProps) {
  // Aggregate all unpaid payments
  const allUnpaid = sessions.flatMap(s => s.payments.filter(p => !p.paid));
  
  // Group by session
  const sessionsWithDebts = sessions.filter(s => s.payments.some(p => !p.paid));

  // Minimum transactions globally (calculated per session already, 
  // but let's show them grouped)
  
  return (
    <div className="flex flex-col h-full bg-bg-ios">
      <div className="vibrant-gradient safe-top p-6 pb-12 rounded-b-[40px] shadow-lg mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-white uppercase tracking-tighter">Debt Tracker</h2>
        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Pending Settlements</p>
      </div>

      <div className="flex-1 scroll-container px-5 pb-24">
        {allUnpaid.length > 0 ? (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="vibrant-card p-8 flex flex-col items-center relative overflow-hidden">
                <div className="relative z-10 text-center">
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mb-2">Total Outstanding</p>
                 <p className="text-4xl font-black tracking-tighter text-gray-900">
                   {allUnpaid.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}€
                 </p>
                 <div className="mt-6 flex items-center gap-3 bg-primary/5 text-primary w-fit px-4 py-1.5 rounded-full mx-auto">
                   <Receipt size={14} />
                   <span className="text-[10px] font-bold uppercase tracking-wider">{allUnpaid.length} Pending</span>
                 </div>
                </div>
                <Wallet size={80} className="absolute -right-6 -bottom-6 text-gray-100 opacity-50" />
            </div>

            {/* Sessions Detail */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] ml-2">Sessions with Debts</h3>
              {sessionsWithDebts.map(session => (
                <div key={session.id} className="vibrant-card overflow-hidden">
                  <div className="bg-gray-50/50 p-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <History size={14} className="text-gray-400" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {session.payments.filter(p => !p.paid).map(payment => (
                      <div key={payment.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-right flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{payment.from}</p>
                            <p className="text-[9px] text-error font-bold uppercase tracking-widest">Pays</p>
                          </div>
                          <div className="text-gray-200">
                            <ArrowRight size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{payment.to}</p>
                            <p className="text-[9px] text-primary font-bold uppercase tracking-widest">To</p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-black text-gray-900">
                            {payment.amount.toFixed(2)}€
                          </p>
                          <button 
                            onClick={() => onMarkPaid(payment.id)}
                            className="mt-1 text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 ml-auto bg-primary/5 px-2 py-1 rounded-lg"
                          >
                            <Check size={10} strokeWidth={4} /> Mark Paid
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
            <div className="bg-emerald-100 p-8 rounded-full mb-6">
              <Check size={64} className="text-primary" strokeWidth={1} />
            </div>
            <p className="font-black text-xl uppercase tracking-widest">debt free!</p>
            <p className="text-sm mt-2 max-w-[200px]">All payments have been settled. Time for a new game?</p>
          </div>
        )}
      </div>
    </div>
  );
}
