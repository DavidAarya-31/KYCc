export interface CycleWindow {
  startMonth: string; // YYYY-MM format
  endMonth: string; // YYYY-MM format
  months: string[]; // Array of YYYY-MM strings
  years: number[]; // Unique years present in months
}

export function getAnniversaryCycle(anniversaryMonth: number, currentDate = new Date()): CycleWindow {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

  // Determine the cycle year based on current month vs anniversary month
  const cycleStartYear = currentMonth >= anniversaryMonth ? currentYear : currentYear - 1;
  
  const months: string[] = [];
  
  // Generate 12 months starting from anniversary month
  for (let i = 0; i < 12; i++) {
    const monthIndex = ((anniversaryMonth - 1 + i) % 12) + 1;
    const year = cycleStartYear + Math.floor((anniversaryMonth - 1 + i) / 12);
    const monthStr = monthIndex.toString().padStart(2, '0');
    months.push(`${year}-${monthStr}`);
  }

  const years = Array.from(new Set(months.map(month => parseInt(month.slice(0, 4), 10))));

  return {
    startMonth: months[0],
    endMonth: months[11],
    months,
    years,
  };
}

export function getCycleMonthPairs(cycle: CycleWindow): Set<string> {
  return new Set(cycle.months.map(month => {
    const year = parseInt(month.slice(0, 4), 10);
    return `${month}:${year}`;
  }));
}

export function getCycleEndDate(cycle: CycleWindow): Date {
  const [year, month] = cycle.endMonth.split('-').map(Number);
  return new Date(year, month, 0);
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRecentYears(count = 6, fromDate = new Date()): number[] {
  const currentYear = fromDate.getFullYear();
  return Array.from({ length: count }, (_, index) => currentYear - index);
}

export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function getProgressPercentage(spent: number, milestone: number): number {
  if (milestone === 0) return 0;
  return Math.min((spent / milestone) * 100, 100);
}
