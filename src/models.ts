namespace Models {

  export class Practice {
    private readonly date: Date;
    private readonly time: string;
    private readonly startTime: Date;
    private readonly court: string;
    private readonly courtName: string;
    private readonly booker: string;
    private members: string[];

    constructor(param0: {date: Date, time: string, court: string, courtName: string, members: string[], booker: string}) {
      this.date = param0.date;
      this.time = param0.time;
      this.court = param0.court;
      this.courtName = param0.courtName;
      this.members = param0.members;
      this.booker = param0.booker;
    }

    public getDateObj(): Date {
      return this.date;
    }

    public getDateString(): string {
      return Utilities.formatDate(this.date, "JST", "MM/dd");
    }

    public getDayString(): string {
      const dayStringArr = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"];
      const dayNum = this.date.getDay();
      return dayStringArr[dayNum];
    }

    public getTimeString(): string {
      return this.time;
    }

    public getStartTime(): Date {
      const startTimeInt = parseInt(this.time.split("-")[0]);
      // 08:00~10:00は間違いなく"8-10"と表記する一方で，16:00~21:00は"16-21"だけでなく"4-9", 18:00~21:00は"18-21"だけでなく"6-9"と表記される可能性がある
      // また，朝7時以前および夜20時以降に練習がスタートすることはないと仮定する。
      // そこで，startTimeNumが8以上のときはhoursをそのまま解釈し，startTimeNumが0~7のときにはhoursに12を足して「午後」の時間として解釈する
      if (startTimeInt <= 7) {
        return new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), startTimeInt + 12);
      } else if (startTimeInt >= 8 && startTimeInt <= 23) {
        return new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), startTimeInt);
      } else {
        throw new Error(`Failed to parse time string: ${this.time}`);
      }
    }

    public getCourtNameString(): string {
      return `${this.court}${this.courtName}`;
    }

    public getMembersString(): string {
      return this.members.join("");
    }

    public getBookerString(): string {
      return this.booker;
    }

    public addMembers(members: string[]): void {
      this.members = this.members.concat(members);
    }

    public getRemindMessage(): string {
      const date = this.getDateString();
      const day = this.getDayString();
      const time = this.getTimeString();
      const courtAndNumber = this.getCourtNameString();
      const members = this.getMembersString();
      const booker = this.getBookerString();
      return `${date}${day} ${time} ${courtAndNumber} (${booker})\n${members}`;
    }
  }

}