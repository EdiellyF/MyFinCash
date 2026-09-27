import { AlertTriangle, Lightbulb, Info, Check } from 'lucide-react';
import Badge from '../ui/Badge';
import GlossaryTerm from './GlossaryTerm';
import ReserveSimulator from './ReserveSimulator';
import FixedIncomeSimulator from './FixedIncomeSimulator';

const CALLOUT_TONES = {
  forest: 'border-l-fincash-forest bg-fincash-forest/5 text-fincash-forest',
  gold: 'border-l-fincash-gold bg-fincash-gold/10 text-[#6F5019]',
  terracotta: 'border-l-fincash-terracotta bg-fincash-terracotta/5 text-fincash-terracotta',
};

const CARD_TONES = {
  forest: 'border-fincash-forest/30 bg-fincash-forest/5',
  neutral: 'border-fincash-ink/10 bg-fincash-ink/[0.03] dark:border-fincash-cream/10 dark:bg-white/5',
};

const RISK_TONE = {
  'Muito baixo': 'forest',
  Baixo: 'forest',
  Médio: 'gold',
  Alto: 'terracotta',
};

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="text-sm leading-relaxed text-fincash-ink/80 dark:text-fincash-cream/80">
          {block.text}
        </p>
      );

    case 'callout':
      return (
        <p className={`rounded-r-lg border-l-4 px-4 py-3 text-sm font-semibold ${CALLOUT_TONES[block.tone]}`}>
          {block.text}
        </p>
      );

    case 'alert':
      return (
        <div className="flex gap-3 rounded-lg border border-fincash-terracotta/30 bg-fincash-terracotta/5 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-fincash-terracotta" />
          <div>
            <p className="text-sm font-bold text-fincash-terracotta">{block.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">
              {block.text}
            </p>
          </div>
        </div>
      );

    case 'list':
      return (
        <ul className="space-y-2">
          {block.items.map(item => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-fincash-ink/80 dark:text-fincash-cream/80">
              <Check size={15} className="mt-0.5 shrink-0 text-fincash-forest" />
              {item}
            </li>
          ))}
        </ul>
      );

    case 'table':
      return (
        <div className="overflow-hidden rounded-lg border border-fincash-ink/10 dark:border-fincash-cream/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-fincash-ink/5 dark:bg-white/5">
              <tr>
                {block.head.map(head => (
                  <th key={head} className="px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-fincash-ink/60 dark:text-fincash-cream/60">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-fincash-ink/5 dark:divide-fincash-cream/5">
              {block.rows.map(row => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={cell} className="px-3 py-2.5 text-fincash-ink/80 dark:text-fincash-cream/80">
                      {block.riskColumn && index === row.length - 1
                        ? <Badge tone={RISK_TONE[cell] ?? 'neutral'}>{cell}</Badge>
                        : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'cards':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {block.cards.map(card => (
            <div key={card.title} className={`rounded-lg border p-4 ${CARD_TONES[card.tone]}`}>
              <p className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">{card.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">{card.text}</p>
              {card.badges && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {card.badges.map(badge => (
                    <Badge key={badge} tone={badge === 'Recomendado' ? 'gold' : 'neutral'}>{badge}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((item, index) => (
            <li key={item.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fincash-forest text-xs font-bold text-fincash-cream">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-fincash-ink dark:text-fincash-cream">{item.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">
                  {item.text}
                  {item.glossary?.map(term => (
                    <span key={term}> <GlossaryTerm term={term} /></span>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      );

    case 'example':
      return (
        <div className="flex gap-3 rounded-lg border border-fincash-gold/40 bg-fincash-gold/10 p-4">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#6F5019]" />
          <div>
            <p className="text-sm font-bold text-[#6F5019]">{block.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-fincash-ink/80 dark:text-fincash-cream/80">{block.text}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function Pill({ pill, index, total, isRead, onMarkRead, isUnlocked }) {
  return (
    <article
      id={pill.id}
      className={`rounded-lg border p-5 ${
        isUnlocked
          ? 'border-fincash-ink/10 bg-white dark:border-fincash-cream/10 dark:bg-slate-800'
          : 'border-fincash-ink/5 bg-fincash-ink/[0.02] dark:border-fincash-cream/5 dark:bg-white/[0.02]'
      }`}
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fincash-forest/10 text-xs font-bold text-fincash-forest">
            {index + 1}
          </span>
          <h4 className="text-base font-bold text-fincash-ink dark:text-fincash-cream">{pill.title}</h4>
          {isRead && <Badge tone="forest">Lida</Badge>}
        </div>
        <span className="text-xs font-medium text-fincash-ink/40 dark:text-fincash-cream/40">
          {index + 1} de {total}
        </span>
      </header>

      <div className="space-y-4">
        {pill.blocks.map((block, blockIndex) => (
          <Block key={`${block.type}-${blockIndex}`} block={block} />
        ))}
        {pill.simulator === 'reserve' && <ReserveSimulator />}
        {pill.simulator === 'fixedIncome' && <FixedIncomeSimulator />}
      </div>

      {isUnlocked && !isRead && (
        <button
          onClick={onMarkRead}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-fincash-forest px-4 py-2.5 text-sm font-semibold text-fincash-cream transition hover:bg-fincash-forest/90"
        >
          <Check size={16} />
          Marcar como lida (+10 XP)
        </button>
      )}

      {isRead && (
        <p className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-fincash-forest">
          <Info size={13} />
          Pílula concluída
        </p>
      )}
    </article>
  );
}
