import { Link } from 'react-router-dom';

const PaymentCancel = () => (
  <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
    <div className="glass glass-border max-w-md rounded-2xl p-10 text-center">
      <h1 className="mb-2 text-2xl font-bold text-zinc-200">Төлем тоқтатылды</h1>
      <p className="mb-8 text-zinc-400">Ештеңе алынбады. Кез келген уақытта қайта көріп көріңіз.</p>
      <Link
        to="/pricing"
        className="inline-block w-full rounded-xl border border-zinc-600 py-3 text-zinc-300 transition hover:bg-zinc-800"
      >
        Жоспарларға оралу
      </Link>
    </div>
  </div>
);

export default PaymentCancel;
