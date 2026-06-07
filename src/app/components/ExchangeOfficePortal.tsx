import { useState } from 'react';
import { db, generateId, COUNTRY_CITIES } from '../store';
import { Building2, CheckCircle, AlertCircle } from 'lucide-react';

export function ExchangeOfficePortal() {
  const [form, setForm] = useState({
    first_name: '', fathers_name: '', last_name: '',
    mobile: '', email: '', office_name: '', license_number: '',
    address: '', bank_account: '', bank_name: '', account_holder: '',
    whatsapp: '',
    countries_supported: [] as string[],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function toggleCountry(c: string) {
    setForm(f => ({
      ...f,
      countries_supported: f.countries_supported.includes(c)
        ? f.countries_supported.filter(x => x !== c)
        : [...f.countries_supported, c],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.countries_supported.length === 0) { setError('Please select at least one supported country.'); return; }

    const offices = db.getOffices();
    if (offices.find(o => o.license_number === form.license_number)) {
      setError('An office with this license number is already registered.');
      return;
    }

    offices.push({
      id: generateId(),
      ...form,
      status: 'pending',
    });
    db.setOffices(offices);

    setSuccess('Exchange office registration submitted! Awaiting admin approval. You will be notified once approved.');
    setForm({
      first_name: '', fathers_name: '', last_name: '',
      mobile: '', email: '', office_name: '', license_number: '',
      address: '', bank_account: '', bank_name: '', account_holder: '',
      whatsapp: '', countries_supported: [],
    });
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-[#212529]">Exchange Office Registration</h2>
        <p className="text-[#6c757d] text-sm mt-1">Register your Sarafi (exchange office) to appear in the transfer network</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>Important:</strong> All registrations are reviewed by our compliance team. Your office will appear in the transfer network only after admin approval.
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100 flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="text-[#212529] border-b border-gray-100 pb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Owner Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="First Name">
            <input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" className={inputCls} />
          </Field>
          <Field label="Father's Name">
            <input required value={form.fathers_name} onChange={e => setForm(f => ({ ...f, fathers_name: e.target.value }))} placeholder="Father's name" className={inputCls} />
          </Field>
          <Field label="Last Name">
            <input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mobile Number">
            <input required type="tel" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="+93 700 000 000" className={inputCls} />
          </Field>
          <Field label="WhatsApp Number">
            <input required type="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+93 700 000 000" className={inputCls} />
          </Field>
        </div>

        <Field label="Email Address">
          <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="office@example.com" className={inputCls} />
        </Field>

        <h3 className="text-[#212529] border-b border-gray-100 pb-3 pt-2">Office Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Office Name">
            <input required value={form.office_name} onChange={e => setForm(f => ({ ...f, office_name: e.target.value }))} placeholder="e.g. Kabul Exchange" className={inputCls} />
          </Field>
          <Field label="License Number">
            <input required value={form.license_number} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))} placeholder="Official license ID" className={inputCls} />
          </Field>
        </div>

        <Field label="Office Address">
          <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full physical address" className={inputCls} />
        </Field>

        <Field label="Countries Supported">
          <div className="flex gap-3 flex-wrap mt-1">
            {Object.keys(COUNTRY_CITIES).map(country => (
              <label key={country} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.countries_supported.includes(country)}
                  onChange={() => toggleCountry(country)}
                  className="w-4 h-4 accent-[#212529]"
                />
                <span className="text-sm text-[#212529]">{country}</span>
              </label>
            ))}
          </div>
        </Field>

        <h3 className="text-[#212529] border-b border-gray-100 pb-3 pt-2">Banking Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bank Name">
            <input required value={form.bank_name} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="Bank name" className={inputCls} />
          </Field>
          <Field label="Bank Account Number">
            <input required value={form.bank_account} onChange={e => setForm(f => ({ ...f, bank_account: e.target.value }))} placeholder="Account number" className={inputCls} />
          </Field>
        </div>

        <Field label="Account Holder Name">
          <input required value={form.account_holder} onChange={e => setForm(f => ({ ...f, account_holder: e.target.value }))} placeholder="Name on bank account" className={inputCls} />
        </Field>

        <button type="submit" className="w-full py-3 rounded-xl bg-[#212529] text-white hover:bg-[#343a40] transition-colors">
          Submit Registration
        </button>
      </form>
    </div>
  );
}
