/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

const moment = require('moment-timezone');

class Temporal {
    constructor (obj) {
        Object.assign(this, obj);
        if (this.offset instanceof DaysAndTimeDuration) {
            this.offset = this.offset.value / (60*60); // in seconds -> in hours
        }
        if (typeof this.offset === 'string') {
            const offset = parseInt(this.offset);
            this.offset = isNaN(offset) ? 0 : offset; // in hours
        }
        if (this.timezone && this.offset === undefined) {
            const zone = moment.tz.zone(this.timezone);
            this.offset = zone.parse(Date.UTC(this.year, this.month, this.day, this.hour, this.minute, this.second)) / 60; // in hours
        }
    }

    static parse (exp) {
        if (typeof exp !== 'string') throw new Error(`Invalid temporal expression "${exp}": must be a string`);

        // check for unallowed + sign
        if (/^\s*\+/.test(exp)) throw new Error(`Invalid temporal expression "${exp}": leading "+" sign is not allowed`);

        // sign
        let sign = /^\s*-/.test(exp) ? -1 : 1;

        // YYYY-MM-DDTHH:MM:SS
        let parts = exp.match(/^\s*-?\s*(\d{4,9})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:@(.+)|([+-]\d{2}:\d{2})(?:\[(.+)\])?)?/);
        if (parts && parts.length >= 6) {
            const [fullMatch, year, month, day, hour, minute, second, atZone, offset, region] = parts;
            if (/^\s*[0]/.test(year)) return null; // no leading zeros in year allowed
            if (!this.isValidDate(parseInt(year),parseInt(month),parseInt(day))) return null;
            return new DateAndTime({ sign, year: parseInt(year), month: parseInt(month), day: parseInt(day), hour: parseInt(hour), minute: parseInt(minute), second: parseInt(second), offset, timezone: atZone || region || null });
        }
        // YYYY-MM-DD
        parts = exp.match(/^\s*-?\s*(\d{4,9})-(\d{2})-(\d{2})\s*$/);
        if (parts && parts.length >= 4) {
            if (/^\s*[0]/.test(parts[1])) return null; // no leading zeros in year allowed
            if (!this.isValidDate(parseInt(parts[1]),parseInt(parts[2]),parseInt(parts[3]))) return null;
            return new DateOnly({ sign, year: parseInt(parts[1]), month: parseInt(parts[2]), day: parseInt(parts[3])});
        }
        // PnDTnHnMnS - sequence D,H,M,S
        parts = exp.match(/^\s*-?\s*P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?\s*$/);
        if (parts) {
            const [fullMatch, days, hours, minutes, seconds] = parts;
            return new DaysAndTimeDuration({
                sign, 
                years: 0,
                months: 0,
                days: parseInt(days ?? 0),
                hours: parseInt(hours ?? 0),
                minutes: parseInt(minutes ?? 0),
                seconds: parseInt(seconds ?? 0),
            });
        }
        // PnYnM - sequence Y,M
        parts = exp.match(/^\s*-?\s*P(?:(\d+)Y)?(?:(\d+)M)?\s*$/);
        if (parts) {
            const [fullMatch, years, months] = parts;
            return new YearsAndMonthDuration({
                sign, 
                years: parseInt(years ?? 0),
                months: parseInt(months ?? 0),
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            });
        }

        // HH:MM:SS
        parts = exp.match(/^\s*-?\s*(\d{2}):(\d{2}):(\d{2})(?:@(.+)|([+-]\d{2}:\d{2})(?:\[(.+)\])?)?/);
        if (parts && parts.length >= 3) {
            const [fullMatch, hour, minute, second, atZone, offset, region] = parts;
            return new Time({ hour: parseInt(parts[1]), minute: parseInt(parts[2]), second: parseInt(parts[3]), offset, timezone: atZone || region || null});
        }
        // No match -> null
        throw new Error(`Invalid temporal expression "${exp}": doesn't match any allowed pattern`);
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
           return YearsAndMonthDuration.build((to.year - from.year)*12 + (to.month - from.month),0);
        }
        return null;
    }

    static isValidDate(year, month, day) {
        // Ensure year, month, and day are integers
        if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
            throw new Error("Invalid date: Year, month, and day must be integers");
        }

        // Check if the year is within the valid range (-999999999 - 999999999)
        if (year < -999999999 || year > 999999999) {
            throw new Error("Invalid date: Year out of range (-999999999 to 999999999)");
        } 

        //if (year <= 0 || month <= 0 || day <= 0)  {
        if (month <= 0 || day <= 0)  {
            throw new Error("Invalid date: Year, month, and day must be positive integers");
        }
    
        // Check if the month is within the valid range (1-12)
        if (month < 1 || month > 12) {
            throw new Error("Invalid date: Month out of range (1-12)");
        }
    
        // simple check for day
        const allowedDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day < 1 || day > allowedDays[month - 1]) {
            throw new Error("Invalid date: Day out of range for the given month");
        }

        // Check the number of days in the given month
        const daysInMonth = new Date(year, month, 0).getDate(); // `month` is 1-based, so `new Date(year, month, 0)` gives the last day of the month
        if (!(day >= 1 && ( isNaN(daysInMonth) ? true : day <= daysInMonth ))) {
            throw new Error("Invalid date: Day out of range for the given month and year");
        }
        return true;
    }

}
class DateAndTime extends Temporal {
    get exp () {
        let offset = Object.hasOwn(this,"offset") && this.offset !== undefined && this.offset !== 0 ? `${this.offset > 0 ? "+" : "-"}${String(this.offset).padStart(2, "0")}:${String(0).padStart(2, "0")}` : "";        
        let value = this.sign < 0 ? "-" : "";
        value = String(this.year).padStart(4,"0") + "-" + String(this.month).padStart(2,"0") + "-" + String(this.day).padStart(2,"0");
        value += "T" + String(this.hour).padStart(2,"0") +":" + String(this.minute).padStart(2,"0") + ":" + + String(this.second).padStart(2,"0");
        value += this.timezone ? "@" + this.timezone : offset;
        return value;
    }

