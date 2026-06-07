import { useState, useEffect, useCallback } from 'react';
import {
  db, User, Deposit, Withdrawal, MoneyTransfer, ExchangeOffice, ExchangeRate,
  addTransaction, addAdminLog, generateId,
} from '../store';
import {
  Users, Download, Upload, Send, Building2, TrendingUp, Globe, LogOut,
  Search, Check, X, Edit2, Shield, AlertTriangle, Printer,
} from 'lucide-react';
import { StatusBadge } from './UserDashboard';

type AdminTab = 'users' | 'deposits' | 'withdrawals' | 'transfers' | 'offices' | 'rates' | 'logs';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('users');
  const [refresh, setRefresh] = useState(0);
  const tick = useCallback(() => setRefresh(r => r + 1), []);

  const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: Download },
    { id: 'withdrawals', label: 'Withdrawals', icon: Upload },
    { id: 'transfers', label: 'Transfers', icon: Send },
    { id: 'offices', label: 'Offices', icon: Building2 },
    { id: 'rates', label: 'Exchange Rates', icon: TrendingUp },
    { id: 'logs', label: 'Admin Logs', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#212529] flex flex-col fixed inset-y-0 left-0 z-20 hidden md:flex">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <Globe className="text-white w-4 h-4" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold">FINOVIX</div>
            <div className="text-white/50 text-xs">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-colors ${tab === t.id ? 'bg-white text-[#212529]' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${tab === t.id ? 'bg-[#212529] text-white' : 'text-[#6c757d] hover:bg-gray-100'}`}>
                <Icon className="w-3 h-3" />{t.label}
              </button>
            );
          })}
          <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 whitespace-nowrap ml-auto">
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-56 p-4 md:p-8 overflow-auto mt-12 md:mt-0">
        {tab === 'users' && <AdminUsers key={refresh} onAction={tick} />}
        {tab === 'deposits' && <AdminDeposits key={refresh} onAction={tick} />}
        {tab === 'withdrawals' && <AdminWithdrawals key={refresh} onAction={tick} />}
        {tab === 'transfers' && <AdminTransfers key={refresh} onAction={tick} />}
        {tab === 'offices' && <AdminOffices key={refresh} onAction={tick} />}
        {tab === 'rates' && <AdminRates key={refresh} onAction={tick} />}
        {tab === 'logs' && <AdminLogs />}
      </main>
    </div>
  );
}

/* ---- Users ---- */
function AdminUsers({ onAction }: { onAction: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editBalance, setEditBalance] = useState<{ id: string; val: string } | null>(null);

  useEffect(() => { setUsers(db.getUsers()); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.account_number.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleBlock(u: User) {
    const all = db.getUsers();
    const idx = all.findIndex(x => x.id === u.id);
    if (idx === -1) return;
    const newStatus = all[idx].status === 'active' ? 'blocked' : 'active';
    all[idx].status = newStatus;
    db.setUsers(all);
    addAdminLog(`${newStatus === 'blocked' ? 'Blocked' : 'Unblocked'} user ${u.name} (${u.account_number})`);
    setUsers(db.getUsers());
    onAction();
  }

  function saveBalance(u: User) {
    if (!editBalance) return;
    const newBal = parseFloat(editBalance.val);
    if (isNaN(newBal) || newBal < 0) return;
    const all = db.getUsers();
    const idx = all.findIndex(x => x.id === u.id);
    if (idx === -1) return;
    const diff = newBal - all[idx].balance;
    all[idx].balance = newBal;
    db.setUsers(all);
    addTransaction(u.account_number, diff >= 0 ? 'credit' : 'debit', Math.abs(diff), `Admin manual balance adjustment`);
    addAdminLog(`Adjusted balance for ${u.name} (${u.account_number}) to $${newBal}`);
    setEditBalance(null);
    setUsers(db.getUsers());
    onAction();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[#212529]">User Management</h2>
        <span className="text-sm text-[#6c757d]">{users.length} accounts</span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or account..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#212529] text-sm" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f9fa]">
                {['Name', 'Account', 'Email', 'Mobile', 'Balance', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-[#6c757d] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-[#6c757d] text-sm">No users found.</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-[#212529] font-medium whitespace-nowrap">{u.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#6c757d]">{u.account_number}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d]">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d]">{u.mobile}</td>
                  <td className="px-4 py-3 text-sm text-[#212529]">
                    {editBalance?.id === u.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="0" step="0.01" value={editBalance.val}
                          onChange={e => setEditBalance({ id: u.id, val: e.target.value })}
                          className="w-24 px-2 py-1 rounded border border-gray-200 text-xs focus:outline-none focus:border-[#212529]" />
                        <button onClick={() => saveBalance(u)} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200"><Check className="w-3 h-3" /></button>
                        <button onClick={() => setEditBalance(null)} className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span>${u.balance.toFixed(2)}</span>
                        <button onClick={() => setEditBalance({ id: u.id, val: u.balance.toString() })} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleBlock(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                      {u.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---- Deposits ---- */
function AdminDeposits({ onAction }: { onAction: () => void }) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => { setDeposits(db.getDeposits()); }, []);

  function handle(dep: Deposit, action: 'approved' | 'rejected') {
    const all = db.getDeposits();
    const idx = all.findIndex(d => d.id === dep.id);
    if (idx === -1) return;
    all[idx].status = action;
    db.setDeposits(all);

    if (action === 'approved') {
      const users = db.getUsers();
      const ui = users.findIndex(u => u.account_number === dep.account_number);
      if (ui !== -1) {
        users[ui].balance += dep.amount;
        db.setUsers(users);
        addTransaction(dep.account_number, 'credit', dep.amount, `Deposit approved — $${dep.amount}`);
      }
    }
    addAdminLog(`${action === 'approved' ? 'Approved' : 'Rejected'} deposit #${dep.id} for ${dep.account_number} ($${dep.amount})`);
    setDeposits(db.getDeposits());
    onAction();
  }

  const shown = filter === 'all' ? deposits : deposits.filter(d => d.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[#212529]">Deposit Requests</h2>
        <FilterTabs value={filter} onChange={setFilter as (v: string) => void} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f9fa]">
                {['Account', 'Amount', 'Receipt', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-[#6c757d] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[#6c757d] text-sm">No records.</td></tr>}
              {shown.map(dep => (
                <tr key={dep.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-[#6c757d]">{dep.account_number}</td>
                  <td className="px-4 py-3 text-sm text-[#212529]">${dep.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d] max-w-[120px] truncate">{dep.receipt_url || '—'}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d]">{new Date(dep.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={dep.status} /></td>
                  <td className="px-4 py-3">
                    {dep.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <ActionBtn color="green" icon={<Check className="w-3 h-3" />} label="Approve" onClick={() => handle(dep, 'approved')} />
                        <ActionBtn color="red" icon={<X className="w-3 h-3" />} label="Reject" onClick={() => handle(dep, 'rejected')} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---- Withdrawals ---- */
function AdminWithdrawals({ onAction }: { onAction: () => void }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState<string>('pending');

  useEffect(() => { setWithdrawals(db.getWithdrawals()); }, []);

  function handle(w: Withdrawal, action: 'approved' | 'rejected') {
    const all = db.getWithdrawals();
    const idx = all.findIndex(x => x.id === w.id);
    if (idx === -1) return;

    if (action === 'approved') {
      const users = db.getUsers();
      const ui = users.findIndex(u => u.account_number === w.account_number);
      if (ui !== -1) {
        if (users[ui].balance < w.amount) {
          alert('User has insufficient balance to process this withdrawal.');
          return;
        }
        users[ui].balance -= w.amount;
        db.setUsers(users);
        addTransaction(w.account_number, 'debit', w.amount, `Withdrawal approved — $${w.amount}`);
      }
    }
    all[idx].status = action;
    db.setWithdrawals(all);
    addAdminLog(`${action === 'approved' ? 'Approved' : 'Rejected'} withdrawal #${w.id} for ${w.account_number} ($${w.amount})`);
    setWithdrawals(db.getWithdrawals());
    onAction();
  }

  const shown = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[#212529]">Withdrawal Requests</h2>
        <FilterTabs value={filter} onChange={setFilter} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f9fa]">
                {['Account', 'Amount', 'Bank Details', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-[#6c757d] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[#6c757d] text-sm">No records.</td></tr>}
              {shown.map(w => (
                <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-[#6c757d]">{w.account_number}</td>
                  <td className="px-4 py-3 text-sm text-[#212529]">${w.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d] max-w-[200px] truncate" title={w.bank_details}>{w.bank_details}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d]">{new Date(w.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                  <td className="px-4 py-3">
                    {w.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <ActionBtn color="green" icon={<Check className="w-3 h-3" />} label="Approve" onClick={() => handle(w, 'approved')} />
                        <ActionBtn color="red" icon={<X className="w-3 h-3" />} label="Reject" onClick={() => handle(w, 'rejected')} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---- Transfers ---- */
function AdminTransfers({ onAction }: { onAction: () => void }) {
  const [transfers, setTransfers] = useState<MoneyTransfer[]>([]);
  const [filter, setFilter] = useState<string>('pending');
  const [receipt, setReceipt] = useState<MoneyTransfer | null>(null);

  useEffect(() => { setTransfers(db.getTransfers()); }, []);

  function handle(t: MoneyTransfer, action: 'approved' | 'rejected') {
    const all = db.getTransfers();
    const idx = all.findIndex(x => x.transfer_number === t.transfer_number);
    if (idx === -1) return;
    all[idx].status = action;
    db.setTransfers(all);
    if (action === 'approved') {
      const users = db.getUsers();
      const ui = users.findIndex(u => u.account_number === t.sender_account);
      if (ui !== -1) {
        const total = t.amount_sent + t.fee;
        users[ui].balance = Math.max(0, users[ui].balance - total);
        db.setUsers(users);
        addTransaction(t.sender_account, 'debit', total, `Transfer approved — ${t.transfer_number} to ${t.receiver_name}`);
      }
      setReceipt(all[idx]);
    }
    addAdminLog(`${action === 'approved' ? 'Approved' : 'Rejected'} transfer ${t.transfer_number} for ${t.sender_account}`);
    setTransfers(db.getTransfers());
    onAction();
  }

  const shown = filter === 'all' ? transfers : transfers.filter(t => t.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[#212529]">Money Transfers</h2>
        <FilterTabs value={filter} onChange={setFilter} />
      </div>

      {receipt && <TransferReceipt transfer={receipt} offices={db.getOffices()} onClose={() => setReceipt(null)} />}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8f9fa]">
                {['Transfer #', 'Sender', 'Recipient', 'Destination', 'Amount', 'Receives', 'Fee', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-[#6c757d] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={10} className="py-10 text-center text-[#6c757d] text-sm">No records.</td></tr>}
              {shown.map(t => (
                <tr key={t.transfer_number} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-[#6c757d]">{t.transfer_number}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d]">{t.sender_account}</td>
                  <td className="px-4 py-3 text-sm text-[#212529] whitespace-nowrap">{t.receiver_name}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d] whitespace-nowrap">{t.city}, {t.country}</td>
                  <td className="px-4 py-3 text-sm text-[#212529] whitespace-nowrap">{t.amount_sent} {t.currency_sent}</td>
                  <td className="px-4 py-3 text-sm text-green-600 whitespace-nowrap">{t.amount_received.toFixed(2)} {t.currency_received}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d]">${t.fee.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-[#6c757d] whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {t.status === 'pending' && (
                        <>
                          <ActionBtn color="green" icon={<Check className="w-3 h-3" />} label="Approve" onClick={() => handle(t, 'approved')} />
                          <ActionBtn color="red" icon={<X className="w-3 h-3" />} label="Reject" onClick={() => handle(t, 'rejected')} />
                        </>
                      )}
                      {t.status === 'approved' && (
                        <button onClick={() => setReceipt(t)} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs flex items-center gap-1">
                          <Printer className="w-3 h-3" /> Receipt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---- Transfer Receipt ---- */
function TransferReceipt({ transfer: t, offices, onClose }: { transfer: MoneyTransfer; offices: ExchangeOffice[]; onClose: () => void }) {
  const office = offices.find(o => o.id === t.exchange_office_id);

  function print() {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Receipt ${t.transfer_number}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 40px auto; padding: 20px; color: #212529; }
        h2 { text-align: center; border-bottom: 2px solid #212529; padding-bottom: 10px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .label { color: #6c757d; }
        .highlight { font-weight: bold; color: #212529; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        .badge { background: #212529; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
      </style></head>
      <body>
        <h2>FINOVIX Transfer Receipt</h2>
        <div class="row"><span class="label">Transfer Number</span><span>${t.transfer_number}</span></div>
        <div class="row"><span class="label">Date</span><span>${new Date(t.date).toLocaleString()}</span></div>
        <div class="row"><span class="label">Sender Account</span><span>${t.sender_account}</span></div>
        <div class="row"><span class="label">Recipient Name</span><span>${t.receiver_name}</span></div>
        <div class="row"><span class="label">Recipient Phone</span><span>${t.receiver_phone}</span></div>
        <div class="row"><span class="label">Destination</span><span>${t.city}, ${t.country}</span></div>
        <div class="row"><span class="label">Amount Sent</span><span>${t.amount_sent} ${t.currency_sent}</span></div>
        <div class="row"><span class="label">Exchange Rate</span><span>1 ${t.currency_sent} ≈ ${(t.amount_received / t.amount_sent).toFixed(4)} ${t.currency_received}</span></div>
        <div class="row highlight"><span class="label">Recipient Receives</span><span>${t.amount_received.toFixed(2)} ${t.currency_received}</span></div>
        <div class="row"><span class="label">Processing Fee</span><span>$${t.fee.toFixed(2)}</span></div>
        <div class="row highlight"><span class="label">Total Paid</span><span>${(t.amount_sent + t.fee).toFixed(2)} ${t.currency_sent}</span></div>
        ${office ? `
        <div class="row"><span class="label">Exchange Office</span><span>${office.office_name}</span></div>
        <div class="row"><span class="label">WhatsApp</span><span>${office.whatsapp}</span></div>
        <div class="row"><span class="label">Phone</span><span>${office.mobile}</span></div>
        ` : ''}
        <div class="row"><span class="label">Status</span><span class="badge">APPROVED</span></div>
        <div class="footer">FINOVIX Money Transfer & Exchange Platform<br/>This is an official transaction receipt.</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[#212529]">Transfer Receipt</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-2.5">
          <ReceiptRow label="Transfer Number" value={t.transfer_number} mono />
          <ReceiptRow label="Date" value={new Date(t.date).toLocaleString()} />
          <ReceiptRow label="Sender Account" value={t.sender_account} />
          <ReceiptRow label="Recipient" value={t.receiver_name} />
          <ReceiptRow label="Recipient Phone" value={t.receiver_phone} />
          <ReceiptRow label="Destination" value={`${t.city}, ${t.country}`} />
          <div className="border-t border-gray-100 pt-2.5 space-y-2">
            <ReceiptRow label="Amount Sent" value={`${t.amount_sent} ${t.currency_sent}`} />
            <ReceiptRow label="Recipient Receives" value={`${t.amount_received.toFixed(2)} ${t.currency_received}`} highlight />
            <ReceiptRow label="Processing Fee" value={`$${t.fee.toFixed(2)}`} />
            <ReceiptRow label="Total Paid" value={`${(t.amount_sent + t.fee).toFixed(2)} ${t.currency_sent}`} bold />
          </div>
          {office && (
            <div className="border-t border-gray-100 pt-2.5 space-y-2">
              <ReceiptRow label="Exchange Office" value={office.office_name} />
              <ReceiptRow label="WhatsApp" value={office.whatsapp} />
              <ReceiptRow label="Phone" value={office.mobile} />
            </div>
          )}
          <div className="flex items-center gap-2 pt-2">
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs">✓ APPROVED</span>
            <span className="text-xs text-[#6c757d]">Official Finovix Receipt</span>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2.5">
          <button onClick={print} className="flex-1 py-2.5 rounded-xl bg-[#212529] text-white text-sm hover:bg-[#343a40] transition-colors flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#6c757d] hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, mono, highlight, bold }: { label: string; value: string; mono?: boolean; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#6c757d]">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} ${highlight ? 'text-green-600 font-semibold' : ''} ${bold ? 'font-semibold text-[#212529]' : 'text-[#212529]'}`}>{value}</span>
    </div>
  );
}

/* ---- Exchange Offices ---- */
function AdminOffices({ onAction }: { onAction: () => void }) {
  const [offices, setOffices] = useState<ExchangeOffice[]>([]);
  const [filter, setFilter] = useState<string>('pending');

  useEffect(() => { setOffices(db.getOffices()); }, []);

  function updateStatus(o: ExchangeOffice, status: ExchangeOffice['status']) {
    const all = db.getOffices();
    const idx = all.findIndex(x => x.id === o.id);
    if (idx === -1) return;
    all[idx].status = status;
    db.setOffices(all);
    addAdminLog(`Updated exchange office "${o.office_name}" status to ${status}`);
    setOffices(db.getOffices());
    onAction();
  }

  const filterOpts = ['all', 'pending', 'approved', 'suspended'];
  const shown = filter === 'all' ? offices : offices.filter(o => o.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[#212529]">Exchange Offices</h2>
        <div className="flex gap-1.5">
          {filterOpts.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${filter === f ? 'bg-[#212529] text-white' : 'bg-white text-[#6c757d] border border-gray-200 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {shown.length === 0 && <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-[#6c757d] text-sm">No offices found.</div>}
        {shown.map(o => (
          <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-[#212529]">{o.office_name}</h4>
                <div className="text-xs text-[#6c757d] mt-0.5">{o.first_name} {o.last_name} · License: {o.license_number}</div>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
              {[['Email', o.email], ['Mobile', o.mobile], ['WhatsApp', o.whatsapp], ['Address', o.address], ['Bank', o.bank_name], ['Countries', o.countries_supported.join(', ')]].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[#6c757d]">{k}</div>
                  <div className="text-[#212529] mt-0.5">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {o.status !== 'approved' && <ActionBtn color="green" icon={<Check className="w-3 h-3" />} label="Approve" onClick={() => updateStatus(o, 'approved')} />}
              {o.status !== 'suspended' && <ActionBtn color="amber" icon={<AlertTriangle className="w-3 h-3" />} label="Suspend" onClick={() => updateStatus(o, 'suspended')} />}
              {o.status === 'suspended' && <ActionBtn color="green" icon={<Check className="w-3 h-3" />} label="Reinstate" onClick={() => updateStatus(o, 'approved')} />}
              <ActionBtn color="red" icon={<X className="w-3 h-3" />} label="Reject" onClick={() => updateStatus(o, 'pending')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Exchange Rates ---- */
function AdminRates({ onAction }: { onAction: () => void }) {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});

  useEffect(() => {
    const r = db.getRates();
    setRates(r);
    const init: Record<string, string> = {};
    r.forEach(x => { init[x.pair] = x.rate.toString(); });
    setEditing(init);
  }, []);

  function saveRate(pair: string) {
    const newRate = parseFloat(editing[pair]);
    if (isNaN(newRate) || newRate <= 0) return;
    const all = db.getRates();
    const idx = all.findIndex(r => r.pair === pair);
    if (idx !== -1) {
      all[idx].rate = newRate;
      all[idx].last_updated = new Date().toISOString();
    } else {
      all.push({ pair, rate: newRate, last_updated: new Date().toISOString() });
    }
    db.setRates(all);
    setRates(db.getRates());
    addAdminLog(`Updated exchange rate ${pair} to ${newRate}`);
    onAction();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[#212529]">Exchange Rate Controls</h2>
        <p className="text-[#6c757d] text-sm mt-1">Override live exchange rates. Rates update automatically every 30–60 seconds.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-[#f8f9fa]">
              {['Currency Pair', 'Current Rate', 'Override', 'Last Updated', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs text-[#6c757d] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rates.map(r => (
              <tr key={r.pair} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-4">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-[#212529]">{r.pair.replace('_', ' → ')}</span>
                </td>
                <td className="px-5 py-4 text-sm text-[#212529]">{r.rate.toFixed(4)}</td>
                <td className="px-5 py-4">
                  <input
                    type="number" min="0" step="0.0001"
                    value={editing[r.pair] ?? r.rate}
                    onChange={e => setEditing(prev => ({ ...prev, [r.pair]: e.target.value }))}
                    className="w-32 px-3 py-1.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] text-sm"
                  />
                </td>
                <td className="px-5 py-4 text-xs text-[#6c757d]">{new Date(r.last_updated).toLocaleTimeString()}</td>
                <td className="px-5 py-4">
                  <button onClick={() => saveRate(r.pair)} className="px-3 py-1.5 rounded-lg bg-[#212529] text-white text-xs hover:bg-[#343a40] transition-colors">
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- Admin Logs ---- */
function AdminLogs() {
  const logs = db.getLogs();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[#212529]">Admin Audit Logs</h2>
        <span className="text-sm text-[#6c757d]">{logs.length} entries</span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-[#6c757d] text-sm">No admin actions recorded yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(l => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <span className="text-sm text-[#212529]">{l.admin_action}</span>
                <span className="text-xs text-[#6c757d] whitespace-nowrap ml-4">{new Date(l.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Shared Components ---- */
function FilterTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5">
      {['all', 'pending', 'approved', 'rejected'].map(f => (
        <button key={f} onClick={() => onChange(f)}
          className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${value === f ? 'bg-[#212529] text-white' : 'bg-white text-[#6c757d] border border-gray-200 hover:bg-gray-50'}`}>
          {f}
        </button>
      ))}
    </div>
  );
}

function ActionBtn({ color, icon, label, onClick }: { color: 'green' | 'red' | 'amber'; icon: React.ReactNode; label: string; onClick: () => void }) {
  const colors = {
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  };
  return (
    <button onClick={onClick} className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${colors[color]}`}>
      {icon} {label}
    </button>
  );
}
