/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

class Temporal {
    constructor (obj) {
        Object.assign(this, obj);
    }

    static parse (exp) {
        // YYYY-MM-DDTHH:MM:SS
        let parts = exp.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
        if (parts && parts.length >= 6) {
            return new DateAndTime({ year: parseInt(parts[1]), month: parseInt(parts[2]), day: parseInt(parts[3]), hour: parseInt(parts[4]), minute: parseInt(parts[5]), second: parseInt(parts[6])});
        }
        // YYYY-MM-DD
        parts = exp.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (parts && parts.length >= 4) {
            return new DateOnly({ year: parseInt(parts[1]), month: parseInt(parts[2]), day: parseInt(parts[3])});
        }
        // PnDnMnYTnHnMnS - sequence D,M,Y is fexible as well as sequence H,M,S for the time, the time part is optional as well as the D,M,Y sequences
        parts = exp.match(/(P(?:\d+[D|M|Y])*(?:T(?:\d+[H|M|S])*)?)/);
        if (parts) {
            return new Duration({
                years: parseInt(exp.match(/P(?:(?:\d+[D|M])*)(\d+)Y/)?.[1] ?? 0),
                months: parseInt(exp.match(/P(?:(?:\d+[D|Y])*)(\d+)M/)?.[1] ?? 0),
                days: parseInt(exp.match(/P(?:(?:\d+[M|Y])*)(\d+)D/)?.[1] ?? 0),
                hours: parseInt(exp.match(/P(?:\d+[D|M|Y])*T(?:\d+[M|S])*(\d+)H/i)?.[1] ?? 0),
                minutes: parseInt(exp.match(/P(?:\d+[D|M|Y])*T(?:\d+[H|S])*(\d+)M/i)?.[1] ?? 0),
                seconds: parseInt(exp.match(/P(?:\d+[D|M|Y])*T(?:\d+[H|M])*(\d+)S/i)?.[1] ?? 0),
            });
        }
        // HH:MM:SS
        parts = exp.match(/(\d{2}):(\d{2}):(\d{2})/);
        if (parts && parts.length >= 3) {
            return new Time({ hour: parseInt(parts[1]), minute: parseInt(parts[2]), second: parseInt(parts[3])});
        }
    }

    static today () {
        const date = new Date();
        return new DateOnly({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
    }
    
    static now () {
        const date = new Date();
        return new DateAndTime({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() });
    }

    static dayOfWeek ({ date = null}) {
        if (date instanceof DateAndTime || date instanceof DateOnly ) {
            const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            return weekday[date.getDate().getDay()];
        }
        return null;
    }

    static dayOfYear ({ date = null}) {
        if (date instanceof DateAndTime || date instanceof DateOnly ) {
            let d = date.getDate();
            let start = new Date(d.getFullYear(), 0, 0);
            let diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        }
        return null;
    }

    static monthOfYear ({ date = null}) {
        if (date instanceof DateAndTime || date instanceof DateOnly ) {
            const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            return month[date.getDate().getMonth()];
        }
        return null;
    }

    static weekOfYear({ date = null }) {
        if (date instanceof DateAndTime || date instanceof DateOnly ) {
            let d = date.getDate();
            // refer to https://weeknumber.com/how-to/javascript
            d.setHours(0, 0, 0, 0);
            // Thursday in current week decides the year.
            d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
            // January 4 is always in week 1.
            var week1 = new Date(d.getFullYear(), 0, 4);
            // Adjust to Thursday in week 1 and count number of weeks from date to week1.
            return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000
                                - 3 + (week1.getDay() + 6) % 7) / 7);
        }
        return null;
    }

    static monthBetween({ from = null, to = null}) {
        if (from instanceof DateOnly && from instanceof DateOnly) {
           // get seconds of both terms, subtract them and buid new duration
           return Duration.build((to.year - from.year)*12 + (to.month - from.month),0);
        }
        return null;
    }

    add (term) {
    }

