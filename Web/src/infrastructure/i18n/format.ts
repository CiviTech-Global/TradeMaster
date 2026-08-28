import i18n from './i18n';

export function getLocale(): string {
  return i18n.language === 'fa' ? 'fa-IR' : 'en-US';
}

export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(getLocale(), options ?? { dateStyle: 'medium' }).format(
    new Date(date)
  );
}

export function formatDateTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(
    getLocale(),
    options ?? { dateStyle: 'medium', timeStyle: 'short' }
  ).format(new Date(date));
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  if (!Number.isFinite(value)) return String(value);
  return new Intl.NumberFormat(getLocale(), options).format(value);
}

export function formatRelativeDate(date: Date | string | number): string {
  const target = new Date(date).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - target) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return i18n.t('common.today', 'Today');
  if (diffDays === 1) return i18n.t('common.yesterday', 'Yesterday');
  return formatDate(date);
}
