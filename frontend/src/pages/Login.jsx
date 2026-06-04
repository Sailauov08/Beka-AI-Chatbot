import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Кіру сәтсіз аяқталды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <h1 className="gradient-text text-3xl font-bold tracking-tight">Beka AI</h1>
          <p className="mt-2 text-sm text-zinc-400">Заманауи AI көмекшіңіз</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass glass-border rounded-2xl p-8 shadow-2xl"
        >
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-700/80 bg-surface-dark/80 px-4 py-3 text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="example@mail.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-400">
              Құпия сөз
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-700/80 bg-surface-dark/80 px-4 py-3 text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-brand py-3.5 font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Кіру...' : 'Кіру'}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Тіркелмегенсіз бе?{' '}
            <Link to="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
              Тіркелу
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
