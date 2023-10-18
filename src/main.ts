function remind(): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleDao = new Infrastructure.ScheduleDaoImpl();
  const today = new Date();
  const accessToken = PropertiesService.getScriptProperties().getProperty("LINE_NOTIFY_TOKEN");
  if (!accessToken) throw new Error("LINE Notify access token is not set.");
  // const apiClient = new Infrastructure.MockNotifyAPIClientImpl();
  const apiClient = new Infrastructure.LINENotifyAPIClientImpl(accessToken);
  const reminderService = new UseCases.ReminderService(ss, scheduleDao, today, apiClient);

  reminderService.remind();
}
