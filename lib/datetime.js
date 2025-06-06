/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

const { sign, parse } = require('mathjs');
const moment = require('moment-timezone');

class Temporal {
    constructor (obj) {
        Object.assign(this, obj);

        // check, if timezone exists
        if (this.timezone && !moment.tz.zone(this.timezone)) {
            throw new Error(`Invalid timezone "${this.timezone}": not found`);
        }

        // offset and timezone are mutually exclusive
        if (typeof this.offset === 'string' && this.timezone) {
            throw new Error(`Invalid timezone "${this.timezone}": offset and timezone are mutually exclusive`);
        }

        // get timezone offset
        if (this.timezone && this.offset === undefined) {
            const zone = moment.tz.zone(this.timezone);
            this.offset = new Offset(zone.parse(Date.UTC(this.year, this.month, this.day, this.hour, this.minute, this.second))*60, this.utc); // in minutes -> to seconds
        }

        // create offset object
        if (!(this.offset instanceof Offset)) {
            this.offset = new Offset(this.offset, this.utc);
        }

    }

    static parse (exp) {
        if (typeof exp !== 'string') throw new Error(`Invalid temporal expression "${exp}": must be a string`);

        // check for unallowed + sign
        if (/^\s*\+/.test(exp)) throw new Error(`Invalid temporal expression "${exp}": leading "+" sign is not allowed`);

        // sign
        let sign = /^\s*-/.test(exp) ? -1 : 1;

        // YYYY-MM-DDTHH:MM:SS.mmmmmmmm
        let parts = exp.match(/^\s*-?\s*(\d{4,9})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)(Z)?(?:@(.+)|([+-]\d{2}:\d{2})(?:\[(.+)\])?)?$/);
        if (parts && parts.length >= 6) {
            const [fullMatch, year, month, day, hour, minute, second, utc, atZone, offset, region] = parts;
            return new DateAndTime({ sign, year, month, day, hour, minute, second, utc: utc || null, offset, timezone: atZone || region || null });
        }
        // YYYY-MM-DD
        parts = exp.match(/^\s*-?\s*(\d{4,9})-(\d{2})-(\d{2})\s*$/);
        if (parts && parts.length >= 4) {
           const [fullMatch, year, month, day] = parts;
           return new DateOnly({ sign, year, month, day });
        }
        // PnDTnHnMnS - sequence D,H,M,S
        parts = exp.match(/^\s*-?\s*P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d*)?)S)?)?\s*$/);
        if (parts) {
            const [fullMatch, days, hours, minutes, seconds] = parts;
            return new DaysAndTimeDuration({
                sign, 
                years: 0,
                months: 0,
                days,
                hours,
                minutes,
                seconds,
            });
        }
        // PnYnM - sequence Y,M
        parts = exp.match(/^\s*-?\s*P(?:(\d+)Y)?(?:(\d+)M)?\s*$/);
        if (parts) {
            const [fullMatch, years, months] = parts;
            return new YearsAndMonthDuration({
                sign, 
                years,
                months,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            });
        }

        // HH:MM:SS.mmmmmmmm
        parts = exp.match(/^\s*-?\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)(Z)?(?:@(.+)|([+-]\d{2}:\d{2})(?:\[(.+)\])?)?$/);
        if (parts && parts.length >= 3) {
            const [fullMatch, hour, minute, second, utc, atZone, offset, region] = parts;
            return new Time({ hour, minute, second, utc: utc || null, offset, timezone: atZone || region || null});
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
        if (typeof date === 'string') date = Temporal.parse(date);
        if (date instanceof DateAndTime || date instanceof DateOnly ) {
            const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            return weekday[date.getDate().getDay()];
        }
        throw new Error(`Invalid parameter "${date}" for day of week function: must be a date or datetime`);
    }

    static dayOfYear ({ date = null}) {
        if (typeof date === 'string') date = Temporal.parse(date);
        if (date instanceof DateAndTime || date instanceof DateOnly ) {
            let d = date.getDate();
            let start = new Date(d.getFullYear(), 0, 0);
            let diff = (d - start) + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        }
        throw new Error(`Invalid date "${date}": must be a date or datetime`);
    }

    static monthOfYear ({ date = null}) {
        if (typeof date === 'string') date = Temporal.parse(date);
        if (date instanceof DateAndTime || date instanceof DateOnly ) {
            const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            return month[date.getDate().getMonth()];
        }
        throw new Error(`Invalid date "${date}": must be a date or datetime`);
    }

    static weekOfYear({ date = null }) {
        if (typeof date === 'string') date = Temporal.parse(date);
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
        throw new Error(`Invalid date "${date}": must be a date or datetime`);
    }

    static monthBetween({ from = null, to = null}) {
        if ((from instanceof DateOnly || from instanceof DateAndTime) && (to instanceof DateOnly || to instanceof DateAndTime)) {
           // get months of both terms, subtract them and buid new duration
           let months = (to.year * to.sign - from.year * from.sign)*12 + (to.month - from.month);
           // correct to full month
           months > 0 ? months -= (to.day - from.day < 0 ? 1 : 0) : months -= (to.day - from.day > 0 ? 1 : 0);
           //return YearsAndMonthDuration.build(months,0);
           return new YearsAndMonthDuration({ years: 0, months });
        }
        throw new Error(`Invalid duration parameter from "${from}" and to "${to}": both terms must be date or datetime`);
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
        const allowedDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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

class Offset {
    constructor (offset, utc) {
        if (offset instanceof DaysAndTimeDuration) {
            const value = Offset.convertFromSeconds(offset.dtd);
            this.offset = { ...value, utc: offset.dtd === 0 ? true : false };
        } else if (typeof offset === 'number') {
            // offset is in seconds
            const value = Offset.convertFromSeconds(offset);
            this.offset = { ...value, utc: utc || false };
        } else if (offset === 'Z') {
            this.offset = { sign: 1, hours: 0, minutes: 0, seconds: 0, utc: true };
        } else if (typeof offset === 'string') {
            const value = Offset.parse(offset);
            if (value.hours === 0 && value.minutes === 0 && value.seconds === 0) utc = true; // offset is 0 -> UTC
            this.offset = { ...value, utc: utc || false };
        } else {
            // no offset
            this.offset = { sign: 1, hours: 0, minutes: 0, seconds: 0, utc: utc || false };
        }
        if (this.offset.sign > 0 && this.offset.hours > 14) throw new Error(`Invalid offset "${offset}": hours must be in range -12 to +14`);
        if (this.offset.sign < 0 && this.offset.hours > 12) throw new Error(`Invalid offset "${offset}": hours must be in range -12 to +14`);
        if (this.offset.minutes > 59) throw new Error(`Invalid offset "${offset}": minutes must be in range 0 to 59`);
        if (this.offset.seconds > 59) throw new Error(`Invalid offset "${offset}": seconds must be in range 0 to 59`);
    }

    static convertFromSeconds (seconds) {
        // convert seconds to hours, minutes and seconds
        const sign = Math.sign(seconds);
        const absSeconds = Math.abs(seconds);
        const hours = Math.floor(absSeconds / 3600);    
        const minutes = Math.floor((absSeconds % 3600) / 60);
        const remainingSeconds = absSeconds % 60;
        return { sign, hours, minutes, seconds: remainingSeconds };
    }

    static parse (exp) {
        if (typeof exp !== 'string') throw new Error(`Invalid offset expression "${exp}": must be a string`);
        // +/-HH:MM:SS
        let parts = exp.match(/^\s*([-|+])\s*(\d{2}):(\d{2})(?::(\d{2}))?\s*$/);
        if (parts && parts.length >= 3) {
            const [fullMatch, sign, hours, minutes, seconds] = parts;
            return { sign: sign === "-" ? -1 : 1, hours: parseInt(hours || 0), minutes: parseInt(minutes || 0), seconds: parseInt(seconds || 0) };
        }
        throw new Error(`Invalid offset expression "${exp}": doesn't match any allowed pattern`);
    }

    get default () {
        return this.offset.default || false;
    }

    get value () {
        // convert offset to seconds
        return this.offset.sign * (this.offset.hours*60*60 + this.offset.minutes*60 + this.offset.seconds);
    }

    get exp () {
        if (this.offset.hours === 0 && this.offset.minutes === 0 && this.offset.seconds === 0 && this.offset.utc) return "Z"; // utc
        if (this.offset.hours || this.offset.minutes) {
            let value = this.offset.sign < 0 ? "-" : "+";
            value += String(this.offset.hours).padStart(2,"0") + ":" + String(this.offset.minutes).padStart(2,"0");
            if (this.offset.seconds) {
                value += ":" + String(this.offset.seconds).padStart(2,"0");
            }
            return value;
        } else {
            return "";
        }
    }
}

class DateAndTime extends Temporal {

    constructor (obj) {
        super(obj);

        // get utc from offset
        if (this.offset && this.offset.value === 0 && this.offset.utc) this.utc = true; // offset is 0 -> UTC
        // convert utc to boolean
        if (this.utc) this.utc = this.utc === "Z" ? true : this.utc;
        if (this.utc && typeof this.utc !== "boolean") throw new Error(`Invalid UTC parameter "${this.utc}": must be either "Z" or a boolean`);
        // additional checks before conversion
        if (typeof this.year === 'string' && /^\s*[0]/.test(this.year)) throw new Error(`Invalid year "${this.year}": no leading zeros in year allowed`);
        if (!this.year || !this.month || !this.day) throw new Error(`Invalid date "${this.year}-${this.month}-${this.day}": year, month and day are required`);
        if (this.year === undefined || this.month === undefined  || this.day === undefined ) throw new Error(`Invalid date "${this.year}-${this.month}-${this.day}": year, month and day are required`);
        // parse numbers
        this.year = parseInt(this.year);
        this.month = parseInt(this.month);
        this.day = parseInt(this.day);
        this.hour = parseInt(this.hour);
        this.minute = parseInt(this.minute);
        this.second = parseFloat(this.second);
        // additional checks after conversion
        if (!Temporal.isValidDate(this.year,this.month,this.day)) throw new Error(`Invalid date "${this.year}-${this.month}-${this.day}": invalid date`);
        if (this.hour < 0 || this.hour > 24) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": hour must be in range 0 to 24`);
        if (this.hour === 24 && ( this.minute || this.second )) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": time maximum is 24:00:00`);
        if (this.minute > 59) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": minute must be in range 0 to 59`);
        if (this.second > 59.999999999) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": second must be in range 0 to 59.999999999`);
    }

    get exp () {
        let value = this.sign < 0 ? "-" : "";
        value += String(this.year).padStart(4,"0") + "-" + String(this.month).padStart(2,"0") + "-" + String(this.day).padStart(2,"0");
        // Ensure seconds have two digits before the decimal point
        const seconds = this.second.toString();
        const len = this.second > 10 ? seconds.length : seconds.length + 1;
        const formattedSeconds = seconds.includes(".")
            ? seconds.padStart(len, "0") // Pad to ensure at least two digits before the decimal
            : seconds.padStart(2, "0"); // Pad for integer seconds
        value += "T" + String(this.hour).padStart(2,"0") +":" + String(this.minute).padStart(2,"0") + ":" + formattedSeconds;
        value += this.timezone ? "" : (this.offset ? this.offset.exp : "");
        value += this.timezone ? "@" + this.timezone : "";
        return value;
    }

    get value () {
        return new Date(this.year,this.month-1,this.day,this.hour,this.minute,this.second).valueOf()
    }

    static build (arr) {
        if (Array.isArray(arr) && arr.length === 6) return new DateAndTime({ year: arr[0], month: arr[1], day: arr[2], hour: arr[3], minute: arr[4], second: arr[5]});
        return undefined;
    }

    static from ({ date, time }) {
        if (date instanceof DateOnly && time instanceof Time) {
            const obj = {
                sign: date.sign,
                year: date.year,
                month: date.month,
                day: date.day,
                hour: time.hour,
                minute: time.minute,
                second: time.second,
                utc: time.offset.utc || false,
                offset: time.offset,
                timezone: time.timezone
            };
            return new DateAndTime(obj);
        } else if (date instanceof DateOnly && !time) {
            const obj = {
                sign: date.sign,
                year: date.year,
                month: date.month,
                day: date.day,
                hour: 0,
                minute: 0,
                second: 0,
                utc: false,
                offset: 0,
                timezone: null
            };
            return new DateAndTime(obj);

        } else if (date instanceof DateAndTime && time instanceof Time) {
            const obj = {
                sign: date.sign,
                year: date.year,
                month: date.month,
                day: date.day,
                hour: time.hour,
                minute: time.minute,
                second: time.second,
                utc: time.utc || false,
                offset: time.offset,
                timezone: time.timezone
            };
            return new DateAndTime(obj);
        }
        throw new Error(`Date and time function - Invalid date and time combination: ${date} and ${time}`);
    }

    static parse (exp) {
        const value = Temporal.parse(exp);
        if (value instanceof Time) throw new Error(`Invalid date and time expression "${exp}": cannot coonvert time to date and time`);
        if (value instanceof Duration) throw new Error(`Invalid date and time expression "${exp}": cannot coonvert duration to date and time`);
        if (value instanceof DateAndTime) return value;
        if (value instanceof DateOnly) return DateAndTime.from({ date: value });
    }

    clone() {
        return new DateAndTime({ sign: this.sign, year: this.year, month: this.month, day: this.day, hour: this.hour, minute: this.minute, second: this.second, offset: this.offset, timezone: this.timezone });
    }

    toDateOnly () {
        return new DateOnly({ sign: this.sign, year: this.year * this.sign, month: this.month, day: this.day });
    }

    toTime () {
        const obj = {
            hour: this.hour,
            minute: this.minute,
            second: this.second,
            utc: this.utc,
            offset: this.offset,
            timezone: this.timezone
        };
        return new Time(obj);
    }

    getDate () {
        return new Date(this.year * this.sign,this.month-1,this.day,this.hour,this.minute,this.second)
    }

    getUTCDate () {
        // convert to date considering the offset
        const offset = this.offset.value;
        const date = new Date(this.year * this.sign,this.month-1,this.day,this.hour,this.minute,this.second);
        if (offset) {
            date.setUTCSeconds(date.getUTCSeconds() + offset);
        }
        return date;
    }

    add (term) {
        if (term instanceof DaysAndTimeDuration) {
            // build temporary date object
            let date = new Date(Date.UTC(this.year * this.sign,this.month-1,this.day,this.hour,this.minute,this.second));
            // add days and time duration seconds
            date.setUTCSeconds(date.getUTCSeconds() + term.dtd)
            // clone this object and set new values - keep timezone and offset
            let dateAndTime = this.clone();
            dateAndTime.sign = date.getUTCFullYear() < 0 ? -1 : 1;
            dateAndTime.year = Math.abs(date.getUTCFullYear());
            dateAndTime.month = date.getUTCMonth() + 1;
            dateAndTime.day = date.getUTCDate();
            dateAndTime.hour = date.getUTCHours();
            dateAndTime.minute = date.getUTCMinutes();
            dateAndTime.second = date.getUTCSeconds();
            return dateAndTime;
        }
        if (term instanceof YearsAndMonthDuration) {
            let dateAndTime = this.clone();
            const year = this.year * this.sign + Math.floor((this.month + term.ymd)/12);
            const month = ( this.month + term.ymd ) - Math.floor((this.month + term.ymd)/12) * 12
            let date = new Date(Date.UTC(year, month, 0));  // 0 is the last day of the previous month
            let newDay = Math.min( date.getUTCDate(),this.day); // adjusted to max days of month
            dateAndTime.sign = date.getUTCFullYear() < 0 ? -1 : 1;
            dateAndTime.year = Math.abs(date.getUTCFullYear());
            dateAndTime.month = month;
            dateAndTime.day = newDay;
            return dateAndTime;
        }
        throw new Error(`Invalid date addition with invalid right term - left term: "${this.exp}", right term "${term.exp}"`);
    }

    subtract (term) {
        if (term instanceof DaysAndTimeDuration) {
            // build temporary date object
            let date = new Date(Date.UTC(this.year * this.sign,this.month-1,this.day,this.hour,this.minute,this.second));
            // substract days and time duration seconds
            date.setUTCSeconds(date.getUTCSeconds() - term.dtd)
            // clone this object and set new values - keep timezone and offset
            let dateAndTime = this.clone();
            dateAndTime.sign = date.getUTCFullYear() < 0 ? -1 : 1;
            dateAndTime.year = Math.abs(date.getUTCFullYear());
            dateAndTime.month = date.getUTCMonth() + 1;
            dateAndTime.day = date.getUTCDate();
            dateAndTime.hour = date.getUTCHours();
            dateAndTime.minute = date.getUTCMinutes();
            dateAndTime.second = date.getUTCSeconds();
            return dateAndTime;
        }
        if (term instanceof YearsAndMonthDuration) {
            let dateAndTime = this.clone();
            const year = this.year * this.sign + Math.floor((this.month - term.ymd)/12);
            const month = ( this.month - term.ymd ) - Math.floor((this.month - term.ymd)/12) * 12
            let date = new Date(Date.UTC(year, month, 0));  // 0 is the last day of the previous month
            let newDay = Math.min( date.getUTCDate(),this.day); // adjusted to max days of month
            dateAndTime.sign = date.getUTCFullYear() < 0 ? -1 : 1;
            dateAndTime.year = Math.abs(date.getUTCFullYear());
            dateAndTime.month = date.getUTCMonth() + 1;
            dateAndTime.day = newDay;
            return dateAndTime;
        }
        if (term instanceof DateAndTime) {
            const diff = ( this.getUTCDate().valueOf() - term.getUTCDate().valueOf() ) / 1000; // in seconds
            return DaysAndTimeDuration.build(diff);
        }
        if (term instanceof DateOnly) {
            if (this.timezone) throw new Error(`Invalid date subtraction as the left term has a timezone - left term: "${this.exp}", right term "${term.exp}"`);
            if (this.offset.value) throw new Error(`Invalid date subtraction as the left term has an offset - left term: "${this.exp}", right term "${term.exp}"`);
            const diff = ( this.getUTCDate().valueOf() - term.getUTCDate().valueOf() ) / 1000; // in seconds
            return DaysAndTimeDuration.build(diff);
        }
        throw new Error(`Invalid date subtraction with invalid right term - left term: "${this.exp}", right term "${term.exp}"`);
    }

}
class DateOnly extends Temporal {

    constructor (obj) {
        super(obj);
        // additional checks before conversion
        if (typeof this.year === 'string' && /^\s*[0]/.test(this.year)) throw new Error(`Invalid year "${this.year}": no leading zeros in year allowed`);
        if (!this.year || !this.month || !this.day) throw new Error(`Invalid date "${this.year}-${this.month}-${this.day}": year, month and day are required`);
        if (this.year === undefined || this.month === undefined  || this.day === undefined ) throw new Error(`Invalid date "${this.year}-${this.month}-${this.day}": year, month and day are required`);
        // parse numbers
        this.year = parseInt(this.year);
        this.month = parseInt(this.month);
        this.day = parseInt(this.day);
        // additional checks after conversion
        if (!Temporal.isValidDate(this.year,this.month,this.day)) throw new Error(`Invalid date "${this.year}-${this.month}-${this.day}": invalid date`);
    }

    get exp () {
        let value = this.sign < 0 ? "-" : "";
        value +=  String(this.year).padStart(4,"0") + "-" + String(this.month).padStart(2,"0") + "-" + String(this.day).padStart(2,"0");
        return value;
    }

    get value () {
        return new Date(this.year,this.month-1,this.day,0,0,0).valueOf()
    }

    static build ({ year, month, day }) {
        Temporal.isValidDate(year,month,day);
        return new DateOnly({ year, month, day });
    }

    static parse (exp) {
        const value = Temporal.parse(exp);
        if (value instanceof Time) throw new Error(`Invalid date and time expression "${exp}": cannot coonvert time to date`);
        if (value instanceof Duration) throw new Error(`Invalid date and time expression "${exp}": cannot coonvert duration to time`);
        if (value instanceof DateAndTime) return DateAndTime.toDateOnly();
        if (value instanceof DateOnly) return value;
    }


    clone() {
        return new DateOnly({ year: this.year, month: this.month, day: this.day });
    }

    getDate () {
        return new Date(this.year,this.month-1,this.day);
    }

    getUTCDate () {
        return new Date(Date.UTC(this.year,this.month-1,this.day));
    }

    toTime () {
        const obj = {
            hour: 0,
            minute: 0,
            second: 0,
            utc: true,
            offset: new Offset("Z", true),
            timezone: null
        };
        return new Time(obj);
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
            /*
            const days = moment(this.getDate()).diff(moment(term.getDate()), 'days');
            return new DaysAndTimeDuration({ years: 0, months: 0, days, hours: 0, minutes: 0, seconds: 0 });
            */
            const diff = ( this.getUTCDate().valueOf() - term.getUTCDate().valueOf() ) / 1000; // in seconds
            return DaysAndTimeDuration.build(diff);
        };
        if (term instanceof DateAndTime) {
            if (!term.timezone && !term.utc && !term.offset.value) throw new Error(`Invalid date subtraction as the right term has no timezone - left term: "${this.exp}", right term "${term.exp}"`);
            const diff = ( this.getUTCDate().valueOf() - term.getUTCDate().valueOf() ) / 1000; // in seconds
            console.log("diff", diff, this.getUTCDate(), term.getUTCDate());
            return DaysAndTimeDuration.build(diff);
        }
        if (term instanceof YearsAndMonthDuration) {
            const obj = {
                year: this.year + Math.floor((this.month - term.ymd)/12),
                month: ( this.month - term.ymd ) - Math.floor((this.month - term.ymd)/12) * 12
            };
            let date = new Date(Date.UTC(obj.year, obj.month, 0));  // 0 is the last day of the previous month
            let newDay = Math.min( date.getUTCDate(),this.day);
            date = new Date(Date.UTC(obj.year, obj.month - 1, newDay )); // adjusted to max days of month
            return new DateOnly({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate()});
        }
        if (term instanceof DaysAndTimeDuration) {
            let date = this.getUTCDate();
            date.setUTCSeconds(this.getUTCDate().getUTCSeconds() - term.dtd);
            return new DateOnly({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate()});
        }
        throw new Error(`Invalid date subtraction with invalid right term - left term: "${this.exp}", right term "${term.exp}"`);
    }

}
class Time extends Temporal {
    constructor (obj) {
        super(obj);
        // get utc from offset
        if (this.offset && this.offset.value === 0 && this.offset.utc) this.utc = true; // offset is 0 -> UTC
        // convert utc to boolean
        if (this.utc) this.utc = this.utc === "Z" ? true : this.utc;
        if (this.utc && typeof this.utc !== "boolean") throw new Error(`Invalid UTC parameter "${this.utc}": must be either "Z" or a boolean`);
        // parse numbers
        this.hour = parseInt(this.hour);
        this.minute = parseInt(this.minute);
        this.second = parseFloat(this.second);
        // additional checks after conversion
        if (this.hour < 0 || this.hour > 24) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": hour must be in range 0 to 24`);
        if (this.hour === 24 && ( this.minute || this.second )) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": time maximum is 24:00:00`);
        if (this.minute > 59) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": minute must be in range 0 to 59`);
        if (this.second > 59) throw new Error(`Invalid time "${this.hour}:${this.minute}:${this.second}": second must be in range 0 to 59`);
    }

