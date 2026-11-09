/** A fresh, service-specific Ionic calendar filter, created before the picker mounts. */
export function makeBlockedDateFilter(today: string, dates: readonly string[]): (isoDay: string) => boolean {
  const blocked = new Set(dates);
  return (isoDay: string): boolean => {
    const day = isoDay.slice(0,10);
    return /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= today && !blocked.has(day);
  };
}
