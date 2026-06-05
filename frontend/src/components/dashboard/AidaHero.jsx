const AidaHero = () => (
  <div className="aida-hero-wrap">
    <div className="aida-mesh">
      <div className="aida-mesh-wave" />
      <div className="aida-mesh-grid" />
      <div className="aida-mesh-lines">
        <svg viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="aidaStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--aida-accent-secondary)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="var(--aida-accent-tertiary)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--aida-accent-secondary)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            className="aida-mesh-line-path"
            strokeDasharray="200"
            d="M0,120 Q50,80 100,100 T200,90 T300,110 T400,85 L400,200 L0,200 Z"
          />
          <path
            className="aida-mesh-line-path"
            strokeDasharray="180"
            style={{ animationDelay: '-2s' }}
            d="M0,140 Q80,100 160,130 T320,115 T400,130"
          />
          <path
            className="aida-mesh-line-path"
            strokeDasharray="160"
            style={{ animationDelay: '-4s', opacity: 0.5 }}
            d="M0,100 Q120,60 240,95 T400,70"
          />
        </svg>
      </div>
    </div>
  </div>
);

export default AidaHero;
