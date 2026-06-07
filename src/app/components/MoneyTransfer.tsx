import { useState, useEffect, useCallback } from 'react';
import { User, db, generateTransferNumber, COUNTRY_CITIES, CURRENCIES, getRate, ExchangeOffice } from '../store';
import { Send, RefreshCw, CheckCircle } from 'lucide-react';

interface MoneyTransferProps {
  user: User;
  onRefresh: () => User;
}

const FEE_RATE = 0.015; // 1.5%

export function MoneyTransfer({ user, onRefresh }: MoneyTransferProps) {
  const [currentUser, setCurrentUser] = useState(user);
  const [form, setForm] = useState({
    receiver_name: '',
    receiver_phone: '',
    country: '',
    city: '',
    amount_sent: '',
    currency_sent: 'USD',
    currency_received: 'AFN',
    exchange_office_id: '',
  });
  const [offices, setOffices] = useState<ExchangeOffice[]>([]);
  const [rate, setRate] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refreshRates = useCallback(() => {
    const r = getRate(form.currency_sent, form.currency_received);
    setRate(r);
    setLastUpdated(new Date().toLocaleTimeString());
  }, [form.currency_sent, form.currency_received]);

  useEffect(() => {
    refreshRates();
    const interval = setInterval(() => {
      // Simulate small rate fluctuation
      const rates = db.getRates();
      const updated = rates.map(r => ({
        ...r,
        rate: r.rate * (1 + (Math.random() - 0.5) * 0.004),
        last_updated: new Date().toISOString(),
      }));
      db.setRates(updated);
      refreshRates();
    }, Math.random() * 30000 + 30000); // 30–60s
    return () => clearInterval(interval);
  }, [refreshRates]);

  useEffect(() => {
    refreshRates();
  }, [form.currency_sent, form.currency_received, refreshRates]);

  useEffect(() => {
    if (form.country) {
      const filtered = db.getOffices().filter(
        o => o.status === 'approved' && o.countries_supported.includes(form.country)
      );
      setOffices(filtered);
      setForm(f => ({ ...f, exchange_office_id: '' }));
    } else {
      setOffices([]);
    }
  }, [form.country]);

  useEffect(() => {
    const u = onRefresh();
    setCurrentUser(u);
  }, []);

  const amountSent = parseFloat(form.amount_sent) || 0;
  const fee = amountSent * FEE_RATE;
  const totalPayable = amountSent + fee;
  const amountReceived = amountSent * rate;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.country || !form.city) { setError('Please select destination country and city.'); return; }
    if (!form.exchange_office_id) { setError('Please select an exchange office.'); return; }
    if (amountSent <= 0) { setError('Please enter a valid amount.'); return; }
    if (totalPayable > currentUser.balance) { setError(`Insufficient balance. Total payable: $${totalPayable.toFixed(2)}, your balance: $${currentUser.balance.toFixed(2)}`); return; }

    const transfers = db.getTransfers();
    transfers.unshift({
      transfer_number: generateTransferNumber(),
      sender_account: currentUser.account_number,
      receiver_name: form.receiver_name,
      receiver_phone: form.receiver_phone,
      country: form.country,
      city: form.city,
      amount_sent: amountSent,
      currency_sent: form.currency_sent,
      amount_received: amountReceived,
      currency_received: form.currency_received,
      exchange_office_id: form.exchange_office_id,
      fee,
      status: 'pending',
      date: new Date().toISOString(),
    });
    db.setTransfers(transfers);

    setSuccess(`Transfer submitted! It's pending admin approval.`);
    setForm(f => ({ ...f, receiver_name: '', receiver_phone: '', amount_sent: '', exchange_office_id: '' }));
  }

  const selectedOffice = offices.find(o => o.id === form.exchange_office_id);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-[#212529]">Send Money</h2>
        <p className="text-[#6c757d] text-sm mt-1">International remittance to Afghanistan & Pakistan</p>
      </div>

      {/* Balance */}
      <div className="bg-[#212529] rounded-2xl p-5 text-white flex items-center justify-between">
        <div>
          <div className="text-white/60 text-xs mb-1">Available Balance</div>
          <div className="text-xl font-semibold">${currentUser.balance.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-white/60 text-xs mb-1">Exchange Rate</div>
          <div className="text-sm">{form.currency_sent} → {form.currency_received}: {rate.toFixed(4)}</div>
          <div className="text-white/40 text-xs mt-0.5">Updated {lastUpdated}</div>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="text-[#212529] border-b border-gray-100 pb-3">Recipient Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Recipient Full Name">
            <input required value={form.receiver_name} onChange={e => setForm(f => ({ ...f, receiver_name: e.target.value }))}
              placeholder="Full name" className={inputCls} />
          </Field>
          <Field label="Recipient Mobile">
            <input required value={form.receiver_phone} onChange={e => setForm(f => ({ ...f, receiver_phone: e.target.value }))}
              placeholder="+93 700 000 000" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Destination Country">
            <select required value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value, city: '' }))} className={inputCls}>
              <option value="">Select country</option>
              {Object.keys(COUNTRY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Destination City">
            <select required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} disabled={!form.country}>
              <option value="">Select city</option>
              {(COUNTRY_CITIES[form.country] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <h3 className="text-[#212529] border-b border-gray-100 pb-3 pt-2">Transfer Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Amount to Send">
            <input type="number" min="1" step="0.01" required value={form.amount_sent}
              onChange={e => setForm(f => ({ ...f, amount_sent: e.target.value }))}
              placeholder="0.00" className={inputCls} />
          </Field>
          <Field label="Send Currency">
            <select value={form.currency_sent} onChange={e => setForm(f => ({ ...f, currency_sent: e.target.value }))} className={inputCls}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Receive Currency">
            <select value={form.currency_received} onChange={e => setForm(f => ({ ...f, currency_received: e.target.value }))} className={inputCls}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Exchange Office (Sarafi)">
            <select required value={form.exchange_office_id}
              onChange={e => setForm(f => ({ ...f, exchange_office_id: e.target.value }))}
              className={inputCls} disabled={!form.country}>
              <option value="">{form.country ? (offices.length ? 'Select office' : 'No offices available') : 'Select country first'}</option>
              {offices.map(o => <option key={o.id} value={o.id}>{o.office_name}</option>)}
            </select>
          </Field>
        </div>

        {/* Rate Calculator */}
        {amountSent > 0 && (
          <div className="bg-[#f8f9fa] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <button type="button" onClick={refreshRates} className="flex items-center gap-1.5 text-xs text-[#6c757d] hover:text-[#212529]">
                <RefreshCw className="w-3 h-3" /> Refresh rates
              </button>
              <span className="text-xs text-[#6c757d]">Updated: {lastUpdated}</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <Row label="Exchange Rate" value={`1 ${form.currency_sent} = ${rate.toFixed(4)} ${form.currency_received}`} />
              <Row label="Amount to Send" value={`${amountSent.toFixed(2)} ${form.currency_sent}`} />
              <Row label="Recipient Receives" value={`${amountReceived.toFixed(2)} ${form.currency_received}`} highlight />
              <Row label="Processing Fee (1.5%)" value={`${fee.toFixed(2)} ${form.currency_sent}`} />
              <div className="border-t border-gray-200 pt-1.5">
                <Row label="Total Payable" value={`${totalPayable.toFixed(2)} ${form.currency_sent}`} bold />
              </div>
            </div>
          </div>
        )}

        {selectedOffice && (
          <div className="bg-blue-50 rounded-xl p-4 text-sm border border-blue-100">
            <div className="text-blue-800 mb-2">Selected Exchange Office</div>
            <div className="text-blue-700">{selectedOffice.office_name}</div>
            <div className="text-blue-600 text-xs mt-1">WhatsApp: {selectedOffice.whatsapp} · Phone: {selectedOffice.mobile}</div>
          </div>
        )}

        <button type="submit" className="w-full py-3 rounded-xl bg-[#212529] text-white hover:bg-[#343a40] transition-colors flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Submit Transfer Request
        </button>
      </form>
    </div>
  );
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400 text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-[#212529] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-[#212529]' : 'text-[#6c757d]'}`}>
      <span>{label}</span>
      <span className={highlight ? 'text-green-600 font-medium' : ''}>{value}</span>
    </div>
  );
}
