import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../config/db.js';
import { updateGoal } from '../services/goalService.js';
import { createNotification } from '../services/notificationService.js';

vi.mock('../config/db.js', () => {
  const findFirst = vi.fn();
  const update = vi.fn();
  return {
    prisma: {
      goal: { findFirst, update },
    },
  };
});

vi.mock('../services/notificationService.js', () => ({
  createNotification: vi.fn(),
}));

describe('goalService - notification triggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers notification when goal reaches 100% for the first time', async () => {
    const userId = 'user-1';
    const goalId = 'goal-1';

    // Mock existing goal with progress < 100%
    prisma.goal.findFirst.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 500, // 50% progress
    });

    // Mock updated goal with progress >= 100%
    prisma.goal.update.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 1000, // 100% progress
    });

    await updateGoal(userId, goalId, {
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 1000,
    });

    expect(createNotification).toHaveBeenCalledWith(
      userId,
      'goal_reached',
      'Meta Atingida! 🎉',
      expect.stringContaining('Viagem'),
      { goalId }
    );
  });

  it('does not trigger notification when goal was already at 100%', async () => {
    const userId = 'user-1';
    const goalId = 'goal-1';

    // Mock existing goal already at 100%
    prisma.goal.findFirst.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 1000, // Already 100%
    });

    // Mock updated goal still at 100%
    prisma.goal.update.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 1000,
    });

    await updateGoal(userId, goalId, {
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 1000,
    });

    expect(createNotification).not.toHaveBeenCalled();
  });

  it('does not trigger notification when goal progress is still below 100%', async () => {
    const userId = 'user-1';
    const goalId = 'goal-1';

    // Mock existing goal at 50%
    prisma.goal.findFirst.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 500,
    });

    // Mock updated goal at 75%
    prisma.goal.update.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 750,
    });

    await updateGoal(userId, goalId, {
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 750,
    });

    expect(createNotification).not.toHaveBeenCalled();
  });

  it('triggers notification when goal exceeds 100%', async () => {
    const userId = 'user-1';
    const goalId = 'goal-1';

    // Mock existing goal at 90%
    prisma.goal.findFirst.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 900,
    });

    // Mock updated goal at 110%
    prisma.goal.update.mockResolvedValue({
      id: goalId,
      userId,
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 1100,
    });

    await updateGoal(userId, goalId, {
      title: 'Viagem',
      targetAmount: 1000,
      currentAmount: 1100,
    });

    expect(createNotification).toHaveBeenCalledWith(
      userId,
      'goal_reached',
      'Meta Atingida! 🎉',
      expect.stringContaining('Viagem'),
      { goalId }
    );
  });
});
