import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'beka_profile_data';

const defaults = {
  username: '',
  phone: '',
  timezone: 'Asia/Almaty',
  twoFactor: true,
  integCalendar: true,
  integEmail: true,
  integSlack: false,
  aidaPersonality: 'concise',
};

export const useProfileData = (user) => {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? JSON.parse(raw) : {};
      return {
        ...defaults,
        ...saved,
        fullName: saved.fullName ?? user?.name ?? '',
      };
    } catch {
      return { ...defaults, fullName: user?.name ?? '' };
    }
  });

  useEffect(() => {
    if (user?.name && !data.fullName) {
      setData((d) => ({ ...d, fullName: user.name }));
    }
  }, [user?.name]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = useCallback((patch) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  return { profile: data, updateProfile: update };
};
