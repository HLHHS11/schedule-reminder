function testRemind() {
  const messageGenerator = new srv.RemindMessageGenerator();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleRepo = new infra.SheetsScheduleRepositoryImpl(ss);
  const mockApiClient = new infra.MockNotifyAPIClientImpl();
  for (let dateIncrement=0; dateIncrement<30; dateIncrement++) {
    const today = new Date(2023, 10-1, 17 + dateIncrement);
    const reminderService = new uc.ReminderService(today, messageGenerator, scheduleRepo, mockApiClient);
    console.log(`-----${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}-----`);
    reminderService.remind();
  }
}