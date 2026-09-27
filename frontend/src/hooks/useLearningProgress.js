import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { CHECKLIST, CHECKLIST_TOTAL, MODULES, levelForXp } from '../data/educationContent';

const TOTAL_PILLS = MODULES.reduce((sum, module) => sum + module.pills.length, 0);

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

export default function useLearningProgress() {
  const [progress, setProgress] = useState(emptyProgress);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data } = await api.get('/learning-progress');
        if (active) setProgress({ ...emptyProgress(), ...data?.data });
      } catch (error) {
        console.error('Error loading learning progress:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // Atualização otimista: a interface responde na hora e a resposta do servidor
  // reconcilia. Ações são idempotentes no backend, então repetir é seguro.
  const send = useCallback(async (action, id) => {
    try {
      const { data } = await api.patch('/learning-progress', { action, id });
      setProgress({ ...emptyProgress(), ...data?.data });
      return data?.data ?? null;
    } catch (error) {
      console.error(`Error on learning progress action ${action}:`, error);
      return null;
    }
  }, []);

  const completePill = useCallback((pillId) => send('completePill', pillId), [send]);
  const passQuiz = useCallback((moduleId) => send('passQuiz', moduleId), [send]);
  const skipQuiz = useCallback((moduleId) => send('skipModule', moduleId), [send]);
  const toggleChecklist = useCallback((itemId) => send('toggleChecklist', itemId), [send]);

  const derived = useMemo(() => {
    const readPills = progress.readPills ?? [];
    const passedModules = progress.passedModules ?? [];
    const skippedModules = progress.skippedModules ?? [];
    const checklistDone = progress.checklistDone ?? [];

    // Um módulo só destrava quando o quiz do anterior foi aprovado. O Módulo 1
    // é sempre liberado para que ninguém fique preso sem conseguir começar.
    const isModuleUnlocked = (index) =>
      index === 0 || passedModules.includes(MODULES[index - 1].id);

    return {
      totalPills: TOTAL_PILLS,
      pillsRead: readPills.length,
      overallPercent: TOTAL_PILLS ? (readPills.length / TOTAL_PILLS) * 100 : 0,
      checklistDone: checklistDone.length,
      checklistTotal: CHECKLIST_TOTAL,
      checklistPercent: CHECKLIST_TOTAL ? (checklistDone.length / CHECKLIST_TOTAL) * 100 : 0,
      checklistComplete: checklistDone.length >= CHECKLIST_TOTAL,
      isModuleUnlocked,
      hasPassed: (moduleId) => passedModules.includes(moduleId),
      hasSkipped: (moduleId) => skippedModules.includes(moduleId),
      isPillRead: (pillId) => readPills.includes(pillId),
      isChecklistDone: (itemId) => checklistDone.includes(itemId),
      modulesPassed: MODULES.filter((module) => passedModules.includes(module.id)).length,
      level: levelForXp(progress.xp ?? 0),
    };
  }, [progress]);

  return { progress, loading, derived, completePill, passQuiz, skipQuiz, toggleChecklist };
}
