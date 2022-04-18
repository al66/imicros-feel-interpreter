/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

 class Strings {

    static matches({ input, pattern }) {
        if (typeof input != 'string' || typeof pattern != 'string') return undefined; 
        try {
            const regex = new RegExp(pattern);
            return input.match(regex) ? true : false;
        } catch(e) {
            return undefined;
        }
    }

    static replace({ input, pattern, replacement, flags }) {
        if (typeof input != 'string' || typeof pattern != 'string' || typeof replacement != 'string') return undefined; 
        try {
            const regex = flags ? new RegExp(pattern,flags) : new RegExp(pattern);
            return input.replace(regex,replacement);
        } catch(e) {
            return undefined;
        }
    }

    static split({ string, delimiter}) {
        if (typeof string != 'string' || typeof delimiter != 'string') return undefined; 
        try {
            const regex = new RegExp(delimiter);
            return string.split(regex);
        } catch(e) {
            return undefined;
        }
    }

    static extract({ string, pattern}) {
        if (typeof string != 'string' || typeof pattern != 'string') return undefined; 
        try {
            const regex = new RegExp(pattern,"g");
            return [...string.matchAll(regex)].flat();
        } catch(e) {
            return undefined;
        }
    }

 }

 module.exports = {
     Strings
 }