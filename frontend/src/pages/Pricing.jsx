import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { paymentAPI } from '../services/api';
import AidaShell from '../components/dashboard/AidaShell';

const PLAN_STYLE = {
  free: { glow: 'pricing-card-free', labelKey: 'free' },
  basic: { glow: 'pricing-card-standard', labelKey: 'standard' },
  pro: { glow: 'pricing-card-pro', labelKey: 'pro' },
};

const USAGE_BARS = [40, 55, 35, 70, 45, 80, 60];

const Pricing = () => {
  const { subscription, refreshSubscription, isAuthenticated } = useAuth();
  const { t, planName } = usePreferences();
  const [plans, setPlans] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    paymentAPI.getPlans().then((res) => setPlans(res.data?.plans || [])).catch(() => {});
    if (isAuthenticated) refreshSubscription();
  }, [isAuthenticated, refreshSubscription]);

  const handleCheckout = async (planId) => {
    if (planId === 'free') return;
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
  const activity = t('pricing.activity');
  const activityList = Array.isArray(activity) ? activity : [];

  const getFeatures = (planId) => {
    const f = t(`pricing.features.${planId}`);
    return Array.isArray(f) ? f : [];
  };

  return (
    <AidaShell>
      <main className="aida-pricing-main">
        <div className="aida-pricing-header">
          <div>
            <h1 className="aida-pricing-title">{t('pricing.title')}</h1>
            <div className="aida-efficiency-badge">
              <span className="text-xs text-slate-400">{t('pricing.efficiency')}</span>
              <span className="text-lg font-bold text-cyan-300">94%</span>
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="3"
                  strokeDasharray="94 100"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="aida-orb aida-orb-inline shrink-0">AI</div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="aida-pricing-layout">
          <div className="aida-pricing-cards">
            {plans.map((plan) => {
              const style = PLAN_STYLE[plan.id] || PLAN_STYLE.free;
              const isCurrent = currentPlan === plan.id;
              const isPro = plan.id === 'pro';
              const features = getFeatures(plan.id);
              const label = t(`pricing.labels.${style.labelKey}`);
              const subName = planName(plan.id);

              return (
                <div key={plan.id} className={`aida-pricing-card ${style.glow}`}>
                  <div className="aida-pricing-card-head">
                    <span className="aida-pricing-tier">{label}</span>
                    <span className="aida-pricing-sub">{subName}</span>
                  </div>
                  <p className="aida-pricing-price">
                    {plan.id === 'free' ? '0 ₽' : `${plan.price ?? ''} ₽`}
                    {plan.id !== 'free' && (
                      <span className="mt-1 block text-sm font-normal text-slate-400">
                        {t('pricing.perMonth')}
                      </span>
                    )}
                  </p>
                  <ul className="aida-pricing-features">
                    {features.map((feat) => (
                      <li key={feat}>
                        <span className="text-cyan-400">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                  {plan.id === 'free' ? (
                    <p className="aida-pricing-btn-muted">
                      {isCurrent ? t('pricing.currentPlan') : '—'}
                    </p>
                  ) : isCurrent ? (
                    <p className="aida-pricing-btn-muted">{t('pricing.currentPlan')}</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loadingPlan === plan.id || !paymentsOn}
                      className={`aida-pricing-btn ${isPro ? 'pro' : ''}`}
                    >
                      {loadingPlan === plan.id
                        ? t('pricing.loading')
                        : isPro
                          ? t('pricing.subscribe')
                          : t('pricing.selectPlan')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <aside className="aida-pricing-insights">
            <div className="aida-settings-card">
              <h3>{t('pricing.insights')}</h3>
              <p className="mb-2 text-xs text-slate-400">{t('pricing.usage')}</p>
              <div className="aida-usage-chart">
                {USAGE_BARS.map((h, i) => (
                  <div key={i} className="aida-usage-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="mt-4 mb-2 text-xs text-slate-400">{t('pricing.resources')}</p>
              <div className="aida-donut">
                <div className="aida-donut-ring" />
              </div>
              <p className="mt-4 mb-2 text-xs text-slate-400">{t('pricing.completion')}</p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-amber-400" />
              </div>
            </div>

            <div className="aida-settings-card">
              <h3>{t('pricing.activity')}</h3>
              <ul className="aida-activity-list">
                {activityList.map((item, i) => (
                  <li key={i} className="aida-activity-item">
                    <div className="aida-activity-avatar">{item.plan?.[0]?.toUpperCase() || 'B'}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-slate-300">{item.text}</p>
                      <span className={`aida-plan-badge badge-${item.plan}`}>
                        {planName(item.plan)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </AidaShell>
  );
};

export default Pricing;
