import { useState, useCallback } from 'react';
import { Auth } from './components/Auth';
import { Layout, UserView } from './components/Layout';
import { UserDashboard } from './components/UserDashboard';
import { MoneyTransfer } from './components/MoneyTransfer';
import { Deposits } from './components/Deposits';
import { Withdrawals } from './components/Withdrawals';
import { ExchangeOfficePortal } from './components/ExchangeOfficePortal';
import { AdminPanel } from './components/AdminPanel';
import { User, db } from './store';

type AuthState =
  | { type: 'guest' }
  | { type: 'user'; user: User }
  | { type: 'admin' };

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ type: 'guest' });
  const [view, setView] = useState<UserView>('dashboard');

  function handleLogin(user: User | null, isAdmin: boolean) {
    if (isAdmin) { setAuth({ type: 'admin' }); return; }
    if (user) { setAuth({ type: 'user', user }); setView('dashboard'); }
  }

  function handleLogout() {
    setAuth({ type: 'guest' });
  }

  const refreshUser = useCallback((): User => {
    if (auth.type !== 'user') return {} as User;
    const users = db.getUsers();
    const fresh = users.find(u => u.account_number === auth.user.account_number);
    if (fresh) {
      setAuth({ type: 'user', user: fresh });
      return fresh;
    }
    return auth.user;
  }, [auth]);

  if (auth.type === 'guest') {
    return <Auth onLogin={handleLogin} />;
  }

  if (auth.type === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  const user = auth.user;

  return (
    <Layout user={user} view={view} onViewChange={setView} onLogout={handleLogout}>
      {view === 'dashboard' && <UserDashboard user={user} onRefresh={refreshUser} />}
      {view === 'transfer' && <MoneyTransfer user={user} onRefresh={refreshUser} />}
      {view === 'deposit' && <Deposits user={user} />}
      {view === 'withdraw' && <Withdrawals user={user} onRefresh={refreshUser} />}
      {view === 'sarafi' && <ExchangeOfficePortal />}
    </Layout>
  );
}
