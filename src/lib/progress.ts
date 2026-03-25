const STORAGE_KEY = "cs-review-progress";

export type ProgressData = {
  [dayKey: string]: { [sectionId: string]: boolean };
};

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(data: ProgressData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function toggleSection(day: number, sectionId: string): ProgressData {
  const data = loadProgress();
  const dayKey = `day${day}`;
  if (!data[dayKey]) data[dayKey] = {};
  data[dayKey][sectionId] = !data[dayKey][sectionId];
  saveProgress(data);
  return data;
}

export function isSectionComplete(data: ProgressData, day: number, sectionId: string): boolean {
  return !!data[`day${day}`]?.[sectionId];
}

export function getDayProgress(data: ProgressData, day: number, totalSections: number): number {
  const dayData = data[`day${day}`];
  if (!dayData || totalSections === 0) return 0;
  const completed = Object.values(dayData).filter(Boolean).length;
  return Math.round((completed / totalSections) * 100);
}

export function getGlobalProgress(data: ProgressData, totalSections: number): number {
  if (totalSections === 0) return 0;
  let completed = 0;
  for (const dayData of Object.values(data)) {
    completed += Object.values(dayData).filter(Boolean).length;
  }
  return Math.round((completed / totalSections) * 100);
}

export function getCompletedDays(data: ProgressData, daySectionCounts: Record<number, number>): number {
  let count = 0;
  for (const [day, total] of Object.entries(daySectionCounts)) {
    if (getDayProgress(data, Number(day), total) === 100) count++;
  }
  return count;
}
