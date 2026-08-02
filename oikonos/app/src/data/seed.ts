import type {
  AppState, Category, CategoryId, Bill, Subscription, Contribution,
  Payee, Notice, ConnectedApp, Settings,
} from './types';

export const CATEGORIES: Record<CategoryId, Category> = {
  food:          { id: 'food',          label: 'Food & Dining',  icon: 'bag',      ink: 'olive' },
  groceries:     { id: 'groceries',     label: 'Groceries',      icon: 'basket',   ink: 'olive' },
  transport:     { id: 'transport',     label: 'Transport',      icon: 'wheel',    ink: 'ink' },
  home:          { id: 'home',          label: 'Home',           icon: 'house',    ink: 'ink' },
  shopping:      { id: 'shopping',      label: 'Shopping',       icon: 'tag',      ink: 'vermilion' },
  health:        { id: 'health',        label: 'Health',         icon: 'leaf',     ink: 'olive' },
  travel:        { id: 'travel',        label: 'Travel',         icon: 'sail',     ink: 'ink' },
  bills:         { id: 'bills',         label: 'Bills & Utilities', icon: 'bolt',  ink: 'vermilion' },
  entertainment: { id: 'entertainment', label: 'Entertainment',  icon: 'ticket',   ink: 'vermilion' },
  education:     { id: 'education',     label: 'Education',      icon: 'book',     ink: 'ink' },
  income:        { id: 'income',        label: 'Income',         icon: 'rise',     ink: 'olive' },
  transfer:      { id: 'transfer',      label: 'Transfer',       icon: 'swap',     ink: 'ink' },
};

/* The reference sheet is dated May 18 2024 — the app's clock is pinned
   there so every seeded figure reads exactly as designed. */
export const NOW = '2024-05-18T14:20:00';

type Raw = [merchant: string, cat: CategoryId, amount: number, at: string, acct: string, place?: string, note?: string];

const RAW: Raw[] = [
  ['Good Earth',            'food',          -2850,   '2024-05-18T13:42:00', 'hdfc', 'Lodhi Colony, New Delhi', 'Long lunch with Meera. Split three ways, I covered it.'],
  ['Blue Tokai Coffee',     'food',          -480,    '2024-05-18T09:12:00', 'upi',  'Khan Market'],
  ['Uber',                  'transport',     -320,    '2024-05-18T08:40:00', 'upi',  'Nizamuddin → Khan Market'],
  ['Nature’s Basket',  'groceries',     -3240,   '2024-05-17T19:05:00', 'hdfc', 'Vasant Vihar'],
  ['Indigo Airlines',       'travel',        -18400,  '2024-05-17T11:30:00', 'amex', 'DEL → ATH, 12 Sep', 'Greek Summer — outbound leg booked.'],
  ['Aegean Home Store',     'home',          -6750,   '2024-05-16T16:20:00', 'amex', 'Select Citywalk'],
  ['Airtel Fibre',          'bills',         -1499,   '2024-05-16T06:00:00', 'hdfc', 'Auto-debit'],
  ['Salary — Meridian Labs','income',         206000, '2024-05-15T00:05:00', 'hdfc', 'NEFT credit'],
  ['Kunzum Books',          'education',     -1850,   '2024-05-15T18:44:00', 'upi',  'Greater Kailash'],
  ['Ola Electric',          'transport',     -260,    '2024-05-14T20:11:00', 'upi'],
  ['Sodabottleopenerwala',  'food',          -3120,   '2024-05-14T21:05:00', 'amex', 'Cyber Hub'],
  ['Apollo Pharmacy',       'health',        -940,    '2024-05-13T10:22:00', 'upi',  'Defence Colony'],
  ['PVR Director’s Cut','entertainment',-2400,   '2024-05-12T20:30:00', 'amex', 'Vasant Kunj'],
  ['BluSmart',              'transport',     -410,    '2024-05-12T18:02:00', 'upi'],
  ['Zomato',                'food',          -1180,   '2024-05-11T21:40:00', 'upi'],
  ['Rent — Nizamuddin East','home',          -62000,  '2024-05-05T09:00:00', 'hdfc', 'Standing instruction'],
  ['Tata Power',            'bills',         -3820,   '2024-05-05T07:30:00', 'hdfc', 'Auto-debit'],
  ['Index Fund SIP',        'transfer',      -40000,  '2024-05-03T09:00:00', 'hdfc', 'Monthly SIP'],
  ['Greek Summer — deposit','transfer',      -25000,  '2024-05-02T09:00:00', 'hdfc', 'Goal auto-save'],
  ['Fabindia',              'shopping',      -4290,   '2024-05-02T17:15:00', 'amex', 'Khan Market'],
  ['Dishoom Delivery',      'food',          -1640,   '2024-04-29T20:50:00', 'upi'],
  ['Design Consulting',     'income',         48000,  '2024-04-28T12:00:00', 'hdfc', 'Invoice #114'],
  ['Le Marché',             'groceries',     -2980,   '2024-04-27T11:20:00', 'hdfc'],
  ['Vistara',               'travel',        -9200,   '2024-04-24T14:00:00', 'amex', 'DEL → BOM'],
  ['The Piano Man',         'entertainment', -1800,   '2024-04-20T22:10:00', 'amex', 'Safdarjung Enclave'],
];

