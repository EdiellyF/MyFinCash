import { prisma } from '../config/db.js';
import { logger } from '../config/logger.js';

// Recompensas. Definidas no servidor para que o cliente não possa arbitrar XP.
export const XP = {
  perPill: 10,
  perModuleQuiz: 25,
  checklistComplete: 15,
};

// Total de itens do checklist, usado para liberar a recompensa de conclusão.
// Precisa acompanhar CHECKLIST em frontend/src/data/educationContent.js
// (4 alimentação + 3 transporte + 3 estudo + 3 descontos + 2 local).
export const CHECKLIST_TOTAL = 15;

function emptyProgress() {
  return {
    readPills: [],
    passedModules: [],
    skippedModules: [],
    checklistDone: [],
    checklistRewarded: false,
    xp: 0,
  };
}

export async function getProgress(userId) {
  const progress = await prisma.learningProgress.findUnique({ where: { userId } });
  return progress ?? { ...emptyProgress(), userId };
}

export async function getOrCreateProgress(userId) {
  return prisma.learningProgress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function markPillRead(userId, pillId) {
  const current = await getOrCreateProgress(userId);
  if (current.readPills.includes(pillId)) {
    return current;
  }

  return prisma.learningProgress.update({
    where: { userId },
    data: {
      readPills: [...current.readPills, pillId],
      xp: { increment: XP.perPill },
    },
  });
}

export async function passModuleQuiz(userId, moduleId) {
  const current = await getOrCreateProgress(userId);
  if (current.passedModules.includes(moduleId)) {
    return current;
  }

  return prisma.learningProgress.update({
    where: { userId },
    data: {
      passedModules: [...current.passedModules, moduleId],
      xp: { increment: XP.perModuleQuiz },
    },
  });
}

// Válvula de escape: libera o módulo seguinte sem exigir acerto no quiz.
// Entra em passedModules para destravar a trilha, mas não rende XP do quiz —
// e fica em skippedModules para o corpo docente saber quem pulou.
export async function skipModule(userId, moduleId) {
  const current = await getOrCreateProgress(userId);
  if (current.passedModules.includes(moduleId)) {
    return current;
  }

  return prisma.learningProgress.update({
    where: { userId },
    data: {
      passedModules: [...current.passedModules, moduleId],
      skippedModules: [...(current.skippedModules ?? []), moduleId],
    },
  });
}

export async function toggleChecklistItem(userId, itemId) {
  const current = await getOrCreateProgress(userId);
  const isDone = current.checklistDone.includes(itemId);

  const checklistDone = isDone
    ? current.checklistDone.filter(id => id !== itemId)
    : [...current.checklistDone, itemId];

  // A recompensa de conclusão é única: só entra na primeira vez que o usuário
  // marca todos os itens, e nunca é retirada se ele desmarcar depois.
  const earnsReward = !current.checklistRewarded && checklistDone.length >= CHECKLIST_TOTAL;

  const updated = await prisma.learningProgress.update({
    where: { userId },
    data: {
      checklistDone,
      ...(earnsReward
        ? { checklistRewarded: true, xp: { increment: XP.checklistComplete } }
        : {}),
    },
  });

  if (earnsReward) {
    logger.info('Learning checklist completed', { userId });
  }

  return updated;
}
