namespace Enums {

  export enum ColumnNumber {
    DATE = 2,
    DAY = 3,
    TIME = 4,
    COURT = 5,
    COURT_NAME = 6,
    MEMBERS_START = 7,
    MEMBERS_END = 10,
    BOOKER = 11,
  }

  export enum RowNumber {
    ATTRIBUTE = 2,
    EVENT_LIST_START = 3,
  }

}

namespace Sets {

  export const Months = new Set([
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ])

}
