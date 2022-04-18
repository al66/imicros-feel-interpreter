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


    add (term) {
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

}
class DateOnly extends Temporal {

    get exp () {
        return String(this.year).padStart(4,"0") + "-" + String(this.month).padStart(2,"0") + "-" + String(this.day).padStart(2,"0");
    }

    get value () {
        return new Date(this.year,this.month-1,this.day,0,0,0).valueOf()
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

}
class Time extends Temporal {

    get exp () {
        return String(this.hour).padStart(2,"0") +":" + String(this.minute).padStart(2,"0") + ":" + + String(this.second).padStart(2,"0")
    }

}
class Duration extends Temporal {

    get exp () {
        let value = "P";
        if (this.days) value += this.days + "D"; 
        if (this.months) value += this.months + "M"; 
        if (this.years) value += this.years + "Y"; 
        if (this.hours || this.minutes | this.seconds) value += "T"; 
        if (this.hours) value += this.hours + "H"; 
        if (this.minutes) value += this.minutes + "M"; 
        if (this.seconds) value += this.seconds + "S"; 
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
            years: months > 0 ? Math.floor(months/12) : 0,
            months: months > 0 ? months % 12 : 0,
            days: seconds > 0 ? Math.floor(seconds/(24*60*60)) : 0,
            hours: seconds > 0 ? Math.floor((seconds % (24*60*60))/(60*60)) : 0,
            minutes: seconds > 0 ? Math.floor((seconds % (60*60))/(60)) : 0,
            seconds: seconds > 0 ? seconds % 60 : 0
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
           return Duration.build(this.ymd - term.ymd,this.dtd - term.dtd);
        };
    }

}

module.exports = {
    Temporal,
    DateAndTime,
    DateOnly,
    Time,
    Duration
};
