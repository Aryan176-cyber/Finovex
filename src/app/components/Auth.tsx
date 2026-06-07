import { useState } from 'react';
import { authenticate, registerUser, User } from '../store';
import { Eye, EyeOff, Globe, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User | null, isAdmin: boolean) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ emailOrMobile: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', mobile: '', password: '', confirm: '' });

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { user, isAdmin } = authenticate(loginForm.emailOrMobile, loginForm.password);
    if (!user && !isAdmin) { setError('Invalid credentials. Please try again.'); return; }
    if (user && user.status === 'blocked') { setError('Your account has been blocked. Contact support.'); return; }
    onLogin(user, isAdmin);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (regForm.password !== regForm.confirm) { setError('Passwords do not match.'); return; }
    if (regForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    const result = registerUser(regForm.name, regForm.email, regForm.mobile, regForm.password);
    if (typeof result === 'string') { setError(result); return; }
    setSuccess(`Account created! Your account number is ${result.account_number}. Please login.`);
    setTab('login');
    setRegForm({ name: '', email: '', mobile: '', password: '', confirm: '' });
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#212529] mb-4">
            <Globe className="text-white w-7 h-7" />
          </div>
          <h1 className="text-[#212529]">FINOVIX</h1>
          <p className="text-[#6c757d] text-sm mt-1">Money Transfer & Exchange Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-4 text-sm transition-colors ${tab === t ? 'bg-[#212529] text-white' : 'text-[#6c757d] hover:bg-gray-50'}`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}
            {success && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100">{success}</div>}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#212529] mb-1.5">Email or Mobile Number</label>
                  <input
                    type="text" required
                    value={loginForm.emailOrMobile}
                    onChange={e => setLoginForm(f => ({ ...f, emailOrMobile: e.target.value }))}
                    placeholder="Enter email or mobile"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#212529] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} required
                      value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Enter password"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 rounded-lg bg-[#212529] text-white hover:bg-[#343a40] transition-colors flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-[#6c757d] mt-2">
                  Admin: admin@finovix.com / Admin@123
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#212529] mb-1.5">Full Name</label>
                  <input
                    type="text" required
                    value={regForm.name}
                    onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#212529] mb-1.5">Email Address</label>
                  <input
                    type="email" required
                    value={regForm.email}
                    onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#212529] mb-1.5">Mobile Number</label>
                  <input
                    type="tel" required
                    value={regForm.mobile}
                    onChange={e => setRegForm(f => ({ ...f, mobile: e.target.value }))}
                    placeholder="+1 234 567 8900"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#212529] mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} required
                      value={regForm.password}
                      onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400 pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#212529] mb-1.5">Confirm Password</label>
                  <input
                    type="password" required
                    value={regForm.confirm}
                    onChange={e => setRegForm(f => ({ ...f, confirm: e.target.value }))}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#f8f9fa] focus:outline-none focus:border-[#212529] transition-colors text-[#212529] placeholder:text-gray-400"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-lg bg-[#212529] text-white hover:bg-[#343a40] transition-colors flex items-center justify-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
