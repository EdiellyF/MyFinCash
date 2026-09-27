import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../config/db.js';
import { createTransaction } from '../services/transactionService.js';
import { createNotification } from '../services/notificationService.js';

vi.mock('../config/db.js', () => {
  const create = vi.fn();
  const findFirst = vi.fn();
  const findMany = vi.fn();
  return {
    prisma: {
      category: { findFirst },
      transaction: { create, findMany },
      budget: { findFirst },
    },
  };
});

vi.mock('../services/notificationService.js', () => ({
  createNotification: vi.fn(),
}));

describe('transactionService - budget notification triggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers notification when budget is exceeded for the first time', async () => {
    const userId = 'user-1';
    const categoryId = 'cat-food';
    const budgetId = 'budget-1';

   
    prisma.category.findFirst.mockImplementation(({ where }) => {
      if (where.OR && where.OR.some(c => c.userId === userId || c.isDefault === true)) {
        return Promise.resolve({
          id: categoryId,
          userId: null,
          name: 'Alimentação',
          isDefault: true,
        });
      }
      return Promise.resolve(null);
    });

    // Mock budget with limit
    prisma.budget.findFirst.mockResolvedValue({
      id: budgetId,
      userId,
      categoryId,
      month: 9,
      year: 2026,
      limitAmount: 500,
      category: { name: 'Alimentação' },
    });

    // Mock existing transactions (spent 400)
    prisma.transaction.findMany.mockResolvedValue([
      { amount: 400 },
    ]);

    // Mock new transaction creation
    prisma.transaction.create.mockResolvedValue({
      id: 'trans-1',
      userId,
      categoryId,
      type: 'expense',
      amount: 150, // 400 + 150 = 550 > 500 (exceeded)
      title: 'Jantar',
    });

    await createTransaction(userId, {
      categoryId,
      type: 'expense',
      title: 'Jantar',
      amount: 150,
      transactionDate: '2026-09-27',
    });

    expect(createNotification).toHaveBeenCalledWith(
      userId,
      'budget_exceeded',
      'Orçamento Estourado! ⚠️',
      expect.stringContaining('Alimentação'),
      expect.objectContaining({
        budgetId,
        categoryId,
        month: 9,
        year: 2026,
      })
    );
  });

  it('does not trigger notification when budget was already exceeded', async () => {
    const userId = 'user-1';
    const categoryId = 'cat-food';

    // Mock category ownership - call must match the OR condition
    prisma.category.findFirst.mockImplementation(({ where }) => {
      if (where.OR && where.OR.some(c => c.userId === userId || c.isDefault === true)) {
        return Promise.resolve({
          id: categoryId,
          userId: null,
          name: 'Alimentação',
          isDefault: true,
        });
      }
      return Promise.resolve(null);
    });

    // Mock budget with limit
    prisma.budget.findFirst.mockResolvedValue({
      id: 'budget-1',
      userId,
      categoryId,
      month: 9,
      year: 2026,
      limitAmount: 500,
      category: { name: 'Alimentação' },
    });

    // Mock existing transactions (already exceeded: spent 600)
    prisma.transaction.findMany.mockResolvedValue([
      { amount: 600 },
    ]);

    // Mock new transaction creation
    prisma.transaction.create.mockResolvedValue({
      id: 'trans-1',
      userId,
      categoryId,
      type: 'expense',
      amount: 50, // 600 + 50 = 650 > 500 (still exceeded)
      title: 'Lanche',
    });

    await createTransaction(userId, {
      categoryId,
      type: 'expense',
      title: 'Lanche',
      amount: 50,
      transactionDate: '2026-09-27',
    });

    expect(createNotification).not.toHaveBeenCalled();
  });

  it('does not trigger notification when budget is not exceeded', async () => {
    const userId = 'user-1';
    const categoryId = 'cat-food';

    // Mock category ownership - call must match the OR condition
    prisma.category.findFirst.mockImplementation(({ where }) => {
      if (where.OR && where.OR.some(c => c.userId === userId || c.isDefault === true)) {
        return Promise.resolve({
          id: categoryId,
          userId: null,
          name: 'Alimentação',
          isDefault: true,
        });
      }
      return Promise.resolve(null);
    });

    // Mock budget with limit
    prisma.budget.findFirst.mockResolvedValue({
      id: 'budget-1',
      userId,
      categoryId,
      month: 9,
      year: 2026,
      limitAmount: 500,
      category: { name: 'Alimentação' },
    });

    // Mock existing transactions (spent 300)
    prisma.transaction.findMany.mockResolvedValue([
      { amount: 300 },
    ]);

    // Mock new transaction creation
    prisma.transaction.create.mockResolvedValue({
      id: 'trans-1',
      userId,
      categoryId,
      type: 'expense',
      amount: 100, // 300 + 100 = 400 < 500 (not exceeded)
      title: 'Café',
    });

    await createTransaction(userId, {
      categoryId,
      type: 'expense',
      title: 'Café',
      amount: 100,
      transactionDate: '2026-09-27',
    });

    expect(createNotification).not.toHaveBeenCalled();
  });
});
