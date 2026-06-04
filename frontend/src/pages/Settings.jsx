import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

const Settings = () => {
  const { user, subscription, logout, refreshSubscription } = useAuth();

  const handleRefresh = () => {
    refreshSubscription();
  };

  return (
    <AppLayout showMainNav>
      <header className="border-b border-surface-border bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-surface-text">Параметрлер</h1>
        <p className="text-sm text-surface-subtext">Аккаунт және жоспар</p>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-surface-text">Профиль</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-subtext">Аты-жөні</label>
                <p className="rounded-xl bg-surface-muted px-4 py-3 text-surface-text">{user?.name}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-surface-subtext">Email</label>
                <p className="rounded-xl bg-surface-muted px-4 py-3 text-surface-text">{user?.email}</p>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-surface-text">Жоспар</h2>
            <div className="flex items-center justify-between rounded-xl bg-brand-light px-4 py-4">
              <div>
                <p className="font-semibold text-brand">{subscription?.planName || 'Тегін'}</p>
                {subscription?.dailyRemaining != null && (
                  <p className="text-sm text-surface-subtext">
                    Бүгін: {subscription.dailyRemaining} хабарлама қалды
                  </p>
                )}
                {subscription?.premiumUntil && (
                  <p className="text-xs text-surface-subtext">
                    Белсенді: {new Date(subscription.premiumUntil).toLocaleDateString('kk-KZ')}
                  </p>
                )}
              </div>
              <Link to="/pricing" className="btn-primary">
                Жоспарды өзгерту
              </Link>
            </div>
            <button type="button" onClick={handleRefresh} className="mt-3 text-sm text-brand hover:underline">
              Статусты жаңарту
            </button>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-surface-text">Қолданба</h2>
            <ul className="space-y-2 text-sm text-surface-subtext">
              <li>✓ Интерфейс: ақшыл тема</li>
              <li>✓ Төлем: Lava.top</li>
              <li>✓ 3 жоспар: Тегін, Бастау (50₽), Про (120₽)</li>
            </ul>
          </section>

          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            Шығу
          </button>
        </div>
      </main>
    </AppLayout>
  );
};

export default Settings;
