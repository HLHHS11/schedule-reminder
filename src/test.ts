function testRemind() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scheduleDao = new Infrastructure.ScheduleDaoImpl();
  const mockApiClient = new Infrastructure.MockNotifyAPIClientImpl();
  for (let dateIncrement=0; dateIncrement<30; dateIncrement++) {
    const today = new Date(2023, 10-1, 17 + dateIncrement);
    const reminderService = new UseCases.ReminderService(ss, scheduleDao, today, mockApiClient);
    console.log(`-----${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}-----`);
    reminderService.remind();
  }
}