    get value () {
        return new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second).valueOf()
    }

    static build (arr) {
        if (Array.isArray(arr) && arr.length === 6) return new DateAndTime({ year: arr[0], month: arr[1], day: arr[2], hour: arr[3], minute: arr[4], second: arr[5]});
        return undefined;
    }

    clone() {
        return new DateAndTime({ year: this.year, month: this.month, day: this.day, hour: this.hour, minute: this.minute, second: this.second, offset: this.offset, timezone: this.timezone });
    }

    toDateOnly () {
        return new DateOnly({ year: this.year, month: this.month, day: this.day });
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
        let value = this.sign < 0 ? "-" : "";
        value +=  String(this.year).padStart(4,"0") + "-" + String(this.month).padStart(2,"0") + "-" + String(this.day).padStart(2,"0");
        return value;
    }

    get value () {
        return new Date(this.year,this.month-1,this.day,0,0,0).valueOf()
    }

    static build (arr) {
        if (Array.isArray(arr) && arr.length === 3) return new DateOnly({ year: arr[0], month: arr[1], day: arr[2]});
        return undefined;
    }

    clone() {
        return new DateOnly({ year: this.year, month: this.month, day: this.day });
    }

    getDate () {
        return new Date(this.year,this.month-1,this.day)
    }

    add (term) {
        if (term instanceof Duration) {
            const obj = {
                year: this.year + term.years + Math.floor((this.month + term.months)/12),
                month: ( this.month + term.months ) - Math.floor((this.month + term.months)/12) * 12
            };
            let date = new Date(Date.UTC(obj.year, obj.month, 0));  // 0 is the last day of the previous month
            let newDay = Math.min( date.getUTCDate(),this.day);
            date = new Date(Date.UTC(obj.year, obj.month - 1, newDay )); // adjusted to max days of month
            date.setUTCDate(date.getUTCDate()  + term.days);  // add days
            return new DateOnly({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate()});
        }
    }


    subtract(term) {
        if (term instanceof DateOnly) {
            const days = moment(this.getDate()).diff(moment(term.getDate()), 'days');
            return new DaysAndTimeDuration({ years: 0, months: 0, days, hours: 0, minutes: 0, seconds: 0 });
        };
        if (term instanceof Duration) {
            const obj = {
                year: this.year - term.years + Math.floor((this.month - term.months)/12),
                month: ( this.month - term.months ) - Math.floor((this.month - term.months)/12) * 12
            };
            let date = new Date(Date.UTC(obj.year, obj.month, 0));  // 0 is the last day of the previous month
            let newDay = Math.min( date.getUTCDate(),this.day);
            date = new Date(Date.UTC(obj.year, obj.month - 1, newDay )); // adjusted to max days of month
            date.setUTCDate(date.getUTCDate() - term.days);
            return new DateOnly({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate()});
        }
    }

}
class Time extends Temporal {

    get exp () {
        let offset = Object.hasOwn(this,"offset") && this.offset !== undefined && this.offset !== 0 ? `${this.offset > 0 ? "+" : "-"}${String(this.offset).padStart(2, "0")}:${String(0).padStart(2, "0")}` : "";        
        let value = this.sign < 0 ? "-" : "";
        value +=  String(this.hour).padStart(2,"0") +":" + String(this.minute).padStart(2,"0") + ":" + + String(this.second).padStart(2,"0")
        value += this.timezone ? "@" + this.timezone : offset;
        return value;
    }

    // hours, minutes and seconds in seconds
    get dtd () {
        return this.second + this.minute*60 + this.hour*60*60;
    }

    static build (term) {
        // named parameters: { hour, minute, second, offset, timezone }
        if (typeof term === 'object' && term !== null && ( term.hour || term.minute || term.second )) {
            const obj = {
                hour: term.hour ?? 0,
                minute: term.minute ?? 0,
                second: term.second ?? 0,
                offset: term.offset ?? 0,
                timezone: term.timezone ?? null
            };
            return new Time(obj);
        }
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
        throw new Error(`Invalid time term "${term}": must be an array of [hours,minutes,seconds] or a number`);
    }

