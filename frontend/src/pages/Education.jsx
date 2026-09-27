import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, X, Lock, Award, Info, Shield, TrendingUp, Building2 } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import useLearningProgress from '../hooks/useLearningProgress';
import { CHECKLIST_TOTAL, DISCLAIMER, GLOSSARY, MODULES } from '../data/educationContent';
import Pill from '../components/education/Pill';
import QuizCard from '../components/education/QuizCard';
import ChecklistCard from '../components/education/ChecklistCard';

const MODULE_ICONS = { Shield, TrendingUp, Building2 };

function GlossaryDrawer({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Glossário">
      <div className="absolute inset-0 bg-fincash-ink/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-floating dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-fincash-ink dark:text-fincash-cream">Glossário</h2>
            <p className="mt-1 text-sm text-fincash-ink/70 dark:text-fincash-cream/70">
              Os termos do curso, explicados em uma linha.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar glossário"
            className="rounded-sm border border-fincash-ink/10 p-2 text-fincash-ink/60 transition hover:bg-fincash-ink/5 dark:border-fincash-cream/15 dark:text-fincash-cream/60"
          >
            <X size={16} />
          </button>
        </div>

        <dl className="space-y-4">
          {GLOSSARY.map(({ term, meaning }) => (
            <div key={term} className="border-l-2 border-fincash-gold pl-3.5">
              <dt className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">{term}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">{meaning}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}

function ModuleSection({ module, index, derived, completePill, passQuiz, skipQuiz }) {
  const Icon = MODULE_ICONS[module.icon] ?? BookOpen;
  const isUnlocked = derived.isModuleUnlocked(index);
  const isPassed = derived.hasPassed(module.id);
  const isSkipped = derived.hasSkipped(module.id);
  const pillsRead = module.pills.filter(pill => derived.isPillRead(pill.id)).length;

  return (
    <section
      id={module.id}
      className={`overflow-hidden rounded-lg border ${
        isUnlocked
          ? 'border-fincash-ink/10 bg-white dark:border-fincash-cream/10 dark:bg-slate-800'
          : 'border-fincash-ink/5 bg-fincash-ink/[0.02] dark:border-fincash-cream/5 dark:bg-white/[0.02]'
      }`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-fincash-ink/10 bg-fincash-forest px-5 py-4 text-fincash-cream dark:border-fincash-cream/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/20">
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold">
              Módulo {module.number} — {module.title}
            </h2>
            <p className="mt-0.5 text-xs text-fincash-cream/80">
              {isUnlocked ? module.intro : 'Conclua o quiz do módulo anterior para liberar.'}
            </p>
          </div>
        </div>
        {isPassed && !isSkipped ? (
          <Badge tone="forest" className="bg-white/20 text-fincash-cream">
            Concluído
          </Badge>
        ) : isSkipped ? (
          <Badge tone="gold" className="bg-white/20 text-fincash-cream">
            Pulado
          </Badge>
        ) : !isUnlocked ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-fincash-cream/80">
            <Lock size={13} /> Bloqueado
          </span>
        ) : (
          <span className="text-xs font-semibold text-fincash-cream/80">
            {pillsRead} de {module.pills.length} pílulas
          </span>
        )}
      </header>

      <div className="space-y-4 p-5">
        {isUnlocked ? (
          <>
            {module.alert && (
              <div className="flex gap-3 rounded-sm border border-fincash-terracotta/30 bg-fincash-terracotta/5 p-4">
                <Info size={18} className="mt-0.5 shrink-0 text-fincash-terracotta" />
                <div>
                  <p className="text-sm font-bold text-fincash-terracotta">{module.alert.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">
                    {module.alert.text}
                  </p>
                </div>
              </div>
            )}

            {module.pills.map((pill, pillIndex) => (
              <Pill
                key={pill.id}
                pill={pill}
                index={pillIndex}
                total={module.pills.length}
                isRead={derived.isPillRead(pill.id)}
                onMarkRead={() => completePill(pill.id)}
                isUnlocked={isUnlocked}
              />
            ))}

            <QuizCard
              module={module}
              isPassed={isPassed}
              isSkipped={isSkipped}
              onPass={passQuiz}
              onSkip={skipQuiz}
            />

            {isPassed && (
              <div className="flex items-center gap-3 rounded-sm border border-fincash-gold/40 bg-fincash-gold/10 p-4">
                <Award size={20} className="shrink-0 text-[#6F5019]" />
                <div>
                  <p className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">
                    {isSkipped ? `📖 Módulo liberado — ${module.reward}` : `${module.rewardIcon} Nível desbloqueado: ${module.reward}`}
                  </p>
                  <p className="mt-0.5 text-xs text-fincash-ink/70 dark:text-fincash-cream/70">
                    {index + 1 < MODULES.length
                      ? 'Módulo seguinte liberado. Bom estudo!'
                      : 'Você concluiu a trilha inteira. Parabéns!'}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center gap-2.5 rounded-sm border border-dashed border-fincash-ink/15 p-8 text-sm text-fincash-ink/50 dark:border-fincash-cream/15 dark:text-fincash-cream/50">
            <Lock size={16} />
            Bloqueado. Passe no quiz do Módulo {module.number - 1} para liberar.
          </div>
        )}
      </div>
    </section>
  );
}

export default function Education() {
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const { derived, completePill, passQuiz, skipQuiz, toggleChecklist } = useLearningProgress();

  useEffect(() => {
    document.body.style.overflow = glossaryOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [glossaryOpen]);

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="overflow-hidden rounded-lg bg-fincash-forest p-6 text-fincash-cream">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-white/15">
                <GraduationCap size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-fincash-gold">Trilha de 3 módulos</p>
                <h1 className="mt-1 text-2xl font-bold">Educação Financeira</h1>
                <p className="mt-1.5 text-sm text-fincash-cream/85">
                  Leia uma pílula por vez. Cada módulo leva cerca de 10 minutos.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                {derived.level.icon} {derived.level.name}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">{derived.progress?.xp ?? 0} XP</span>
              <button
                onClick={() => setGlossaryOpen(true)}
                className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/15"
              >
                Glossário
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-fincash-cream/85">
              <span>
                {derived.pillsRead} de {derived.totalPills} pílulas · {derived.modulesPassed} de {MODULES.length} módulos
              </span>
              <span>{derived.overallPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-sm bg-white/20">
              <div
                className="h-full rounded-sm bg-fincash-gold transition-all duration-500"
                style={{ width: `${derived.overallPercent}%` }}
              />
            </div>
          </div>
        </header>

        <ChecklistCard derived={derived} toggleChecklist={toggleChecklist} />

        {MODULES.map((module, index) => (
          <ModuleSection
            key={module.id}
            module={module}
            index={index}
            derived={derived}
            completePill={completePill}
            passQuiz={passQuiz}
            skipQuiz={skipQuiz}
          />
        ))}

        <footer className="flex gap-3 rounded-lg border border-fincash-ink/10 bg-white p-5 dark:border-fincash-cream/10 dark:bg-slate-800">
          <Info size={16} className="mt-0.5 shrink-0 text-fincash-ink/40 dark:text-fincash-cream/40" />
          <div className="space-y-1.5">
            <p className="text-xs leading-relaxed text-fincash-ink/70 dark:text-fincash-cream/70">{DISCLAIMER}</p>
            <p className="text-xs text-fincash-ink/50 dark:text-fincash-cream/50">
                Programa de Capacitação em Letramento Financeiro e Inclusão Digital · IFTO
            </p>
          </div>
        </footer>
      </div>

      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </AppShell>
  );
}
