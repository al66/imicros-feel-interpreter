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

    static replace({ input, pattern, replacement, flags, logger }) {
        function mapXPathFlagsToJSFlags(flags) {
            if (!flags) return ""; // No flags provided
            return flags
                .replace(/i/g, "i") // Case-insensitive
                .replace(/m/g, "m") // Multiline
                .replace(/s/g, "s") // Dotall
                .replace(/x/g, ""); // Ignore 'x' (not supported in JS, preprocess pattern if needed)
        }        
        try {
            // FEEL index starts with 1 instead of 0
            replacement = replacement.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + 1}`);
            // map xpath flags to regex flags (x is not supported)
            flags = flags ? mapXPathFlagsToJSFlags(flags) : null;
            // build regex
            const regex = flags ? new RegExp("(" + pattern + ")",flags + "g") : new RegExp("(" + pattern + ")","g");
            const result = input.replace(regex,replacement);
            logger.debug({
                message: "replace",
                input: input,
                pattern: pattern,
                replacement: replacement,
                flags: flags,
                regex: regex,
                result: result
            })
            return result;
        } catch(e) {
            logger.debug({
                message: "replace failed",
                input: input,
                pattern: pattern,
                replacement: replacement,
                flags: flags,
                error: e.message
            })
            throw new Error(`replace failed: ${ input } ${ pattern } ${ replacement } ${ flags } - ${ e.message }`);
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