    get exp () {
        let value = this.sign < 0 ? "-" : "";
        // Ensure seconds have two digits before the decimal point
        const seconds = this.second.toString();
        const len = this.second > 10 ? seconds.length : seconds.length + 1;
        const formattedSeconds = seconds.includes(".")
            ? seconds.padStart(len, "0") // Pad to ensure at least two digits before the decimal
            : seconds.padStart(2, "0"); // Pad for integer seconds
        value +=  String(this.hour).padStart(2,"0") + ":" + String(this.minute).padStart(2,"0") + ":" + formattedSeconds
        value += this.timezone ? "" : (this.offset ? this.offset.exp : "");
        value += this.timezone ? "@" + this.timezone : "";
        return value;
    }

    // hours, minutes and seconds in seconds
    get dtd () {
        return this.second + this.minute*60 + this.hour*60*60;
    }

    static build ({ hour, minute, second, utc, offset, timezone }) {
        // additional checks
        if (hour === null) throw new Error(`Invalid hour "${hour}": null is not allowed`);
        if (minute === null) throw new Error(`Invalid minute "${minute}": null is not allowed`);
        if (second === null) throw new Error(`Invalid second "${second}": null is not allowed`);
        //if (offset === null) throw new Error(`Invalid offset "${offset}": null is not allowed`);
        const obj = {
            hour: hour ?? 0,
            minute: minute ?? 0,
            second: second ?? 0,
            offset: offset,
            utc,
            timezone: timezone ?? null
        };
        return new Time(obj);
    }

