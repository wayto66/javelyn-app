export class DateHelper {
  static getDaysBetweenDates(
    startDate: Date,
    endDate: Date,
    format: "day-month" | "full"
  ): string[] {
    const daysArray: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (format === "day-month") {
        daysArray.push(
          `${currentDate.getDate().toString().padStart(2, "0")}/${(
            currentDate.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}
          `
        );
      } else {
        daysArray.push(currentDate.toISOString().split("T")[0] ?? "");
      }

      currentDate.setDate(currentDate.getDate() + 1); // Avança para o próximo dia
    }

    return daysArray;
  }

  static getWeeksBetweenDates(startDate: Date, endDate: Date): string[] {
    const weeksArray: string[] = [];
    const currentDate = new Date(startDate);
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    while (currentDate <= endDate) {
      const startOfWeek = new Date(currentDate.getTime());
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Set to the first day of the week
      const endOfWeek = new Date(startOfWeek.getTime());
      endOfWeek.setDate(endOfWeek.getDate() + 6); // Set to the last day of the week

      const weekString = `S${Math.ceil(startOfWeek.getDate() / 7)}/${
        startOfWeek.getMonth() + 1
      }/${startOfWeek.getFullYear()}`;

      weeksArray.push(weekString);

      currentDate.setTime(currentDate.getTime() + 7 * oneDay); // Move to the next week
    }

    return weeksArray;
  }

  static getMonthsBetweenDates(startDate: Date, endDate: Date): string[] {
    const monthsArray: string[] = [];
    const currentDate = new Date(startDate);
    const oneMonth = 30 * 24 * 60 * 60 * 1000; // milliseconds in a month (aprox.)

    while (currentDate <= endDate) {
      const monthString = `${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;
      monthsArray.push(monthString);

      // Move para o primeiro dia do próximo mês
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }

    return monthsArray;
  }
}
