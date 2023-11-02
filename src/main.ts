// Entry point
function remind(): void {
  const today = new Date();
  const messageGenerator = new srv.RemindMessageGenerator();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleRepo = new infra.SheetsScheduleRepositoryImpl(ss);
  const accessToken = PropertiesService.getScriptProperties().getProperty("LINE_NOTIFY_TOKEN");
  if (!accessToken) throw new Error("LINE Notify access token is not set.");
  const apiClient = new infra.LINENotifyAPIClientImpl(accessToken);
  // const apiClient = new Infrastructure.MockNotifyAPIClientImpl();
  const reminderService = new uc.ReminderService(today, messageGenerator, scheduleRepo, apiClient);

  reminderService.remind();
}
