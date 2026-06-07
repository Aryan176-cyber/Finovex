export type UserStatus = 'active' | 'blocked';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type OfficeStatus = 'pending' | 'approved' | 'suspended';
export type TransactionType = 'credit' | 'debit';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  account_number: string;
  balance: number;
  status: UserStatus;
}

export interface Deposit {
  id: string;
  account_number: string;
  amount: number;
  receipt_url: string;
  status: RequestStatus;
  date: string;
}

export interface Withdrawal {
  id: string;
  account_number: string;
  amount: number;
  bank_details: string;
  status: RequestStatus;
  date: string;
}

export interface MoneyTransfer {
  transfer_number: string;
  sender_account: string;
  receiver_name: string;
  receiver_phone: string;
  country: string;
  city: string;
  amount_sent: number;
  currency_sent: string;
  amount_received: number;
  currency_received: string;
  exchange_office_id: string;
  fee: number;
  status: RequestStatus;
  date: string;
}

export interface ExchangeOffice {
  id: string;
  first_name: string;
  fathers_name: string;
  last_name: string;
  mobile: string;
  email: string;
  office_name: string;
  license_number: string;
  address: string;
  countries_supported: string[];
  bank_name: string;
  bank_account: string;
  account_holder: string;
  whatsapp: string;
  status: OfficeStatus;
}

export interface ExchangeRate {
  pair: string;
  rate: number;
  last_updated: string;
}

export interface Transaction {
  id: string;
  account_number: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
}

export interface AdminLog {
  id: string;
  admin_action: string;
  timestamp: string;
}

const ADMIN_EMAIL = 'admin@finovix.com';
const ADMIN_PASSWORD = 'Admin@123';

function getStore<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStore<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const defaultRates: ExchangeRate[] = [
  { pair: 'USD_AFN', rate: 75.0, last_updated: new Date().toISOString() },
  { pair: 'USD_PKR', rate: 278.0, last_updated: new Date().toISOString() },
  { pair: 'EUR_USD', rate: 1.08, last_updated: new Date().toISOString() },
  { pair: 'USD_IRR', rate: 42000.0, last_updated: new Date().toISOString() },
  { pair: 'EUR_AFN', rate: 81.0, last_updated: new Date().toISOString() },
  { pair: 'EUR_PKR', rate: 300.0, last_updated: new Date().toISOString() },
  { pair: 'AFN_PKR', rate: 3.7, last_updated: new Date().toISOString() },
];

export const db = {
  getUsers: (): User[] => getStore('fnx_users', []),
  setUsers: (users: User[]) => setStore('fnx_users', users),
  getDeposits: (): Deposit[] => getStore('fnx_deposits', []),
  setDeposits: (d: Deposit[]) => setStore('fnx_deposits', d),
  getWithdrawals: (): Withdrawal[] => getStore('fnx_withdrawals', []),
  setWithdrawals: (w: Withdrawal[]) => setStore('fnx_withdrawals', w),
  getTransfers: (): MoneyTransfer[] => getStore('fnx_transfers', []),
  setTransfers: (t: MoneyTransfer[]) => setStore('fnx_transfers', t),
  getOffices: (): ExchangeOffice[] => getStore('fnx_offices', []),
  setOffices: (o: ExchangeOffice[]) => setStore('fnx_offices', o),
  getRates: (): ExchangeRate[] => {
    const stored = getStore<ExchangeRate[]>('fnx_rates', []);
    return stored.length ? stored : defaultRates;
  },
  setRates: (r: ExchangeRate[]) => setStore('fnx_rates', r),
  getTransactions: (): Transaction[] => getStore('fnx_transactions', []),
  setTransactions: (t: Transaction[]) => setStore('fnx_transactions', t),
  getLogs: (): AdminLog[] => getStore('fnx_logs', []),
  setLogs: (l: AdminLog[]) => setStore('fnx_logs', l),
};

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function generateTransferNumber(): string {
  return 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export function generateAccountNumber(): string {
  const users = db.getUsers();
  const nextNum = 100001 + users.length;
  return `FNX${nextNum}`;
}

export function addTransaction(account_number: string, type: TransactionType, amount: number, description: string) {
  const txns = db.getTransactions();
  txns.unshift({ id: generateId(), account_number, type, amount, description, date: new Date().toISOString() });
  db.setTransactions(txns);
}

export function addAdminLog(action: string) {
  const logs = db.getLogs();
  logs.unshift({ id: generateId(), admin_action: action, timestamp: new Date().toISOString() });
  db.setLogs(logs);
}

export function authenticate(emailOrMobile: string, password: string): { user: User | null; isAdmin: boolean } {
  if (emailOrMobile === ADMIN_EMAIL && password === ADMIN_PASSWORD) return { user: null, isAdmin: true };
  const users = db.getUsers();
  const user = users.find(u => (u.email === emailOrMobile || u.mobile === emailOrMobile) && u.password === password);
  return { user: user || null, isAdmin: false };
}

export function registerUser(name: string, email: string, mobile: string, password: string): User | string {
  const users = db.getUsers();
  if (users.find(u => u.email === email)) return 'Email already registered';
  if (users.find(u => u.mobile === mobile)) return 'Mobile number already registered';
  const newUser: User = {
    id: generateId(), name, email, mobile, password,
    account_number: generateAccountNumber(), balance: 0, status: 'active',
  };
  users.push(newUser);
  db.setUsers(users);
  return newUser;
}

export function getRate(from: string, to: string): number {
  if (from === to) return 1;
  const rates = db.getRates();
  const direct = rates.find(r => r.pair === `${from}_${to}`);
  if (direct) return direct.rate;
  const inverse = rates.find(r => r.pair === `${to}_${from}`);
  if (inverse) return 1 / inverse.rate;
  if (from !== 'USD' && to !== 'USD') {
    const fromToUsd = rates.find(r => r.pair === `${from}_USD`);
    const usdToFrom = rates.find(r => r.pair === `USD_${from}`);
    const usdToTo = rates.find(r => r.pair === `USD_${to}`);
    const toToUsd = rates.find(r => r.pair === `${to}_USD`);
    const fromInUsd = fromToUsd ? fromToUsd.rate : usdToFrom ? 1 / usdToFrom.rate : null;
    const toFromUsd = usdToTo ? usdToTo.rate : toToUsd ? 1 / toToUsd.rate : null;
    if (fromInUsd && toFromUsd) return fromInUsd * toFromUsd;
  }
  return 1;
}

export const ADMIN_CREDENTIALS = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };

export const COUNTRY_CITIES: Record<string, string[]> = {
  Afghanistan: ['Kabul', 'Herat', 'Mazar-e-Sharif', 'Kandahar', 'Jalalabad'],
  Pakistan: ['Islamabad', 'Lahore', 'Karachi', 'Peshawar', 'Quetta'],
};

export const CURRENCIES = ['USD', 'EUR', 'AFN', 'PKR', 'IRR'];

export const CORPORATE_BANK = {
  holder: 'Finovix Ltd',
  bank: 'International Exchange Bank',
  account: '0012-3456-7890-1234',
  iban: 'IEB0012345678901234',
  card: '4111-1111-1111-1234',
};