    static parse (exp) {
        const value = Temporal.parse(exp);
        if (value instanceof DateOnly) throw new Error(`Invalid date and time expression "${exp}": cannot coonvert date to time`);
        if (value instanceof Duration) throw new Error(`Invalid date and time expression "${exp}": cannot coonvert duration to date and time`);
        if (value instanceof DateAndTime) return DateAndTime.toTime();
        if (value instanceof Time) return value;
    }

    calculateFromSeconds ({seconds, utc = false, offset = undefined,  timezone = null}) {
        const absSeconds = Math.abs(seconds) % 86400;
        const obj = {
            hour: absSeconds > 0 ? Math.floor((absSeconds % (24*60*60))/(60*60)) : 0,
            minute: absSeconds > 0 ? Math.floor((absSeconds % (60*60))/(60)) : 0,
            second: absSeconds > 0 ? absSeconds % 60 : 0,
            utc,
            offset,
            timezone
        }
        return new Time(obj);
    }

    clone() {
        return new Time({ hour: this.hour, minute: this.minute, second: this.second, utc: this.utc, offset: this.offset, timezone: this.timezone });
    }

    add(term) {
        if (term instanceof YearsAndMonthDuration) throw new Error(`Invalid time addition with invalid right term - left term: "${this.exp}", right term "${term.exp}"`);
        if (term instanceof Duration) {
           // get seconds of both terms, add them and buid new time
           return this.calculateFromSeconds({ seconds: this.dtd + term.dtd, utc: this.utc, offset: this.offset, timezone: this.timezone });
        };
    }

