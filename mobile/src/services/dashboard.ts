import { api } from "./api";

export type DashboardTransactionType =
  | "INCOME"
  | "EXPENSE";

export type InsightSeverity =
  | "HIGH"
  | "MEDIUM"
  | "INFO";

export type BudgetStatus =
  | "ON_TRACK"
  | "NEAR_LIMIT"
  | "OVER_LIMIT";

export type GoalInsightStatus =
  | "COMPLETED"
  | "ON_TRACK"
  | "REQUIRES_CONTRIBUTION"
  | "OVERDUE";

export type ComparisonDirection =
  | "INCREASE"
  | "DECREASE"
  | "STABLE";

export interface DashboardPeriod {
  startDate: string;
  endDate: string;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  balanceVariation: number;
}

export interface DashboardAccount {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
}

export interface DashboardCategoryExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface DashboardTransaction {
  id: string;
  description: string;
  type: DashboardTransactionType;
  amount: number;
  date: string;
  status: string;
  account: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export interface DashboardCreditCards {
  total: number;
  totalCreditLimit: number;
  totalAvailableCredit: number;
  totalUsedCredit: number;
}

export interface DashboardGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progress: number;
  targetDate: string | null;
  status: string;
}

export interface DashboardGoals {
  total: number;
  items: DashboardGoal[];
}

export interface DashboardBudget {
  id: string;
  [key: string]: unknown;
}

export interface DashboardBudgets {
  total: number;
  items: DashboardBudget[];
}

export interface DashboardSummaryResponse {
  period: DashboardPeriod;

  summary: DashboardSummary;

  accounts: {
    total: number;
    items: DashboardAccount[];
  };

  expensesByCategory: DashboardCategoryExpense[];

  recentTransactions: DashboardTransaction[];

  creditCards: DashboardCreditCards;

  goals: DashboardGoals;

  budgets: DashboardBudgets;
}

export interface DashboardOverviewMonth {
  year: number;
  month: number;
  label: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardOverviewResponse {
  period: DashboardPeriod;
  months: DashboardOverviewMonth[];
}

export interface DashboardCashFlowDay {
  day: number;
  date: string;
  income: number;
  expenses: number;
  balance: number;
  accumulatedBalance: number;
}

export interface DashboardCashFlowResponse {
  period: DashboardPeriod;
  days: DashboardCashFlowDay[];
}

export interface SpendingInsightCategory {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface SpendingInsight {
  type: "SPENDING_INCREASE";
  severity: InsightSeverity;
  title: string;
  message: string;
  category: SpendingInsightCategory;
  currentAmount: number;
  previousAmount: number;
  difference: number;
  percentageChange: number;
}

export interface DashboardSpendingInsights {
  generatedAt: string;
  period: {
    current: DashboardPeriod;
    previous: DashboardPeriod;
  };
  total: number;
  insights: SpendingInsight[];
}

export interface ExpenseConcentrationCategory
  extends SpendingInsightCategory {
  amount: number;
  percentage: number;
}

export interface ExpenseConcentrationInsight {
  type: "EXPENSE_CONCENTRATION";
  severity: "INFO";
  title: string;
  message: string;
}

export interface DashboardConcentrationInsights {
  generatedAt: string;
  period: DashboardPeriod;
  totalExpenses: number;
  categoryCount: number;
  topCategories: ExpenseConcentrationCategory[];
  concentration: {
    topCategoriesCount: number;
    amount: number;
    percentage: number;
    threshold: number;
    isSignificant: boolean;
  };
  insight: ExpenseConcentrationInsight | null;
}

export interface DashboardProjectionInsights {
  generatedAt: string;
  period: DashboardPeriod;
  days: {
    elapsed: number;
    remaining: number;
    total: number;
  };
  current: {
    totalExpenses: number;
    averageDailyExpense: number;
  };
  projection: {
    projectedTotal: number;
    projectedRemaining: number;
  };
}

export interface DashboardMonthlyComparison {
  generatedAt: string;
  period: {
    current: DashboardPeriod;
    previous: DashboardPeriod;
  };
  current: {
    amount: number;
  };
  previous: {
    amount: number;
  };
  comparison: {
    difference: number;
    percentageChange: number | null;
    direction: ComparisonDirection;
  };
}

export interface BudgetInsightCategory
  extends SpendingInsightCategory {}

export interface BudgetInsightBudget {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
}

export interface BudgetInsight {
  type: "BUDGET_USAGE";
  severity: InsightSeverity;
  budget: BudgetInsightBudget;
  category: BudgetInsightCategory;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: BudgetStatus;
}

export interface DashboardBudgetInsights {
  generatedAt: string;
  totalBudgets: number;
  totalCategories: number;
  insights: BudgetInsight[];
}

export interface GoalInsight {
  type: "FINANCIAL_GOAL";
  severity: InsightSeverity;
  goal: {
    id: string;
    name: string;
    description: string | null;
    targetDate: string | null;
    status: string;
    color: string | null;
    icon: string | null;
  };
  progress: {
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    percentage: number;
  };
  timeline: {
    daysUntilTarget: number | null;
    monthsUntilTarget: number | null;
    requiredMonthlyContribution: number | null;
  };
  contributions: {
    count: number;
    total: number;
    lastContribution: {
      id: string;
      amount: number | string;
      date: string;
      [key: string]: unknown;
    } | null;
  };
  status: GoalInsightStatus;
}

export interface DashboardGoalInsights {
  generatedAt: string;
  total: number;
  insights: GoalInsight[];
}

export interface RecurringInsight {
  id: string;
  description: string;
  type: DashboardTransactionType;
  frequency: string;
  amount: number;
  monthlyAmount: number;
  annualAmount: number;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  notes: string | null;
  category: SpendingInsightCategory;
  account: {
    id: string;
    name: string;
  };
}

export interface DashboardRecurringInsights {
  generatedAt: string;
  total: number;
  summary: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyNetImpact: number;
    annualIncome: number;
    annualExpenses: number;
    annualNetImpact: number;
  };
  nextRecurring: RecurringInsight | null;
  insights: RecurringInsight[];
}

export interface DashboardInsightsResponse {
  generatedAt: string;
  spending: DashboardSpendingInsights;
  concentration: DashboardConcentrationInsights;
  projection: DashboardProjectionInsights;
  monthlyComparison: DashboardMonthlyComparison;
  budget: DashboardBudgetInsights;
  goals: DashboardGoalInsights;
  recurring: DashboardRecurringInsights;
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const response =
    await api.get<DashboardSummaryResponse>(
      "/dashboard/summary",
    );

  return response.data;
}

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  const response =
    await api.get<DashboardOverviewResponse>(
      "/dashboard/overview",
    );

  return response.data;
}

export async function getDashboardCashFlow(): Promise<DashboardCashFlowResponse> {
  const response =
    await api.get<DashboardCashFlowResponse>(
      "/dashboard/cash-flow",
    );

  return response.data;
}

export async function getDashboardInsights(): Promise<DashboardInsightsResponse> {
  const response =
    await api.get<DashboardInsightsResponse>(
      "/dashboard/insights",
    );

  return response.data;
}