
const util = require('util');

let exp = [
    "P5D12Y",
    "P12Y5M",
    "P5D7M",
    "PT30M10S",
    "P5M12YT5H",
    "P5D3YT30M",
    "PT30M7S",
    "PT15S",
]

let regex = [
    { type: "duration", regex: /(P(?:\d+[D|M|Y])*(?:T(?:\d+[H|M|S])*)?)/ },
    { type: "years", regex: /P(?:(?:\d+[D|M])*)(\d+)Y/ },
    { type: "days", regex: /P(?:(?:\d+[M|Y])*)(\d+)D/ },
    { type: "month", regex: /P(?:(?:\d+[D|Y])*)(\d+)M/ },
    { type: "hours", regex: /P(?:\d+[D|M|Y])*T(?:\d+[M|S])*(\d+)H/i },
    { type: "minutes", regex: /P(?:\d+[D|M|Y])*T(?:\d+[H|S])*(\d+)M/i },
    { type: "seconds", regex: /P(?:\d+[D|M|Y])*T(?:\d+[H|M])*(\d+)S/i }
]

exp.forEach((e) => {
    if (e.match(/(P(?:\d+[D|M|Y])*(?:T(?:\d+[H|M|S])*)?)/)) {
        let duration = {
            years: parseInt(e.match(/P(?:(?:\d+[D|M])*)(\d+)Y/)?.[1] ?? 0),
            months: parseInt(e.match(/P(?:(?:\d+[D|Y])*)(\d+)M/)?.[1] ?? 0),
            days: parseInt(e.match(/P(?:(?:\d+[M|Y])*)(\d+)D/)?.[1] ?? 0),
            hours: parseInt(e.match(/P(?:\d+[D|M|Y])*T(?:\d+[M|S])*(\d+)H/i)?.[1] ?? 0),
            minutes: parseInt(e.match(/P(?:\d+[D|M|Y])*T(?:\d+[H|S])*(\d+)M/i)?.[1] ?? 0),
            seconds: parseInt(e.match(/P(?:\d+[D|M|Y])*T(?:\d+[H|M])*(\d+)S/i)?.[1] ?? 0),
        };
        console.log(util.inspect({ e, duration }, { showHidden: false, depth: null, colors: true }));
    }
    // regex.forEach((r) => {
        // console.log(util.inspect({ e, r, match: e.match(r.regex) ? e.match(r.regex)[1] : null }, { showHidden: false, depth: null, colors: true }));
        // console.log(util.inspect([...e.matchAll(r)], { showHidden: false, depth: null, colors: true }));
    // })
})
