import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'beka_calendar_events';

export const EVENT_TYPES = {
  meeting: { label: 'Кездесу', color: 'cyan', icon: '📅' },
  deadline: { label: 'Дедлайн', color: 'gold', icon: '⏰' },
  birthday: { label: 'Туған күн', color: 'purple', icon: '🎂' },
  holiday: { label: 'Мереке', color: 'magenta', icon: '🎉' },
  reminder: { label: 'Еске салу', color: 'blue', icon: '🔔' },
  other: { label: 'Басқа', color: 'slate', icon: '•' },
};

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useCalendarEvents = () => {
  const [events, setEvents] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((event) => {
    const item = {
      id: crypto.randomUUID?.() || String(Date.now()),
      date: event.date,
      title: event.title.trim(),
      time: event.time || '10:00',
      location: event.location?.trim() || '',
      type: event.type || 'other',
    };
    setEvents((prev) => [...prev, item]);
    return item;
  }, []);

  const removeEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getEventsForDate = useCallback(
    (dateKey) => events.filter((e) => e.date === dateKey),
    [events]
  );

  const upcoming = useCallback(
    (fromDate = new Date()) => {
      const today = formatDateKey(fromDate);
      return [...events]
        .filter((e) => e.date >= today)
        .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))
        .slice(0, 8);
    },
    [events]
  );

  return { events, addEvent, removeEvent, getEventsForDate, upcoming };
};

export const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
