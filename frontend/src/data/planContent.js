/** Тарифтер мен UI мәтіндері */

export const PLAN_META = {
  free: {
    tagline: 'Free',
    subtitle: 'Негізгі чат және сурет — тегін',
    bestFor: 'Танысу, жеке сұрақтар',
    cta: 'Ағымдағы жоспар',
  },
  basic: {
    tagline: 'Standard',
    subtitle: 'Көбірек хабарлама, күн сайын жұмыс',
    bestFor: 'Оқу, жоба, орташа жүктеме',
    cta: 'Бастауға жазылу',
  },
  pro: {
    tagline: 'Professional',
    subtitle: 'Шексіз қолжетімділік және басымдық',
    bestFor: 'Кәсіби және күнделікті интенсивті пайдалану',
    cta: 'Проға жазылу',
  },
};

export const PLAN_FEATURES = {
  free: [
    { label: 'Күніне 15 AI хабарлама', included: true },
    { label: 'Мәтіндік чат (Gemini)', included: true },
    { label: 'Сурет жүктеу және Vision', included: true },
    { label: 'Чат тарихы', included: true },
    { label: 'Шексіз хабарлама', included: false },
    { label: 'Pro басымдық кезегі', included: false },
  ],
  basic: [
    { label: 'Күніне 80 хабарлама', included: true },
    { label: 'Сурет және Vision', included: true },
    { label: '30 күн белсенділік', included: true },
    { label: 'Lava төлем (карта, Kaspi, СБП)', included: true },
    { label: 'Шексіз хабарлама', included: false },
    { label: 'Pro басымдық', included: false },
  ],
  pro: [
    { label: 'Шексіз хабарлама', included: true, strong: true },
    { label: 'Сурет және Vision', included: true, strong: true },
    { label: 'Жауаптарға басымдық', included: true, strong: true },
    { label: 'Күрделі тапсырмалар', included: true },
    { label: '30 күн Pro мәртебе', included: true },
  ],
};

export const PRO_BENEFITS = [
  {
    title: 'Шексіз хабарлама',
    text: 'Күнделікті лимит жоқ. Ұзақ диалогтар мен көп сұрақтарға арналған.',
  },
  {
    title: 'Басымдық кезегі',
    text: 'Pro пайдаланушылардың сұрақтары жүйеде алдымен өңделеді.',
  },
  {
    title: 'Күрделі тапсырмалар',
    text: 'Ұзын код, архитектура, құжаттама — жоғары жүктеме үшін.',
  },
  {
    title: 'Толық Vision',
    text: 'Сурет, диаграмма, скриншот — терең талдау барлық жоспарда, Pro — лимитсіз.',
  },
];

export const PRO_VS_BASIC = [
  { title: 'Күнделікті лимит', basic: '80', pro: 'Шексіз' },
  { title: 'Сурет / Vision', basic: 'Иә', pro: 'Иә' },
  { title: 'Кезек', basic: 'Стандарт', pro: 'Басымдық' },
  { title: 'Баға', basic: '50 ₽ / ай', pro: '120 ₽ / ай' },
];

export const PRICING_FAQ = [
  {
    q: 'Тегін жоспарда сурет жіберуге бола ма?',
    a: 'Иә. Тегін нұсқада да сурет жүктеу және Vision қолжетімді. Шектеу — күніне 15 хабарлама.',
  },
  {
    q: 'Про неге қажет?',
    a: 'Күніне 15–80 хабарлама жетпесе: Pro шексіз чат және басымдық кезек береді.',
  },
  {
    q: 'Төлем қалай жүреді?',
    a: 'Lava.top арқылы. Төлем расталғаннан кейін webhook жоспарды автоматты белсендіреді.',
  },
  {
    q: 'Жазылым аяқталса?',
    a: '30 күннен кейін Тегін жоспарға қайтасыз (сурет сақталады, лимит 15/күн).',
  },
];

export const SETTINGS_FEATURES = (sub) => [
  { key: 'chat', title: 'Мәтіндік чат', desc: 'Gemini AI', on: true },
  { key: 'image', title: 'Сурет жүктеу', desc: 'Барлық жоспарларда', on: true },
  { key: 'vision', title: 'Vision талдау', desc: 'Сурет бойынша сұрақ', on: true },
  {
    key: 'unlimited',
    title: 'Шексіз хабарлама',
    desc: 'Күнделікті лимит жоқ',
    on: sub?.dailyLimit == null,
  },
  {
    key: 'priority',
    title: 'Pro басымдығы',
    desc: 'Жауап кезегінде алдымен',
    on: Boolean(sub?.isPro),
  },
];

export const PAYMENT_METHODS = ['Карта', 'Kaspi', 'СБП'];