const RECURRING = new Set(['Airtel Fibre', 'Rent — Nizamuddin East', 'Tata Power', 'Index Fund SIP', 'Greek Summer — deposit', 'Salary — Meridian Labs']);

/* ================================================================
   Full-app seed
   ================================================================ */

export const BILLS: Bill[] = [
  { id: 'bl1', name: 'Rent — Nizamuddin East', category: 'home', amount: 62000, due: '2024-06-05', accountId: 'hdfc', status: 'scheduled', autopay: true },
  { id: 'bl2', name: 'Tata Power', category: 'bills', amount: 3820, due: '2024-06-05', accountId: 'hdfc', status: 'scheduled', autopay: true },
  { id: 'bl3', name: 'Airtel Fibre', category: 'bills', amount: 1499, due: '2024-05-22', accountId: 'hdfc', status: 'due', autopay: true },
  { id: 'bl4', name: 'Amex Platinum', category: 'bills', amount: 48250, due: '2024-05-20', accountId: 'hdfc', status: 'due', autopay: false },
  { id: 'bl5', name: 'Society Maintenance', category: 'home', amount: 6400, due: '2024-05-14', accountId: 'hdfc', status: 'overdue', autopay: false },
  { id: 'bl6', name: 'Water — DJB', category: 'bills', amount: 780, due: '2024-05-08', accountId: 'hdfc', status: 'paid', autopay: true },
];

export const SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', name: 'Spotify Duo', category: 'entertainment', amount: 149, everyMonths: 1, nextAt: '2024-05-28', accountId: 'upi' },
  { id: 's2', name: 'Netflix', category: 'entertainment', amount: 649, everyMonths: 1, nextAt: '2024-06-02', accountId: 'amex', priceRose: 150 },
  { id: 's3', name: 'iCloud 2TB', category: 'bills', amount: 749, everyMonths: 1, nextAt: '2024-05-26', accountId: 'amex' },
  { id: 's4', name: 'Figma Professional', category: 'education', amount: 1250, everyMonths: 1, nextAt: '2024-06-01', accountId: 'amex' },
  { id: 's5', name: 'Cult.fit Elite', category: 'health', amount: 16000, everyMonths: 12, nextAt: '2024-11-04', accountId: 'hdfc' },
  { id: 's6', name: 'The Ken', category: 'education', amount: 2750, everyMonths: 12, nextAt: '2025-01-19', accountId: 'amex' },
];

export const CONTRIBUTIONS: Contribution[] = [
  { id: 'c1', goalId: 'g1', amount: 25000, at: '2024-05-02T09:00:00', auto: true },
  { id: 'c2', goalId: 'g1', amount: 25000, at: '2024-04-02T09:00:00', auto: true },
  { id: 'c3', goalId: 'g1', amount: 30000, at: '2024-03-14T18:20:00', auto: false },
  { id: 'c4', goalId: 'g1', amount: 25000, at: '2024-03-02T09:00:00', auto: true },
  { id: 'c5', goalId: 'g1', amount: 20000, at: '2024-02-02T09:00:00', auto: true },
  { id: 'c6', goalId: 'g2', amount: 30000, at: '2024-05-02T09:00:00', auto: true },
  { id: 'c7', goalId: 'g2', amount: 30000, at: '2024-04-02T09:00:00', auto: true },
  { id: 'c8', goalId: 'g3', amount: 20000, at: '2024-05-02T09:00:00', auto: true },
  { id: 'c9', goalId: 'g4', amount: 15000, at: '2024-05-02T09:00:00', auto: true },
];

export const PAYEES: Payee[] = [
  { id: 'p1', name: 'Meera Nair', kind: 'person', handle: 'meera@okaxis', lastAt: '2024-05-18T14:05:00' },
  { id: 'p2', name: 'Ravi (flatmate)', kind: 'person', handle: 'ravi.kt@okhdfcbank', lastAt: '2024-05-06T10:12:00' },
  { id: 'p3', name: 'Sunita — help', kind: 'person', handle: '98••••2210', lastAt: '2024-05-01T08:00:00' },
  { id: 'p4', name: 'Kunzum Books', kind: 'business', handle: 'kunzum@ybl', lastAt: '2024-05-15T18:44:00' },
  { id: 'p5', name: 'Blue Tokai', kind: 'business', handle: 'bluetokai@icici', lastAt: '2024-05-18T09:12:00' },
];

