import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';

const Pricing = () => {
  const { user, subscription, refreshSubscription, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentAPI.getPlans().then((res) => setPlans(res.data)).catch(() => {});
    if (isAuthenticated) {
      refreshSubscription();
    }
  }, [isAuthenticated, refreshSubscription]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await paymentAPI.createCheckout();
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = subscription?.isPremium;
  const paymentsOn = plans?.paymentsEnabled ?? subscription?.paymentsEnabled;

  return (
    <div className="mesh-bg min-h-screen overflow-y-auto">
      <header className="border-b border-zinc-800/80 bg-surface-dark/60 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 transition hover:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Чатқа оралу
          </Link>
          <span className="gradient-text font-semibold">Beka AI · Lava.top</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="gradient-text mb-3 text-4xl font-bold">Жоспарлар</h1>
          <p className="text-zinc-400">
            Premium — Lava.top: карта, Kaspi, СБП және басқа әдістер
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass glass-border rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-zinc-200">Тегін</h2>
            <p className="mt-2 text-3xl font-bold text-white">0 ₸</p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-400">
              <li>✓ Күніне 15 хабарлама</li>
              <li>✓ Мәтіндік чат</li>
              <li>✗ Сурет жүктеу</li>
            </ul>
            {user && !isPremium && (
              <p className="mt-6 text-xs text-cyan-400">
                Қалған: {subscription?.dailyRemaining ?? 15} хабарлама бүгін
              </p>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-violet-500/10 p-8 shadow-glow">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white">
              Ұсынылады
            </div>
            <h2 className="text-xl font-semibold text-white">Premium</h2>
            <p className="mt-2 text-3xl font-bold gradient-text">
              {plans?.displayPrice || '2 990 ₸ / ай'}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-300">
              {(plans?.features || []).map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>

            {isPremium ? (
              <div className="mt-8 space-y-3">
                <p className="text-center text-sm text-emerald-400">✓ Premium белсенді</p>
                <p className="text-center text-xs text-zinc-500">
                  Ұзарту үшін төмендегі «Төлеу» батырмасын қайта басыңыз
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading || !paymentsOn}
                className="mt-8 w-full rounded-xl bg-gradient-brand py-3.5 font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? 'Жүктелуде...'
                  : paymentsOn
                    ? '💳 Lava.top — төлеу'
                    : 'Lava.top әлі бапталмаған'}
              </button>
            )}
          </div>
        </div>

        <div className="glass glass-border mt-10 rounded-2xl p-6 text-sm text-zinc-500">
          <p className="mb-2 font-medium text-zinc-400">Қалай жұмыс істейді?</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Төлем Lava.top арқылы — қауіпсіз төлем шлюзі</li>
            <li>Ақша сіздің Lava.top балансыңызға түседі</li>
            <li>Premium {plans?.durationDays || 30} күнге белсенділенеді</li>
          </ul>
          {!paymentsOn && (
            <p className="mt-4 text-amber-400/90">
              Әкімші Lava.top кілттерін орнатқаннан кейін төлем іске қосылады (ТӨЛЕМ-ОРНАТУ.md).
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
