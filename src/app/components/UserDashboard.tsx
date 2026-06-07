import { useState, useEffect } from 'react';
import { User, db, Transaction, Deposit, Withdrawal, MoneyTransfer } from '../store';
import { Wallet, Hash, Clock, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  onRefresh: () => User;
}

export function UserDashboard({ user, onRefresh }: UserDashboardProps) {
  const [currentUser, setCurrentUser] = useState(user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transfers, setTransfers] = useState<MoneyTransfer[]>([]);

  useEffect(() => {
    const refresh = () => {
      const u = onRefresh();
      setCurrentUser(u);
      setTransactions(db.getTransactions().filter(t => t.account_number === u.account_number));
      setDeposits(db.getDeposits().filter(d => d.account_number === u.account_number));
      setWithdrawals(db.getWithdrawals().filter(w => w.account_number === u.account_number));
      setTransfers(db.getTransfers().filter(t => t.sender_account === u.account_number));
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [user.account_number]);

  const pendingDeposits = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#212529]">Welcome back, {currentUser.name.split(' ')[0]}</h2>
        <p className="text-[#6c757d] text-sm mt-1">Here's your account overview</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#212529] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm">Available Balance</span>
            <Wallet className="w-5 h-5 text-white/40" />
          </div>
          <div className="text-2xl font-semibold">${currentUser.balance.toFixed(2)}</div>
          <div className="text-white/50 text-xs mt-1">USD</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6c757d] text-sm">Account Number</span>
            <Hash className="w-5 h-5 text-gray-300" />
          </div>
          <div className="text-[#212529] font-mono text-lg">{currentUser.account_number}</div>
          <div className="text-[#6c757d] text-xs mt-1">{currentUser.status === 'active' ? '● Active' : '● Blocked'}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6c757d] text-sm">Pending Requests</span>
            <Clock className="w-5 h-5 text-gray-300" />
          </div>
          <div className="text-[#212529] text-2xl font-semibold">{pendingDeposits + pendingWithdrawals + pendingTransfers}</div>
          <div className="text-[#6c757d] text-xs mt-1">{pendingDeposits}D · {pendingWithdrawals}W · {pendingTransfers}T</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6c757d] text-sm">Total Transactions</span>
            <TrendingUp className="w-5 h-5 text-gray-300" />
          </div>
          <div className="text-[#212529] text-2xl font-semibold">{transactions.length}</div>
          <div className="text-[#6c757d] text-xs mt-1">Lifetime records</div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-[#212529]">Transaction History</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-[#6c757d] text-sm">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Description</th>
                  <th className="text-right px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Amount</th>
                  <th className="text-right px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                        txn.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {txn.type === 'credit' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#212529]">{txn.description}</td>
                    <td className="px-5 py-3 text-right text-sm">
                      <span className={txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-[#6c757d]">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposits */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[#212529]">Deposit Requests</h3>
          <span className="text-xs text-[#6c757d]">{deposits.length} total</span>
        </div>
        {deposits.length === 0 ? (
          <div className="py-8 text-center text-[#6c757d] text-sm">No deposit requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-sm text-[#212529]">${d.amount.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-[#6c757d]">{new Date(d.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawals */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[#212529]">Withdrawal Requests</h3>
          <span className="text-xs text-[#6c757d]">{withdrawals.length} total</span>
        </div>
        {withdrawals.length === 0 ? (
          <div className="py-8 text-center text-[#6c757d] text-sm">No withdrawal requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Bank Details</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-sm text-[#212529]">${w.amount.toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm text-[#6c757d] max-w-[200px] truncate">{w.bank_details}</td>
                    <td className="px-5 py-3"><StatusBadge status={w.status} /></td>
                    <td className="px-5 py-3 text-right text-xs text-[#6c757d]">{new Date(w.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfers */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[#212529]">Money Transfers</h3>
          <span className="text-xs text-[#6c757d]">{transfers.length} total</span>
        </div>
        {transfers.length === 0 ? (
          <div className="py-8 text-center text-[#6c757d] text-sm">No transfers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Transfer #</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Recipient</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Destination</th>
                  <th className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.transfer_number} className="border-b border-gray-50">
                    <td className="px-5 py-3 text-xs font-mono text-[#6c757d]">{t.transfer_number}</td>
                    <td className="px-5 py-3 text-sm text-[#212529]">{t.receiver_name}</td>
                    <td className="px-5 py-3 text-sm text-[#212529]">{t.amount_sent} {t.currency_sent}</td>
                    <td className="px-5 py-3 text-sm text-[#6c757d]">{t.city}, {t.country}</td>
                    <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-3 text-right text-xs text-[#6c757d]">{new Date(t.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
    active: 'bg-green-50 text-green-700',
    blocked: 'bg-red-50 text-red-700',
    suspended: 'bg-orange-50 text-orange-700',
  };
  return (
    <span className={`inline-block text-xs px-2 py-1 rounded-full capitalize ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status}
    </span>
  );
}
