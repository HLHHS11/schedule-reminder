// Infrastructure
namespace infra {

  export interface IScheduleRepository {
    get(): mo.Schedule;
  }

  export class SheetsScheduleRepositoryImpl implements IScheduleRepository {

    constructor(
      private readonly ss: GoogleAppsScript.Spreadsheet.Spreadsheet
    ) {}

    public get(): mo.Schedule {
      const practices: mo.Practice[] = [];
      const scheduleSheets = this.getScheduleSheets();

      scheduleSheets.forEach(sheet => {
        // NOTE: データ範囲の最終行 = シートの最後の行(更新日のセル) - 2
        const dataLastRow = sheet.getLastRow() - 2;
        const dataRange = sheet.getRange(
          cst.RowNumber.EVENT_LIST_START,
          cst.ColumnNumber.DATE,
          dataLastRow - cst.RowNumber.EVENT_LIST_START + 1,
          cst.ColumnNumber.BOOKER - cst.ColumnNumber.DATE + 1
        );
        const table = dataRange.getValues();
        for (let i=0; i<table.length; i++) {
          const values = table[i];
          const dateValue = values[this.toArrIdx(cst.ColumnNumber.DATE)];
          // 空文字列なら直前の練習にメンバー追加
          if (dateValue === "") {
            const start = this.toArrIdx(cst.ColumnNumber.MEMBERS_START);
            const end = this.toArrIdx(cst.ColumnNumber.MEMBERS_END);
            const members = values
              .slice(start, end + 1)  // NOTE: i番目からj番目までとってくるにはslice(i, j+1)とする
              .filter(item => Boolean(item)); // 偽値(空文字列を想定)は除外
            practices[practices.length-1].addMembers(members);
          } else {  // 空文字列でなければ新しい練習を追加
            let date: Date;
            if (dateValue instanceof Date) {
              // 年が不正な可能性に備えて，現在の年をセットする
              date = new Date(new Date().getFullYear(), dateValue.getMonth(), dateValue.getDate());
            } else if (typeof dateValue === "string") {
              date = lib.parseDateString(dateValue);
            } else {
              throw new Error("Find unknown type in 'date' column.");
            }
            let time: string;
            const timeValue = values[this.toArrIdx(cst.ColumnNumber.TIME)];
            if (typeof timeValue === "string") {
              time = timeValue;
            } else if (timeValue instanceof Date) {
              throw new Error("The type of values in 'time' column must be string, but got Date.");
            } else {
              throw new Error("Find unknown type in 'time' column.");
            }
            const court = values[this.toArrIdx(cst.ColumnNumber.COURT)] as string;
            const courtName = values[this.toArrIdx(cst.ColumnNumber.COURT_NAME)] as string;
            const membersStart = this.toArrIdx(cst.ColumnNumber.MEMBERS_START);
            const membersEnd = this.toArrIdx(cst.ColumnNumber.MEMBERS_END);
            const members = values
              .slice(membersStart, membersEnd + 1)  // NOTE: i番目からj番目までとってくるにはslice(i, j+1)とする
              .filter(item => Boolean(item)); // 偽値(空文字列を想定)は除外
            const booker = values[this.toArrIdx(cst.ColumnNumber.BOOKER)] as string;
            practices.push(new mo.Practice({
              date,
              time,
              court,
              courtName,
              members,
              booker
            }));
          }
        }
      });

      return new mo.Schedule(practices);
    }

    private toArrIdx(columnNumber: cst.ColumnNumber): number {
      return columnNumber - 2;
    }

    private getScheduleSheets(): GoogleAppsScript.Spreadsheet.Sheet[] {
      const scheduleSheets: GoogleAppsScript.Spreadsheet.Sheet[] = [];
      cst.Months.forEach(month => {
        const sheet = this.ss.getSheetByName(month);
        if (sheet) {
          scheduleSheets.push(sheet);
        }
      });
      return scheduleSheets;
    }

  }

  export interface NotifyAPIClient {
    sendMessage(message: string): boolean;
  }

  export class LINENotifyAPIClientImpl implements NotifyAPIClient {

    constructor(
      private readonly accessToken: string
    ) {}

    public sendMessage(message: string): boolean {
      const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        method: "post",
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
        },
        payload: {
          "message": message,
        },
      };
      const response = UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
      const responseCode = response.getResponseCode();
      if (responseCode === 200) {
        return true;
      } else {
        console.log(`Failed to notify. Response code: ${responseCode}`);
        return false;
      }
    }

  }

  export class MockNotifyAPIClientImpl implements NotifyAPIClient {

    public sendMessage(message: string): boolean {
      console.log(`Notify:\n${message}`);
      return true;
    }

  }

}
