export type CategoryId =
  | 'food' | 'groceries' | 'transport' | 'home' | 'shopping'
  | 'health' | 'travel' | 'bills' | 'entertainment' | 'education'
  | 'income' | 'transfer';

export interface Category {
  id: CategoryId;
  label: string;
  /** Icon key resolved by <CategoryIcon> */
  icon: string;
  /** Which of the three inks this category is printed in */
  ink: 'ink' | 'olive' | 'vermilion';
}

export type AccountKind = 'bank' | 'card' | 'wallet' | 'invest';

export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  /** last four of the account/card number */
  tail: string;
  balance: number;
  ink: 'ink' | 'olive' | 'vermilion';
}

export interface Txn {
  id: string;
  merchant: string;
  /** Short human note shown on the detail screen */
  note?: string;
  category: CategoryId;
  /** negative = money out, positive = money in */
  amount: number;
  /** ISO datetime */
  at: string;
  accountId: string;
  /** Where it happened — shown on the detail screen */
  place?: string;
  /** Marks a transaction the user has flagged for review */
  flagged?: boolean;
  recurring?: boolean;
}

export interface Budget {
  id: string;
  category: CategoryId;
  /** monthly allocation */
  limit: number;
  /** rollover from previous month, can be negative */
  rollover: number;
}

export interface Goal {
  id: string;
  name: string;
  /** One-line intent shown under the title */
  blurb: string;
  target: number;
  saved: number;
  /** ISO date the user is aiming for */
  by: string;
  /** monthly auto-contribution */
  monthly: number;
  /** which illustration to print on the goal screen */
  scene: 'acropolis' | 'santorini' | 'harbour' | 'olivegrove';
  ink: 'ink' | 'olive' | 'vermilion';
}

export interface MonthPoint {
  /** ISO first-of-month */
  month: string;
  income: number;
  expenses: number;
  netWorth: number;
}

export interface AppState {
  user: { name: string; handle: string };
  /** The app's notion of "now" — fixed so the seeded data reads correctly */
  now: string;
  accounts: Account[];
  txns: Txn[];
  budgets: Budget[];
  goals: Goal[];
  history: MonthPoint[];
  bills: Bill[];
  subscriptions: Subscription[];
  contributions: Contribution[];
  payees: Payee[];
  notices: Notice[];
  connected: ConnectedApp[];
  settings: Settings;
}

/* ================================================================
   Full-app additions
   ================================================================ */

export interface Merchant {
  /** slug used in routes */
  id: string;
  name: string;
  category: CategoryId;
  /** where the user usually meets it */
  place?: string;
}

export type BillStatus = 'due' | 'scheduled' | 'paid' | 'overdue';

export interface Bill {
  id: string;
  name: string;
  category: CategoryId;
  amount: number;
  /** ISO date the money leaves */
  due: string;
  accountId: string;
  status: BillStatus;
  autopay: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  category: CategoryId;
  amount: number;
  /** every N months — 1 monthly, 12 yearly */
  everyMonths: number;
  nextAt: string;
  accountId: string;
  /** the app noticed a price change */
  priceRose?: number;
}

export interface Contribution {
  id: string;
  goalId: string;
  amount: number;
  at: string;
  /** auto-save vs a deliberate top-up */
  auto: boolean;
}

export type PayeeKind = 'person' | 'business';

export interface Payee {
  id: string;
  name: string;
  kind: PayeeKind;
  /** UPI handle or account tail */
  handle: string;
  /** ISO of the last time money moved */
  lastAt?: string;
}

export type NoticeKind = 'budget' | 'bill' | 'goal' | 'security' | 'insight';

export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
  /** where tapping it should land */
  route?: string;
  routeId?: string;
}

export interface Settings {
  /** the paper grain and ink texture can be dialled back */
  texture: 'full' | 'subtle' | 'off';
  motion: 'full' | 'reduced';
  /** hide every figure behind a tap */
  privacy: boolean;
  weekStart: 'sunday' | 'monday';
  /** the app is rupee-first but the formatter is switchable */
  currency: 'INR' | 'EUR' | 'USD';
  biometrics: boolean;
  notifications: {
    budgets: boolean;
    bills: boolean;
    goals: boolean;
    insights: boolean;
    security: boolean;
  };
}

export interface ConnectedApp {
  id: string;
  name: string;
  /** what it can see */
  scope: string;
  connectedAt: string;
  ink: 'ink' | 'olive' | 'vermilion';
}
