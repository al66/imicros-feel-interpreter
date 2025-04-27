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
        this.logLevels = [];
    }

    activate (level) {
        this.active = true;
        switch (level) {
            case 'D':
                this.logLevels.push(this.debugLevel);
            case 'I':
                this.logLevels.push(this.infoLevel);
            case 'W':
                this.logLevels.push(this.warningLevel);
            case 'E':
                this.logLevels.push(this.errorLevel);
                break;
            default:
                this.logLevels = [this.errorLevel, this.warningLevel, this.infoLevel, this.debugLevel];
        }
    }

    deactivate () {
        this.active = false;
        this.logLevels = [];
    }

    isActive () {
        return this.active;
    }

    clear () {
        this.log = [];
    }

    add (entry) {
        const level = entry._level || this.infoLevel;
        if (this.active && this.logLevels.includes(level) && this.log.length < this.limit) this.log.push({
            _level: level,
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