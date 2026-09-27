import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../config/db.js';
import { createTransaction, updateTransaction } from '../services/transactionService.js';
import { createNotification } from '../services/notificationService.js';

vi.mock('../config/db.js', () => {
  // Cada model precisa do seu próprio mock: com um vi.fn() compartilhado, o
  // último mockResolvedValue sobrescreveria os outros e o serviço leria o
  // registro errado (ex.: ler a transação como se fosse o orçamento).
  const categoryFindFirst = vi.fn();
  const transactionCreate = vi.fn();
  const transactionFindFirst = vi.fn();
  const transactionFindMany = vi.fn();
  const transactionUpdate = vi.fn();
  const budgetFindFirst = vi.fn();

  return {
    prisma: {
      category: { findFirst: categoryFindFirst },
      transaction: {
        create: transactionCreate,
        findFirst: transactionFindFirst,
        findMany: transactionFindMany,
        update: transactionUpdate,
      },
      budget: { findFirst: budgetFindFirst },
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

  describe('month window must match the Budgets page (budgetService.monthDateRange)', () => {
    beforeEach(() => {
      prisma.category.findFirst.mockResolvedValue({
        id: 'cat-food',
        userId: null,
        name: 'Alimentação',
        isDefault: true,
      });
      prisma.budget.findFirst.mockResolvedValue({
        id: 'budget-1',
        categoryId: 'cat-food',
        month: 9,
        year: 2026,
        limitAmount: 500,
        category: { name: 'Alimentação' },
      });
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.create.mockResolvedValue({ id: 'trans-1' });
    });

    it('queries the month using UTC boundaries, not local time', async () => {
      // "2026-09-01" é gravado como meia-noite UTC. Em UTC-3 isso é 31/08 21:00
      // local, então uma janela em hora local deixaria a transação de fora.
      await createTransaction('user-1', {
        categoryId: 'cat-food',
        type: 'expense',
        title: 'Padaria',
        amount: 10,
        transactionDate: '2026-09-01',
      });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            transactionDate: {
              gte: new Date(Date.UTC(2026, 8, 1)),
              lt: new Date(Date.UTC(2026, 9, 1)),
            },
          }),
        })
      );
    });

    it('resolves a first-of-month date to its own month, not the previous one', async () => {
      await createTransaction('user-1', {
        categoryId: 'cat-food',
        type: 'expense',
        title: 'Virada',
        amount: 10,
        transactionDate: '2026-10-01',
      });

      expect(prisma.budget.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ month: 10, year: 2026 }),
        })
      );
      expect(prisma.budget.findFirst).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ month: 9 }),
        })
      );
    });
  });

  describe('editing a transaction must not duplicate the alert', () => {
    beforeEach(() => {
      prisma.category.findFirst.mockResolvedValue({
        id: 'cat-food',
        userId: null,
        name: 'Alimentação',
        isDefault: true,
      });
      prisma.budget.findFirst.mockImplementation(({ where }) => Promise.resolve({
        id: `budget-${where.categoryId}`,
        categoryId: where.categoryId,
        month: where.month,
        year: where.year,
        limitAmount: 500,
        category: { name: where.categoryId === 'cat-food' ? 'Alimentação' : 'Transporte' },
      }));
      prisma.transaction.update.mockResolvedValue({ id: 'trans-1' });
    });

    it('does not re-notify when only the title of the offending transaction changes', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'trans-1',
        userId: 'user-1',
        categoryId: 'cat-food',
        type: 'expense',
        amount: 550, // já estourou o limite de 500 e já foi notificado
        transactionDate: new Date('2026-09-15'),
      });
      prisma.transaction.findMany.mockResolvedValue([]);

      await updateTransaction('user-1', 'trans-1', {
        categoryId: 'cat-food',
        type: 'expense',
        title: 'Jantar renomeado',
        amount: 550,
        transactionDate: '2026-09-15',
      });

      expect(createNotification).not.toHaveBeenCalled();
    });

    it('notifies when editing the amount is what crosses the limit', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'trans-1',
        userId: 'user-1',
        categoryId: 'cat-food',
        type: 'expense',
        amount: 400, // dentro do limite
        transactionDate: new Date('2026-09-15'),
      });
      prisma.transaction.findMany.mockResolvedValue([]);

      await updateTransaction('user-1', 'trans-1', {
        categoryId: 'cat-food',
        type: 'expense',
        title: 'Jantar',
        amount: 550, // 400 -> 550 cruza o limite de 500
        transactionDate: '2026-09-15',
      });

      expect(createNotification).toHaveBeenCalledWith(
        'user-1',
        'budget_exceeded',
        'Orçamento Estourado! ⚠️',
        expect.stringContaining('Alimentação'),
        expect.objectContaining({ budgetId: 'budget-cat-food', month: 9, year: 2026 })
      );
    });

    it('treats a transaction moved to another category as never having been counted', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'trans-1',
        userId: 'user-1',
        categoryId: 'cat-food',
        type: 'expense',
        amount: 550,
        transactionDate: new Date('2026-09-15'),
      });
      prisma.transaction.findMany.mockResolvedValue([]);

      await updateTransaction('user-1', 'trans-1', {
        categoryId: 'cat-transport',
        type: 'expense',
        title: 'Jantar',
        amount: 550,
        transactionDate: '2026-09-15',
      });

      // Nada foi gasto antes em Transporte, então estourar é transição nova.
      expect(createNotification).toHaveBeenCalledWith(
        'user-1',
        'budget_exceeded',
        'Orçamento Estourado! ⚠️',
        expect.any(String),
        expect.objectContaining({ categoryId: 'cat-transport' })
      );
    });
  });
});
