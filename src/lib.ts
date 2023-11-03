namespace lib {

  export const parseDateString = (dateStr: string): Date => {
    // dateStrが"○月○日"型なら
    const match1 = dateStr.match(/(\d{1,2})月(\d{1,2})日/);
    if (match1) {

      const currentYear = new Date().getFullYear();
      const month = parseInt(match1[1], 10);
      const day = parseInt(match1[2], 10);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        // Dateコンストラクタはmonthを0-11で受け取るので-1する
        return new Date(currentYear, month-1, day);
      } else {
        throw new Error("Failed to parse date string.");
      }

    } else {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error("Failed to parse date string.");
      } else {
        return date;
      }
    }
  }

}