    dateDiff(dt1, dt2)
    {
        /*
         * setup 'empty' return object
         */
        var ret = {days:0, months:0, years:0};
    
        /*
         * If the dates are equal, return the 'empty' object
         */
        if (dt1 == dt2) return ret;
    
        /*
         * ensure dt2 > dt1
         */
        if (dt1 > dt2)
        {
            var dtmp = dt2;
            dt2 = dt1;
            dt1 = dtmp;
        }
    
        /*
         * First get the number of full years
         */
    
        var year1 = dt1.getFullYear();
        var year2 = dt2.getFullYear();
    
        var month1 = dt1.getMonth();
        var month2 = dt2.getMonth();
    
        var day1 = dt1.getDate();
        var day2 = dt2.getDate();
    
        /*
         * Set initial values bearing in mind the months or days may be negative
         */
    
        ret['years'] = year2 - year1;
        ret['months'] = month2 - month1;
        ret['days'] = day2 - day1;
    
        /*
         * Now we deal with the negatives
         */
    
        /*
         * First if the day difference is negative
         * eg dt2 = 13 oct, dt1 = 25 sept
         */
        if (ret['days'] < 0)
        {
            /*
             * Use temporary dates to get the number of days remaining in the month
             */
            var dtmp1 = new Date(dt1.getFullYear(), dt1.getMonth() + 1, 1, 0, 0, -1);
    
            var numDays = dtmp1.getDate();
    
            ret['months'] -= 1;
            ret['days'] += numDays;
    
        }
    
        /*
         * Now if the month difference is negative
         */
        if (ret['months'] < 0)
        {
            ret['months'] += 12;
            ret['years'] -= 1;
        }
    
        return ret;
    }

}
class DateAndTime extends Temporal {
    get exp () {
        let value = String(this.year).padStart(4,"0") + "-" + String(this.month).padStart(2,"0") + "-" + String(this.day).padStart(2,"0");
        value += "T" + String(this.hour).padStart(2,"0") +":" + String(this.minute).padStart(2,"0") + ":" + + String(this.second).padStart(2,"0");
        return value;
    }

    get value () {
        return new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second).valueOf()
    }

    getDate () {
        return new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second)
    }

    add (term) {
        if (term instanceof Duration) {
            const obj = {
                year: this.year + term.years,
                month: this.month + term.months,
                day: this.day + term.days,
                hour: this.hour + term.hours,
                minute: this.minute + term.minutes,
                second: this.second + term.seconds
            };
            return new DateAndTime(obj);
        }
    }

    subtract (term) {
        if (term instanceof Duration) {
            const obj = {
                year: this.year - term.years,
                month: this.month - term.months,
                day: this.day - term.days,
                hour: this.hour - term.hours,
                minute: this.minute - term.minutes,
                second: this.second - term.seconds
            };
            return new DateAndTime(obj);
        }
    }

}
class DateOnly extends Temporal {

    get exp () {
        return String(this.year).padStart(4,"0") + "-" + String(this.month).padStart(2,"0") + "-" + String(this.day).padStart(2,"0");
    }

    get value () {
        return new Date(this.year,this.month-1,this.day,0,0,0).valueOf()
    }

    static build (arr) {
        if (Array.isArray(arr) && arr.length === 3) return new DateOnly({ year: arr[0], month: arr[1], day: arr[2]});
        return undefined;
    }

    getDate () {
        return new Date(this.year,this.month-1,this.day)
    }

    add (term) {
        if (term instanceof Duration) {
            const obj = {
                year: this.year + term.years,
                month: this.month + term.months,
                day: this.day + term.days
            };
            return new DateOnly(obj);
        }
    }


    subtract(term) {
        if (term instanceof DateOnly) {
           const sign = term.value > this.value ? -1 : 1;
           const first = term.getDate();
           const second = this.getDate();
           const diff = this.dateDiff(first,second);
           const months = diff.months + diff.years*12;
           const seconds = diff.days * 24*60*60;
           return Duration.build(months*sign,seconds*sign);
        };
    }

}
class Time extends Temporal {

    get exp () {
        return String(this.hour).padStart(2,"0") +":" + String(this.minute).padStart(2,"0") + ":" + + String(this.second).padStart(2,"0")
    }

