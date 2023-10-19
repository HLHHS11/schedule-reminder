namespace UseCases {

  export class ReminderService {

    constructor(
      private readonly ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
      private readonly scheduleDao: Infrastructure.ScheduleDao,
      private readonly today: Date,
      private readonly apiClient: Infrastructure.NotifyAPIClient,
    ) {}

    public remind(): void {
      // 検索条件である，this.todayの次の日の00:00の時刻を取得
      const tomorrowTime = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate() + 1).getTime();
      // スケジュール一覧を取得
      const scheduleSheets: GoogleAppsScript.Spreadsheet.Sheet[] = [];
      Sets.Months.forEach(month => {
        const sheet = this.ss.getSheetByName(month);
        if (sheet) {
          scheduleSheets.push(sheet);
        }
      });

      let remindMessage = "";
      for (const sheet of scheduleSheets) {
        const schedule = this.scheduleDao.getSchedule(sheet);
        const tomorrowPractices = schedule.filter(practice => practice.getDateObj().getTime() === tomorrowTime);
        tomorrowPractices.forEach(practice => {
          remindMessage += `\n${practice.getRemindMessage()}`;
        });
      }
      
      if (remindMessage !== "") {
        remindMessage += "\n\n試合球・練習球は誰が持っていきますか？";
        this.apiClient.sendMessage(remindMessage);
      } else {
        console.log("No practice tomorrow.");
      }
    }
    
  }

}