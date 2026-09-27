import { useState } from 'react';
import { Calculator } from 'lucide-react';

const currency = value =>
  `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-fincash-ink/70 dark:text-fincash-cream/70">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-sm border border-fincash-ink/15 bg-white px-3 py-2 text-sm text-fincash-ink outline-none transition focus:border-fincash-forest focus:ring-1 focus:ring-fincash-forest dark:border-fincash-cream/20 dark:bg-slate-900 dark:text-fincash-cream';

export default function ReserveSimulator() {
  const [monthly, setMonthly] = useState('');
  const [contribution, setContribution] = useState('');
  const [months, setMonths] = useState(6);

  const expense = parseFloat(monthly || 0);
  const saving = parseFloat(contribution || 0);
  const target = expense * months;
  const monthsNeeded = saving > 0 ? Math.ceil(target / saving) : null;
  const percent = target > 0 && saving > 0 ? Math.min((saving / target) * 100, 100) : 0;

  const arrival = monthsNeeded
    ? new Date(new Date().setMonth(new Date().getMonth() + monthsNeeded))
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="rounded-lg border border-fincash-forest/25 bg-fincash-forest/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calculator size={18} className="text-fincash-forest" />
        <h4 className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">Simulador de Reserva</h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Quanto você gasta por mês (R$)">
          <input
            type="number"
            min="0"
            value={monthly}
            onChange={e => setMonthly(e.target.value)}
            placeholder="Ex: 3000"
            className={inputClass}
          />
        </Field>
        <Field label="Quanto consegue guardar (R$)">
          <input
            type="number"
            min="0"
            value={contribution}
            onChange={e => setContribution(e.target.value)}
            placeholder="Ex: 500"
            className={inputClass}
          />
        </Field>
        <Field label="Quantos meses quer cobrir">
          <select value={months} onChange={e => setMonths(Number(e.target.value))} className={inputClass}>
            <option value={3}>3 meses (mínimo)</option>
            <option value={6}>6 meses (recomendado)</option>
            <option value={12}>12 meses (ideal)</option>
          </select>
        </Field>
      </div>

      {target > 0 ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm bg-white p-3 dark:bg-slate-900">
              <p className="text-xs text-fincash-ink/60 dark:text-fincash-cream/60">Sua meta de reserva</p>
              <p className="text-lg font-bold text-fincash-forest">{currency(target)}</p>
            </div>
            <div className="rounded-sm bg-white p-3 dark:bg-slate-900">
              <p className="text-xs text-fincash-ink/60 dark:text-fincash-cream/60">Tempo para atingir</p>
              <p className="text-lg font-bold text-fincash-ink dark:text-fincash-cream">
                {monthsNeeded ? `${monthsNeeded} ${monthsNeeded === 1 ? 'mês' : 'meses'}` : '—'}
              </p>
            </div>
          </div>

          {saving > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-fincash-ink/70 dark:text-fincash-cream/70">
                <span>{currency(saving)} de {currency(target)}</span>
                <span>{percent.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-sm bg-fincash-ink/10 dark:bg-white/10">
                <div
                  className="h-full rounded-sm bg-fincash-forest transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">
                Faltam {currency(target - saving)} para completar o primeiro mês. A {currency(saving)} por mês, você
                chega lá em <strong>{arrival}</strong>.
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-fincash-ink/60 dark:text-fincash-cream/60">
          Preencha os campos acima para ver seu plano.
        </p>
      )}
    </div>
  );
}
