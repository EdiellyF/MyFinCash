import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../config/db.js';
import {
  getProgress,
  getOrCreateProgress,
  markPillRead,
  passModuleQuiz,
  skipModule,
  toggleChecklistItem,
  XP,
  CHECKLIST_TOTAL,
} from '../services/learningProgressService.js';

vi.mock('../config/db.js', () => {
  const findUnique = vi.fn();
  const upsert = vi.fn();
  const update = vi.fn();

  return {
    prisma: {
      learningProgress: { findUnique, upsert, update },
    },
  };
});

function baseProgress(overrides = {}) {
  return {
    userId: 'user-1',
    readPills: [],
    passedModules: [],
    skippedModules: [],
    checklistDone: [],
    checklistRewarded: false,
    xp: 0,
    ...overrides,
  };
}

// Espelha os ids de CHECKLIST em frontend/src/data/educationContent.js.
const ALL_ITEMS = [
  'food-ru', 'food-market', 'food-delivery', 'food-feira',
  'trans-pass', 'trans-carona', 'trans-bilhete',
  'study-used', 'study-library', 'study-share',
  'discount-cine', 'discount-m365', 'discount-celular',
  'local-food', 'local-moradia',
];

describe('learningProgressService', () => {
  it('declares a checklist total that matches the frontend content', () => {
    expect(ALL_ITEMS).toHaveLength(CHECKLIST_TOTAL);
  });
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.learningProgress.upsert.mockImplementation(async ({ create }) => baseProgress(create));
  });

  describe('getProgress', () => {
    it('returns an empty progress when the user has never started', async () => {
      prisma.learningProgress.findUnique.mockResolvedValue(null);

      const result = await getProgress('user-1');

      expect(result.readPills).toEqual([]);
      expect(result.passedModules).toEqual([]);
      expect(result.checklistDone).toEqual([]);
      expect(result.xp).toBe(0);
    });

    it('returns the stored progress when it exists', async () => {
      prisma.learningProgress.findUnique.mockResolvedValue(baseProgress({ readPills: ['m1-p1'], xp: 10 }));

      const result = await getProgress('user-1');

      expect(result.readPills).toEqual(['m1-p1']);
      expect(result.xp).toBe(10);
    });
  });

  describe('markPillRead', () => {
    it('adds the pill and awards XP on first read', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress());
      prisma.learningProgress.update.mockResolvedValue(baseProgress({ readPills: ['m1-p1'] }));

      await markPillRead('user-1', 'm1-p1');

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          readPills: ['m1-p1'],
          xp: { increment: XP.perPill },
        },
      });
    });

    it('is idempotent: reading the same pill twice awards XP only once', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress({ readPills: ['m1-p1'] }));

      await markPillRead('user-1', 'm1-p1');

      expect(prisma.learningProgress.update).not.toHaveBeenCalled();
    });
  });

  describe('passModuleQuiz', () => {
    it('records the module and awards XP', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress({ readPills: ['m1-p1', 'm1-p2'] }));

      await passModuleQuiz('user-1', 'm1');

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          passedModules: ['m1'],
          xp: { increment: XP.perModuleQuiz },
        },
      });
    });

    it('is idempotent: re-passing the same quiz awards XP only once', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress({ passedModules: ['m1'] }));

      await passModuleQuiz('user-1', 'm1');

      expect(prisma.learningProgress.update).not.toHaveBeenCalled();
    });
  });

  describe('skipModule', () => {
    it('unlocks the next module without awarding quiz XP', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress({ readPills: ['m1-p1', 'm1-p2'], xp: 20 }));

      await skipModule('user-1', 'm1');

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          passedModules: ['m1'],
          skippedModules: ['m1'],
        },
      });
      // Sem xp: increment no data significa que o bônus do quiz foi retido.
      expect(prisma.learningProgress.update.mock.calls[0][0].data).not.toHaveProperty('xp');
    });

    it('is idempotent: skipping twice records nothing new', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(
        baseProgress({ passedModules: ['m1'], skippedModules: ['m1'] })
      );

      await skipModule('user-1', 'm1');

      expect(prisma.learningProgress.update).not.toHaveBeenCalled();
    });

    it('does not award XP again if the quiz is passed after skipping', async () => {
      // O módulo já está em passedModules por causa do skip, então passar no
      // quiz depois não pode conceder o bônus de novo.
      prisma.learningProgress.upsert.mockResolvedValue(
        baseProgress({ passedModules: ['m1'], skippedModules: ['m1'] })
      );

      await passModuleQuiz('user-1', 'm1');

      expect(prisma.learningProgress.update).not.toHaveBeenCalled();
    });
  });

  describe('toggleChecklistItem', () => {
    it('marks an item as done', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress());
      prisma.learningProgress.update.mockResolvedValue(baseProgress({ checklistDone: ['food-ru'] }));

      await toggleChecklistItem('user-1', 'food-ru');

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { checklistDone: ['food-ru'] },
      });
    });

    it('unmarks an item that was done', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress({ checklistDone: ['food-ru', 'food-market'] }));

      await toggleChecklistItem('user-1', 'food-ru');

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { checklistDone: ['food-market'] },
      });
    });

    it('awards the completion bonus exactly once when every item is done', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(
        baseProgress({ checklistDone: ALL_ITEMS.slice(0, CHECKLIST_TOTAL - 1) })
      );

      await toggleChecklistItem('user-1', ALL_ITEMS[CHECKLIST_TOTAL - 1]);

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          checklistDone: ALL_ITEMS,
          checklistRewarded: true,
          xp: { increment: XP.checklistComplete },
        },
      });
    });

    it('does not award the bonus again if the user unchecks and rechecks later', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(
        baseProgress({ checklistDone: ALL_ITEMS, checklistRewarded: true })
      );

      await toggleChecklistItem('user-1', ALL_ITEMS[0]);

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { checklistDone: ALL_ITEMS.slice(1) },
      });
    });

    it('never awards the bonus while items remain unchecked', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress({ checklistDone: ALL_ITEMS.slice(0, 3) }));

      await toggleChecklistItem('user-1', ALL_ITEMS[3]);

      expect(prisma.learningProgress.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { checklistDone: ALL_ITEMS.slice(0, 4) },
      });
    });
  });

  describe('user isolation', () => {
    it('always scopes reads and writes to the requested userId', async () => {
      prisma.learningProgress.upsert.mockResolvedValue(baseProgress());

      await getOrCreateProgress('user-2');

      expect(prisma.learningProgress.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-2' },
        update: {},
        create: { userId: 'user-2' },
      });
    });

    it('cannot read another user progress by guessing the id', async () => {
      prisma.learningProgress.findUnique.mockResolvedValue(null);

      // getProgress só recebe o userId do token, nunca um id vindo do cliente.
      await getProgress('user-1');

      expect(prisma.learningProgress.findUnique).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });
});
