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
      setError(err.message || 'Кіру сәтсіз');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">
            B
          </div>
          <h1 className="text-2xl font-bold text-brand">Beka AI</h1>
          <p className="mt-1 text-sm text-surface-subtext">AI көмекшіңізге кіріңіз</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="mb-1 block text-sm text-surface-subtext">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm text-surface-subtext">Құпия сөз</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Кіру...' : 'Кіру'}
          </button>
          <p className="mt-6 text-center text-sm text-surface-subtext">
            Тіркелмедіңіз бе?{' '}
            <Link to="/register" className="font-medium text-brand hover:underline">
              Тіркелу
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
