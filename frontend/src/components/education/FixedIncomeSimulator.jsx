import { useState } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';

const currency = value =>
  `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const inputClass =
  'w-full rounded-sm border border-fincash-ink/15 bg-white px-3 py-2 text-sm text-fincash-ink outline-none transition focus:border-fincash-gold focus:ring-1 focus:ring-fincash-gold dark:border-fincash-cream/20 dark:bg-slate-900 dark:text-fincash-cream';

export default function FixedIncomeSimulator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('12');
  const [period, setPeriod] = useState('12');

  const amount = parseFloat(principal || 0);
  const monthlyRate = (parseFloat(rate || 0) / 100) / 12;
  const months = parseInt(period || 0, 10);

  const final = amount > 0 && months > 0 ? amount * Math.pow(1 + monthlyRate, months) : 0;
  const earnings = final - amount;
  const percent = amount > 0 ? (earnings / amount) * 100 : 0;

  return (
    <div className="rounded-lg border border-fincash-gold/40 bg-fincash-gold/10 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calculator size={18} className="text-[#6F5019]" />
        <h4 className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">Simulador de Renda Fixa</h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-fincash-ink/70 dark:text-fincash-cream/70">
            Valor que você aplica (R$)
          </span>
          <input
            type="number"
            min="0"
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
            placeholder="Ex: 1000"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-fincash-ink/70 dark:text-fincash-cream/70">
            Taxa anual (%)
          </span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="Ex: 12"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-fincash-ink/70 dark:text-fincash-cream/70">
            Por quantos meses
          </span>
          <input
            type="number"
            min="1"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            placeholder="Ex: 12"
            className={inputClass}
          />
        </label>
      </div>

      {amount > 0 && months > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-sm bg-white p-3 dark:bg-slate-900">
            <p className="text-xs text-fincash-ink/60 dark:text-fincash-cream/60">Você terá</p>
            <p className="text-lg font-bold text-fincash-ink dark:text-fincash-cream">{currency(final)}</p>
          </div>
          <div className="rounded-sm bg-white p-3 dark:bg-slate-900">
            <p className="text-xs text-fincash-ink/60 dark:text-fincash-cream/60">Rendimento bruto</p>
            <p className="text-lg font-bold text-fincash-forest">+ {currency(earnings)}</p>
          </div>
          <div className="rounded-sm bg-white p-3 dark:bg-slate-900">
            <p className="text-xs text-fincash-ink/60 dark:text-fincash-cream/60">No período</p>
            <p className="text-lg font-bold text-fincash-ink dark:text-fincash-cream">{percent.toFixed(2)}%</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-fincash-ink/60 dark:text-fincash-cream/60">
          Preencha os campos acima para ver a projeção.
        </p>
      )}

      <div className="mt-4 flex gap-2.5 rounded-sm bg-white/70 p-3 dark:bg-slate-900/60">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#6F5019]" />
        <p className="text-xs leading-relaxed text-fincash-ink/75 dark:text-fincash-cream/75">
          Simulação simplificada: não desconta imposto e não considera o IPCA. Serve para comparar ordens de
          grandeza, não para prever ganho real.
        </p>
      </div>
    </div>
  );
}
