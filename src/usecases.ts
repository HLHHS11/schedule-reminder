namespace UseCases {

  export class ReminderService {

    constructor(
      private readonly ss: GoogleAppsScript.Spreadsheet.Spreadsheet,
      private readonly scheduleDao: Infrastructure.ScheduleDao,
      private readonly today: Date,
      private readonly apiClient: Infrastructure.NotifyAPIClient,
    ) {}

    public remind(): void {
      // スケジュール一覧を取得
      const scheduleSheets: GoogleAppsScript.Spreadsheet.Sheet[] = [];
      Sets.Months.forEach(month => {
        const sheet = this.ss.getSheetByName(month);
        if (sheet) {
          scheduleSheets.push(sheet);
        }
      });
      // this.todayの0:00の時刻を取得
      const todayTime = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()).getTime();
      // 検索条件である，this.todayの次の日の0:00の時刻を取得
      const tomorrowTime = todayTime + 24*60*60*1000;
      // 午後4時以降の練習を検索するための必要条件として，todayの16:00の時刻を取得
      const today4pmTime = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 16).getTime();
      
      const todayRemindMessages: string[] = [];
      const tomorrowRemindMessages: string[] = [];
      for (const sheet of scheduleSheets) {
        const schedule = this.scheduleDao.getSchedule(sheet);

        const todayAfter4pmPractices = schedule.filter(practice => {
          practice.getDateObj().getTime() === todayTime &&
          practice.getStartTime().getTime() >= today4pmTime;
        });
        todayAfter4pmPractices.forEach(practice => {
          todayRemindMessages.push(`\n本日の練習の再リマインドです\n${practice.getRemindMessage()}`);
        });

        const tomorrowPractices = schedule.filter(practice => practice.getDateObj().getTime() === tomorrowTime);
        tomorrowPractices.forEach(practice => {
          tomorrowRemindMessages.push(`\n${practice.getRemindMessage()}`);
        });
      }
      
      if (todayRemindMessages.length > 0) {
        todayRemindMessages.forEach(message => {this.apiClient.sendMessage(message)});
        this.apiClient.sendMessage("\nボール担当の方よろしくお願いいたします");
      }
      if (tomorrowRemindMessages.length > 0) {
        tomorrowRemindMessages.forEach(message => {this.apiClient.sendMessage(message)});
        this.apiClient.sendMessage("\n試合球・練習球は誰が持っていきますか？");
      }
      if (todayRemindMessages.length === 0 && tomorrowRemindMessages.length === 0) {
        console.log("No practice tomorrow.");
      }
      
    }
    
  }

}