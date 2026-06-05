/** Email немесе телефонды нормализациялау */
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const normalizePhone = (raw) => {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    digits = `7${digits}`;
  }
  if (!digits.startsWith('7') && digits.length >= 10) {
    digits = digits;
  }
  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
};

export const parseIdentifier = (raw) => {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return { error: 'Идентификатор бос' };

  if (isEmail(trimmed)) {
    return { channel: 'email', target: trimmed.toLowerCase() };
  }

  const phone = normalizePhone(trimmed);
  if (!phone) {
    return { error: 'Дұрыс email немесе телефон енгізіңіз' };
  }
  return { channel: 'phone', target: phone };
};

export const findUserByIdentifier = async (User, identifier) => {
  const parsed = parseIdentifier(identifier);
  if (parsed.error) return { error: parsed.error };

  const query =
    parsed.channel === 'email'
      ? { email: parsed.target }
      : { phone: parsed.target };

  const user = await User.findOne(query).select('+password');
  return { user, ...parsed };
};