    clone() {
        return new Time({ hour: this.hour, minute: this.minute, second: this.second });
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
        if (this.years) value += Math.abs(this.years) + "Y"; 
        if (this.months) value += Math.abs(this.months) + "M"; 
        if (this.days) value += Math.abs(this.days) + "D"; 
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

}

class DaysAndTimeDuration extends Duration {

    get exp () {
        let value = "P";
        if (this.value < 0 ) value = "-" + value;
        if (this.days) value += Math.abs(this.days) + "D"; 
        if (this.hours || this.minutes | this.seconds) value += "T"; 
        if (this.hours) value += Math.abs(this.hours) + "H"; 
        if (this.minutes) value += Math.abs(this.minutes) + "M"; 
        if (this.seconds) value += Math.abs(this.seconds) + "S"; 
        return value;
    }

    // days, hours, minutes and seconds in seconds
    get dtd () {
        return ( this.seconds + this.minutes*60 + this.hours*60*60 + this.days*24*60*60 ) * ( this.sign ? this.sign : 1 );
    }

    // total in seconds (month caluclated with 30 days)
    get value () {
        return this.dtd; 
    }

    static build(dtd) {
        const obj = {
            years: 0,
            months: 0,
            days: dtd > 0 ? Math.floor(dtd/(24*60*60)) : -Math.floor(Math.abs(dtd)/(24*60*60)),
            hours: dtd > 0 ? Math.floor((dtd % (24*60*60))/(60*60)) : -Math.floor((Math.abs(dtd) % (24*60*60))/(60*60)),
            minutes: dtd > 0 ? Math.floor((dtd % (60*60))/(60)) : -Math.floor((Math.abs(dtd) % (60*60))/(60)),
            seconds: dtd > 0 ? dtd % 60 : -(Math.abs(dtd) % 60)
        }
        return new DaysAndTimeDuration(obj);
    }

    clone() {
        return new DaysAndTimeDuration({ years: this.years, months: this.months, days: this.days, hours: this.hours, minutes: this.minutes, seconds: this.seconds });
    }

    add(term) {
        if (term instanceof DaysAndTimeDuration) {
           return DaysAndTimeDuration.build(this.dtd + term.dtd);
        };
        if (term instanceof DateAndTime) return term.add(this);
    }

    subtract(term) {
        if (term instanceof DaysAndTimeDuration) {
           const dtd = this.dtd - term.dtd; 
           return DaysAndTimeDuration.build(dtd);
        };
        if (term instanceof Temporal) throw new Error(`Subtraction of "${this.exp}" and "${term.exp}" is not allowed`);
        // other not allowed term
        throw new Error(`Subtraction of ${this.exp} with this term is not allowed`);
    }

    abs() {
        return DaysAndTimeDuration.build(Math.abs(this.dtd));
    }

}

class YearsAndMonthDuration extends Duration {

    get exp () {
        let value = "P";
        if (this.value < 0) value = "-" + value;
        if (this.years) value += Math.abs(this.years) + "Y"; 
        if (this.months) value += Math.abs(this.months) + "M"; 
        return value;
    }

    // months and years in month
    get ymd () {
        return ( this.months + this.years*12 ) * ( this.sign ? this.sign : 1 );
    }

    // total in seconds (month caluclated with 30 days)
    get value () {
        return this.ymd * (30*24*60*60); 
    }

    static build(ymd) {
        const obj = {
            years: ymd > 0 ? Math.floor(ymd/12) : -Math.floor(Math.abs(ymd)/12),
            months: ymd > 0 ? ymd % 12 : -(Math.abs(ymd) % 12),
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        }
        return new YearsAndMonthDuration(obj);
    }

    clone() {
        return new YearsAndMonthDuration({ years: this.years, months: this.months, days: this.days, hours: this.hours, minutes: this.minutes, seconds: this.seconds });
    }

    add(term) {
        if (term instanceof YearsAndMonthDuration) {
           return YearsAndMonthDuration.build(this.ymd + term.ymd);
        };
        if (term instanceof DateAndTime) return term.add(this);
    }

    subtract(term) {
        if (term instanceof YearsAndMonthDuration) {
            const ymd = this.ymd - term.ymd;
           return YearsAndMonthDuration.build(ymd);
        };
        if (term instanceof Temporal) throw new Error(`Subtraction of "${this.exp}" and "${term.exp}" is not allowed`);
        // other not allowed term
        throw new Error(`Subtraction of ${this.exp} with this term is not allowed`);
    }

    abs() {
        return YearsAndMonthDuration.build(Math.abs(this.ymd));
    }

}

module.exports = {
    Temporal,
    DateAndTime,
    DateOnly,
    Time,
    Duration,
    DaysAndTimeDuration,
    YearsAndMonthDuration
};
