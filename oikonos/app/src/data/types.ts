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
}
