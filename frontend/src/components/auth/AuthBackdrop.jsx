import { useId } from 'react';
import AidaHero from '../dashboard/AidaHero';

const AuthWave = ({ mirror }) => {
  const gradId = useId();
  return (
    <svg
      className={`aida-auth-wave-icon ${mirror ? 'mirror' : ''}`}
      width="32"
      height="40"
      viewBox="0 0 32 40"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--aida-link)" />
          <stop offset="100%" stopColor="var(--aida-accent-tertiary)" />
        </linearGradient>
      </defs>
      <path
        d="M8 4 C2 14, 2 26, 8 36"
        stroke={`url(#${gradId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 8 C10 18, 10 28, 16 36"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
};

export const AuthBrand = () => (
  <div className="aida-auth-brand-row">
    <AuthWave />
    <h1 className="aida-auth-brand">Beka AI</h1>
    <AuthWave mirror />
  </div>
);

const AuthBackdrop = ({ children }) => (
  <div className="aida-auth-page">
    <div className="aida-auth-bg" aria-hidden>
      <div className="aida-auth-orbit aida-auth-orbit-1" />
      <div className="aida-auth-orbit aida-auth-orbit-2" />
      <div className="aida-auth-orbit aida-auth-orbit-3" />
      <div className="aida-auth-node aida-auth-node-1" />
      <div className="aida-auth-node aida-auth-node-2" />
      <div className="aida-auth-node aida-auth-node-3" />
      <AidaHero />
    </div>
    <div className="aida-auth-content">{children}</div>
  </div>
);

export default AuthBackdrop;