    subtract(term) {
        if (term instanceof DaysAndTimeDuration) {
           // get seconds of both terms, add them and buid new time
           const seconds = this.dtd - ( term.dtd % 86400 );
           return this.calculateFromSeconds({ seconds, utc: this.utc, offset: this.offset, timezone: this.timezone });
        };
        if (term instanceof Time) {
            // get seconds of both terms, sibstract them and buid a days and time duration
            const seconds = this.dtd - term.dtd;
            return DaysAndTimeDuration.build(seconds);
        };
        throw new Error(`Invalid time substraction with invalid right term - left term: "${this.exp}", right term "${term}"`);
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

    static parse (exp) {
        const value = Temporal.parse(exp);
        if (value instanceof Time) throw new Error(`Invalid duration expression "${exp}": cannot coonvert time to duration`);
        if (value instanceof DateAndTime) throw new Error(`Invalid duration expression "${exp}": cannot coonvert date and time to duration`);
        if (value instanceof DateOnly) throw new Error(`Invalid duration expression "${exp}": cannot coonvert date to duration`);
        if (value instanceof Duration) return value;
    }

}

class DaysAndTimeDuration extends Duration {

    constructor (obj) {
        super(obj);
        // additional checks before conversion
        if (!this.days && !this.hours && !this.minutes && !this.seconds) throw new Error(`Invalid duration: any kind of time is required`);
        // parse numbers
        this.years = 0;
        this.months = 0;
        this.days = parseInt(this.days ?? 0);
        this.hours = parseInt(this.hours ?? 0);
        this.minutes = parseInt(this.minutes ?? 0);
        this.seconds = parseFloat(this.seconds ?? 0);
        // caluclate additional days from hours, minutes and seconds and adjust them
        if (this.seconds > 0) { 
            this.minutes += Math.floor(this.seconds/60);
            this.seconds = this.seconds % 60;
        }   
        if (this.seconds < 0) {
            this.minutes -= Math.floor(Math.abs(this.seconds)/60);
            this.seconds = -(Math.abs(this.seconds) % 60);
        }
        if (this.minutes > 0) { 
            this.hours += Math.floor(this.minutes/60);
            this.minutes = this.minutes % 60;
        }
        if (this.minutes < 0) { 
            this.hours -= Math.floor(Math.abs(this.minutes)/60);
            this.minutes = -(Math.abs(this.minutes) % 60);
        }
        if (this.hours > 0) {
            this.days += Math.floor(this.hours/24);
            this.hours = this.hours % 24;
        }
        if (this.hours < 0) {   
            this.days -= Math.floor(Math.abs(this.hours)/24);
            this.hours = -(Math.abs(this.hours) % 24);
        }
    }

