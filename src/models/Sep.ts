import moment from "moment";

export class Sep {
    top = 0;
    visible = false;
    commit = "";
    time: moment.Moment;
    baseTime: moment.Moment;
    constructor(t: moment.Moment) {
      this.time = t;
      this.baseTime = moment();
    }
  
    get display(): string {
      let diffHr = moment().diff(this.time, 'hour');
      let diffDay = moment().diff(this.time, 'day');
      let diffWeek = moment().diff(this.time, 'week');
      let diffMonth = moment().diff(this.time, 'month');
      if (diffMonth) {
        return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
      } else if (diffWeek) {
        return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
      } else if (diffDay) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      } else if (diffHr) {
        return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
      }
      return '';
    }
  }