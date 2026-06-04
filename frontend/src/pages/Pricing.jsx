import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../services/api';
import AppLayout from '../components/AppLayout';

const planFeatures = {
  free: ['Күніне 15 хабарлама', 'Мәтіндік чат', 'Негізгі AI модель'],
  basic: ['Күніне 80 хабарлама', 'Сурет жүктеу', '30 күн Premium'],
  pro: ['Шексіз хабарлама', 'Сурет + Vision', 'Жылдам жауап', '30 күн Про'],
};

const Pricing = () => {
  const { subscription, refreshSubscription, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentAPI.getPlans().then((res) => setPlans(res.data?.plans || [])).catch(() => {});
    if (isAuthenticated) refreshSubscription();
  }, [isAuthenticated, refreshSubscription]);

  const handleCheckout = async (planId) => {
    setError('');
    setLoadingPlan(planId);
    try {
      const res = await paymentAPI.createCheckout(planId);
      if (res.data?.url) window.location.href = res.data.url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = subscription?.plan || 'free';
  const paymentsOn = plans.length > 0;

  return (
    <AppLayout showMainNav>
      <header className="border-b border-surface-border bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-surface-text">Төлемдер мен тарифтер</h1>
        <p className="text-sm text-surface-subtext">Lava.top — карта, Kaspi, СБП</p>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isPro = plan.id === 'pro';
              const features = planFeatures[plan.id] || [];

              return (
                <div
                  key={plan.id}
                  className={`card relative flex flex-col p-6 ${isPro ? 'border-brand ring-2 ring-brand/20' : ''}`}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-semibold text-white">
                      Ұсынылады
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-surface-text">{plan.name}</h2>
                  <p className={`mt-2 text-3xl font-bold ${isPro ? 'text-brand' : 'text-surface-text'}`}>
                    {plan.priceLabel}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2 text-sm text-surface-subtext">
                    {features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>

                  {plan.id === 'free' ? (
                    <p className="mt-6 text-center text-sm text-surface-subtext">
                      {isCurrent ? '✓ Ағымдағы жоспар' : 'Әдепкі жоспар'}
                    </p>
                  ) : isCurrent ? (
                    <p className="mt-6 text-center text-sm font-medium text-brand">✓ Белсенді</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loadingPlan === plan.id || !paymentsOn}
                      className={`mt-6 w-full ${isPro ? 'btn-primary' : 'btn-secondary border-brand text-brand'}`}
                    >
                      {loadingPlan === plan.id ? 'Жүктелуде...' : `${plan.name} — төлеу`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {!paymentsOn && plans.length === 0 && (
            <p className="mt-8 text-center text-surface-subtext">Жоспарлар жүктелуде...</p>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default Pricing;
