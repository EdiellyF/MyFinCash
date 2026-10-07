import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/db.js', () => {
  const findMany = vi.fn();
  return {
    prisma: {
      transaction: { findMany }
    }
  };
});

import { prisma } from '../config/db.js';
import { getDashboardData } from '../services/dashboardService.js';

beforeEach(() => {
  prisma.transaction.findMany.mockReset();
});


function dateInCurrentMonth(day) {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), day)).toISOString();
}

function dateInPreviousMonth(day) {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, day)).toISOString();
}

describe('dashboardService', () => {
  it('calculates totals and groups correctly, considering only the current month', async () => {
    const transactions = [
      { id: 1, type: 'income', amount: 1000, transactionDate: dateInCurrentMonth(1), category: { name: 'Salary' }, userId: 1 },
      { id: 2, type: 'expense', amount: 200, transactionDate: dateInCurrentMonth(2), category: { name: 'Food' }, userId: 1 },
      { id: 3, type: 'expense', amount: 50, transactionDate: dateInPreviousMonth(15), category: { name: 'Transport' }, userId: 1 }
    ];

    prisma.transaction.findMany.mockResolvedValue(transactions);

    const result = await getDashboardData(1);

    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpense).toBe(200); 
    expect(result.expensesByCategory.some(c => c.name === 'Food' && c.value === 200)).toBeTruthy();
    expect(result.expensesByCategory.some(c => c.name === 'Transport')).toBeFalsy();
    expect(result.recentTransactions.length).toBeGreaterThan(0);
  });

  it('excludes transactions from months other than the current one from totals', async () => {
    const transactions = [
      { id: 1, type: 'income', amount: 500, transactionDate: dateInPreviousMonth(10), category: { name: 'Freelance' }, userId: 1 },
      { id: 2, type: 'expense', amount: 300, transactionDate: dateInPreviousMonth(12), category: { name: 'Food' }, userId: 1 }
    ];

    prisma.transaction.findMany.mockResolvedValue(transactions);

    const result = await getDashboardData(1);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.expensesByCategory).toEqual([]);
   
    expect(result.monthlyMovement.length).toBeGreaterThan(0);
  });

  it('handles empty transaction list', async () => {
    prisma.transaction.findMany.mockResolvedValue([]);

    const result = await getDashboardData(1);

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.expensesByCategory).toEqual([]);
    expect(result.monthlyMovement).toEqual([]);
  });
});