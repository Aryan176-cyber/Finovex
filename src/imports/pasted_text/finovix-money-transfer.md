این یک پرامپت مهندسی‌شده، فوق‌العاده جامع، ساختاریافته و **بدون هیچ‌گونه نقص فنی (Bulletproof Prompt)** به زبان انگلیسی است. ساختار این پرامپت به گونه‌ای تنظیم شده است که پلتفرم‌های ساخت برنامه بر پایه هوش مصنوعی (مانند Bolt.new، Lovable، یا v0) بتوانند تمام منطق بک‌اند، ساختار کامپوننت‌های فرانت‌اند، قوانین پایگاه داده و منطق محاسباتی پلتفرم شما را به صورت دقیق، یک‌جا و کاملاً عملیاتی پیاده‌سازی کنند.

می‌توانید متن زیر را کپی کرده و به عنوان دستورالعمل به هوش مصنوعی مورد نظر بدهید:

---

```text
Act as an elite full-stack engineer and enterprise software architect. Build a highly secure, functional, and enterprise-grade Web Application named "FINOVIX MONEY TRANSFER & EXCHANGE PLATFORM" using standard web technologies.

### UI/UX & STYLING ARCHITECTURE
- Aesthetic Theme: Strict "White Mode" design language. Use a clean, modern, and minimal light-themed palette.
- Backgrounds & Typography: Pure whites (#ffffff) and very light grays (#f8f9fa), with deep dark text (#212529) to ensure excellent contrast and professional readability.
- Layout Orientation: 100% Left-to-Right (LTR) alignment. The entire app environment, dashboards, forms, variables, data tables, and generated receipts must be in pure English. Do not integrate any right-to-left components or multi-language configurations.
- Responsiveness: Native mobile-first architecture that seamlessly expands to accommodate tablet and desktop viewports. No incomplete skeletons or placeholder blocks; all buttons, routing, views, modals, and tables must be fully interactive.

### DATA ARCHITECTURE & STATE MANAGEMENT
Implement a centralized and persistent state system using localStorage to mimic a live relational database architecture based exactly on these 8 tables:
1. users: id, name, email, mobile, password, account_number (auto-generated in sequential 'FNX100001' format), balance (defaults to 0.00), status (active, blocked)
2. deposits: id, account_number, amount, receipt_url, status (pending, approved, rejected), date
3. withdrawals: id, account_number, amount, bank_details, status (pending, approved, rejected), date
4. money_transfers: transfer_number (unique crypto-random string), sender_account, receiver_name, receiver_phone, country, city, amount_sent, currency_sent, amount_received, currency_received, exchange_office_id, fee, status (pending, approved, rejected), date
5. exchange_offices: id, first_name, fathers_name, last_name, mobile, email, office_name, license_number, address, countries_supported (array), bank_name, bank_account, account_holder, whatsapp, status (pending, approved, suspended)
6. exchange_rates: pair (e.g., USD_AFN, USD_PKR, EUR_USD), rate, last_updated
7. transactions: id, account_number, type (credit, debit), amount, description, date
8. admin_logs: id, admin_action, timestamp

### REQUISITE SYSTEM FEATURES

#### 1. AUTHENTICATION & ONBOARDING
- User sign-up requiring Name, Email, Mobile Number, and Password. Upon submission, automatically assign a unique sequential account number matching the 'FNX100001' format.
- Login module supporting verification via either Email or Mobile Number alongside the matching password.

#### 2. USER WALLET DASHBOARD
- Clean metric summary cards showing: Current Available Balance, Auto-generated Account Number, and active request statuses.
- Real-time tabular logs displaying the user's personal transaction history, pending/completed deposit requests, and withdrawal requests.

#### 3. INTERNATIONAL REMITTANCE ENGINE
- Cascading geographic select menus restricted strictly to:
  * Afghanistan Cities: Kabul, Herat, Mazar-e-Sharif, Kandahar, Jalalabad
  * Pakistan Cities: Islamabad, Lahore, Karachi, Peshawar, Quetta
- Recipient information profile fields mapping Full Name, Mobile Number, Sent Amount, and target Currency.
- Dynamic Exchange Office Selector: Query the local store to filter and display only the "approved" Exchange Offices (Sarafis) that list the chosen destination country in their configuration.
- Exchange Rate Calculator: Implement an automated interval clock mimicking an active third-party API that updates rates every 30 to 60 seconds between USD, EUR, AFN, PKR, and IRR.
- Dynamic pricing component displaying: Current conversion exchange rate, baseline transfer amount, precise foreign currency receiving amount, structural processing fee, and absolute Total Payable Amount.

#### 4. FUND MANAGEMENT (DEPOSITS & WITHDRAWALS)
- Bank Deposit Directory: Visual interface displaying corporate bank information (Account Holder: Finovix Ltd, Bank Name: International Exchange Bank, Account Number, IBAN, Card Number).
- Deposit Request Console: Form to type the deposit amount, featuring a modular mockup image uploader to attach payment receipts. The default state initiates as 'pending' until admin intervention.
- Withdrawal Terminal: Form requesting transaction amount and precise target bank criteria. Initiates as 'pending'.

#### 5. EXCHANGE OFFICE (SARAFI) PORTAL
- Dedicated onboarding pipeline collecting the exact 13 data points defined in the specification (First Name, Father's Name, Last Name, Mobile, Email, Address, Office Name, License Number, Countries Supported, Bank Account Number, Bank Name, Account Holder Name, WhatsApp Number).
- Strict onboarding lifecycle rule: All initial office submissions are set to 'pending' and are completely hidden from the user transfer terminal until an administrator updates their status to 'approved'.

#### 6. ENTERPRISE ADMINISTRATIVE PLATFORM (ADMIN PANEL)
- User Management Module: Tabular dashboard to view all accounts, execute inline name/ID searches, toggle block/unblock system access states, and run manual numeric adjustments on wallet balances.
- Operational Queue Hub: Isolated, filterable ledger screens handling execution requests for:
  * Pending Deposits: Approving credits the user balance and appends an immutable transaction record.
  * Pending Withdrawals: Approving deducts the user balance and appends a transaction record.
  * Pending Transfers: Approving changes the record status to approved, locks the ledger balance, and triggers receipt outputs.
- Sarafi Management Terminal: Approve, reject, edit parameters, or actively suspend exchange office configurations.
- Exchange Rate Controls: Live currency matrix console with manual numeric input fields providing instant global manual rate overrides.
- Receipt & Notification Engine: Generates a perfectly structured, clean, scannable invoice receipt containing all standard criteria (Transfer number, Date, Sender, Receiver, Destination parameters, exact financial amounts, and active Sarafi contact channels like WhatsApp and Phone). Emulate an automated PDF email transmission system upon approval.

### MANDATORY BUSINESS & INTEGRITY COMPLIANCE RULES
- Ledger Immutability: Every single alteration to a user balance field MUST programmatically inject a descriptive log entry containing a unique ID into the transactions table.
- Strict Gatekeeping: No individual transaction, deposit, withdrawal, or Sarafi profile can affect live platform operations or wallet balances without transitioning from 'pending' to 'approved' via explicit administrative interaction.
- Generate all unique dynamic identifier strings cleanly using standard semantic web methods. Ensure the design utilizes clean grid layouts and flexible elements to support mobile views perfectly.

```