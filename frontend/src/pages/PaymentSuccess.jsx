import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PaymentSuccess = () => {
  const { refreshSubscription } = useAuth();

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
      <div className="glass glass-border max-w-md rounded-2xl p-10 text-center shadow-glow">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">
          ✓
        </div>
        <h1 className="gradient-text mb-2 text-2xl font-bold">Төлем сәтті!</h1>
        <p className="mb-8 text-zinc-400">
          Premium белсенділенді. Енді шексіз чат және сурет жүктеу қолжетімді.
        </p>
        <Link
          to="/"
          className="inline-block w-full rounded-xl bg-gradient-brand py-3 font-semibold text-white shadow-glow"
        >
          Чатқа өту
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
