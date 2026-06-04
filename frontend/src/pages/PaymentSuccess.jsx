import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const PaymentSuccess = () => {
  const { refreshSubscription } = useAuth();
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-2xl text-brand">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-surface-text">Төлем сәтті!</h1>
        <p className="mt-2 text-surface-subtext">Жоспар белсенділенді</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Чатқа өту
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
