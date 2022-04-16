const { Duration } = require("./../lib/datetime.js");

let months = 61
let seconds = 60*60*24*3+65 
console.log({ months, seconds, duration: Duration.build(months,seconds).exp});