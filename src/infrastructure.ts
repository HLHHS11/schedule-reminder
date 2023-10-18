namespace Infrastructure {

  export interface ScheduleDao {
    getSchedule(sheet: GoogleAppsScript.Spreadsheet.Sheet): Array<Models.Practice>;
  }

  export class ScheduleDaoImpl implements ScheduleDao {

    public getSchedule(sheet: GoogleAppsScript.Spreadsheet.Sheet): Array<Models.Practice> {
      // NOTE: データ範囲の最終行 = シートの最後の行(更新日のセル) - 2
      const dataLastRow = sheet.getLastRow() - 2;
      const dataRange = sheet.getRange(
        Enums.RowNumber.EVENT_LIST_START,
        Enums.ColumnNumber.DATE,
        dataLastRow - Enums.RowNumber.EVENT_LIST_START + 1,
        Enums.ColumnNumber.BOOKER - Enums.ColumnNumber.DATE + 1
      );
      const values = dataRange.getValues();
      const schedule: Array<Models.Practice> = [];
      const toArrIdx = (columnNumber: Enums.ColumnNumber): number => columnNumber - 2;
      for (let i=0; i<values.length; i++) {
        const valueArr = values[i];
        const dateValue = valueArr[toArrIdx(Enums.ColumnNumber.DATE)];
        // 空文字列なら直前の練習にメンバー追加
        if (dateValue === "") {
          const start = toArrIdx(Enums.ColumnNumber.MEMBERS_START);
          const end = toArrIdx(Enums.ColumnNumber.MEMBERS_END);
          const members = valueArr
            .slice(start, end + 1)  // NOTE: i番目からj番目までとってくるにはslice(i, j+1)とする
            .filter(item => Boolean(item)); // 偽値(空文字列を想定)は除外
          schedule[schedule.length-1].addMembers(members);
        } else {  // 空文字列でなければ新しい練習を追加
          let date: Date;
          if (dateValue instanceof Date) {
            // 年が不正な可能性に備えて，現在の年をセットする
            date = new Date(new Date().getFullYear(), dateValue.getMonth(), dateValue.getDate());
          } else if (typeof dateValue === "string") {
            date = Lib.parseDateString(dateValue);
          } else {
            throw new Error("Find unknown type in 'date' column.");
          }
          let time: string;
          const timeValue = valueArr[toArrIdx(Enums.ColumnNumber.TIME)];
          if (typeof timeValue === "string") {
            time = timeValue;
          } else if (timeValue instanceof Date) {
            throw new Error("The type of values in 'time' column must be string, but got Date.");
          } else {
            throw new Error("Find unknown type in 'time' column.");
          }
          const court = valueArr[toArrIdx(Enums.ColumnNumber.COURT)] as string;
          const courtName = valueArr[toArrIdx(Enums.ColumnNumber.COURT_NAME)] as string;
          const membersStart = toArrIdx(Enums.ColumnNumber.MEMBERS_START);
          const membersEnd = toArrIdx(Enums.ColumnNumber.MEMBERS_END);
          const members = valueArr
            .slice(membersStart, membersEnd + 1)  // NOTE: i番目からj番目までとってくるにはslice(i, j+1)とする
            .filter(item => Boolean(item)); // 偽値(空文字列を想定)は除外
          const booker = valueArr[toArrIdx(Enums.ColumnNumber.BOOKER)] as string;
          schedule.push(new Models.Practice({
            date,
            time,
            court,
            courtName,
            members,
            booker
          }));
        }
      }
      return schedule;
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
