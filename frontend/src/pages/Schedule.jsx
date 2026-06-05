import { useState, useMemo } from 'react';
import AidaShell from '../components/dashboard/AidaShell';
import { usePreferences } from '../context/PreferencesContext';
import {
  useCalendarEvents,
  EVENT_TYPES,
  formatDateKey,
  parseDateKey,
} from '../hooks/useCalendarEvents';

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const Schedule = () => {
  const { t, locale, months, weekdays } = usePreferences();
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
  const { events, addEvent, removeEvent, getEventsForDate, upcoming } = useCalendarEvents();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('10:00');
  const [eventType, setEventType] = useState('meeting');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayKey = formatDateKey(today);
  const selectedEvents = getEventsForDate(selectedDate);
  const upcomingList = upcoming();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const n = new Date();
    setViewDate(new Date(n.getFullYear(), n.getMonth(), 1));
    setSelectedDate(formatDateKey(n));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addEvent({
      date: selectedDate,
      title,
      time,
      location,
      type: eventType,
    });
    setTitle('');
    setLocation('');
  };

  const selectDay = (date) => {
    if (!date) return;
    const key = formatDateKey(date);
    setSelectedDate(key);
    const dayEvents = getEventsForDate(key);
    if (dayEvents.length === 1) {
      setEventType(dayEvents[0].type);
    }
  };

  return (
    <AidaShell>
      <main className="aida-schedule-main">
        <div className="aida-schedule-header">
          <h1 className="aida-settings-title">{t('schedule.title')}</h1>
          <div className="aida-orb aida-orb-inline shrink-0">AI</div>
        </div>

        <div className="aida-schedule-layout">
          {/* Calendar */}
          <div className="aida-settings-card aida-calendar-card">
            <div className="aida-cal-toolbar">
              <div className="flex items-center gap-2">
                <button type="button" className="aida-cal-nav" onClick={prevMonth} aria-label="Алдыңғы ай">
                  ‹
                </button>
                <h2 className="aida-cal-month">
                  {months[month]} {year}
                </h2>
                <button type="button" className="aida-cal-nav" onClick={nextMonth} aria-label="Келесі ай">
                  ›
                </button>
              </div>
              <button type="button" className="aida-cal-today" onClick={goToday}>
                {t('schedule.today')}
              </button>
            </div>

            <div className="aida-cal-weekdays">
              {weekdays.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>

            <div className="aida-cal-grid">
              {cells.map((date, idx) => {
                if (!date) return <div key={`e-${idx}`} className="aida-cal-cell empty" />;
                const key = formatDateKey(date);
                const dayEvents = getEventsForDate(key);
                const isToday = key === todayKey;
                const isSelected = key === selectedDate;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectDay(date)}
                    className={`aida-cal-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="aida-cal-day-num">{date.getDate()}</span>
                    <div className="aida-cal-dots">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`aida-cal-event-pill type-${EVENT_TYPES[ev.type]?.color || 'slate'}`}
                          title={`${t(`schedule.types.${ev.type}`)}: ${ev.title}`}
                        >
                          {EVENT_TYPES[ev.type]?.icon} {t(`schedule.types.${ev.type}`)}
                        </span>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-slate-400">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedEvents.length > 0 && (
              <div className="aida-cal-selected-day">
                <p className="text-xs font-semibold aida-text-accent-soft">
                  {parseDateKey(selectedDate).toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <ul className="mt-2 space-y-1">
                  {selectedEvents.map((ev) => (
                    <li key={ev.id} className="flex items-center justify-between gap-2 text-xs text-slate-300">
                      <span>
                        <span className={`aida-tag type-${EVENT_TYPES[ev.type]?.color}`}>
                          {t(`schedule.types.${ev.type}`)}
                        </span>{' '}
                        {ev.time} — {ev.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEvent(ev.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="aida-schedule-side">
            {/* Upcoming */}
            <div className="aida-settings-card">
              <h3>{t('schedule.upcoming')}</h3>
              {upcomingList.length === 0 ? (
                <p className="text-xs text-slate-500">{t('schedule.noEvents')}</p>
              ) : (
                <ul className="aida-upcoming-list">
                  {upcomingList.map((ev) => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          setSelectedDate(ev.date);
                          setViewDate(
                            new Date(
                              parseDateKey(ev.date).getFullYear(),
                              parseDateKey(ev.date).getMonth(),
                              1
                            )
                          );
                        }}
                      >
                        <p className="font-medium text-slate-200">{ev.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {parseDateKey(ev.date).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          · {ev.time}
                        </p>
                        <span className={`aida-tag type-${EVENT_TYPES[ev.type]?.color}`}>
                          {t(`schedule.types.${ev.type}`)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Create */}
            <div className="aida-settings-card">
              <h3>{t('schedule.addEvent')}</h3>
              <p className="mb-3 text-[11px] aida-text-accent-dim">
                {t('schedule.day')}:{' '}
                {parseDateKey(selectedDate).toLocaleDateString(locale, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="aida-settings-label">{t('schedule.eventType')}</label>
                  <select
                    className="aida-settings-select"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    {Object.keys(EVENT_TYPES).map((id) => (
                      <option key={id} value={id}>
                        {EVENT_TYPES[id].icon} {t(`schedule.types.${id}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="aida-settings-label">{t('schedule.titleLabel')}</label>
                  <input
                    className="aida-settings-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('schedule.titlePlaceholder')}
                  />
                </div>
                <div>
                  <label className="aida-settings-label">{t('schedule.location')}</label>
                  <input
                    className="aida-settings-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t('schedule.locationPlaceholder')}
                  />
                </div>
                <div>
                  <label className="aida-settings-label">{t('schedule.time')}</label>
                  <select
                    className="aida-settings-select"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="aida-cal-create-btn">
                  {t('schedule.create')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </AidaShell>
  );
};

export default Schedule;
