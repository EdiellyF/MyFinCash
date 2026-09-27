import {
  Building2, Scale, Database, Target, Bot, Share2, Globe, HardDrive,
  Lock, Clock, UserCheck, Trash2, Cpu, Users, RefreshCw, Shield,
} from 'lucide-react';

const ICONS = {
  Building2, Scale, Database, Target, Bot, Share2, Globe, HardDrive,
  Lock, Clock, UserCheck, Trash2, Cpu, Users, RefreshCw, Shield,
};

const TONES = {
  terracotta: 'border-fincash-terracotta/30 bg-fincash-terracotta/5',
  forest: 'border-fincash-forest/30 bg-fincash-forest/5',
  neutral: 'border-fincash-ink/10 bg-white dark:border-fincash-cream/10 dark:bg-slate-800',
};

const ICON_TONES = {
  terracotta: 'bg-fincash-terracotta/10 text-fincash-terracotta',
  forest: 'bg-fincash-forest/10 text-fincash-forest',
  neutral: 'bg-fincash-ink/5 text-fincash-ink/60 dark:bg-white/5 dark:text-fincash-cream/60',
};

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return <p className="text-sm leading-relaxed text-fincash-ink/80 dark:text-fincash-cream/80">{block.text}</p>;

    case 'list':
      return (
        <ul className="space-y-2">
          {block.items.map(item => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-fincash-ink/80 dark:text-fincash-cream/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fincash-forest" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'group':
      return (
        <div className="rounded-sm border border-fincash-ink/10 p-4 dark:border-fincash-cream/10">
          <p className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">{block.title}</p>
          <ul className="mt-2 space-y-1.5">
            {block.items.map(item => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fincash-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'callout':
      return (
        <div className={`rounded-sm border-l-4 p-4 ${TONES[block.tone] ?? TONES.terracotta} border-l-current`}>
          <p className="text-sm font-semibold leading-relaxed text-fincash-ink dark:text-fincash-cream">{block.text}</p>
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
                <p className="mt-0.5 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    default:
      return null;
  }
}

export function PolicySection({ section }) {
  const Icon = ICONS[section.icon] ?? Shield;
  const tone = section.tone ?? 'neutral';

  return (
    <section className={`overflow-hidden rounded-lg border ${TONES[tone]}`}>
      <header className="flex items-center gap-3 px-5 py-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${ICON_TONES[tone]}`}>
          <Icon size={18} />
        </div>
        <h2 className="text-base font-bold text-fincash-ink dark:text-fincash-cream">{section.title}</h2>
      </header>
      <div className="space-y-3 px-5 pb-5">
        {section.blocks.map((block, index) => (
          <Block key={`${block.type}-${index}`} block={block} />
        ))}
      </div>
    </section>
  );
}

export default PolicySection;
