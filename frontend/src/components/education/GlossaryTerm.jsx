import { useState } from 'react';
import { GLOSSARY } from '../../data/educationContent';

const MEANINGS = Object.fromEntries(GLOSSARY.map(({ term, meaning }) => [term, meaning]));

// Jargão inevitável ganha uma explicação de uma linha, no próprio ponto do texto.
export default function GlossaryTerm({ term }) {
  const [open, setOpen] = useState(false);
  const meaning = MEANINGS[term];

  if (!meaning) return <>{term}</>;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        className="border-b border-dotted border-fincash-gold font-semibold text-fincash-ink hover:text-fincash-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-fincash-gold dark:text-fincash-cream"
      >
        {term}
      </button>
      {open && (
        <span className="absolute left-0 top-full z-40 mt-1.5 block w-64 rounded-lg border border-fincash-ink/10 bg-white p-3 text-xs font-normal leading-relaxed text-fincash-ink/80 shadow-floating dark:border-fincash-cream/20 dark:bg-slate-800 dark:text-fincash-cream/80">
          {meaning}
        </span>
      )}
    </span>
  );
}
