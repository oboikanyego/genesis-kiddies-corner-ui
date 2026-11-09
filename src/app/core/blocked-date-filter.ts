/** Service-specific date availability: excludes past and already blocked days. */
export function makeBlockedDateFilter(today: string, dates: readonly string[]): (isoDay: string) => boolean {
  const blocked = new Set(dates);
  return (isoDay: string): boolean => {
    const day = isoDay.slice(0,10);
    return /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= today && !blocked.has(day);
  };
}


/** Monday-first month grid for the always-clickable inline admin calendar. */
export interface MonthDay { day: number; date: string }
export function blockedMonthGrid(month: string): Array<MonthDay | null> {
  if(!/^\d{4}-\d{2}$/.test(month)) return [];
  const [year, number] = month.split('-').map(Number);
  if(number<1||number>12||year<1900||year>9999) return [];
  const start = new Date(Date.UTC(year,number-1,1));
  const count = new Date(Date.UTC(year,number,0)).getUTCDate();
  const offset = (start.getUTCDay()+6)%7; // Monday=0, Sunday=6
  const cells: Array<MonthDay | null> = Array.from({length:offset},()=>null);
  for(let day=1;day<=count;day++){
    cells.push({day,date:month+'-'+String(day).padStart(2,'0')});
  }
  while(cells.length%7) cells.push(null);
  return cells;
}
export function shiftBlockedMonth(month:string,steps:number):string{
  const [year,number]=month.split('-').map(Number);
  const shifted=new Date(Date.UTC(year,number-1+steps,1));
  return String(shifted.getUTCFullYear()).padStart(4,'0')+'-'+String(shifted.getUTCMonth()+1).padStart(2,'0');
}
