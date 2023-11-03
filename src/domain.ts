// Domain Models
namespace mo {

  export class Practice {

    public readonly date: Date;
    public readonly startHours: number;
    public readonly endHours: number;
    public readonly courtName: string;
    public readonly courtNumber: string;
    private _members: string[];  // NOTE: addMembers()メソッドの実装の都合上，readonlyが使えない
    public readonly booker: string;

    constructor(
      date: Date,
      startHours: number,
      endHours: number,
      courtName: string,
      courtNumber: string,
      members: string[],
      booker: string
    ) {
      this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());  // 時刻部分を切り捨てる
      if (startHours < 0 || startHours > 23 || endHours < 0 || endHours > 23) {
        throw new Error("Invalid hours.");
      }
      this.startHours = startHours;
      this.endHours = endHours;
      this.courtName = courtName;
      this.courtNumber = courtNumber;
      this._members = members;
      this.booker = booker;
    }
    
    public get members(): string[] {return this._members;}  // NOTE: readonlyが使えないためgetterを定義しほぼ同様の挙動を実現

    public addMembers(members: string[]): void {
      this._members = this._members.concat(members);
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
      return `${this.startHours}-${this.endHours}`;
    }
    public getCourtInfoString(): string {
      return `${this.courtName}${this.courtNumber}`;
    }
    public getMembersString(): string {
      return this._members.join("");
    }
    public getBookerString(): string {
      return this.booker;
    }


  }

  export interface IFilterStrategy {
    matches(practice: Practice): boolean;
  }

  export class Schedule {
    private readonly practices: Practice[];

    constructor(practices: Practice[], isSorted: boolean = false) {
      // TODO: フィルタリング条件によっては，ソートされていることを前提にして以後の探索を打ち切ることができるかもしれない。その場合に対応できるよう，とりあえずソート。
      if (!isSorted) {
        practices = practices.sort((a, b) => a.startHours - b.startHours);
      }
      this.practices = practices;
    }
    
    public getPractices(): Practice[] {
      return this.practices;
    }

    public filter(strategy: IFilterStrategy): Schedule {
      return new Schedule(this.practices.filter(practice => strategy.matches(practice)), true);
    } 
  }

  // filter strategy implementations
  export class OnAndAfterTodayStrategy implements IFilterStrategy {
    private readonly todayTime: number;

    constructor(today: Date) {
      this.todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    }

    public matches(practice: Practice): boolean {
      return practice.date.getTime() === this.todayTime;
    }
  }

  export class TomorrowStrategy implements IFilterStrategy {
    private readonly tomorrowTime: number;

    constructor(today: Date) {
      this.tomorrowTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() + 24*60*60*1000;
    }

    public matches(practice: Practice): boolean {
      return practice.date.getTime() === this.tomorrowTime;
    }
  }

  export class TodayAfter4pmStrategy implements IFilterStrategy {
    private readonly today4pmTime: number;

    constructor(today: Date) {
      this.today4pmTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16).getTime();
    }

    public matches(practice: Practice): boolean {
      return practice.getDateObj().getTime() === this.today4pmTime && practice.getStartTime().getTime() >= this.today4pmTime;
    }
  }

}

// Domain Services
namespace srv {
  export class RemindMessageGenerator {

    public generate(practice: mo.Practice, preamble: string = "", appendix: string = ""): string {
      const date = practice.getDateString();
      const day = practice.getDayString();
      const time = practice.getTimeString();
      const courtAndNumber = practice.getCourtInfoString();
      const members = practice.getMembersString();
      const booker = practice.getBookerString();
      return `\n${preamble ? preamble+"\n" : ""}${date}${day} ${time} ${courtAndNumber} (${booker})\n${members}${appendix ? "\n"+appendix : ""}`;
    }
  }
}
