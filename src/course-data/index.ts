import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";
import { day6 } from "./day6";
import { day7 } from "./day7";
import { CourseDay } from "../types";

export const COURSE_DAYS: CourseDay[] = [day1, day2, day3, day4, day5, day6, day7];

export function getCourseDay(dayNumber: number): CourseDay | undefined {
  return COURSE_DAYS.find(d => d.day === dayNumber);
}

export function getTotalSections(): number {
  return COURSE_DAYS.reduce((sum, day) => sum + day.sections.length, 0);
}

export function getDaySectionCounts(): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const day of COURSE_DAYS) {
    counts[day.day] = day.sections.length;
  }
  return counts;
}
