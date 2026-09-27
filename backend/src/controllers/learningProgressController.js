import { ok } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';
import {
  getProgress,
  markPillRead,
  passModuleQuiz,
  skipModule,
  toggleChecklistItem,
} from '../services/learningProgressService.js';

const ACTIONS = {
  completePill: (userId, id) => markPillRead(userId, id),
  passQuiz: (userId, id) => passModuleQuiz(userId, id),
  skipModule: (userId, id) => skipModule(userId, id),
  toggleChecklist: (userId, id) => toggleChecklistItem(userId, id),
};

export async function show(req, res) {
  const progress = await getProgress(req.user.id);
  return ok(res, progress, 'Progresso da trilha carregado.');
}

export async function update(req, res) {
  const { action, id } = req.body ?? {};

  if (!action || !ACTIONS[action]) {
    throw new ValidationError('Ação inválida. Use: completePill, passQuiz, skipModule ou toggleChecklist.');
  }

  if (!id || typeof id !== 'string') {
    throw new ValidationError('O campo "id" é obrigatório para esta ação.');
  }

  const progress = await ACTIONS[action](req.user.id, id);
  return ok(res, progress, 'Progresso atualizado.');
}
