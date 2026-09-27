import { prisma } from '../config/db.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { logger } from '../config/logger.js';
import { createNotification } from './notificationService.js';

async function ensureCategoryOwnership(userId, categoryId) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      OR: [{ userId }, { isDefault: true }]
    }
  });

  if (!category) {
    logger.warn('Invalid category access attempt', { userId, categoryId });
    throw new ValidationError('Categoria inválida ou não pertence ao usuário.');
  }
  return category;
}

// Mesma janela usada por budgetService.monthDateRange: o front envia a data como
// string nua ("2026-09-01"), que o JS grava como meia-noite UTC. Filtrar por
// hora local deslocaria a fronteira do mês em relação à tela de Orçamentos.
function monthWindow(year, month) {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  };
}

async function sumSpent(userId, categoryId, window, excludeTransactionId = null) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      categoryId,
      type: 'expense',
      transactionDate: { gte: window.gte, lt: window.lt },
      ...(excludeTransactionId ? { NOT: { id: excludeTransactionId } } : {}),
    }
  });

  return transactions.reduce((sum, item) => sum + Number(item.amount), 0);
}

// previousAmount: valor da versão anterior desta transação, quando ela já estava
// na mesma categoria/mês e está sendo substituída por este lançamento. Entra no
// total anterior para que editar uma transação que já estourou o orçamento não
// dispare um segundo alerta; em create, é 0 e o total anterior é a soma da janela.
async function calculateBudgetAlert(userId, payload, options = {}) {
  const { excludeTransactionId = null, previousAmount = 0 } = options;

  if (payload.type !== 'expense') return null;

  const date = new Date(payload.transactionDate);
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  const budget = await prisma.budget.findFirst({
    where: {
      userId,
      categoryId: payload.categoryId,
      month,
      year
    },
    include: { category: true }
  });

  if (!budget) return null;

  const currentSpent = await sumSpent(userId, payload.categoryId, monthWindow(year, month), excludeTransactionId);
  const spentBefore = currentSpent + previousAmount;
  const projected = currentSpent + Number(payload.amount);
  const limit = Number(budget.limitAmount);

  // Só dispara na transição real de "dentro do limite" para "estourado",
  // usando o total que o usuário já via antes da operação.
  const wasExceeded = spentBefore > limit;
  const willBeExceeded = projected > limit;

  if (willBeExceeded && !wasExceeded) {
    // Budget just exceeded - trigger notification
    await createNotification(
      userId,
      'budget_exceeded',
      'Orçamento Estourado! ⚠️',
      `Você ultrapassou o limite de R$ ${limit.toFixed(2)} para a categoria "${budget.category.name}" em ${month}/${year}. Gasto atual: R$ ${projected.toFixed(2)}.`,
      { budgetId: budget.id, categoryId: budget.categoryId, month, year }
    );
  }

  if (projected > limit) {
    logger.warn('Budget limit exceeded', { 
      userId, 
      categoryId: payload.categoryId, 
      category: budget.category.name,
      limit, 
      projected,
      exceededBy: projected - limit 
    });
    
    return {
      category: budget.category.name,
      month,
      year,
      limit,
      projected,
      exceededBy: projected - limit
    };
  }

  return null;
}

export async function listTransactions(userId, query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(query.type ? { type: query.type } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...((query.startDate || query.endDate) ? {
      transactionDate: {
        ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
        ...(query.endDate ? { lte: new Date(query.endDate) } : {})
      }
    } : {})
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { transactionDate: 'desc' },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);

  logger.info('Transactions listed with pagination', { 
    userId, 
    page, 
    limit, 
    total,
    returned: transactions.length 
  });

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

export async function createTransaction(userId, data) {
  await ensureCategoryOwnership(userId, data.categoryId);
  const budgetAlert = await calculateBudgetAlert(userId, data);

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId: data.categoryId,
      type: data.type,
      title: data.title,
      description: data.description,
      amount: data.amount,
      transactionDate: new Date(data.transactionDate)
    },
    include: { category: true }
  });

  logger.info('Transaction created in database', { 
    userId, 
    transactionId: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    budgetAlert: !!budgetAlert 
  });

  return { transaction, budgetAlert };
}

export async function updateTransaction(userId, id, data) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) {
    logger.warn('Update attempt for non-existent transaction', { userId, transactionId: id });
    throw new NotFoundError('Transação não encontrada.');
  }

  await ensureCategoryOwnership(userId, data.categoryId);

  // "Anterior" = o gasto que o usuário já via. Só entra na conta se a transação
  // antiga já estava na mesma categoria e no mesmo mês do novo registro; se foi
  // movida de lugar, o total anterior é apenas a soma dos demais.
  const previousDate = new Date(existing.transactionDate);
  const sameWindow =
    existing.categoryId === data.categoryId &&
    previousDate.getUTCFullYear() === new Date(data.transactionDate).getUTCFullYear() &&
    previousDate.getUTCMonth() === new Date(data.transactionDate).getUTCMonth();

  const budgetAlert = await calculateBudgetAlert(userId, data, {
    excludeTransactionId: id,
    previousAmount: sameWindow && existing.type === 'expense' ? Number(existing.amount) : 0,
  });

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      type: data.type,
      title: data.title,
      description: data.description,
      amount: data.amount,
      transactionDate: new Date(data.transactionDate)
    },
    include: { category: true }
  });

  logger.info('Transaction updated in database', { 
    userId, 
    transactionId: id,
    budgetAlert: !!budgetAlert 
  });

  return { transaction, budgetAlert };
}

export async function removeTransaction(userId, id) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) {
    logger.warn('Delete attempt for non-existent transaction', { userId, transactionId: id });
    throw new NotFoundError('Transação não encontrada.');
  }

  await prisma.transaction.delete({ where: { id } });
  
  logger.info('Transaction deleted from database', { userId, transactionId: id });
}