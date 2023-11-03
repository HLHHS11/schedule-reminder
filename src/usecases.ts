// Use Cases
namespace uc {

  export class ReminderService {

    private readonly today: Date;
    private readonly messageGenerator: srv.RemindMessageGenerator;
    private readonly scheduleRepo: infra.IScheduleRepository;
    private readonly apiClient: infra.NotifyAPIClient;

    constructor(
      today: Date,
      messageGenerator: srv.RemindMessageGenerator,
      scheduleRepo: infra.IScheduleRepository,
      apiClient: infra.NotifyAPIClient,
    ) {
      this.today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      this.messageGenerator = messageGenerator;
      this.scheduleRepo = scheduleRepo;
      this.apiClient = apiClient;
    }

    public remind(): void {
      // スケジュールを取得
      const schedule = this.scheduleRepo.get();
      // フィルタリング条件を生成
      const stratTodayTomorrow = new mo.TodayOrTomorrowStrategy(this.today);
      const stratToday = new mo.TodayStrategy(this.today);
      const stratTomorrow = new mo.TomorrowStrategy(this.today);
      const stratAfter4pm = new mo.AfterSpecificHoursStrategy(16);
      // フィルタリング
      const scheduleTodayTomorrow = schedule.filter(stratTodayTomorrow);
      const scheduleTodayAfter4pm = scheduleTodayTomorrow.filter(stratToday).filter(stratAfter4pm);
      const scheduleTomorrow = scheduleTodayTomorrow.filter(stratTomorrow);
      // メッセージ生成
      const messages: string[] = [];
      scheduleTodayAfter4pm.getPractices().forEach(practice => {
        messages.push(this.messageGenerator.generate(practice, "本日の練習の再リマインドです", "ボール担当の方よろしくお願いいたします"));
      })
      scheduleTomorrow.getPractices().forEach(practice => {
        messages.push(this.messageGenerator.generate(practice, "", "試合球・練習球は誰が持っていきますか？"));
      });
      // メッセージ送信
      messages.forEach(message => {this.apiClient.sendMessage(message)});      
    }
    
  }

}