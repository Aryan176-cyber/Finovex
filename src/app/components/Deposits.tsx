import { useState } from 'react';
import { User, db, generateId, CORPORATE_BANK } from '../store';
import { Copy, CheckCircle, Upload } from 'lucide-react';

interface DepositsProps {
  user: User;
}

export function Deposits({ user }: DepositsProps) {
  const [amount, setAmount] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedField, setCopiedField] = useState('');

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setReceiptName(file.name);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError('Please enter a valid amount.'); return; }
    if (!receiptName) { setError('Please upload a payment receipt.'); return; }

    const deposits = db.getDeposits();
    deposits.unshift({
      id: generateId(),
      account_number: user.account_number,
      amount: amt,
      receipt_url: receiptName,
      status: 'pending',
      date: new Date().toISOString(),
    });
    db.setDeposits(deposits);

    setSuccess('Deposit request submitted! Awaiting admin approval.');
    setAmount('');
    setReceiptName('');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-[#212529]">Deposit Funds</h2>
        <p className="text-[#6c757d] text-sm mt-1">Transfer funds to our bank and submit your receipt</p>
      </div>

      {/* Corporate Bank Info */}
      <div className="bg-[#212529] rounded-2xl p-6 text-white">
        <div className="text-white/60 text-xs uppercase tracking-wider mb-4">Corporate Bank Details</div>
        <div className="space-y-3">
          <BankRow label="Account Holder" value={CORPORATE_BANK.holder} />
          <BankRow label="Bank Name" value={CORPORATE_BANK.bank} />
          <BankRow label="Account Number" value={CORPORATE_BANK.account} onCopy={() => copyToClipboard(CORPORATE_BANK.account, 'account')} copied={copiedField === 'account'} />
          <BankRow label="IBAN" value={CORPORATE_BANK.iban} onCopy={() => copyToClipboard(CORPORATE_BANK.iban, 'iban')} copied={copiedField === 'iban'} />
          <BankRow label="Card Number" value={CORPORATE_BANK.card} onCopy={() => copyToClipboard(CORPORATE_BANK.card, 'card')} copied={copiedField === 'card'} />
        </div>
        <div className="mt-4 p-3 rounded-xl bg-white/10 text-white/70 text-xs">
          Transfer your deposit to the account above, then submit the receipt below.
        </div>
      </div>

      {/* Deposit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="text-[#212529] border-b border-gray-100 pb-3">Submit Deposit Request</h3>

        {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}
        {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

        <div>
          <label className="block text-sm text-[#212529] mb-1.5">Deposit Amount (USD)</label>
          <input
            type="number" min="1" step="0.01" required
            value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-[#212529] mb-1.5">Payment Receipt</label>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors bg-[#f8f9fa]">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            {receiptName ? (
              <span className="text-sm text-[#212529]">{receiptName}</span>
            ) : (
              <>
                <span className="text-sm text-[#6c757d]">Click to upload receipt</span>
                <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, PDF up to 10MB</span>
              </>
            )}
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl bg-[#212529] text-white hover:bg-[#343a40] transition-colors flex items-center justify-center gap-2">
          Submit Deposit Request
        </button>
      </form>
    </div>
  );
}

function BankRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-white/50 text-xs">{label}</div>
        <div className="text-white text-sm font-mono mt-0.5">{value}</div>
      </div>
      {onCopy && (
        <button type="button" onClick={onCopy} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/40" />}
        </button>
      )}
    </div>
  );
}
