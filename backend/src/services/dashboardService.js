import { prisma } from '../config/db.js';

export async function getDashboardData(userId) {

  const allTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { transactionDate: 'desc' }
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); 
  const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0));
  const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1, 0, 0, 0));

  const currentMonthTransactions = allTransactions.filter((item) => {
    const d = new Date(item.transactionDate);
    return d >= startOfMonth && d < startOfNextMonth;
  });

  const totalIncome = currentMonthTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpense = currentMonthTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expensesByCategoryMap = {};
  currentMonthTransactions.filter((item) => item.type === 'expense').forEach((item) => {
    const key = item.category?.name || 'Sem categoria';
    expensesByCategoryMap[key] = (expensesByCategoryMap[key] || 0) + Number(item.amount);
  });

  const monthlyMap = {};
  allTransactions.forEach((item) => {
    const date = new Date(item.transactionDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }

    monthlyMap[monthKey][item.type] += Number(item.amount);
  });

  return {
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    expensesByCategory: Object.entries(expensesByCategoryMap).map(([name, value]) => ({ name, value })),
    monthlyMovement: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
    recentTransactions: allTransactions.slice(0, 8)
  };
}