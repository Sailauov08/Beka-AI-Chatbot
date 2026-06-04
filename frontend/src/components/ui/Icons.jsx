export const IconCheck = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMinus = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
    <path d="M4 8h8" strokeLinecap="round" />
  </svg>
);

export const IconImage = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
    />
  </svg>
);

export const PageHeader = ({ label, title, description }) => (
  <header className="border-b border-surface-border bg-white px-8 py-8">
    {label && (
      <p className="section-label">{label}</p>
    )}
    <h1 className="page-title">{title}</h1>
    {description && <p className="page-desc">{description}</p>}
  </header>
);

export const FeatureRow = ({ included, strong, children }) => (
  <li
    className={`flex items-start gap-3 text-sm leading-snug ${
      included ? 'text-surface-text' : 'text-surface-subtext'
    }`}
  >
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded ${
        included
          ? strong
            ? 'bg-ink text-white'
            : 'border border-surface-border bg-white text-ink'
          : 'border border-surface-border bg-surface-muted text-slate-400'
      }`}
    >
      {included ? <IconCheck className="h-3 w-3" /> : <IconMinus className="h-3 w-3" />}
    </span>
    <span className={strong ? 'font-medium' : ''}>{children}</span>
  </li>
);
