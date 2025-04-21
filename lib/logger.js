/**
 * @license MIT, imicros.de (c) 2025 Andreas Leinen
 *
 */
"use strict";

class Logger {
    constructor () {
        this.log = [];
        this.limit = 50000;
        this.errorLevel = 'E';
        this.warningLevel = 'W';
        this.infoLevel = 'I';
        this.debugLevel = 'D';
    }

    activate () {
        this.active = true;
    }

    deactivate () {
        this.active = false;
    }

    isActive () {
        return this.active;
    }

    clear () {
        this.log = [];
    }

    add (entry) {
        if (this.active && this.log.length < this.limit) this.log.push({
            _level: entry._level || this.infoLevel,
            entry
        });
    }

    error (entry) {
        this.add({ _level: this.errorLevel, ...entry });
    }

    warning (entry) {
        this.add({ _level: this.warningLevel, ...entry });
    }

    info (entry) {
        this.add({ _level: this.infoLevel, ...entry });
    }

    debug (entry) {
        this.add({ _level: this.debugLevel, ...entry });
    }

    getLog () {
        return this.log.map((entry) => {
            return {
                level: entry._level,
                entry: entry.entry
            };
        });
    }
}

module.exports = {
    Logger
};