    get exp () {
        let value = "P";
        if (this.value < 0 ) value = "-" + value;
        if (this.days) value += Math.abs(this.days) + "D"; 
        if (this.hours || this.minutes || this.seconds ||!this.days) value += "T"; 
        if (this.hours) value += Math.abs(this.hours) + "H"; 
        if (this.minutes) value += Math.abs(this.minutes) + "M"; 
        if (this.seconds || (!this.days && !this.hours && !this.minutes)) value += Math.abs(this.seconds) + "S"; 
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

    negate() {
        return DaysAndTimeDuration.build(-this.dtd);
    }

    clone() {
        return new DaysAndTimeDuration({ years: this.years, months: this.months, days: this.days, hours: this.hours, minutes: this.minutes, seconds: this.seconds });
    }

    add(term) {
        if (term instanceof DaysAndTimeDuration) {
           return DaysAndTimeDuration.build(this.dtd + term.dtd);
        };
        if (term instanceof DateAndTime) return term.add(this);
        throw new Error(`Invalid date and time addition with invalid right term - left term: "${this.exp}", right term "${term.exp}"`);
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

    constructor (obj) {
        super(obj);
        // additional checks before conversion
        if (typeof this.years === 'string' && !this.years && !this.months) throw new Error(`Invalid duration: either years or month are required`);
        // parse numbers
        this.years = parseInt(this.years ?? 0);
        this.months = parseInt(this.months ?? 0);
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        // calculate additional years from months and adjust months
        if (this.months > 0) {
            this.years += Math.floor(this.months/12);
            this.months = this.months % 12;
        } else if (this.months < 0) {
            this.years -= Math.floor(Math.abs(this.months)/12);
            this.months = -(Math.abs(this.months) % 12);
        }
        // additional checks after conversion
    }

    get exp () {
        let value = "P";
        if (this.value < 0) value = "-" + value;
        if (this.years) value += Math.abs(this.years) + "Y"; 
        if (this.months || !this.years) value += Math.abs(this.months) + "M"; 
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

    negate() {
        return YearsAndMonthDuration.build(-this.ymd);
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
