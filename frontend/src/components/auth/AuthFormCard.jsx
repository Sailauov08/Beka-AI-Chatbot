import AuthBackdrop, { AuthBrand } from './AuthBackdrop';

const AuthFormCard = ({ subtitle, tall, children }) => (
  <AuthBackdrop>
    <div className={`aida-auth-card ${tall ? 'aida-auth-card--tall' : ''}`}>
      <AuthBrand />
      <p className="aida-auth-subtitle">{subtitle}</p>
      {children}
    </div>
  </AuthBackdrop>
);

export default AuthFormCard;
