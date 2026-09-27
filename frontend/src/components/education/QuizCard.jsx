import { useState } from 'react';
import { Check, X, Lock } from 'lucide-react';
import Badge from '../ui/Badge';

export default function QuizCard({ module, isPassed, isSkipped, onPass, onSkip }) {
  const [answers, setAnswers] = useState({});
  const [confirmingSkip, setConfirmingSkip] = useState(false);

  if (isSkipped) {
    return (
      <div className="rounded-lg border border-fincash-ink/10 bg-fincash-ink/[0.02] p-5 dark:border-fincash-cream/10 dark:bg-white/[0.02]">
        <div className="flex items-start gap-3">
          <Check size={18} className="mt-0.5 shrink-0 text-fincash-forest" />
          <div>
            <p className="text-sm font-semibold text-fincash-forest">Módulo liberado</p>
            <p className="mt-1 text-sm leading-relaxed text-fincash-ink/70 dark:text-fincash-cream/70">
              Você optou por seguir sem responder o quiz e não recebeu os pontos dele. Pode voltar e fazer as
              perguntas quando quiser — o conteúdo das pílulas continua disponível acima.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isPassed) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-fincash-forest/30 bg-fincash-forest/5 p-4">
        <Check size={18} className="shrink-0 text-fincash-forest" />
        <p className="text-sm font-semibold text-fincash-forest">
          Quiz aprovado. Módulo concluído — você já pode seguir para o próximo.
        </p>
      </div>
    );
  }

  const answeredAll = module.quiz.every(question => answers[question.id]);

  function choose(questionId, optionId) {
    if (answers[questionId]) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  }

  function handleSubmit() {
    if (!answeredAll) return;
    onPass(module.id);
  }

  return (
    <div className="rounded-lg border border-fincash-ink/10 bg-fincash-ink/[0.02] p-5 dark:border-fincash-cream/10 dark:bg-white/[0.02]">
      <div className="mb-4 flex items-center gap-2">
        <Lock size={16} className="text-fincash-ink/50 dark:text-fincash-cream/50" />
        <h4 className="text-sm font-bold text-fincash-ink dark:text-fincash-cream">Verifique o que aprendeu</h4>
        <Badge tone="gold">+25 XP</Badge>
      </div>

      <div className="space-y-5">
        {module.quiz.map((question, questionIndex) => {
          const chosenId = answers[question.id];
          const chosen = question.options.find(option => option.id === chosenId);

          return (
            <fieldset key={question.id} disabled={Boolean(chosenId)}>
              <legend className="mb-3 text-sm font-semibold text-fincash-ink dark:text-fincash-cream">
                {questionIndex + 1}. {question.question}
              </legend>

              <div className="space-y-2">
                {question.options.map(option => {
                  const isChosen = chosenId === option.id;
                  const showAsCorrect = isChosen && option.correct;
                  const showAsWrong = isChosen && !option.correct;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => choose(question.id, option.id)}
                      className={`flex w-full items-start gap-3 rounded-sm border px-3.5 py-2.5 text-left text-sm transition ${
                        showAsCorrect
                          ? 'border-fincash-forest bg-fincash-forest/10 text-fincash-forest'
                          : showAsWrong
                            ? 'border-fincash-terracotta bg-fincash-terracotta/10 text-fincash-terracotta'
                            : 'border-fincash-ink/10 text-fincash-ink/75 hover:border-fincash-forest/40 hover:bg-fincash-forest/5 dark:border-fincash-cream/15 dark:text-fincash-cream/75'
                      }`}
                    >
                      <span className="mt-0.5 font-bold uppercase">{option.id})</span>
                      <span className="flex-1">{option.text}</span>
                      {showAsCorrect && <Check size={16} className="mt-0.5 shrink-0" />}
                      {showAsWrong && <X size={16} className="mt-0.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {chosen && (
                <p className={`mt-2.5 text-xs leading-relaxed ${chosen.correct ? 'text-fincash-forest' : 'text-fincash-terracotta'}`}>
                  {chosen.correct ? '✅ ' : '❌ '}
                  {chosen.why}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={!answeredAll}
          className="w-full rounded-sm bg-fincash-forest px-4 py-2.5 text-sm font-semibold text-fincash-cream transition hover:bg-fincash-forest/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {answeredAll ? 'Concluir módulo e liberar o próximo' : 'Responda todas as perguntas'}
        </button>

        {confirmingSkip ? (
          <div className="rounded-sm border border-fincash-terracotta/30 bg-fincash-terracotta/5 p-4">
            <p className="text-sm font-semibold text-fincash-terracotta">Liberar o próximo módulo mesmo assim?</p>
            <p className="mt-1 text-xs leading-relaxed text-fincash-ink/70 dark:text-fincash-cream/70">
              O Módulo {module.number + 1} vai abrir, mas este módulo fica registrado como pulado e você não
              ganha os pontos do quiz. Dá para refazer depois.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  onSkip(module.id);
                  setConfirmingSkip(false);
                }}
                className="rounded-sm bg-fincash-terracotta px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-fincash-terracotta/90"
              >
                Sim, liberar
              </button>
              <button
                onClick={() => setConfirmingSkip(false)}
                className="rounded-sm border border-fincash-ink/15 px-3.5 py-2 text-xs font-semibold text-fincash-ink/70 transition hover:bg-fincash-ink/5 dark:border-fincash-cream/20 dark:text-fincash-cream/70"
              >
                Continuar no quiz
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingSkip(true)}
            className="w-full text-xs font-medium text-fincash-ink/45 underline-offset-4 transition hover:text-fincash-ink/70 hover:underline dark:text-fincash-cream/45"
          >
            Não consigo agora, seguir sem o quiz
          </button>
        )}
      </div>
    </div>
  );
}
