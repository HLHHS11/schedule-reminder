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
        // データ範囲を特定し，二次元配列として取得 (table: any[][]に格納)
        // NOTE: データ範囲の最終行 = シートの最後の行(更新日のセル) - 2
        const dataLastRow = sheet.getLastRow() - 2;
        const dataRange = sheet.getRange(
          cst.RowNumber.EVENT_LIST_START,
          cst.ColumnNumber.DATE,
          dataLastRow - cst.RowNumber.EVENT_LIST_START + 1,
          cst.ColumnNumber.BOOKER - cst.ColumnNumber.DATE + 1
        );
        const table = dataRange.getValues();
        // 各行を解釈して練習を追加
        for (let i=0; i<table.length; i++) {
          const values = table[i];
          const dateValue = values[this.toArrIdx(cst.ColumnNumber.DATE)];
          // 日付部分が空文字列なら直前の練習にメンバー追加
          if (dateValue === "") {
            const start = this.toArrIdx(cst.ColumnNumber.MEMBERS_START);
            const end = this.toArrIdx(cst.ColumnNumber.MEMBERS_END);
            const members = values
              .slice(start, end + 1)  // NOTE: i番目からj番目までとってくるにはslice(i, j+1)とする
              .filter(item => Boolean(item)); // 偽値(空文字列を想定)は除外
            practices[practices.length-1].addMembers(members);
          } else {  // 日付部分が空文字列でなければ新しい練習を追加
            // 日付を解釈
            let date: Date;
            if (dateValue instanceof Date) {
              // 年が不正な可能性に備えて，現在の年をセットする
              date = new Date(new Date().getFullYear(), dateValue.getMonth(), dateValue.getDate());
            } else if (typeof dateValue === "string") {
              date = lib.parseDateString(dateValue);
            } else {
              throw new Error("Find unknown type in 'date' column.");
            }
            // 開始時刻・終了時刻を解釈
            let startHours: number;
            let endHours: number;
            const timeValue = values[this.toArrIdx(cst.ColumnNumber.TIME)];
            if (typeof timeValue === "string") {
              const timeParts = timeValue.split("-");
              if (timeParts.length !== 2) { // "-"がただ１つだけ含まれていることを確認
                throw new Error(`Failed to parse time string: ${timeValue}`);
              }
              [startHours, endHours] = timeParts.map(timePart => parseInt(timePart, 10));
              // 08:00~10:00は間違いなく"8-10"と表記する一方で，16:00~21:00は"16-21"だけでなく"4-9", 18:00~21:00は"18-21"だけでなく"6-9"と表記される可能性がある
              // また，朝7時以前および夜20時以降に練習がスタートすることはないと仮定する。
              // そこで，startTimeHourが8以上のときはhoursをそのまま解釈し，startTimeHourが0~7のときには12を足して「午後」の時間として解釈する
              if (startHours <= 7) {
                startHours += 12;
                endHours += 12;
              } else if (startHours >= 8 && startHours <= 23) {
                // do nothing
              } else {
                throw new Error(`Failed to parse time string: ${timeValue}`);
              }
            } else if (timeValue instanceof Date) { // NOTE: スプレッドシートに書式設定なしで"8-10"のような値を入力すると，8月10日を表すDate型として解釈されることがあるため
              throw new Error("The type of values in 'time' column must be string, but got Date.");
            } else {
              throw new Error("Find unknown type in 'time' column.");
            }
            // コート名(ex: 宝，西院)とコート番号(ex: ①，A)を解釈
            const courtName = values[this.toArrIdx(cst.ColumnNumber.COURT)] as string;
            const courtNumber = values[this.toArrIdx(cst.ColumnNumber.COURT_NAME)] as string;
            // メンバーを解釈
            const membersStartIdx = this.toArrIdx(cst.ColumnNumber.MEMBERS_START);
            const membersEndIdx = this.toArrIdx(cst.ColumnNumber.MEMBERS_END);
            const members = values
              .slice(membersStartIdx, membersEndIdx + 1)  // NOTE: i番目からj番目までとってくるにはslice(i, j+1)とする
              .filter(item => Boolean(item)); // 偽値(空文字列を想定)は除外
            // 予約者を解釈
            const booker = values[this.toArrIdx(cst.ColumnNumber.BOOKER)] as string;
            practices.push(new mo.Practice(
              date,
              startHours,
              endHours,
              courtName,
              courtNumber,
              members,
              booker
            ));
          }
        }
      });

      return new mo.Schedule(practices);
    }

    private toArrIdx(columnNumber: cst.ColumnNumber): number {
      return columnNumber - cst.ColumnNumber.DATE;
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
