import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, TrendingUp, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import PolicySection from '../components/privacy/PolicySection';

const formatDate = value => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR');
};

export default function PrivacyPolicy() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/legal/privacy-policy')
      .then(({ data }) => {
        if (!active) return;
        setPolicy(data?.data ?? null);
        if (!data?.data) setError('Não foi possível carregar a política de privacidade.');
      })
      .catch(err => {
        if (!active) return;
        setError(err.response?.data?.message || 'Não foi possível carregar a política de privacidade.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-fincash-cream p-4 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <header className="mb-4 flex items-center justify-between rounded-lg border border-fincash-ink/10 bg-white px-5 py-4 dark:border-fincash-cream/10 dark:bg-slate-800">
          <Link to="/login" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-fincash-forest text-fincash-cream">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-fincash-ink dark:text-fincash-cream">Finance</p>
              <p className="text-xs font-semibold leading-tight text-fincash-forest">MyFinCash</p>
            </div>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-fincash-forest transition hover:underline"
          >
            <ArrowLeft size={15} />
            Voltar
          </Link>
        </header>

        <main className="rounded-lg border border-fincash-ink/10 bg-white p-6 md:p-8 dark:border-fincash-cream/10 dark:bg-slate-800">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-fincash-forest/10 text-fincash-forest">
              <ShieldCheck size={28} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-fincash-ink dark:text-fincash-cream">
                {policy?.title ?? 'Política de Privacidade'}
              </h1>
              {policy && (
                <p className="mt-1 text-sm text-fincash-ink/55 dark:text-fincash-cream/55">
                  Versão {policy.version} · Atualizada em {formatDate(policy.lastUpdated)}
                </p>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-fincash-forest border-t-transparent" />
            </div>
          )}

          {!loading && error && (
            <div className="flex gap-3 rounded-lg border border-fincash-terracotta/20 bg-fincash-terracotta/5 p-5 text-fincash-terracotta">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-semibold">Não foi possível carregar a política</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && policy && (
            <div className="space-y-4">
              <div className="rounded-lg border border-fincash-forest/20 bg-fincash-forest/5 p-5">
                <p className="text-sm leading-relaxed text-fincash-ink/85 dark:text-fincash-cream/85">
                  {policy.summary}
                </p>
              </div>

              {policy.sections.map(section => (
                <PolicySection key={section.id} section={section} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
