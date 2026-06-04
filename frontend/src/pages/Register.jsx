import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Құпия сөздер сәйкес келмейді');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Тіркелу сәтсіз');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg flex min-h-screen items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">
            B
          </div>
          <h1 className="text-2xl font-bold text-brand">Beka AI</h1>
          <p className="mt-1 text-sm text-surface-subtext">Жаңа аккаунт</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {['name', 'email', 'password', 'confirmPassword'].map((field, i) => {
            const labels = ['Аты-жөні', 'Email', 'Құпия сөз', 'Құпия сөзді растау'];
            const types = ['text', 'email', 'password', 'password'];
            const values = [name, email, password, confirmPassword];
            const setters = [setName, setEmail, setPassword, setConfirmPassword];
            return (
              <div key={field} className={i < 3 ? 'mb-4' : 'mb-6'}>
                <label className="mb-1 block text-sm text-surface-subtext">{labels[i]}</label>
                <input
                  type={types[i]}
                  value={values[i]}
                  onChange={(e) => setters[i](e.target.value)}
                  required
                  minLength={field.includes('password') ? 6 : undefined}
                  className="input-field"
                />
              </div>
            );
          })}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Тіркелуде...' : 'Тіркелу'}
          </button>
          <p className="mt-6 text-center text-sm text-surface-subtext">
            Аккаунт бар ма?{' '}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Кіру
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