export const NOTICES: Notice[] = [
  { id: 'n1', kind: 'bill', title: 'Amex Platinum due in 2 days', body: '₹48,250 — no autopay set on this one.', at: '2024-05-18T08:00:00', read: false, route: 'bills' },
  { id: 'n2', kind: 'budget', title: 'Bills & Utilities is 76% spent', body: '₹1,681 left with 13 days to go.', at: '2024-05-17T09:30:00', read: false, route: 'budgets' },
  { id: 'n3', kind: 'goal', title: 'Greek Summer passed 60%', body: 'On track for September at ₹25,000 a month.', at: '2024-05-02T09:05:00', read: true, route: 'goal', routeId: 'g1' },
  { id: 'n4', kind: 'insight', title: 'Netflix went up ₹150', body: 'From ₹499 to ₹649 on the 2nd.', at: '2024-05-03T07:00:00', read: true, route: 'subscriptions' },
  { id: 'n5', kind: 'security', title: 'New sign-in on iPad', body: 'New Delhi · 14 May, 9:41 PM.', at: '2024-05-14T21:41:00', read: true, route: 'security' },
];

export const CONNECTED: ConnectedApp[] = [
  { id: 'ca1', name: 'Zerodha Console', scope: 'Reads holdings and P&L', connectedAt: '2023-11-02', ink: 'olive' },
  { id: 'ca2', name: 'Cleartax', scope: 'Reads capital-gains statements', connectedAt: '2024-01-18', ink: 'ink' },
  { id: 'ca3', name: 'Splitwise', scope: 'Reads settled expenses', connectedAt: '2024-03-09', ink: 'vermilion' },
];

export const SETTINGS: Settings = {
  texture: 'full',
  motion: 'full',
  privacy: false,
  weekStart: 'monday',
  currency: 'INR',
  biometrics: true,
  notifications: { budgets: true, bills: true, goals: true, insights: true, security: true },
};

export const SEED: AppState = {
  user: { name: 'Arjun', handle: '@arjun' },
  now: NOW,

  accounts: [
    { id: 'hdfc', name: 'HDFC Savings',    kind: 'bank',   tail: '4021', balance: 412600, ink: 'ink' },
    { id: 'amex', name: 'Amex Platinum',   kind: 'card',   tail: '7318', balance: -48250, ink: 'vermilion' },
    { id: 'upi',  name: 'UPI Wallet',      kind: 'wallet', tail: '9902', balance: 12400,  ink: 'olive' },
    { id: 'zer',  name: 'Zerodha Equity',  kind: 'invest', tail: '5510', balance: 497600, ink: 'olive' },
  ],

  txns: RAW.map(([merchant, category, amount, at, accountId, place, note], i) => ({
    id: `t${String(i + 1).padStart(3, '0')}`,
    merchant, category, amount, at, accountId, place, note,
    recurring: RECURRING.has(merchant),
  })),

  budgets: [
    { id: 'b1', category: 'food',          limit: 18000, rollover: 1200 },
    { id: 'b2', category: 'groceries',     limit: 12000, rollover: -400 },
    { id: 'b3', category: 'transport',     limit: 6000,  rollover: 900 },
    { id: 'b4', category: 'shopping',      limit: 8000,  rollover: 0 },
    { id: 'b5', category: 'entertainment', limit: 6000,  rollover: 350 },
    { id: 'b6', category: 'health',        limit: 4000,  rollover: 2100 },
    { id: 'b7', category: 'bills',         limit: 7000,  rollover: 0 },
  ],

  goals: [
    { id: 'g1', name: 'Greek Summer', blurb: 'Two weeks island-hopping, September.',
      target: 200000, saved: 125000, by: '2024-09-01', monthly: 25000, scene: 'acropolis', ink: 'ink' },
    { id: 'g2', name: 'Emergency Fund', blurb: 'Six months of runway, untouched.',
      target: 600000, saved: 384000, by: '2025-03-01', monthly: 30000, scene: 'harbour', ink: 'olive' },
    { id: 'g3', name: 'Studio Move', blurb: 'Deposit and fit-out for the new place.',
      target: 350000, saved: 92000, by: '2025-01-15', monthly: 20000, scene: 'santorini', ink: 'vermilion' },
    { id: 'g4', name: 'Olive Grove', blurb: 'A slow, patient someday fund.',
      target: 1500000, saved: 210000, by: '2029-06-01', monthly: 15000, scene: 'olivegrove', ink: 'olive' },
  ],

  bills: BILLS,
  subscriptions: SUBSCRIPTIONS,
  contributions: CONTRIBUTIONS,
  payees: PAYEES,
  notices: NOTICES,
  connected: CONNECTED,
  settings: SETTINGS,

  history: [
    { month: '2023-12-01', income: 198000, expenses: 121400, netWorth: 642000 },
    { month: '2024-01-01', income: 206000, expenses: 138900, netWorth: 698500 },
    { month: '2024-02-01', income: 212000, expenses: 109300, netWorth: 741200 },
    { month: '2024-03-01', income: 254000, expenses: 152600, netWorth: 776800 },
    { month: '2024-04-01', income: 248000, expenses: 118050, netWorth: 812400 },
    { month: '2024-05-01', income: 254000, expenses:  92750, netWorth: 874350 },
  ],
};

/** Reference figures the home screen must reproduce exactly. */
export const YTD = {
  netWorth: 874350,
  changePct: 12.4,
  income: 1240000,
  expenses: 565250,
  savings: 380750,
};

