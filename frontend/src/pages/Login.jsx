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
    <div className="flex min-h-screen items-center justify-center bg-surface-dark px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl font-bold text-white">
            B
          </div>
          <h1 className="text-2xl font-semibold text-white">Beka AI Chatbot</h1>
          <p className="mt-2 text-sm text-gray-400">Жүйеге кіріңіз</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-700 bg-surface-light p-8 shadow-xl"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1.5 block text-sm text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-600 bg-surface-dark px-4 py-3 text-white outline-none transition focus:border-accent"
              placeholder="example@mail.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1.5 block text-sm text-gray-400">
              Құпия сөз
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-600 bg-surface-dark px-4 py-3 text-white outline-none transition focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-3 font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? 'Кіру...' : 'Кіру'}
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Тіркелмегенсіз бе?{' '}
            <Link to="/register" className="text-accent hover:underline">
              Тіркелу
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
