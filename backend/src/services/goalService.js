import { prisma } from '../config/db.js';
import { NotFoundError } from '../utils/errors.js';
import { createNotification } from './notificationService.js';

function calculateProgress(goal) {
  return Number(goal.targetAmount) > 0
    ? Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100)
    : 0;
}

export async function listGoals(userId) {
  const rows = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return rows.map((goal) => ({
    ...goal,
    progress: calculateProgress(goal)
  }));
}

export async function createGoal(userId, data) {
  return prisma.goal.create({
    data: {
      userId,
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline ? new Date(data.deadline) : null
    }
  });
}

export async function updateGoal(userId, id, data) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) {
    throw new NotFoundError('Meta não encontrada.');
  }

  // Calculate previous progress
  const previousProgress = calculateProgress(goal);

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: {
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline ? new Date(data.deadline) : null
    }
  });

  // Calculate new progress
  const newProgress = calculateProgress(updatedGoal);

  // Check if goal just reached 100% (crossed from <100% to >=100%)
  if (previousProgress < 100 && newProgress >= 100) {
    await createNotification(
      userId,
      'goal_reached',
      'Meta Atingida! 🎉',
      `Parabéns! Você alcançou sua meta "${updatedGoal.title}" com sucesso.`,
      { goalId: updatedGoal.id }
    );
  }

  return updatedGoal;
}

export async function removeGoal(userId, id) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) {
    throw new NotFoundError('Meta não encontrada.');
  }

  await prisma.goal.delete({ where: { id } });
}