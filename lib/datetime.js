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
        return new Date(this.year,this.month,this.day,this.hour,this.minute,this.second).valueOf()
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
        return new Date(this.year,this.month,this.day,0,0,0).valueOf()
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
