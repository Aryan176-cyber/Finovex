import { useState } from 'react';
import { User, db, generateId } from '../store';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface WithdrawalsProps {
  user: User;
  onRefresh: () => User;
}

export function Withdrawals({ user, onRefresh }: WithdrawalsProps) {
  const [currentUser, setCurrentUser] = useState(user);
  const [form, setForm] = useState({
    amount: '',
    bank_name: '',
    account_number: '',
    account_holder: '',
    iban: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { setError('Please enter a valid amount.'); return; }

    const freshUser = onRefresh();
    setCurrentUser(freshUser);
    if (amt > freshUser.balance) {
      setError(`Insufficient balance. Your balance: $${freshUser.balance.toFixed(2)}`);
      return;
    }

    const bankDetails = `Bank: ${form.bank_name} | Account: ${form.account_number} | Holder: ${form.account_holder} | IBAN: ${form.iban}${form.notes ? ` | Notes: ${form.notes}` : ''}`;

    const withdrawals = db.getWithdrawals();
    withdrawals.unshift({
      id: generateId(),
      account_number: freshUser.account_number,
      amount: amt,
      bank_details: bankDetails,
      status: 'pending',
      date: new Date().toISOString(),
    });
    db.setWithdrawals(withdrawals);

    setSuccess('Withdrawal request submitted! Awaiting admin approval.');
    setForm({ amount: '', bank_name: '', account_number: '', account_holder: '', iban: '', notes: '' });
  }

  const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400 text-sm';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-[#212529]">Withdraw Funds</h2>
        <p className="text-[#6c757d] text-sm mt-1">Request a withdrawal to your bank account</p>
      </div>

      <div className="bg-[#212529] rounded-2xl p-5 text-white flex items-center justify-between">
        <div>
          <div className="text-white/60 text-xs mb-1">Available Balance</div>
          <div className="text-xl font-semibold">${currentUser.balance.toFixed(2)}</div>
        </div>
        <div className="text-white/50 text-sm">{currentUser.account_number}</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="text-[#212529] border-b border-gray-100 pb-3">Withdrawal Details</h3>

        {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
        {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

        <div>
          <label className="block text-sm text-[#212529] mb-1.5">Withdrawal Amount (USD)</label>
          <input type="number" min="1" step="0.01" required value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="0.00" className={inputCls} />
        </div>

        <h3 className="text-[#212529] border-b border-gray-100 pb-3">Bank Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#212529] mb-1.5">Bank Name</label>
            <input required value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))}
              placeholder="e.g. Chase Bank" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#212529] mb-1.5">Account Number</label>
            <input required value={form.account_number} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))}
              placeholder="Your account number" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#212529] mb-1.5">Account Holder Name</label>
            <input required value={form.account_holder} onChange={e => setForm(f => ({ ...f, account_holder: e.target.value }))}
              placeholder="Full name on account" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#212529] mb-1.5">IBAN (Optional)</label>
            <input value={form.iban} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))}
              placeholder="International bank number" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#212529] mb-1.5">Additional Notes (Optional)</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Any additional routing or transfer notes..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400 text-sm resize-none" />
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs">
          Withdrawals are subject to admin review and may take 1–3 business days to process.
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-[#212529] text-white hover:bg-[#343a40] transition-colors">
          Submit Withdrawal Request
        </button>
      </form>
    </div>
  );
}
