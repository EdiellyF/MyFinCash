import { useState } from 'react';
import { Utensils, Bus, BookOpen, Zap, MapPin, Check, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import Badge from '../ui/Badge';
import { CHECKLIST } from '../../data/educationContent';

const ICONS = { Utensils, Bus, BookOpen, Zap, MapPin };

const currency = value =>
  `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function ChecklistCard({ derived, toggleChecklist }) {
  const [justCompleted, setJustCompleted] = useState(false);

  async function handleToggle(itemId) {
    const wasComplete = derived.checklistComplete;
    const done = await toggleChecklist(itemId);

    if (done && !wasComplete) {
      setJustCompleted(true);
      toast.success('Meta concluída! +15 XP', {
        description: 'Você marcou todas as dicas. Continue assim todo mês.',
      });
    }
  }

  const potential = CHECKLIST.reduce(
    (sum, group) =>
      sum + group.items.reduce((groupSum, item) => groupSum + (derived.isChecklistDone(item.id) ? item.saving : 0), 0),
    0
  );

  return (
    <section className="rounded-lg border border-fincash-ink/10 bg-white p-5 dark:border-fincash-cream/10 dark:bg-slate-800">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-fincash-ink dark:text-fincash-cream">
            Economize com o que você já gasta
          </h2>
          <p className="mt-1 text-sm text-fincash-ink/70 dark:text-fincash-cream/70">
            Não precisa cortar tudo. Marque o que você já faz e veja quanto sobra.
          </p>
        </div>
        <Badge tone={derived.checklistComplete ? 'forest' : 'gold'}>
          {derived.checklistDone} de {derived.checklistTotal} dicas
        </Badge>
      </div>

      <div className="mb-5 space-y-2 rounded-sm bg-fincash-forest/5 p-4">
        <p className="text-sm font-bold text-fincash-forest">
          Você economiza {currency(potential)} por mês
        </p>
        <p className="text-xs text-fincash-ink/70 dark:text-fincash-cream/70">
          Em 12 meses, isso dá {currency(potential * 12)}.
        </p>
        <div className="h-2 w-full overflow-hidden rounded-sm bg-fincash-ink/10 dark:bg-white/10">
          <div
            className="h-full rounded-sm bg-fincash-forest transition-all duration-500"
            style={{ width: `${derived.checklistPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-5">
        {CHECKLIST.map(group => {
          const Icon = ICONS[group.icon] ?? BookOpen;
          const doneInGroup = group.items.filter(item => derived.isChecklistDone(item.id)).length;

          return (
            <div key={group.id}>
              <div className="mb-2 flex items-center gap-2">
                <Icon size={15} className="text-fincash-gold" />
                <h3 className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">{group.title}</h3>
                <span className="text-xs font-medium text-fincash-ink/40 dark:text-fincash-cream/40">
                  {doneInGroup}/{group.items.length}
                </span>
              </div>

              <ul className="space-y-1.5">
                {group.items.map(item => {
                  const checked = derived.isChecklistDone(item.id);

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleToggle(item.id)}
                        className={`flex w-full items-start gap-3 rounded-sm border px-3.5 py-2.5 text-left transition ${
                          checked
                            ? 'border-fincash-forest/30 bg-fincash-forest/5'
                            : 'border-fincash-ink/10 hover:border-fincash-forest/40 hover:bg-fincash-forest/5 dark:border-fincash-cream/15'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                            checked
                              ? 'border-fincash-forest bg-fincash-forest text-fincash-cream'
                              : 'border-fincash-ink/25 dark:border-fincash-cream/30'
                          }`}
                        >
                          {checked && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span
                          className={`flex-1 text-sm ${
                            checked
                              ? 'text-fincash-ink/50 line-through dark:text-fincash-cream/50'
                              : 'text-fincash-ink/80 dark:text-fincash-cream/80'
                          }`}
                        >
                          {item.text}
                        </span>
                        <Badge tone={checked ? 'forest' : 'neutral'} className="shrink-0">
                          {item.saving > 0 ? `≈ ${currency(item.saving)}/${item.period?.split(' ')[0] ?? 'mês'}` : item.period}
                        </Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {derived.checklistComplete && (
        <div className="mt-5 flex items-center gap-2.5 rounded-sm border border-fincash-forest/30 bg-fincash-forest/10 p-4">
          <PartyPopper size={18} className="shrink-0 text-fincash-forest" />
          <p className="text-sm font-semibold text-fincash-forest">
            {justCompleted ? 'Meta concluída agora! +15 XP 🎉' : 'Checklist completo. Boas economias!'}
          </p>
        </div>
      )}
    </section>
  );
}
