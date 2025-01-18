import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  formatDateToStartOfDayUTC(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00.000Z`;
  }

  getNumberOfDays(starDate: Date, endDate: Date) {
    if (!starDate || !endDate) {
      return;
    }
    return Math.ceil(
      Math.abs(endDate.setHours(0, 0, 0, 0) - starDate.setHours(0, 0, 0, 0)) /
        (1000 * 60 * 60 * 24)
    );
  }

  getDayName(dateString: any) {
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
  }

  countConsecutiveDays(dates: string[]) {
    if (!dates.length) return [0, 0];

    // Convert strings to Date objects and sort them
    const dateObjects = dates
      .map((date) => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());

    let maxConsecutiveDays = 1;
    let currentStreak = 1;

    for (let i = 1; i < dateObjects.length; i++) {
      const currentDate = dateObjects[i];
      const previousDate = dateObjects[i - 1];

      // Check if the current date is the next day of the previous date
      if (currentDate.getTime() - previousDate.getTime() === 86400000) {
        // 86400000 ms = 1 day
        currentStreak++;
      } else {
        if (currentStreak > maxConsecutiveDays) {
          maxConsecutiveDays = currentStreak;
        }
        currentStreak = 1;
      }
    }

    return [maxConsecutiveDays, currentStreak];
  }

  getMostRecentDate(dates: string[]): Date | null {
    if (!dates.length) return null;

    // Convert strings to Date objects and sort them
    const dateObjects = dates
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    // The most recent date will be the first in the sorted array
    return dateObjects[0];
  }
}