    // hours, minutes and seconds in seconds
    get dtd () {
        return this.second + this.minute*60 + this.hour*60*60;
    }

    static build (term) {
        // Array: [hours,minutes,seconds]
        if (Array.isArray(term) && term.length >= 3) {
            let time = new Time({ hour: term[0], minute: term[1], second: term[2]});
            if (term[3]) return time.add(term[3]);
            return time;
        }
        // Number: seconds
        if (typeof term === 'number') {
            const seconds = Math.abs(term) % 86400;
            const obj = {
                hour: seconds > 0 ? Math.floor((seconds % (24*60*60))/(60*60)) : 0,
                minute: seconds > 0 ? Math.floor((seconds % (60*60))/(60)) : 0,
                second: seconds > 0 ? seconds % 60 : 0
            }
            return new Time(obj);
        }
        return undefined;
    }

    add(term) {
        if (term instanceof Duration) {
           // get seconds of both terms, add them and buid new time
           return Time.build(this.dtd + term.dtd);
        };
    }

    subtract(term) {
        if (term instanceof Duration) {
           // get seconds of both terms, add them and buid new time
           return Time.build(this.dtd - term.dtd > 0 ? this.dtd - term.dtd : 0);
        };
    }

}
class Duration extends Temporal {

    get exp () {
        let value = "P";
        if (this.value < 0) value = "-" + value;
        if (this.days) value += Math.abs(this.days) + "D"; 
        if (this.months) value += Math.abs(this.months) + "M"; 
        if (this.years) value += Math.abs(this.years) + "Y"; 
        if (this.hours || this.minutes | this.seconds) value += "T"; 
        if (this.hours) value += Math.abs(this.hours) + "H"; 
        if (this.minutes) value += Math.abs(this.minutes) + "M"; 
        if (this.seconds) value += Math.abs(this.seconds) + "S"; 
        return value;
    }

    // days, hours, minutes and seconds in seconds
    get dtd () {
        return this.seconds + this.minutes*60 + this.hours*60*60 + this.days*24*60*60;
    }

    // months and years in month
    get ymd () {
        return this.months + this.years*12;
    }

    // total in seconds (month caluclated with 30 days)
    get value () {
        return this.ymd * (30*24*60*60) + this.dtd; 
    }

    static build(months,seconds) {
        const obj = {
            years: months > 0 ? Math.floor(months/12) : -Math.floor(Math.abs(months)/12),
            months: months > 0 ? months % 12 : -(Math.abs(months) % 12),
            days: seconds > 0 ? Math.floor(seconds/(24*60*60)) : -Math.floor(Math.abs(seconds)/(24*60*60)),
            hours: seconds > 0 ? Math.floor((seconds % (24*60*60))/(60*60)) : -Math.floor((Math.abs(seconds) % (24*60*60))/(60*60)),
            minutes: seconds > 0 ? Math.floor((seconds % (60*60))/(60)) : -Math.floor((Math.abs(seconds) % (60*60))/(60)),
            seconds: seconds > 0 ? seconds % 60 : -(Math.abs(seconds) % 60)
        }
        return new Duration(obj);
    }

    add(term) {
        if (term instanceof Duration) {
           // get seconds and months of both terms, add them and buid new duration
           return Duration.build(this.ymd + term.ymd,this.dtd + term.dtd);
        };
        if (term instanceof DateAndTime) return term.add(this);
    }

    subtract(term) {
        if (term instanceof Duration) {
           // get seconds and months of both terms, subtract them and buid new duration
           const month = this.ymd - term.ymd;
           // consider seconds only, if they will have the same sign
           const seconds = Math.sign(month) === Math.sign(this.dtd - term.dtd) ? this.dtd - term.dtd : 0;
           return Duration.build(month,seconds);
        };
    }

    abs() {
        return Duration.build(Math.abs(this.ymd),Math.abs(this.dtd));
    }

}

module.exports = {
    Temporal,
    DateAndTime,
    DateOnly,
    Time,
    Duration
};
