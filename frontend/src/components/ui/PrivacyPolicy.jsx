import { useEffect, useState } from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';
import api from '../../services/api';
import PolicySection from '../privacy/PolicySection';

const formatDate = value => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('pt-BR');
};

export default function PrivacyPolicy({ isOpen, onClose, onAccept }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || policy) return;

    let active = true;
    setLoading(true);
    setError('');

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
  }, [isOpen, policy]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = event => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fincash-ink/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Política de Privacidade"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-slate-900"
      >
        <header className="flex items-start justify-between gap-3 border-b border-fincash-ink/10 p-6 dark:border-fincash-cream/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-fincash-forest/10 text-fincash-forest">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-fincash-ink dark:text-fincash-cream">
                {policy?.title ?? 'Política de Privacidade'}
              </h2>
              {policy && (
                <p className="text-sm text-fincash-ink/55 dark:text-fincash-cream/55">
                  Versão {policy.version} · Atualizada em {formatDate(policy.lastUpdated)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded-sm border border-fincash-ink/10 p-2 text-fincash-ink/60 transition hover:bg-fincash-ink/5 dark:border-fincash-cream/15 dark:text-fincash-cream/60"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-fincash-forest border-t-transparent" />
            </div>
          )}

          {!loading && error && (
            <div className="flex gap-3 rounded-lg border border-fincash-terracotta/20 bg-fincash-terracotta/5 p-5 text-fincash-terracotta">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && policy && (
            <>
              <div className="rounded-lg border border-fincash-forest/20 bg-fincash-forest/5 p-5">
                <p className="text-sm leading-relaxed text-fincash-ink/85 dark:text-fincash-cream/85">
                  {policy.summary}
                </p>
              </div>
              {policy.sections.map(section => (
                <PolicySection key={section.id} section={section} />
              ))}
            </>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-fincash-ink/10 p-5 dark:border-fincash-cream/10">
          <button
            onClick={onClose}
            className="rounded-sm border border-fincash-ink/15 px-5 py-2.5 text-sm font-semibold text-fincash-ink/70 transition hover:bg-fincash-ink/5 dark:border-fincash-cream/20 dark:text-fincash-cream/70"
          >
            Fechar
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="flex items-center gap-2 rounded-sm bg-fincash-forest px-5 py-2.5 text-sm font-semibold text-fincash-cream transition hover:bg-fincash-forest/90"
            >
              <Check size={16} />
              Aceitar e continuar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
