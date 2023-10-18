namespace Models {

  export class Practice {
    private readonly date: Date;
    private readonly time: string;
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