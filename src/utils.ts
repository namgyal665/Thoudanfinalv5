import { Payment } from "./types";

/**
 * Greedily settles debts between players to minimize the number of transactions.
 * @param balances - Record of player names and their net balance (positive = creator/creditor, negative = debtor)
 * @param sessionId - The session these debts belong to
 * @returns Array of optimized Payment objects
 */
export function simplifyDebts(balances: Record<string, number>, sessionId: string): Payment[] {
  const transactions: Payment[] = [];
  
  // Filter out zero balances
  const participants = Object.entries(balances)
    .filter(([_, balance]) => Math.abs(balance) > 0.01)
    .map(([name, balance]) => ({ name, balance }));

  const debtors = participants.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = participants.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (amount > 0.01) {
      transactions.push({
        id: crypto.randomUUID(),
        from: debtor.name,
        to: creditor.name,
        amount: Number(amount.toFixed(2)),
        paid: false,
        sessionId
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return transactions;
}

export function calculateGamePayouts(
  scores: number[], 
  players: string[], 
  config: Record<string, number>,
  winCondition: '1000' | 'high'
): { payouts: {from: string, to: string, amount: number}[], winnerIndex: number } {
  const sortedIndices = [...scores.keys()].sort((a, b) => scores[a] - scores[b]);
  const numPlayers = players.length;
  const winnerIndex = sortedIndices[numPlayers - 1];
  const winnerScore = scores[winnerIndex];
  
  // Base payouts from config
  const payouts: {from: string, to: string, amount: number}[] = [];
  let winnerTotal = 0;

  // Multipliers
  const winnerExactly1000 = winCondition === '1000' && winnerScore === 1000;

  sortedIndices.forEach((playerIdx, rank) => {
    if (playerIdx === winnerIndex) return;

    // config is p0 (lowest), p1, p2, p3, p4 (but winner is handled separately)
    // Actually the user said: "For N players, positions are labeled: Lowest pays, 2nd lowest pays..."
    // Winner collects.
    const baseAmount = config[`p${rank}`] || 0;
    let actualAmount = baseAmount;

    // Special Multipliers
    // 1. Player ends with 0 or negative score: pays base amount one extra time (double)
    if (scores[playerIdx] <= 0) {
      actualAmount += baseAmount;
    }

    // 2. Winner hits exactly 1000: everyone pays one extra base amount
    if (winnerExactly1000) {
      actualAmount += baseAmount;
    }

    if (actualAmount > 0) {
      payouts.push({
        from: players[playerIdx],
        to: players[winnerIndex],
        amount: actualAmount
      });
      winnerTotal += actualAmount;
    }
  });

  return { payouts, winnerIndex };
}
