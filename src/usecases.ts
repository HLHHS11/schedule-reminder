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
      // フィルタリング条件をインスタンス化
      const onAndAfterToday = new mo.OnAndAfterTodayStrategy(this.today);
      const todayAfter4pm = new mo.TodayAfter4pmStrategy(this.today);
      const tomorrow = new mo.TomorrowStrategy(this.today);
      // フィルタリング
      const scheduleOnAndAfterToday = schedule.filter(onAndAfterToday);
      const scheduleTodayAfter4pm = scheduleOnAndAfterToday.filter(todayAfter4pm);
      const scheduleTomorrow = scheduleOnAndAfterToday.filter(tomorrow);
      // メッセージ生成
      const messages: string[] = [];
      scheduleTodayAfter4pm.getPractices().forEach(practice => {
        messages.push(this.messageGenerator.generate(practice, "本日の練習のリマインドです", "ボール担当の方よろしくお願いいたします"));
      })
      scheduleTomorrow.getPractices().forEach(practice => {
        messages.push(this.messageGenerator.generate(practice, "", "試合球・練習球は誰が持っていきますか？"));
      });
      // メッセージ送信
      messages.forEach(message => {this.apiClient.sendMessage(message)});      
    }
    
  }

}